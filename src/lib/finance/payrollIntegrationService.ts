import { supabase } from '../supabase';
import { postVoucher } from './posting-engine';
import { FinPayrollSyncsApi } from '../supabase-finance';

export type PayrollJournalLine = {
  employee_id: string;
  department: string;
  property_id?: number;
  unit_id?: number;
  cost_center_id?: number;
  account_code: string; // e.g. Basic Salary Expense
  debit: number;
  credit: number;
};

export type PayrollSyncPayload = {
  payroll_run_id: string;
  period: string;
  lines: PayrollJournalLine[];
};

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

  const totalDebit = payload.lines.reduce((s, l) => s + l.debit, 0);

  // 2. Create Sync Record
  const syncRecord = await FinPayrollSyncsApi.create({
    payroll_run_id: payload.payroll_run_id,
    period: payload.period,
    status: 'Pending',
    total_amount: totalDebit
  });

  try {
    const today = new Date().toISOString().split('T')[0];

    // 3. Map to FinVoucherLines
    const voucherLines = payload.lines.map(l => ({
      account_code: l.account_code,
      debit: l.debit,
      credit: l.credit,
      cost_center_id: l.cost_center_id,
      property_id: l.property_id,
      unit_id: l.unit_id,
      description: `Payroll ${payload.period} - Emp ${l.employee_id}`
    }));

    // 4. Post Journal
    await postVoucher({
      voucher_date: today,
      voucher_type: 'Journal',
      description: `External Payroll Sync Run: ${payload.payroll_run_id}`,
      reference_no: payload.payroll_run_id,
      lines: voucherLines
    });

    // 5. Mark as Posted
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
