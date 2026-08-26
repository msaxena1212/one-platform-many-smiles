import { supabase } from '../supabase';
import { postLeaseDepositReceipt, postVoucher } from './posting-engine';
import { FinDepositsApi } from '../supabase-finance';

/**
 * Step 1: Collect Leasing Security Deposit (21500)
 */
export async function collectSecurityDeposit(payload: {
  amount: number;
  tenant_id: string | number;
  property_id: string | number;
  unit_id: string | number;
  lease_id?: string | number;
  mode: 'Cash' | 'Bank';
  ref: string;
}) {
  // Post receipt journal (Dr Bank/Cash, Cr 21500)
  const voucher = await postLeaseDepositReceipt(
    payload.amount, 
    payload.tenant_id as any, 
    payload.property_id as any, 
    payload.unit_id as any, 
    payload.mode, 
    payload.ref
  );

  // Record deposit subledger
  const deposit = await FinDepositsApi.create({
    deposit_type: 'Security Deposit',
    coa_account_code: '21500',
    amount: payload.amount,
    tenant_id: String(payload.tenant_id),
    property_id: String(payload.property_id),
    unit_id: String(payload.unit_id),
    lease_id: payload.lease_id != null ? String(payload.lease_id) : undefined,
    status: 'Active',
    receipt_ref: voucher.voucher_number
  });

  return deposit;
}

/**
 * Step 2: Transfer Deposit from 21500 to 21100 when Tenant Vacates
 */
export async function transferDepositToRefundable(depositId: number | string) {
  const isNumeric = typeof depositId === 'number' || (!isNaN(Number(depositId)) && !String(depositId).includes('-'));
  if (!isNumeric) {
    return;
  }

  const numId = Number(depositId);
  const { data: deposit, error } = await supabase.from('fin_deposits').select('*').eq('id', numId).single();
  if (error) throw error;
  if (deposit.coa_account_code !== '21500') throw new Error('Deposit is already refundable or not a leasing deposit.');

  const today = new Date().toISOString().split('T')[0];

  // Dr 21500, Cr 21100
  await postVoucher({
    voucher_date: today,
    voucher_type: 'Journal',
    description: `Transfer Deposit to Refundable at Lease Closure`,
    reference_no: deposit.receipt_ref,
    lines: [
      { account_code: '21500', debit: deposit.amount, credit: 0, tenant_id: deposit.tenant_id, property_id: deposit.property_id, unit_id: deposit.unit_id },
      { account_code: '21100', debit: 0, credit: deposit.amount, tenant_id: deposit.tenant_id, property_id: deposit.property_id, unit_id: deposit.unit_id }
    ]
  });

  // Update Subledger
  await FinDepositsApi.update(String(numId), { 
    coa_account_code: '21100', 
    status: 'Refundable' 
  });
}

/**
 * Step 3: Settle Refundable Deposit against deductions and refund the rest
 */
export async function settleDeposit(depositId: number | string, deductions: number, refundAmount: number) {
  const isNumeric = typeof depositId === 'number' || (!isNaN(Number(depositId)) && !String(depositId).includes('-'));
  if (!isNumeric) {
    return;
  }

  const numId = Number(depositId);
  const { data: deposit, error } = await supabase.from('fin_deposits').select('*').eq('id', numId).single();
  if (error) throw error;
  if (deposit.status !== 'Refundable') throw new Error('Deposit must be marked Refundable before settlement.');

  const total = deductions + refundAmount;
  if (Math.abs(total - deposit.amount) > 0.001) throw new Error('Deductions and Refund must equal Deposit Amount.');

  const today = new Date().toISOString().split('T')[0];
  
  const lines = [
    { account_code: '21100', debit: deposit.amount, credit: 0, tenant_id: deposit.tenant_id, property_id: deposit.property_id, unit_id: deposit.unit_id, description: 'Settle Refundable Deposit' }
  ];

  if (refundAmount > 0) {
    lines.push({ account_code: '12000', debit: 0, credit: refundAmount, tenant_id: deposit.tenant_id, property_id: deposit.property_id, unit_id: deposit.unit_id, description: 'Bank Refund' });
  }

  if (deductions > 0) {
    // Assuming deductions go against Tenant Receivables (12413) 
    lines.push({ account_code: '12413', debit: 0, credit: deductions, tenant_id: deposit.tenant_id, property_id: deposit.property_id, unit_id: deposit.unit_id, description: 'Offset Tenant Dues' });
  }

  await postVoucher({
    voucher_date: today,
    voucher_type: 'Journal',
    description: `Settle Deposit ID ${depositId}`,
    lines
  });

  await FinDepositsApi.update(String(numId), { status: refundAmount > 0 ? 'Refunded' : 'Settled' });
}
