/**
 * Write-through persistence for finance entries.
 *
 * Every entry is written to the database before the screen treats it as saved. The browser copy is only a cache:
 * if a write fails, the entry is removed from the screen again and the user is told it was not saved.
 *
 *  - Receivable invoices live in `fin_receivable_invoices` (payload keeps the full invoice object).
 *  - Vouchers live in `fin_vouchers`, with their account lines in `fin_voucher_lines`. Lines carry the account UUID
 *    from `fin_coa_accounts`, so an entry never loses its debit/credit accounts.
 */
import { supabase } from "@/lib/supabase";
import { apiDb } from "@/lib/api-db";

export type PersistResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

export type ArInvoiceLike = {
  id: string;
  invoice_no: string;
  tenant: string;
  property: string;
  unit: string;
  date: string;
  stream?: string;
  account_code?: string;
  amount: number;
  status: string;
  billingPeriod?: string;
  leaseId?: string;
};

export type VoucherLike = {
  id: string;
  voucher_no: string;
  voucher_type: string;
  date: string;
  name: string;
  debit: string;
  debit_code: string;
  credit: string;
  credit_code: string;
  amount: number;
  status?: string;
  property_name?: string;
  unit_ref?: string;
  tenant_name?: string;
  lines?: { type: "DR" | "CR"; account?: string; account_code?: string; amount: number; description?: string }[];
};

const VOUCHER_TYPE_CODE: Record<string, string> = {
  "Payment Voucher": "PV",
  "Receipt Voucher": "RV",
  "Journal Voucher": "JV",
  "Contra Voucher": "CV",
};

function errText(e: unknown): string {
  if (!e) return "Unknown error";
  if (typeof e === "string") return e;
  const m = (e as { message?: string }).message;
  return m || "Unknown error";
}

/* ───────── Receivable invoices ───────── */

export function arRow(inv: ArInvoiceLike) {
  return {
    invoice_no: inv.invoice_no,
    invoice_date: inv.date || null,
    billing_period: inv.billingPeriod || (inv.date ? inv.date.slice(0, 7) : null),
    property_name: inv.property || null,
    unit_ref: inv.unit || null,
    tenant_name: inv.tenant || null,
    lease_id: inv.leaseId || null,
    stream: inv.stream || null,
    account_code: inv.account_code || null,
    amount: Number(inv.amount) || 0,
    status: inv.status || "Pending",
    payload: inv,
    updated_at: new Date().toISOString(),
  };
}

/** Insert the invoices; any invoice_no already in the database is left as it is. */
export async function persistReceivables(invoices: ArInvoiceLike[]): Promise<PersistResult> {
  if (invoices.length === 0) return { ok: true };
  const { error } = await apiDb
    .from("fin_receivable_invoices")
    .upsert(invoices.map(arRow), { onConflict: "invoice_no", ignoreDuplicates: true });
  return error ? { ok: false, error: errText(error) } : { ok: true };
}

/** Status / amount change for one invoice (e.g. marked as collected). */
export async function updateReceivable(inv: ArInvoiceLike): Promise<PersistResult> {
  const { error } = await apiDb
    .from("fin_receivable_invoices")
    .update(arRow(inv))
    .eq("invoice_no", inv.invoice_no);
  return error ? { ok: false, error: errText(error) } : { ok: true };
}

/** Full list from the database. Returns null when the read fails, so the caller keeps what it has. */
export async function loadReceivables(): Promise<ArInvoiceLike[] | null> {
  const { data, error } = await supabase.from("fin_receivable_invoices").select("payload").order("invoice_date", { ascending: false }).limit(10000);
  if (error || !data) return null;
  return data.map((r: { payload: ArInvoiceLike }) => r.payload);
}

/* ───────── Vouchers ───────── */

/** Insert a voucher and its account lines. Rolls the voucher back if any line fails. */
export async function persistVoucher(v: VoucherLike): Promise<PersistResult<{ id: string }>> {
  const lines = v.lines && v.lines.length > 0
    ? v.lines.map(l => ({
        code: String(l.account_code || l.account || "").trim().split(/\s+/)[0],
        dr: l.type === "DR" ? Number(l.amount) || 0 : 0,
        cr: l.type === "CR" ? Number(l.amount) || 0 : 0,
        description: l.description || v.name,
      }))
    : [
        { code: String(v.debit_code || "").trim(), dr: Number(v.amount) || 0, cr: 0, description: v.debit || v.name },
        { code: String(v.credit_code || "").trim(), dr: 0, cr: Number(v.amount) || 0, description: v.credit || v.name },
      ];

  const codes = Array.from(new Set(lines.map(l => l.code).filter(Boolean)));
  if (codes.length === 0) return { ok: false, error: "No account codes on this voucher" };

  const { data: accounts, error: accErr } = await supabase
    .from("fin_coa_accounts")
    .select("id, account_code, account_name")
    .in("account_code", codes);
  if (accErr) return { ok: false, error: errText(accErr) };
  const byCode = new Map((accounts || []).map((a: { id: string; account_code: string; account_name: string }) => [a.account_code, a]));
  const missing = codes.filter(c => !byCode.has(c));
  if (missing.length) return { ok: false, error: `Account ${missing.join(", ")} is not in the chart of accounts` };

  const { data: vRow, error: vErr } = await apiDb
    .from("fin_vouchers")
    .insert({
      voucher_number: v.voucher_no,
      voucher_date: v.date,
      voucher_type: VOUCHER_TYPE_CODE[v.voucher_type] || "JV",
      reference_no: v.debit_code || null,
      description: v.name,
      total_amount: Number(v.amount) || 0,
      status: "posted",
      posted_at: new Date().toISOString(),
      source_type: "FINANCE_VOUCHER",
    })
    .select("id")
    .single();
  if (vErr || !vRow) return { ok: false, error: errText(vErr) || "Voucher not saved" };
  const voucherId = String((vRow as { id: string }).id);

  const { error: lErr } = await apiDb.from("fin_voucher_lines").insert(
    lines.map(l => {
      const acct = byCode.get(l.code) as { id: string; account_name: string };
      return {
        voucher_id: voucherId,
        account_id: acct.id,
        account_code: l.code,
        account_name: acct.account_name,
        debit_amount: l.dr,
        credit_amount: l.cr,
        description: l.description,
      };
    }),
  );
  if (lErr) {
    // Keep the database free of a voucher with no lines.
    await apiDb.from("fin_vouchers").delete().eq("id", voucherId);
    return { ok: false, error: errText(lErr) };
  }
  return { ok: true, data: { id: voucherId } };
}
