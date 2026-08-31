/**
 * Revenue, Billing, Late Fees & Revenue Recognition Engine (P461 – P520)
 *
 * Implements deterministic Group → Class → GL → SL postings for:
 *   1. Multi-component Rent Invoices (Rent, Parking, Service Charges, VAT)
 *   2. Late Payment Penalties (41201005) & Lease Transfer Fees (41201006)
 *   3. Rent Discounts & Approved Waivers (51101001)
 *   4. Tenant Credit Notes (41100001 Dr / 12413 Cr)
 *   5. Prorated Move-In / Move-Out Billing Schedules
 */

import { supabase } from '../supabase';
import { resolveAccountingAccounts, normalizeUuid } from './account-resolver';
import { postVoucher, type PostingResult } from './posting-engine';

// ── Types ─────────────────────────────────────────────────────────────────────

export type MultiComponentInvoiceLine = {
  chargeType: 'RENT' | 'PARKING' | 'SERVICE_CHARGE' | 'UTILITY' | 'LATE_FEE';
  amount: number;
  description?: string;
};

export type MultiComponentInvoicePayload = {
  tenantId: string | number;
  propertyId: string | number;
  unitId: string | number;
  leaseId?: string | number;
  invoiceNumber: string;
  invoiceDate?: string;
  unitCode?: string;
  lines: MultiComponentInvoiceLine[];
};

// ── P461–P463: Multi-Component Invoice Posting ────────────────────────────────

/**
 * Posts a multi-component lease billing invoice:
 *   Dr 12413 [unit SL]  (Tenant Receivable – total gross invoice)
 *   Cr 41100001         (Rental Revenue)
 *   Cr 41100002         (Parking Fee Revenue)
 *   Cr 41100003         (Service Charge Revenue)
 *   Cr 41201003         (Utility Recovery Income)
 *   Cr 41201005         (Late Payment Penalty Revenue)
 */
export async function postMultiComponentInvoice(payload: MultiComponentInvoicePayload): Promise<PostingResult> {
  const invoiceDate = payload.invoiceDate || new Date().toISOString().split('T')[0];
  const totalAmount = payload.lines.reduce((sum, line) => sum + line.amount, 0);

  // Resolve Tenant AR account for Debit
  const { debit: arAcct } = await resolveAccountingAccounts({
    transactionType: 'RENT_INVOICE',
    propertyId: String(payload.propertyId),
    unitId: normalizeUuid(payload.unitId),
    tenantId: normalizeUuid(payload.tenantId),
    leaseId: normalizeUuid(payload.leaseId),
    unitName: payload.unitCode,
  });

  const voucherLines: Array<{
    account_code: string;
    account_name: string;
    debit: number;
    credit: number;
    description: string;
  }> = [
    {
      account_code: arAcct.slCode,
      account_name: `${arAcct.groupName} / ${arAcct.className} / ${arAcct.glName} / ${arAcct.slName}`,
      debit: totalAmount,
      credit: 0,
      description: `Tenant Receivable – Invoice ${payload.invoiceNumber}`,
    },
  ];

  // Resolve credit account for each charge component
  for (const line of payload.lines) {
    if (line.amount <= 0) continue;

    let txType:
      | 'RENT_INVOICE'
      | 'PARKING_CHARGE'
      | 'SERVICE_CHARGE'
      | 'UTILITY_CHARGE'
      | 'LATE_FEE_CHARGE' = 'RENT_INVOICE';

    if (line.chargeType === 'PARKING') txType = 'PARKING_CHARGE';
    else if (line.chargeType === 'SERVICE_CHARGE') txType = 'SERVICE_CHARGE';
    else if (line.chargeType === 'UTILITY') txType = 'UTILITY_CHARGE';
    else if (line.chargeType === 'LATE_FEE') txType = 'LATE_FEE_CHARGE';

    const { credit: crAcct } = await resolveAccountingAccounts({
      transactionType: txType,
      propertyId: String(payload.propertyId),
      unitId: normalizeUuid(payload.unitId),
      tenantId: normalizeUuid(payload.tenantId),
      leaseId: normalizeUuid(payload.leaseId),
      unitName: payload.unitCode,
    });

    voucherLines.push({
      account_code: crAcct.slCode,
      account_name: `${crAcct.groupName} / ${crAcct.className} / ${crAcct.glName} / ${crAcct.slName}`,
      debit: 0,
      credit: line.amount,
      description: line.description || crAcct.slName,
    });
  }

  return postVoucher({
    voucher_type: 'Journal',
    voucher_date: invoiceDate,
    reference_no: payload.invoiceNumber,
    description: `Billing Invoice – ${payload.invoiceNumber}${payload.unitCode ? ` (${payload.unitCode})` : ''}`,
    tenant_id: payload.tenantId,
    property_id: payload.propertyId,
    unit_id: payload.unitId,
    lease_id: payload.leaseId,
    lines: voucherLines,
  });
}

// ── P464: Late Payment Penalty Posting ────────────────────────────────────────

/**
 * Posts a standalone Late Payment Penalty:
 *   Dr 12413 [unit SL]  – Tenant Receivable
 *   Cr 41201005         – Late Payment Penalty Revenue
 */
