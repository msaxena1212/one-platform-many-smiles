/**
 * Browser-storage records written through to the database.
 *
 * Several screens keep their records in localStorage under a fixed key, or under a key family (one key per vendor,
 * per invoice, per HRMS master category). Those writes are the client's data, so this module makes every write to a
 * registered key also go to the `app_documents` table (store = the full key name):
 *
 *  - Start-up: the database copy of each key is loaded into localStorage. Records that exist only in this browser are
 *    uploaded. Where a record exists in the database, the database version wins.
 *  - Every later write: changed records are upserted and removed records are soft-deleted, straight away.
 *  - Arrays store one row per item (id = item.id, or a stable key). Objects store one row per entry.
 *    Plain values (numbers, strings) store one row under a fixed id.
 *
 * The write is intercepted at Storage.setItem, so every existing call site is covered without being edited.
 */
import { supabase } from "@/lib/supabase";
import { apiDb } from "@/lib/api-db";
import { toast } from "sonner";

/** Exact localStorage keys whose records are client data. Finance keys with their own hooks are not listed here. */
export const DB_BACKED_KEYS: string[] = [
  // Leasing
  "pms_renewed_leases_v1",
  "pms_renewal_pdcs",
  "pms_custom_lease_overrides",
  "pms_settlement_cases_v3",
  "pms_checkout_cases_v3",
  "pms_deposit_settlements_v1",
  "pms_leasing_v2_leases",
  "pms_deleted_leases_v1",
  "zyno_signed_handover_receipts",
  // Maintenance
  "pms_vendor_invoices",
  "pms_wo_comments",
  "pms_ticket_comments",
  "pms_stock_movements",
  "pms_maintenance_stock",
  "pms_job_card_material_issues_v1",
  // Finance banks (the bank screens write these keys)
  "zyno-company-bank-accounts-v2",
  "pms_fin_banks_override_v2",
  "pms_fin_bank_accounts_override_v2",
  "zyno_finance_budget_heads",
  // Procurement and masters
  "proc_catalog_items",
  "grn_cost_mappings_v2",
  "fin_revenue_generation_batches_v2",
  "zyno_custom_dynamic_masters_v1",
  // Admin
  "zyno_approval_workflows_v2",
  "pms_managed_user_profiles",
  "zyno_pms_import_batches_history_v2",
  "zyno_pms_import_audit_trail_v2",
  "pms_security_audit_logs",
  // Organisation branding used on printed documents
  "pms_organization_document_branding_v3",
];

/**
 * Key families: every key starting with one of these prefixes is client data.
 * Session and UI-only keys (demo session, impersonation, theme) are deliberately not listed.
 */
export const DB_BACKED_PREFIXES: string[] = [
  "partial_paid_", // amount already paid against an AP invoice, keyed by invoice id
  "vendor_advance_", // vendor advance balance, keyed by vendor id
  "vendor_adv_util_", // vendor advance utilisation history, keyed by vendor id
];

type Row = { id: string; data: unknown };
const MAP_MARK = "__entry";
const SCALAR_ID = "__scalar";

const snapshots = new Map<string, Map<string, string>>();
const hydrated = new Set<string>();
const failed = new Set<string>();
let suppress = false;
let startupDone = false;

export function isDbBackedKey(key: string): boolean {
  return DB_BACKED_KEYS.includes(key) || DB_BACKED_PREFIXES.some(p => key.startsWith(p));
}

function hash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

function itemId(x: any): string {
  if (typeof x === "string" || typeof x === "number") return String(x);
  if (x && typeof x === "object") {
    const v = x.id ?? x.key ?? x.code ?? x.lease_number ?? x.chequeNo ?? x.receipt_number ?? x.invoice_number;
    if (v !== undefined && v !== null && String(v) !== "") return String(v);
  }
  return "h:" + hash(JSON.stringify(x));
}

/** Turn a stored value into rows. Arrays: one row per item. Objects: one row per entry. Plain values: one row. */
function toRows(value: unknown): Row[] {
  const seen = new Map<string, Row>();
  if (Array.isArray(value)) {
    for (const x of value) seen.set(itemId(x), { id: itemId(x), data: x });
  } else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      seen.set(k, { id: k, data: { [MAP_MARK]: true, v } });
    }
  } else if (value !== null && value !== undefined) {
    seen.set(SCALAR_ID, { id: SCALAR_ID, data: { [MAP_MARK]: true, v: value } });
  }
  return [...seen.values()];
}

/** Rebuild the stored value from rows. Map entries are recognised by their marker. */
function fromRows(rows: Row[]): unknown {
  if (rows.length === 1 && rows[0].id === SCALAR_ID) return (rows[0].data as any)?.v;
  const isMap = rows.some(r => r.data && typeof r.data === "object" && (r.data as any)[MAP_MARK] === true);
  if (isMap) {
    const out: Record<string, unknown> = {};
    for (const r of rows) out[r.id] = (r.data as any)?.v;
    return out;
  }
  return rows.map(r => r.data);
}

async function upsert(key: string, rows: Row[]): Promise<string | null> {
  const CHUNK = 200;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK).map(r => ({
      store: key,
      id: r.id,
      data: r.data,
      deleted: false,
      updated_at: new Date().toISOString(),
    }));
    const { error } = await apiDb.from("app_documents").upsert(chunk, { onConflict: "store,id" });
    if (error) return error.message;
  }
  return null;
}

async function softDelete(key: string, ids: string[]): Promise<string | null> {
  for (const id of ids) {
    const { error } = await apiDb
      .from("app_documents")
      .update({ deleted: true, updated_at: new Date().toISOString() } as any)
      .eq("store", key)
      .eq("id", id);
    if (error) return error.message;
  }
  return null;
}

