/**
 * One-time move of finance records that earlier versions kept only in this browser's localStorage into the database.
 *
 * Each legacy key is read, its records are written to the database (skipping any already there), and the browser
 * key is removed only after every record is saved. A key whose save fails is kept and reported, so nothing is lost.
 */
import { toast } from "sonner";
import { loadCollectionRows, upsertCollectionRecords } from "@/lib/db-collection";
import { persistReceivables, persistVoucherOnce, type ArInvoiceLike, type VoucherLike } from "@/lib/finance/finance-persistence";

const LEGACY_BASE = "zyno-pms-finance-data-v6";

function readLegacyList(key: string): any[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return null;
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function removeLegacy(key: string) {
  try { window.localStorage.removeItem(key); } catch { /* storage unavailable */ }
}

/** Upload the records that are not yet in the store, by id. */
async function uploadStore(store: string, key: string[], idOf: (x: any) => string, what: string): Promise<boolean> {
  const dbRows = await loadCollectionRows(store);
  if (!dbRows) return false;
  const known = new Set(dbRows.map(r => r.id));
  const records = key.flatMap(k => readLegacyList(k) ?? []);
  const pending = records.filter(x => !known.has(idOf(x)));
  // Keep the first copy of any id that appears in more than one legacy key.
  const unique = [...new Map(pending.map(x => [idOf(x), x])).values()];
  if (unique.length === 0) return true;
  const err = await upsertCollectionRecords(store, unique.map(x => ({ id: idOf(x), data: x })));
  if (err) { toast.error(`${what} from this browser were NOT saved to the database: ${err}`); return false; }
  return true;
}

/** Upload vouchers one at a time; a voucher whose number is already in the database is skipped. */
async function uploadVouchers(keys: string[]): Promise<boolean> {
  let ok = true;
  for (const k of keys) {
    const list = readLegacyList(k);
    if (!list) continue;
    for (const v of list) {
      if (!v?.voucher_no) continue;
      const res = await persistVoucherOnce({
        ...(v as VoucherLike),
        id: String(v.id ?? v.voucher_no),
        voucher_type: String(v.voucher_type || "Journal Voucher"),
        date: String(v.date || v.voucher_date || new Date().toISOString().slice(0, 10)),
        name: String(v.name || v.voucher_no),
        debit: String(v.debit || ""),
        debit_code: String(v.debit_code || ""),
        credit: String(v.credit || ""),
        credit_code: String(v.credit_code || ""),
        amount: Number(v.amount) || 0,
      });
      if (!res.ok) {
        toast.error(`Voucher ${v.voucher_no} from this browser was NOT saved to the database: ${res.error}`);
        ok = false;
      }
    }
  }
  return ok;
}

let ran = false;

/** Run once per browser session. Keys are removed from the browser only after their records are in the database. */
export async function migrateFinanceBrowserCaches(): Promise<void> {
  if (ran || typeof window === "undefined") return;
  ran = true;

  const plan: Array<{ keys: string[]; ok: () => Promise<boolean> }> = [
    { keys: [`${LEGACY_BASE}-journals`, "zyno-pms-finance-data-v1-journals"], ok: () => uploadStore("fin.journals", [`${LEGACY_BASE}-journals`, "zyno-pms-finance-data-v1-journals"], x => String(x.id), "Journal entries") },
    { keys: [`${LEGACY_BASE}-ap`, "zyno-pms-finance-data-v1-ap"], ok: () => uploadStore("fin.ap", [`${LEGACY_BASE}-ap`, "zyno-pms-finance-data-v1-ap"], x => String(x.id ?? x.invoice_no), "Payable invoices") },
    { keys: [`${LEGACY_BASE}-cashbook`], ok: () => uploadStore("fin.cashbook", [`${LEGACY_BASE}-cashbook`], x => String(x.id), "Cash book entries") },
    { keys: ["fin_debit_notes"], ok: () => uploadStore("fin.debit_notes", ["fin_debit_notes"], x => String(x.id), "Debit notes") },
    { keys: ["fin_credit_notes"], ok: () => uploadStore("fin.credit_notes", ["fin_credit_notes"], x => String(x.id), "Credit notes") },
    { keys: ["zyno-pdc-cash-receipts-v2"], ok: () => uploadPdcReceipts() },
  ];

  for (const step of plan) {
    if (step.keys.every(k => readLegacyList(k) === null)) continue;
    const done = await step.ok();
    if (done) step.keys.forEach(removeLegacy);
  }

  // Receivables and vouchers go through their own persistence rules.
  const arKeys = [`${LEGACY_BASE}-ar`, "zyno-pms-finance-data-v1-ar"];
  const arList = arKeys.flatMap(k => readLegacyList(k) ?? []) as ArInvoiceLike[];
  if (arList.length) {
    const res = await persistReceivables(arList.map(a => ({ ...a, id: String(a.id ?? a.invoice_no) })));
    if (res.ok) arKeys.forEach(removeLegacy);
    else toast.error(`Receivables from this browser were NOT saved to the database: ${res.error}`);
  } else {
    arKeys.forEach(k => { if (readLegacyList(k) !== null) removeLegacy(k); });
  }

  const voucherKeys = [`${LEGACY_BASE}-vouchers`, "zyno-pms-finance-data-v1-vouchers", "zyno_finance_vouchers", "finance_master_v1-vouchers"];
  if (voucherKeys.some(k => readLegacyList(k) !== null)) {
    const ok = await uploadVouchers(voucherKeys);
    if (ok) voucherKeys.forEach(removeLegacy);
  }

  // Derived cache: rebuilt from the database, so it is simply removed.
  removeLegacy("pms_posting_periods_cache");
}

/** PDC cash receipts were one browser object keyed by cheque number. Each cheque becomes one database record. */
async function uploadPdcReceipts(): Promise<boolean> {
  const key = "zyno-pdc-cash-receipts-v2";
  let obj: Record<string, unknown> = {};
  try {
    const raw = window.localStorage.getItem(key);
    obj = raw ? JSON.parse(raw) : {};
  } catch {
    return false;
  }
  const dbRows = await loadCollectionRows("pdc.cash_receipts");
  if (!dbRows) return false;
  const known = new Set(dbRows.map(r => r.id));
  const records = Object.entries(obj)
    .filter(([id]) => !known.has(id))
    .map(([id, rows]) => ({ id, data: { id, rows } }));
  if (records.length === 0) return true;
  const err = await upsertCollectionRecords("pdc.cash_receipts", records);
  if (err) { toast.error(`PDC cash receipts from this browser were NOT saved to the database: ${err}`); return false; }
  return true;
}
