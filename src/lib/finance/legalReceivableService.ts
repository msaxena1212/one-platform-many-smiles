import { supabase } from '../supabase';
import { postVoucher } from './posting-engine';
import { FinLegalReceivablesApi } from '../supabase-finance';

/**
 * Escalate an overdue Tenant Receivable to Legal
 */
export async function escalateToLegal(payload: {
  amount: number;
  tenant_id: string | number;
  property_id: string | number;
  unit_id: string | number;
  lease_id?: string | number;
  reason: string;
}) {
  const today = new Date().toISOString().split('T')[0];

  // 1. Post Escalation Journal (Dr Legal Receivable 12411, Cr Tenant Receivable 12413)
  const voucher = await postVoucher({
    voucher_date: today,
    voucher_type: 'Journal',
    description: `Legal Escalation: ${payload.reason}`,
    lines: [
      { account_code: '12411', debit: payload.amount, credit: 0, tenant_id: payload.tenant_id as any, property_id: payload.property_id as any, unit_id: payload.unit_id as any },
      { account_code: '12413', debit: 0, credit: payload.amount, tenant_id: payload.tenant_id as any, property_id: payload.property_id as any, unit_id: payload.unit_id as any }
    ]
  });

  // 2. Create Subledger Entry
  const legalRec = await FinLegalReceivablesApi.create({
    tenant_id: String(payload.tenant_id),
    property_id: String(payload.property_id),
    unit_id: String(payload.unit_id),
    lease_id: payload.lease_id != null ? String(payload.lease_id) : undefined,
    original_amount: payload.amount,
    outstanding_balance: payload.amount,
    escalation_date: today,
    reason: payload.reason,
    status: 'Escalated'
  });

  return { legalRec, voucher };
}

/**
 * Recover Funds from a Legal Receivable
 */
export async function recoverLegalFunds(legalId: string | number, amount: number, bankRef: string) {
  const { data: legalRec, error } = await supabase
    .from('fin_legal_receivables')
    .select('*')
    .eq('id', legalId)
    .single();
  if (error) throw error;
  if (legalRec.outstanding_balance < amount) throw new Error('Recovery amount exceeds outstanding balance.');

  const today = new Date().toISOString().split('T')[0];

  // Dr Bank, Cr Legal Receivable
  await postVoucher({
    voucher_date: today,
    voucher_type: 'Receipt',
    description: `Legal Recovery for ID ${legalId}`,
    reference_no: bankRef,
    lines: [
      { account_code: '12000', debit: amount, credit: 0, tenant_id: legalRec.tenant_id, property_id: legalRec.property_id, unit_id: legalRec.unit_id },
      { account_code: '12411', debit: 0, credit: amount, tenant_id: legalRec.tenant_id, property_id: legalRec.property_id, unit_id: legalRec.unit_id }
    ]
  });

  const newBalance = legalRec.outstanding_balance - amount;
  await FinLegalReceivablesApi.update(String(legalId), {
    outstanding_balance: newBalance,
    status: newBalance <= 0.001 ? 'Fully Recovered' : 'Partially Recovered'
  });
}
