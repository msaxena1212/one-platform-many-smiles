import { supabase } from '../supabase';
import { resolveAccountingAccounts, normalizeUuid } from './account-resolver';
import { postVoucher, type PostingResult } from './posting-engine';
import { FinLegalReceivablesApi } from '../supabase-finance';

/**
 * Legal Receivable Engine (Phase 2 — Resolver-driven)
 *
 * All account codes are resolved through the canonical Account Resolver.
 * Transaction types:
 *   - LEGAL_ESCALATION  : Dr 12411001 Legal Receivable / Cr 12413 [unit SL]
 *   - LEGAL_RECOVERY    : Dr 12000001 Bank / Cr 12411001 Legal Receivable
 *
 * Hard-coded GLs (12411, 12413, 12000) have been removed.
 */

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
}): Promise<{ legalRec: unknown; voucher: PostingResult }> {
  const today = new Date().toISOString().split('T')[0];

  // 1. Resolve Dr/Cr through the canonical resolver.
  //    credit is the unit-scoped 12413 SL (tenant AR), so unitId is required.
  const { debit: drAcct, credit: crAcct } = await resolveAccountingAccounts({
    transactionType: 'LEGAL_ESCALATION',
    propertyId: String(payload.property_id),
    unitId: normalizeUuid(payload.unit_id),
    tenantId: normalizeUuid(payload.tenant_id),
    leaseId: normalizeUuid(payload.lease_id),
  });

  // 2. Post Escalation Journal (Dr Legal Receivable / Cr Tenant Receivable)
  const voucher = await postVoucher({
    voucher_date: today,
    voucher_type: 'Journal',
    description: `Legal Escalation: ${payload.reason}`,
    tenant_id: payload.tenant_id,
    property_id: payload.property_id,
    unit_id: payload.unit_id,
    lease_id: payload.lease_id,
    lines: [
      {
        account_code: drAcct.slCode,
        account_name: `${drAcct.groupName} / ${drAcct.className} / ${drAcct.glName} / ${drAcct.slName}`,
        debit: payload.amount,
        credit: 0,
        tenant_id: payload.tenant_id,
        property_id: payload.property_id,
        unit_id: payload.unit_id,
        lease_id: payload.lease_id,
        description: `Legal Receivable – ${payload.reason}`,
      },
      {
        account_code: crAcct.slCode,
        account_name: `${crAcct.groupName} / ${crAcct.className} / ${crAcct.glName} / ${crAcct.slName}`,
        debit: 0,
        credit: payload.amount,
        tenant_id: payload.tenant_id,
        property_id: payload.property_id,
        unit_id: payload.unit_id,
        lease_id: payload.lease_id,
        description: `Reduce Tenant AR – ${crAcct.slName}`,
      },
    ],
  });

  // 3. Create Subledger Entry
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
export async function recoverLegalFunds(
  legalId: string | number,
  amount: number,
  bankRef: string,
): Promise<void> {
  const { data: legalRec, error } = await supabase
    .from('fin_legal_receivables')
    .select('*')
    .eq('id', legalId)
    .single();
  if (error) throw error;
  if (legalRec.outstanding_balance < amount) {
    throw new Error('Recovery amount exceeds outstanding balance.');
  }

  const today = new Date().toISOString().split('T')[0];

  // 1. Resolve Dr/Cr through the canonical resolver.
  //    Both sides are fixed SLs (12000001 Bank and 12411001 Legal Receivable)
  //    so no unit context is required by the resolver.
  const { debit: drAcct, credit: crAcct } = await resolveAccountingAccounts({
    transactionType: 'LEGAL_RECOVERY',
    paymentMethod: 'BANK',
    propertyId: String(legalRec.property_id),
    unitId: normalizeUuid(legalRec.unit_id),
    tenantId: normalizeUuid(legalRec.tenant_id),
    leaseId: normalizeUuid(legalRec.lease_id),
  });

  // 2. Post receipt voucher (Dr Bank / Cr Legal Receivable)
  await postVoucher({
    voucher_date: today,
    voucher_type: 'Receipt',
    description: `Legal Recovery for ID ${legalId}`,
    reference_no: bankRef,
    tenant_id: legalRec.tenant_id,
    property_id: legalRec.property_id,
    unit_id: legalRec.unit_id,
    lease_id: legalRec.lease_id,
    lines: [
      {
        account_code: drAcct.slCode,
        account_name: `${drAcct.groupName} / ${drAcct.className} / ${drAcct.glName} / ${drAcct.slName}`,
        debit: amount,
        credit: 0,
        tenant_id: legalRec.tenant_id,
        property_id: legalRec.property_id,
        unit_id: legalRec.unit_id,
        lease_id: legalRec.lease_id,
        description: `Bank Receipt – Legal Recovery ${legalId}`,
      },
      {
        account_code: crAcct.slCode,
        account_name: `${crAcct.groupName} / ${crAcct.className} / ${crAcct.glName} / ${crAcct.slName}`,
        debit: 0,
        credit: amount,
        tenant_id: legalRec.tenant_id,
        property_id: legalRec.property_id,
        unit_id: legalRec.unit_id,
        lease_id: legalRec.lease_id,
        description: `Reduce Legal Receivable – ${crAcct.slName}`,
      },
    ],
  });

  const newBalance = legalRec.outstanding_balance - amount;
  await FinLegalReceivablesApi.update(String(legalId), {
    outstanding_balance: newBalance,
    status: newBalance <= 0.001 ? 'Fully Recovered' : 'Partially Recovered'
  });
}
