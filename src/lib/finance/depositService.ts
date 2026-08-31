import { supabase } from '../supabase';
import { postLeaseDepositReceipt, postVoucher } from './posting-engine';
import {
  resolveAccountingAccounts,
  resolveGlOnlyAccount,
  type DepositType,
  type PaymentMethod,
} from './account-resolver';
import { FinDepositsApi } from '../supabase-finance';

// ── Types ─────────────────────────────────────────────────────────────────────

export type DepositCollectionPayload = {
  amount: number;
  tenant_id: string | number;
  property_id: string | number;
  unit_id: string | number;
  lease_id?: string | number;
  /**
   * Payment mode for this deposit collection.
   * Determines the debit account:
   *   Cash → 12100 [unit SL]
   *   Bank → 12000001
   */
  mode: 'Cash' | 'Bank';
  /**
   * Type of deposit being collected.
   * Determines the credit GL/SL account.
   */
  depositType?: DepositType;
  /** Human-readable unit name for SL name generation (e.g. "Flat 15") */
  unit_name?: string;
  ref: string;
};

// ── Step 1: Collect Deposit ───────────────────────────────────────────────────

/**
 * Collect a security (or other) deposit from a tenant.
 *
 * COA:
 *   Security / Bank:   Dr 12000001 Bank        / Cr 21500[unit SL] Deposit
 *   Security / Cash:   Dr 12100[unit SL] Cash  / Cr 21500[unit SL] Deposit
 *   Qatar Cool / Bank: Dr 12000001 Bank        / Cr 21100003 Qatar Cool Deposit
 *   Kahramaa / Bank:   Dr 12000001 Bank        / Cr 21100004 Kahramaa Deposit
 *   Service Fee / Bank:Dr 12000001 Bank        / Cr 21100005 Service Fee Deposit
 *   Reservation / Bank:Dr 12000001 Bank        / Cr 21100001 Reservation Advance
 */
export async function collectSecurityDeposit(payload: DepositCollectionPayload) {
  const depositType: DepositType = payload.depositType ?? 'SECURITY';
  const paymentMethod: PaymentMethod = payload.mode === 'Cash' ? 'CASH' : 'BANK';

  // Post receipt journal via the SL-aware posting function
  const voucher = await postLeaseDepositReceipt(
    payload.amount,
    payload.tenant_id,
    payload.property_id,
    payload.unit_id,
    payload.mode,
    payload.ref,
    payload.unit_name,
  );

  // Map depositType to COA account code for subledger recording
  const coaCodeMap: Record<DepositType, string> = {
    SECURITY:     '21500',
    GUARANTEE:    '21200',
    QATAR_COOL:   '21100003',
    KAHRAMAA:     '21100004',
    SERVICE_FEE:  '21100005',
    RESERVATION:  '21100001',
  };

  // Record deposit subledger entry
  const deposit = await FinDepositsApi.create({
    deposit_type:     depositType,
    coa_account_code: coaCodeMap[depositType],
    amount:           payload.amount,
    tenant_id:        String(payload.tenant_id),
    property_id:      String(payload.property_id),
    unit_id:          String(payload.unit_id),
    lease_id:         payload.lease_id != null ? String(payload.lease_id) : undefined,
    status:           'Active',
    receipt_ref:      voucher.voucher_number,
  });

  return deposit;
}

// ── Step 2: Transfer Deposit 21500 → 21100 ───────────────────────────────────

/**
 * Transfer leasing security deposit from 21500 to 21100006 when tenant vacates.
 *
 * COA:
 *   Dr 21500[unit SL]  Deposits - Leasing Customers
 *   Cr 21100006        Refundable Security Deposit - Tenant
 */
export async function transferDepositToRefundable(
  depositId: number | string,
  propertyId?: string,
  unitId?: string,
  unitName?: string,
) {
  const isNumeric =
    typeof depositId === 'number' ||
    (!isNaN(Number(depositId)) && !String(depositId).includes('-'));

  if (!isNumeric) return;

  const numId = Number(depositId);
  const { data: deposit, error } = await supabase
    .from('fin_deposits')
    .select('*')
    .eq('id', numId)
    .single();

  if (error) throw error;
  if (deposit.coa_account_code !== '21500') {
    throw new Error('Deposit is already refundable or not a leasing deposit.');
  }

  const today = new Date().toISOString().split('T')[0];

  // Resolve unit SL codes via account resolver
  const resolvedPropertyId = propertyId ?? deposit.property_id;
  const resolvedUnitId     = unitId     ?? deposit.unit_id;

  const { debit: drAcct, credit: crAcct } = await resolveAccountingAccounts({
    transactionType: 'DEPOSIT_TO_REFUNDABLE',
    depositType:     'SECURITY',
    propertyId:      String(resolvedPropertyId),
    unitId:          resolvedUnitId ? String(resolvedUnitId) : undefined,
    tenantId:        deposit.tenant_id ? String(deposit.tenant_id) : undefined,
    unitName,
  });

  // Dr 21500[unit SL] / Cr 21100006
  await postVoucher({
    voucher_date: today,
    voucher_type: 'Journal',
    description:  'Transfer Deposit to Refundable at Lease Closure',
    reference_no: deposit.receipt_ref,
    tenant_id:    deposit.tenant_id,
    property_id:  deposit.property_id,
    unit_id:      deposit.unit_id,
    lines: [
      {
        account_code: drAcct.slCode,
        account_name: `${drAcct.groupName} / ${drAcct.className} / ${drAcct.glName} / ${drAcct.slName}`,
        debit:  deposit.amount,
        credit: 0,
        description: `Transfer from ${drAcct.slName} to Refundable`,
      },
      {
        account_code: crAcct.slCode,
        account_name: `${crAcct.groupName} / ${crAcct.className} / ${crAcct.glName} / ${crAcct.slName}`,
        debit:  0,
        credit: deposit.amount,
        description: crAcct.slName,
      },
    ],
  });

  // Use the SL code returned by the resolver (credit side of
  // DEPOSIT_TO_REFUNDABLE) for the sub-ledger recording. The resolver
  // already supplies the canonical SL; no 5-digit literal needed here.
  await FinDepositsApi.update(String(numId), {
    coa_account_code: crAcct.slCode,
    status: 'Refundable',
  });
}

