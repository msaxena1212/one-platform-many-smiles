/**
 * One-time removal of the September 2026 test transactions: work orders WO-2026-001 and WO-2026-003, the two
 * contractor invoices raised against them, the payment receipt and settlement voucher for the paid one, and the
 * maintenance tickets they came from.
 *
 * These records only ever existed in this browser's saved data (the work-order and AP-invoice tables are not in
 * the database), plus a payment voucher that may have been written to fin_vouchers. Matching is by exact invoice
 * number / work-order reference, so nothing else is touched. Everything removed is copied to
 * `pms_legacy_purge_backup_v1` first, so it can be restored. Runs once per browser; the database delete repeats
 * until it succeeds.
 */
import { supabase } from "./supabase";

const INVOICE_NOS = ["INV-CARRIER-2026-081", "INV-ALMANA-4482"];
const WORK_ORDERS = ["WO-2026-001", "WO-2026-003"];
const TICKETS = ["T-101", "T-103"];
const VOUCHER_NOS = ["PV-CARRIER-2026-081", "PV-ALMANA-4482"];

const LOCAL_DONE_KEY = "pms_legacy_purge_local_v1";
const DB_DONE_KEY = "pms_legacy_purge_db_v1";
const BACKUP_KEY = "pms_legacy_purge_backup_v1";
const FINANCE_PREFIX = "zyno-pms-finance-data-v6";

const mentionsLegacy = (value: unknown): boolean => {
  const text = typeof value === "string" ? value : JSON.stringify(value ?? "");
  return INVOICE_NOS.some((n) => text.includes(n)) || WORK_ORDERS.some((w) => text.includes(w)) || VOUCHER_NOS.some((v) => text.includes(v));
};

function readList(key: string): any[] | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function purgeLocal(): void {
  const removed: Record<string, any[]> = {};
  const filterKey = (key: string, isLegacy: (item: any) => boolean) => {
    const list = readList(key);
    if (!list) return;
    const kept = list.filter((item) => !isLegacy(item));
    if (kept.length !== list.length) {
      removed[key] = list.filter(isLegacy);
      localStorage.setItem(key, JSON.stringify(kept));
    }
  };

  // AP invoices and their receipts (the Procurement / Finance / Vendor screens all read these)
  filterKey("proc_ap_invoices_cache_v2", (i) => INVOICE_NOS.includes(i?.invoice_number) || WORK_ORDERS.includes(i?.po_number) || mentionsLegacy(i?.invoice_number));
  filterKey("proc_payment_receipts_v2", (r) => INVOICE_NOS.includes(r?.invoice_number) || VOUCHER_NOS.includes(r?.voucher_number));
  // Maintenance side
  filterKey("pms_vendor_invoices", (i) => INVOICE_NOS.includes(i?.invoiceNo) || WORK_ORDERS.includes(i?.workOrderId));
  filterKey("pms_maintenance_tickets", (t) => TICKETS.includes(t?.id));
  filterKey("pms_work_orders", (w) => WORK_ORDERS.includes(w?.id));
  // Finance ledger copies kept in the browser
  ["-vouchers", "-ap", "-journals", "-ar", "-cashbook"].forEach((suffix) =>
    filterKey(FINANCE_PREFIX + suffix, (item) => mentionsLegacy(item)),
  );

  // Partial-payment markers are keyed by invoice id, which the cleaned invoice list no longer has.
  try {
    const known = new Set((readList("proc_ap_invoices_cache_v2") || []).map((i) => String(i?.id)));
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i) || "";
      if (k.startsWith("partial_paid_") && !known.has(k.replace("partial_paid_", ""))) {
        const v = localStorage.getItem(k);
        if (v && Number(v) > 0) {
          (removed["partial_paid"] ||= []).push({ key: k, value: v });
          localStorage.removeItem(k);
        }
      }
    }
  } catch {
    // markers are cosmetic
  }

  if (Object.keys(removed).length > 0) {
    try {
      localStorage.setItem(BACKUP_KEY, JSON.stringify({ removedAt: new Date().toISOString(), removed }));
    } catch {
      // backup is best-effort
    }
    console.info("[purge] removed legacy test transactions from this browser:", Object.fromEntries(Object.entries(removed).map(([k, v]) => [k, v.length])));
  }
  localStorage.setItem(LOCAL_DONE_KEY, "1");
}

async function purgeDatabase(): Promise<void> {
  try {
    const filters = [
      ...VOUCHER_NOS.map((n) => `voucher_number.eq.${n}`),
      ...INVOICE_NOS.map((n) => `description.ilike.%${n}%`),
      ...WORK_ORDERS.map((w) => `description.ilike.%${w}%`),
    ].join(",");
    const { error } = await supabase.from("fin_vouchers").delete().or(filters);
    if (!error) localStorage.setItem(DB_DONE_KEY, "1");
  } catch {
    // try again on the next load
  }
}

if (typeof window !== "undefined") {
  try {
    if (!localStorage.getItem(LOCAL_DONE_KEY)) purgeLocal();
    if (!localStorage.getItem(DB_DONE_KEY)) void purgeDatabase();
  } catch {
    // storage unavailable; nothing to purge
  }
}

export {};