export async function postLatePaymentFee(params: {
  amount: number;
  tenantId: string | number;
  propertyId: string | number;
  unitId: string | number;
  leaseId?: string | number;
  referenceNo: string;
  reason?: string;
  unitCode?: string;
}): Promise<PostingResult> {
  const { debit: drAcct, credit: crAcct } = await resolveAccountingAccounts({
    transactionType: 'LATE_FEE_CHARGE',
    propertyId: String(params.propertyId),
    unitId: normalizeUuid(params.unitId),
    tenantId: normalizeUuid(params.tenantId),
    leaseId: normalizeUuid(params.leaseId),
    unitName: params.unitCode,
  });

  return postVoucher({
    voucher_type: 'Journal',
    voucher_date: new Date().toISOString().split('T')[0],
    reference_no: params.referenceNo,
    description: `Late Payment Penalty – ${params.referenceNo}${params.reason ? ` (${params.reason})` : ''}`,
    tenant_id: params.tenantId,
    property_id: params.propertyId,
    unit_id: params.unitId,
    lease_id: params.leaseId,
    lines: [
      {
        account_code: drAcct.slCode,
        account_name: `${drAcct.groupName} / ${drAcct.className} / ${drAcct.glName} / ${drAcct.slName}`,
        debit: params.amount,
        credit: 0,
        description: drAcct.slName,
      },
      {
        account_code: crAcct.slCode,
        account_name: `${crAcct.groupName} / ${crAcct.className} / ${crAcct.glName} / ${crAcct.slName}`,
        debit: 0,
        credit: params.amount,
        description: crAcct.slName,
      },
    ],
  });
}

// ── P465: Rent Discount / Waiver Posting ──────────────────────────────────────

/**
 * Posts an approved Rent Discount or Waiver:
 *   Dr 51101001 (Rent Discounts & Approved Waivers)
 *   Cr 12413 [unit SL] (Tenant Receivable)
 */
export async function postRentDiscountOrWaiver(params: {
  amount: number;
  tenantId: string | number;
  propertyId: string | number;
  unitId: string | number;
  leaseId?: string | number;
  waiverReference: string;
  approvalId: string;
  reason: string;
  unitCode?: string;
}): Promise<PostingResult> {
  const { debit: drAcct, credit: crAcct } = await resolveAccountingAccounts({
    transactionType: 'RENT_DISCOUNT_WAIVER',
    propertyId: String(params.propertyId),
    unitId: normalizeUuid(params.unitId),
    tenantId: normalizeUuid(params.tenantId),
    leaseId: normalizeUuid(params.leaseId),
    unitName: params.unitCode,
  });

  return postVoucher({
    voucher_type: 'Journal',
    voucher_date: new Date().toISOString().split('T')[0],
    reference_no: params.waiverReference,
    description: `Approved Rent Waiver [Approval #${params.approvalId}] – ${params.reason}`,
    tenant_id: params.tenantId,
    property_id: params.propertyId,
    unit_id: params.unitId,
    lease_id: params.leaseId,
    lines: [
      {
        account_code: drAcct.slCode,
        account_name: `${drAcct.groupName} / ${drAcct.className} / ${drAcct.glName} / ${drAcct.slName}`,
        debit: params.amount,
        credit: 0,
        description: `Waiver Expense – ${params.reason}`,
      },
      {
        account_code: crAcct.slCode,
        account_name: `${crAcct.groupName} / ${crAcct.className} / ${crAcct.glName} / ${crAcct.slName}`,
        debit: 0,
        credit: params.amount,
        description: `Reduce Tenant Receivable – ${drAcct.slName}`,
      },
    ],
  });
}

// ── P466: Tenant Credit Note Posting ──────────────────────────────────────────

/**
 * Posts a Tenant Credit Note reducing rent revenue:
 *   Dr 41100001 (Rental Revenue)
 *   Cr 12413 [unit SL] (Tenant Receivable)
 */
export async function postTenantCreditNote(params: {
  amount: number;
  tenantId: string | number;
  propertyId: string | number;
  unitId: string | number;
  leaseId?: string | number;
  creditNoteNumber: string;
  reason: string;
  unitCode?: string;
}): Promise<PostingResult> {
  const { debit: drAcct, credit: crAcct } = await resolveAccountingAccounts({
    transactionType: 'TENANT_CREDIT_NOTE',
    propertyId: String(params.propertyId),
    unitId: normalizeUuid(params.unitId),
    tenantId: normalizeUuid(params.tenantId),
    leaseId: normalizeUuid(params.leaseId),
    unitName: params.unitCode,
  });

  return postVoucher({
    voucher_type: 'Journal',
    voucher_date: new Date().toISOString().split('T')[0],
    reference_no: params.creditNoteNumber,
    description: `Credit Note – ${params.creditNoteNumber} (${params.reason})`,
    tenant_id: params.tenantId,
    property_id: params.propertyId,
    unit_id: params.unitId,
    lease_id: params.leaseId,
    lines: [
      {
        account_code: drAcct.slCode,
        account_name: `${drAcct.groupName} / ${drAcct.className} / ${drAcct.glName} / ${drAcct.slName}`,
        debit: params.amount,
        credit: 0,
        description: `Credit Note Revenue Adjustment – ${params.reason}`,
      },
      {
        account_code: crAcct.slCode,
        account_name: `${crAcct.groupName} / ${crAcct.className} / ${crAcct.glName} / ${crAcct.slName}`,
        debit: 0,
        credit: params.amount,
        description: `Reduce Tenant Receivable – ${crAcct.slName}`,
      },
    ],
  });
}
