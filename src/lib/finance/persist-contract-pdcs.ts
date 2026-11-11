/**
 * Saves the PDCs captured when a contract is created or renewed.
 *
 * Writes the `pdcs` rows first, then the matching `fin_pdc_register` rows (only columns that exist in that
 * table, linked through `original_pdc_id`), and ONLY THEN tells the finance store to refresh so the
 * "PDC In Hand" vouchers reach the Trial Balance, General Ledger and Customer SOA straight away.
 * (Previously the refresh event fired before the inserts finished, and the register insert used columns the
 * table does not have, so it failed silently.)
 */
import { apiDb } from "@/lib/api-db";

export type ContractPdcInput = {
  chequeNo: string | number;
  date: string;
  amount: number;
  bank?: string;
  tenureStart?: string;
  tenureEnd?: string;
};

export type ContractPdcContext = {
  unit: string;
  property: string;
  propertyCode?: string;
  tenantName: string;
  leaseId?: string;
};

export async function persistContractPdcs(
  pdcs: ContractPdcInput[],
  ctx: ContractPdcContext,
): Promise<{ ok: boolean; inserted: number; error?: string }> {
  if (!pdcs.length) return { ok: true, inserted: 0 };
  const notify = () => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent("pdcs_updated"));
    window.dispatchEvent(new CustomEvent("finance_vouchers_updated"));
  };

  const pdcRows = pdcs.map((p) => ({
    cheque_number: p.chequeNo,
    amount: p.amount,
    bank: p.bank,
    status: "In Hand",
    status_pdc: "in hand",
    unit_name: ctx.unit,
    property_name: ctx.property,
    property_code: ctx.propertyCode || ctx.property?.split(" - ")[0] || "Al Ameen",
    tenant_name: ctx.tenantName,
    maturity_date: p.date,
    deposit_date: p.date,
    rent_from_date: p.tenureStart,
    rent_to_date: p.tenureEnd,
    lease_id: ctx.leaseId,
  }));

  const { data: saved, error } = await apiDb.from("pdcs").insert(pdcRows).select("id, sl_no, cheque_number");
  if (error) {
    console.warn("[persistContractPdcs] pdcs insert failed:", error.message);
    return { ok: false, inserted: 0, error: error.message };
  }

  // Register rows: only real fin_pdc_register columns.
  const savedRows: any[] = Array.isArray(saved) ? saved : [];
  const registerRows = pdcs.map((p, i) => {
    const match = savedRows.find((r) => String(r.cheque_number) === String(p.chequeNo)) || savedRows[i];
    return {
      cheque_number: p.chequeNo,
      cheque_date: p.date,
      amount: p.amount,
      status: "In Hand",
      ...(match?.sl_no != null ? { original_pdc_id: match.sl_no } : {}),
    };
  });
  const { error: regError } = await apiDb.from("fin_pdc_register").insert(registerRows);
  if (regError) console.warn("[persistContractPdcs] fin_pdc_register insert note:", regError.message);

  notify();
  return { ok: true, inserted: pdcRows.length };
}
