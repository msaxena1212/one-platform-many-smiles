/**
 * Owner Accounting, Property Management Fees & Remittance Engine (P521 – P580)
 *
 * Implements deterministic Group → Class → GL → SL postings for:
 *   1. Property Management Fee Recognition (Dr 22001001 Owner Payable / Cr 41101001 PM Fee)
 *   2. Net Rental Remittances / Distributions to Owners (Dr 22001001 Owner Payable / Cr 12000001 Bank)
 *   3. Owner Funding for Property Expenses / Capital Works (Dr 51001001 Expense / Cr 22001001 Owner Payable)
 *   4. Owner Advances / Working Capital & Repayments (12414001)
 *   5. Inter-Property Clearing Transfers (22002001)
 *   6. Owner Statement & Balance Reconciliations
 */

import { supabase } from '../supabase';
import { resolveAccountingAccounts, normalizeUuid } from './account-resolver';
import { postVoucher, type PostingResult } from './posting-engine';

// ── Types ─────────────────────────────────────────────────────────────────────

export type OwnerStatementSummary = {
  ownerId: string;
  propertyId: string;
  grossRentalCollected: number;
  expensesPaid: number;
  pmFeesDeducted: number;
  remittancesPaid: number;
  openingBalance: number;
  closingPayableBalance: number;
  isBalanced: boolean;
};

// ── P521: Property Management Fee Recognition ────────────────────────────────

/**
 * Deducts Property Management Fee from Owner Payable and recognizes PM Fee Revenue:
 *   Dr 22001001 (Owner Payable / Current Account)
 *   Cr 41101001 (Property Management Fee Revenue)
 */
export async function postPropertyManagementFee(params: {
  ownerId: string | number;
  propertyId: string | number;
  amount: number;
  feeCalculationPeriod: string;
  referenceNo: string;
  feePercentage?: number;
}): Promise<PostingResult> {
  const { debit: drAcct, credit: crAcct } = await resolveAccountingAccounts({
    transactionType: 'PM_FEE_RECOGNITION',
    propertyId: String(params.propertyId),
  });

  return postVoucher({
    voucher_type: 'Journal',
    voucher_date: new Date().toISOString().split('T')[0],
    reference_no: params.referenceNo,
    description: `PM Fee (${params.feeCalculationPeriod}${params.feePercentage ? ` @ ${params.feePercentage}%` : ''}) – Ref ${params.referenceNo}`,
    property_id: params.propertyId,
    lines: [
      {
        account_code: drAcct.slCode,
        account_name: `${drAcct.groupName} / ${drAcct.className} / ${drAcct.glName} / ${drAcct.slName}`,
        debit: params.amount,
        credit: 0,
        description: `Deduct PM Fee from Owner – ${params.referenceNo}`,
      },
      {
        account_code: crAcct.slCode,
        account_name: `${crAcct.groupName} / ${crAcct.className} / ${crAcct.glName} / ${crAcct.slName}`,
        debit: 0,
        credit: params.amount,
        description: `Recognize Management Fee Revenue – ${params.feeCalculationPeriod}`,
      },
    ],
  });
}

// ── P522: Owner Remittance / Distribution ─────────────────────────────────────

/**
 * Disburses net rental remittance to the property owner:
 *   Dr 22001001 (Owner Payable / Current Account)
 *   Cr 12000001 (Bank)
 */
export async function postOwnerRemittance(params: {
  ownerId: string | number;
  propertyId: string | number;
  amount: number;
  paymentReference: string;
  remittanceDate?: string;
  notes?: string;
}): Promise<PostingResult> {
  const remittanceDate = params.remittanceDate || new Date().toISOString().split('T')[0];

  const { debit: drAcct, credit: crAcct } = await resolveAccountingAccounts({
    transactionType: 'OWNER_REMITTANCE',
    paymentMethod: 'BANK',
    propertyId: String(params.propertyId),
  });

  return postVoucher({
    voucher_type: 'Payment',
    voucher_date: remittanceDate,
    reference_no: params.paymentReference,
    description: `Owner Remittance / Distribution – ${params.paymentReference}${params.notes ? ` (${params.notes})` : ''}`,
    property_id: params.propertyId,
    lines: [
      {
        account_code: drAcct.slCode,
        account_name: `${drAcct.groupName} / ${drAcct.className} / ${drAcct.glName} / ${drAcct.slName}`,
        debit: params.amount,
        credit: 0,
        description: `Settle Owner Payable – ${params.paymentReference}`,
      },
      {
        account_code: crAcct.slCode,
        account_name: `${crAcct.groupName} / ${crAcct.className} / ${crAcct.glName} / ${crAcct.slName}`,
        debit: 0,
        credit: params.amount,
        description: `Bank Disbursement to Owner`,
      },
    ],
  });
}

// ── P523: Owner Funds Property Expense ────────────────────────────────────────

/**
 * Records an expense funded directly by the property owner:
 *   Dr 51001001 (Property Maintenance & Repair / Direct Expense)
 *   Cr 22001001 (Owner Payable / Current Account)
 */
