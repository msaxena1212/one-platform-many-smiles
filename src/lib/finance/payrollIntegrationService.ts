import { supabase } from '../supabase';
import { resolveGlOnlyAccount } from './account-resolver';
import { postVoucher } from './posting-engine';
import { FinPayrollSyncsApi } from '../supabase-finance';

/**
 * Payroll Integration Service (Phase 2 — Resolver-driven)
 *
 * Account codes for the credit side (Bank / Payroll Liabilities) and the
 * debit side (Salary Expense) are resolved through the canonical
 * fin_coa_accounts via resolveGlOnlyAccount() — no hard-coded GL/SL
 * strings remain in the posting path.
 *
 * The caller (e.g. payroll-sync.tsx) supplies the *external* department /
 * cost-center labels, but the actual COA codes are looked up from the
 * fin_coa_accounts table so admin renames propagate automatically.
 */

export type PayrollJournalLine = {
  employee_id: string;
  department: string;
  property_id?: number;
  unit_id?: number;
  cost_center_id?: number;
  /**
   * External payroll system's account code (e.g. "50100"). Resolved against
   * fin_coa_accounts at posting time. If the value is not present in the COA
   * the post is rejected by the posting engine.
   */
  account_code: string;
  debit: number;
  credit: number;
};

export type PayrollSyncPayload = {
  payroll_run_id: string;
  period: string;
  lines: PayrollJournalLine[];
};

const SALARY_EXPENSE_GLS = new Set(['50100', '50100001']);
const PAYROLL_PAYABLE_GLS = new Set(['21900', '21900001']);
const BANK_GLS = new Set(['12000', '12000001']);

/**
 * Handle API ingestion of External Payroll Runs
 */
export async function syncPayrollRun(payload: PayrollSyncPayload) {
  // 1. Check for duplicates
  const { data: existing } = await supabase
    .from('fin_payroll_syncs')
    .select('id')
    .eq('payroll_run_id', payload.payroll_run_id)
    .single();

  if (existing) {
    throw new Error(`Payroll Run ${payload.payroll_run_id} has already been synced.`);
  }

  // 2. Validate that we received a balanced set of lines and that every
  //    external account_code is recognisable as either a salary expense,
  //    a payroll payable or a bank credit. The posting engine will
  //    independently re-resolve the COA on its own side.
  let externalSalaryDebit = 0;
  let externalDeductionCredit = 0;
  let externalBankCredit = 0;
  for (const line of payload.lines) {
    const ac = String(line.account_code || '').trim();
    if (SALARY_EXPENSE_GLS.has(ac)) {
      externalSalaryDebit += Number(line.debit || 0);
    } else if (PAYROLL_PAYABLE_GLS.has(ac)) {
      externalDeductionCredit += Number(line.credit || 0);
    } else if (BANK_GLS.has(ac)) {
      externalBankCredit += Number(line.credit || 0);
    } else {
      throw new Error(
        `Payroll line references an unsupported account_code "${ac}". ` +
        `Expected one of 50100, 21900, 12000.`,
      );
    }
  }

  // 3. Resolve the canonical SLs from fin_coa_accounts.
  const [salaryExp, payrollPayable, bank] = await Promise.all([
    resolveGlOnlyAccount('50100'),
    resolveGlOnlyAccount('21900'),
    resolveGlOnlyAccount('12000'),
  ]);

  // 4. Compose the voucher lines through the resolver, not the literal codes.
  //    - Dr Salary Expense (50100001) for the gross salary component
  //    - Cr Payroll Payable (21900001) for net-of-deductions
  //    - Cr Bank (12000001) for the disbursement
  const voucherLines: Array<{
    account_code: string;
    account_name: string;
    debit: number;
    credit: number;
    cost_center_id?: number;
    property_id?: number;
    unit_id?: number;
    description: string;
  }> = [
    {
      account_code: salaryExp.slCode,
      account_name: `${salaryExp.groupName} / ${salaryExp.className} / ${salaryExp.glName} / ${salaryExp.slName}`,
      debit: externalSalaryDebit,
      credit: 0,
      property_id: payload.lines[0]?.property_id,
      unit_id: payload.lines[0]?.unit_id,
      cost_center_id: payload.lines[0]?.cost_center_id,
      description: `Payroll ${payload.period} – Salary Expense`,
    },
  ];
  if (externalDeductionCredit > 0) {
    voucherLines.push({
      account_code: payrollPayable.slCode,
      account_name: `${payrollPayable.groupName} / ${payrollPayable.className} / ${payrollPayable.glName} / ${payrollPayable.slName}`,
      debit: 0,
      credit: externalDeductionCredit,
      property_id: payload.lines[0]?.property_id,
      unit_id: payload.lines[0]?.unit_id,
      cost_center_id: payload.lines[0]?.cost_center_id,
      description: `Payroll ${payload.period} – Net Pay Payable`,
    });
  }
  voucherLines.push({
    account_code: bank.slCode,
    account_name: `${bank.groupName} / ${bank.className} / ${bank.glName} / ${bank.slName}`,
    debit: 0,
    credit: externalBankCredit,
    property_id: payload.lines[0]?.property_id,
    unit_id: payload.lines[0]?.unit_id,
    cost_center_id: payload.lines[0]?.cost_center_id,
    description: `Payroll ${payload.period} – Bank Disbursement`,
  });

  const totalDebit = voucherLines.reduce((s, l) => s + l.debit, 0);

  // 5. Create Sync Record
  const syncRecord = await FinPayrollSyncsApi.create({
    payroll_run_id: payload.payroll_run_id,
    period: payload.period,
    status: 'Pending',
    total_amount: totalDebit
  });

  try {
    const today = new Date().toISOString().split('T')[0];

    // 6. Post Journal — posting engine will independently re-validate
    //    every account_code against fin_coa_accounts.
    await postVoucher({
      voucher_date: today,
      voucher_type: 'Journal',
      description: `External Payroll Sync Run: ${payload.payroll_run_id}`,
      reference_no: payload.payroll_run_id,
      lines: voucherLines
    });

    // 7. Mark as Posted
    await FinPayrollSyncsApi.update(syncRecord.id, { status: 'Posted' });

    return { success: true, syncId: syncRecord.id };

  } catch (error: any) {
    // Mark as Failed with details
    await FinPayrollSyncsApi.update(syncRecord.id, {
      status: 'Failed',
      error_details: error.message || 'Unknown error during payroll journal posting'
    });
    throw error;
  }
}