/** Diff the new value against what the database holds and write only the difference. */
async function syncKey(key: string, value: unknown): Promise<void> {
  const rows = toRows(value);
  const snap = snapshots.get(key) ?? new Map<string, string>();
  const seen = new Set<string>();
  const changed: Row[] = [];
  for (const r of rows) {
    seen.add(r.id);
    const j = JSON.stringify(r.data);
    if (snap.get(r.id) !== j) changed.push(r);
  }
  const removed = [...snap.keys()].filter(id => !seen.has(id));
  if (changed.length) {
    const err = await upsert(key, changed);
    if (err) toast.error(`Changes to ${key} were NOT saved to the database: ${err}`);
    else changed.forEach(r => snap.set(r.id, JSON.stringify(r.data)));
  }
  if (removed.length) {
    const err = await softDelete(key, removed);
    if (err) toast.error(`Removal in ${key} was NOT saved to the database: ${err}`);
    else removed.forEach(id => snap.delete(id));
  }
  snapshots.set(key, snap);
}

const PAGE = 1000;

/** Every live row of one key family, read in pages. Returns null when the read fails. */
async function loadFamilyRows(prefix: string): Promise<Map<string, Row[]> | null> {
  const pattern = prefix.replace(/[\\_%]/g, m => "\\" + m) + "%";
  const byStore = new Map<string, Row[]>();
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("app_documents")
      .select("store, id, data")
      .like("store", pattern)
      .eq("deleted", false)
      .order("store", { ascending: true })
      .order("id", { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) return null;
    const batch = (data || []) as (Row & { store: string })[];
    for (const r of batch) {
      const list = byStore.get(r.store) ?? [];
      list.push({ id: r.id, data: r.data });
      byStore.set(r.store, list);
    }
    if (batch.length < PAGE) break;
  }
  return byStore;
}

/**
 * Load the database copy of one key into localStorage, uploading any browser-only records first.
 * `preloaded` is the key's live rows when a family read already fetched them.
 */
export async function hydrateKey(key: string, preloaded?: Row[]): Promise<void> {
  let dbRows: Row[];
  if (preloaded) {
    dbRows = preloaded;
  } else {
    const { data, error } = await supabase
      .from("app_documents")
      .select("id, data")
      .eq("store", key)
      .eq("deleted", false)
      .limit(20000);
    if (error || !data) { failed.add(key); return; } // keep the browser copy; retry on the next start
    dbRows = data as Row[];
  }
  snapshots.set(key, new Map(dbRows.map(r => [r.id, JSON.stringify(r.data)])));

  let localValue: unknown = null;
  try {
    const raw = localStorage.getItem(key);
    localValue = raw ? JSON.parse(raw) : null;
  } catch { localValue = null; }

  const dbIds = new Set(dbRows.map(r => r.id));
  const localRows = localValue !== null && localValue !== undefined ? toRows(localValue) : [];
  const localOnly = localRows.filter(r => !dbIds.has(r.id));
  if (localOnly.length) {
    const err = await upsert(key, localOnly);
    if (err) toast.error(`Records in ${key} from this browser were NOT saved to the database: ${err}`);
    else {
      localOnly.forEach(r => snapshots.get(key)?.set(r.id, JSON.stringify(r.data)));
      toast.info(`${localOnly.length} record(s) from this browser saved to the database (${key}).`);
    }
  }

  const merged = dbRows.length || localOnly.length ? fromRows([...dbRows, ...localOnly]) : localValue;
  if (merged !== null && merged !== undefined) {
    suppress = true;
    try { localStorage.setItem(key, JSON.stringify(merged)); } finally { suppress = false; }
  }
  hydrated.add(key);
}

let installed = false;

/** Start-up: find every key that is client data (listed, or in a family), then load and upload each. */
async function startup(): Promise<void> {
  const keys = new Set<string>(DB_BACKED_KEYS);
  const preloaded = new Map<string, Row[]>();

  for (const prefix of DB_BACKED_PREFIXES) {
    const family = await loadFamilyRows(prefix);
    if (family) {
      for (const [store, rows] of family) {
        keys.add(store);
        preloaded.set(store, rows);
      }
      // Browser-only keys of this family: they have no database rows, so they are uploaded below.
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(prefix)) {
          keys.add(k);
          if (!preloaded.has(k)) preloaded.set(k, []);
        }
      }
    } else {
      // The read failed: keep the browser copies of this family and do not write over the database.
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(prefix)) failed.add(k);
      }
    }
  }

  await Promise.all([...keys].map(k => hydrateKey(k, preloaded.get(k))));
  startupDone = true;
}

/** Start-up: intercept writes to the registered keys and load their database copies. Safe to call more than once. */
export function installDbBackedKeys(): void {
  if (installed || typeof window === "undefined") return;
  installed = true;

  const original = Storage.prototype.setItem;
  Storage.prototype.setItem = function (this: Storage, key: string, value: string) {
    original.call(this, key, value);
    if (suppress || this !== window.localStorage || !isDbBackedKey(key)) return;
    if (failed.has(key)) return; // database read failed: do not write over it
    if (!hydrated.has(key)) {
      // Not loaded yet: the start-up load will merge this browser copy.
      if (!startupDone) return;
      // A key first created after start-up: the start-up read found no database copy, so it starts empty.
      hydrated.add(key);
      snapshots.set(key, new Map());
    }
    try {
      void syncKey(key, JSON.parse(value));
    } catch { /* not JSON: nothing to store */ }
  };

  void startup().then(() => {
    window.dispatchEvent(new Event("pms_data_updated"));
  });
}

installDbBackedKeys();