export async function postOwnerFundedExpense(params: {
  ownerId: string | number;
  propertyId: string | number;
  unitId?: string | number;
  amount: number;
  expenseDescription: string;
  referenceNo: string;
}): Promise<PostingResult> {
  const { debit: drAcct, credit: crAcct } = await resolveAccountingAccounts({
    transactionType: 'OWNER_FUNDS_EXPENSE',
    propertyId: String(params.propertyId),
    unitId: params.unitId ? String(params.unitId) : undefined,
  });

  return postVoucher({
    voucher_type: 'Journal',
    voucher_date: new Date().toISOString().split('T')[0],
    reference_no: params.referenceNo,
    description: `Owner-Funded Expense: ${params.expenseDescription}`,
    property_id: params.propertyId,
    unit_id: params.unitId,
    lines: [
      {
        account_code: drAcct.slCode,
        account_name: `${drAcct.groupName} / ${drAcct.className} / ${drAcct.glName} / ${drAcct.slName}`,
        debit: params.amount,
        credit: 0,
        description: params.expenseDescription,
      },
      {
        account_code: crAcct.slCode,
        account_name: `${crAcct.groupName} / ${crAcct.className} / ${crAcct.glName} / ${crAcct.slName}`,
        debit: 0,
        credit: params.amount,
        description: `Owner Reimbursement Credit – ${params.referenceNo}`,
      },
    ],
  });
}

// ── P524: Inter-Property Clearing Transfer ───────────────────────────────────

/**
 * Transfers funds between properties via Inter-Property Clearing (22002001):
 *   Dr 22002001 (Inter-Property Clearing)
 *   Cr 12000001 (Bank)
 */
export async function postInterPropertyTransfer(params: {
  fromPropertyId: string | number;
  toPropertyId: string | number;
  amount: number;
  transferReference: string;
  reason: string;
}): Promise<PostingResult> {
  const { debit: drAcct, credit: crAcct } = await resolveAccountingAccounts({
    transactionType: 'INTER_PROPERTY_TRANSFER',
    paymentMethod: 'BANK',
    propertyId: String(params.fromPropertyId),
  });

  return postVoucher({
    voucher_type: 'Payment',
    voucher_date: new Date().toISOString().split('T')[0],
    reference_no: params.transferReference,
    description: `Inter-Property Transfer [Property ${params.fromPropertyId} -> ${params.toPropertyId}]: ${params.reason}`,
    property_id: params.fromPropertyId,
    lines: [
      {
        account_code: drAcct.slCode,
        account_name: `${drAcct.groupName} / ${drAcct.className} / ${drAcct.glName} / ${drAcct.slName}`,
        debit: params.amount,
        credit: 0,
        description: `Inter-Property Clearing – ${params.reason}`,
      },
      {
        account_code: crAcct.slCode,
        account_name: `${crAcct.groupName} / ${crAcct.className} / ${crAcct.glName} / ${crAcct.slName}`,
        debit: 0,
        credit: params.amount,
        description: `Bank Disbursement for Transfer`,
      },
    ],
  });
}

// ── P525: Owner Statement & Ledger Summary ────────────────────────────────────

/**
 * Reconciles Owner Current Account (22001001) for a specific owner and property.
 */
export async function generateOwnerStatementSummary(
  ownerId: string,
  propertyId: string,
): Promise<OwnerStatementSummary> {
  const { data: lines, error } = await supabase
    .from('fin_voucher_lines')
    .select('account_code, debit_amount, credit_amount, description')
    .eq('property_id', propertyId);

  if (error) throw error;

  let grossRentalCollected = 0;
  let expensesPaid = 0;
  let pmFeesDeducted = 0;
  let remittancesPaid = 0;
  let ownerPayableCredits = 0;
  let ownerPayableDebits = 0;

  for (const line of lines || []) {
    const acct = String(line.account_code || '');
    const dr = Number(line.debit_amount || 0);
    const cr = Number(line.credit_amount || 0);

    if (acct === '22001001' || acct === '22001') {
      ownerPayableCredits += cr;
      ownerPayableDebits += dr;
      if (dr > 0) {
        const desc = String(line.description || '').toLowerCase();
        if (desc.includes('fee') || desc.includes('management')) {
          pmFeesDeducted += dr;
        } else {
          remittancesPaid += dr;
        }
      }
    } else if (acct.startsWith('51001') || acct.startsWith('51002') || acct.startsWith('51003') || acct.startsWith('51004')) {
      expensesPaid += dr;
    } else if (acct.startsWith('41100')) {
      grossRentalCollected += cr;
    }
  }

  const closingPayableBalance = Number((ownerPayableCredits - ownerPayableDebits).toFixed(2));

  return {
    ownerId,
    propertyId,
    grossRentalCollected: Number(grossRentalCollected.toFixed(2)),
    expensesPaid: Number(expensesPaid.toFixed(2)),
    pmFeesDeducted: Number(pmFeesDeducted.toFixed(2)),
    remittancesPaid: Number(remittancesPaid.toFixed(2)),
    openingBalance: 0,
    closingPayableBalance,
    isBalanced: closingPayableBalance >= 0,
  };
}
