import { supabase } from '../supabase';
import type { FinPdcRegister } from '../supabase-finance';

/**
 * Canonical PDC lifecycle service.
 *
 * IMPORTANT:
 * - fin_pdc_register is the single finance PDC register.
 * - PDC accounting is posted by the database lifecycle RPC.
 * - This service must not write pdcs, erp_vouchers, erp_journal_entries,
 *   fin_accounting_events, or fin_accounting_event_lines directly.
 * - The RPC makes the business-state transition and accounting posting
 *   one transaction and applies an idempotency key per lifecycle event.
 */

export type PdcLifecycleResult = {
  pdc_id: number;
  pdc_status: string;
  accounting_event_id: string;
  voucher_id: string;
  voucher_number: string;
};

function numericPdcId(value: string | number | undefined | null): number | null {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}

async function processPdcLifecycle(args: {
  action: 'RECEIVE' | 'DEPOSIT' | 'CLEAR' | 'RETURN' | 'REPLACE';
  pdcId?: string | number;
  chequeNumber?: string;
  chequeDate?: string;
  amount?: number;
  tenantId?: number;
  propertyId?: number;
  unitId?: number;
  bankId?: number;
  unitCode?: string;
}): Promise<PdcLifecycleResult> {
  const { data, error } = await supabase.rpc('fin_process_pdc_lifecycle', {
    p_action: args.action,
    p_pdc_id: numericPdcId(args.pdcId),
    p_cheque_number: args.chequeNumber || null,
    p_cheque_date: args.chequeDate || null,
    p_amount: args.amount ?? null,
    p_tenant_id: args.tenantId ?? null,
    p_property_id: args.propertyId ?? null,
    p_unit_id: args.unitId ?? null,
    p_bank_id: args.bankId ?? null,
    p_unit_code: args.unitCode || null,
  });

  if (error) {
    throw new Error(`PDC ${args.action.toLowerCase()} failed: ${error.message}`);
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    throw new Error(`PDC ${args.action.toLowerCase()} returned no result.`);
  }

  return row as PdcLifecycleResult;
}

/**
 * Event 1 — Cheque Receipt / Collection.
 *
 * Persists the PDC in fin_pdc_register and posts:
 *   Dr 12900 PDC In Hand
 *   Cr 21400 Customer(PDC) - Unit
 */
export async function receivePdc(payload: {
  cheque_number: string;
  cheque_date: string;
  amount: number;
  tenant_id: number;
  property_id: number;
  unit_id: number;
  bank_id?: number;
  unitCode?: string;
}): Promise<FinPdcRegister> {
  const result = await processPdcLifecycle({
    action: 'RECEIVE',
    chequeNumber: payload.cheque_number,
    chequeDate: payload.cheque_date,
    amount: payload.amount,
    tenantId: payload.tenant_id,
    propertyId: payload.property_id,
    unitId: payload.unit_id,
    bankId: payload.bank_id,
    unitCode: payload.unitCode,
  });

  const { data, error } = await supabase
    .from('fin_pdc_register')
    .select('*')
    .eq('id', result.pdc_id)
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'PDC was posted but could not be reloaded.');
  }

  return data as FinPdcRegister;
}

/**
 * Event 2 — Cheque Deposit to Bank.
 *
 * State transition: In Hand -> Deposited
 * GL:
 *   Dr 12000 Bank Account
 *   Cr 12900 PDC In Hand
 */
export async function depositPdc(pdcId: number | string, chequeNo?: string) {
  return processPdcLifecycle({
    action: 'DEPOSIT',
    pdcId,
    chequeNumber: chequeNo,
  });
}

/**
 * Event 3 — Cheque Cleared by Bank.
 *
 * State transition: Deposited -> Cleared
 * GL:
 *   Dr 21400 Customer(PDC) - Unit
 *   Cr 12413 Receivable - Unit
 */
export async function clearPdc(pdcId: number | string, chequeNo?: string) {
  return processPdcLifecycle({
    action: 'CLEAR',
    pdcId,
    chequeNumber: chequeNo,
  });
}

/**
 * Event 6 — Cheque Return / Bounce.
 *
 * State transition: Deposited -> Returned
 * GL:
 *   Dr 12900 PDC In Hand
 *   Cr 12000 Bank Account
 *   Dr 12413 Receivable - Unit
 *   Cr 21400 Customer(PDC) - Unit
 */
export async function returnPdc(pdcId: number | string, chequeNo?: string) {
  return processPdcLifecycle({
    action: 'RETURN',
    pdcId,
    chequeNumber: chequeNo,
  });
}

/**
 * Event 4 — Cash Deposit in place of PDC.
 *
 * State transition: In Hand/Returned -> Replaced
 * GL retained from the approved PDC flow:
 *   Dr 12000 Bank Account
 *   Cr 12100 Cash In Hand
 */
export async function cashDepositInPlaceOfPdc(
  pdcId: number | string,
  chequeNo?: string,
) {
  return processPdcLifecycle({
    action: 'REPLACE',
    pdcId,
    chequeNumber: chequeNo,
  });
}