// ── Step 3: Settle Refundable Deposit ────────────────────────────────────────

/**
 * Settle refundable deposit with deductions + bank refund.
 *
 * COA:
 *   Dr 21100006  Refundable Security Deposit    (full deposit amount)
 *   Cr 12000001  Bank                           (refund portion)
 *   Cr 12413[unit SL] Tenant Receivable         (deduction offset)
 */
export async function settleDeposit(
  depositId: number | string,
  deductions: number,
  refundAmount: number,
  propertyId?: string,
  unitId?: string,
  unitName?: string,
) {
  const isNumeric =
    typeof depositId === 'number' ||
    (!isNaN(Number(depositId)) && !String(depositId).includes('-'));

  if (!isNumeric) return;

  const numId = Number(depositId);
  const { data: deposit, error } = await supabase
    .from('fin_deposits')
    .select('*')
    .eq('id', numId)
    .single();

  if (error) throw error;
  if (deposit.status !== 'Refundable') {
    throw new Error('Deposit must be marked Refundable before settlement.');
  }

  const total = deductions + refundAmount;
  if (Math.abs(total - deposit.amount) > 0.001) {
    throw new Error('Deductions and Refund must equal Deposit Amount.');
  }

  const today = new Date().toISOString().split('T')[0];
  const resolvedPropertyId = propertyId ?? deposit.property_id;
  const resolvedUnitId     = unitId     ?? deposit.unit_id;

  // Resolve the two fixed SLs (Refundable SD 21100006, Bank 12000001)
  // through the canonical resolver so any admin renames in fin_coa_accounts
  // are picked up automatically.
  const [refundableSd, bank] = await Promise.all([
    resolveGlOnlyAccount('21100006'),
    resolveGlOnlyAccount('12000001'),
  ]);

  // Lines start with the debit of 21100006
  const lines: Array<{
    account_code: string;
    account_name?: string;
    debit: number;
    credit: number;
    tenant_id?: string | number;
    property_id?: string | number;
    unit_id?: string | number;
    description?: string;
  }> = [
    {
      account_code: refundableSd.slCode,
      account_name: `${refundableSd.groupName} / ${refundableSd.className} / ${refundableSd.glName} / ${refundableSd.slName}`,
      debit:  deposit.amount,
      credit: 0,
      tenant_id:   deposit.tenant_id,
      property_id: deposit.property_id,
      unit_id:     deposit.unit_id,
      description: 'Settle Refundable Deposit',
    },
  ];

  // Refund via bank
  if (refundAmount > 0) {
    lines.push({
      account_code: bank.slCode,
      account_name: `${bank.groupName} / ${bank.className} / ${bank.glName} / ${bank.slName}`,
      debit:  0,
      credit: refundAmount,
      tenant_id:   deposit.tenant_id,
      property_id: deposit.property_id,
      unit_id:     deposit.unit_id,
      description: 'Deposit Refund via Bank',
    });
  }

  // Deductions offset against tenant receivable (unit SL)
  if (deductions > 0) {
    // Resolve AR unit SL
    const { credit: arAcct } = await resolveAccountingAccounts({
      transactionType: 'RENT_RECEIPT',
      paymentMethod:   'BANK',
      propertyId:      String(resolvedPropertyId),
      unitId:          resolvedUnitId ? String(resolvedUnitId) : undefined,
      unitName,
    });

    lines.push({
      account_code: arAcct.slCode,
      account_name: `${arAcct.groupName} / ${arAcct.className} / ${arAcct.glName} / ${arAcct.slName}`,
      debit:  0,
      credit: deductions,
      tenant_id:   deposit.tenant_id,
      property_id: deposit.property_id,
      unit_id:     deposit.unit_id,
      description: `Offset Tenant Dues – ${arAcct.slName}`,
    });
  }

  await postVoucher({
    voucher_date: today,
    voucher_type: 'Journal',
    description:  `Settle Deposit ID ${depositId}`,
    lines,
  });

  await FinDepositsApi.update(String(numId), {
    status: refundAmount > 0 ? 'Refunded' : 'Settled',
  });
}
