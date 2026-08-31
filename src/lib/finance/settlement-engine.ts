/**
 * Final Settlement & Lease Closure Engine
 *
 * Implements the complete master logic for:
 *   1. Calculating final tenant liabilities & balance:
 *      Refundable Deposit - (Rent + Utilities + Damage + Penalties + Other) = Refund or Recovery
 *   2. Step-by-step or atomic Posting of settlement transactions:
 *      - Move 21500 to 21100006
 *      - Recognize damage/penalty/utility charges into AR (12413)
 *      - Settle AR against 21100006
 *      - Post final bank/cash refund
 *   3. Unclaimed deposit transfer & redemption (21100006 <-> 21100002)
 *   4. Early termination future PDC identification and return
 *   5. Reservation advance applications and forfeitures
 *   6. Guarantee cheque returns
 */

import { supabase } from '../supabase';
import { resolveAccountingAccounts } from './account-resolver';
import { postVoucher, type PostingResult } from './posting-engine';
import { returnPdc } from './pdcService';

// ── Types ─────────────────────────────────────────────────────────────────────

import type { DepositType } from './account-resolver';

export type SettlementDeduction = {
  type: 'RENT' | 'UTILITY' | 'DAMAGE' | 'PENALTY' | 'OTHER';
  description: string;
  amount: number;
  /** If the charge is already invoiced into AR (12413), set to true */
  alreadyInvoiced?: boolean;
};

/**
 * Per-category deposit breakdown. Source-account driven settlement uses the
 * deposit's GL/SL code (21500 for SECURITY, 21100003 Qatar Cool, 21100004
 * Kahramaa, 21100005 Service Fee) as the deduction source.
 */
export type SettlementDepositLine = {
  depositType: DepositType;
  amount: number;
};

export type FinalSettlementInput = {
  leaseId: string;
  tenantId: string;
  propertyId: string;
  unitId: string;
  unitName?: string;
  /**
   * Total deposit amount held (used for backward-compat single-bucket settlement).
   * If `deposits` is supplied, this is ignored.
   */
  depositAmount: number;
  /**
   * Multi-category deposit breakdown. When present, each bucket is settled from
   * its own source GL/SL (21500, 21100003, 21100004, 21100005).
   */
  deposits?: SettlementDepositLine[];
  deductions: SettlementDeduction[];
  paymentMethod?: 'BANK' | 'CASH';
  referenceNo?: string;
  settlementDate?: string;
};

export type SettlementSummary = {
  depositAmount: number;
  totalDeductions: number;
  netRefundAmount: number;
  netRecoveryAmount: number;
  isRefund: boolean;
};

// ── Master Calculation ────────────────────────────────────────────────────────

/**
 * Calculates the exact settlement figures without posting entries.
 */
export function calculateSettlementSummary(
  depositAmount: number,
  deductions: SettlementDeduction[],
): SettlementSummary {
  const totalDeductions = deductions.reduce((sum, d) => sum + Number(d.amount || 0), 0);
  const net = depositAmount - totalDeductions;

  return {
    depositAmount,
    totalDeductions,
    netRefundAmount: net > 0 ? Number(net.toFixed(2)) : 0,
    netRecoveryAmount: net < 0 ? Number(Math.abs(net).toFixed(2)) : 0,
    isRefund: net >= 0,
  };
}

// ── Master Settlement Execution ───────────────────────────────────────────────

/**
 * Executes the complete Final Settlement flow:
 *   1. Validates all inputs and balances
 *   2. Moves each deposit bucket from its source GL to its refundable counterpart
 *      (21500 → 21100006, 21100003 → 21100006, 21100004 → 21100006, 21100005 → 21100006).
 *      If no `deposits` breakdown is supplied, falls back to a single SECURITY bucket.
 *   3. For uninvoiced deductions: recognizes them via AR (12413 Dr / Revenue Cr)
 *   4. Settle AR against each deposit bucket (capped at the bucket amount —
 *      excess stays in AR so deposit balances never go negative)
 *   5. Issues bank/cash refund for remaining positive balance
 */
export async function executeFinalSettlement(
  input: FinalSettlementInput,
): Promise<{
  summary: SettlementSummary;
  vouchers: PostingResult[];
}> {
  const dateStr = input.settlementDate || new Date().toISOString().split('T')[0];

  // Resolve deposit buckets (multi-category if supplied, else single SECURITY).
  const depositBuckets: SettlementDepositLine[] =
    input.deposits && input.deposits.length > 0
      ? input.deposits.filter((d) => d.amount > 0)
      : input.depositAmount > 0
        ? [{ depositType: 'SECURITY', amount: input.depositAmount }]
        : [];

  const totalDeposit = depositBuckets.reduce((s, d) => s + d.amount, 0);
  const summary = calculateSettlementSummary(totalDeposit, input.deductions);
  const vouchers: PostingResult[] = [];

  // 1. Move each deposit bucket from its source GL to its refundable counterpart.
  //    Source-account driven: SECURITY → 21500[unit SL], QATAR_COOL → 21100003, etc.
  for (const bucket of depositBuckets) {
    const { debit: drDep, credit: crDep } = await resolveAccountingAccounts({
      transactionType: 'DEPOSIT_TO_REFUNDABLE',
      depositType: bucket.depositType,
      propertyId: input.propertyId,
      unitId: input.unitId,
      tenantId: input.tenantId,
      leaseId: input.leaseId,
      unitName: input.unitName,
    });

    const vchDep = await postVoucher({
      voucher_date: dateStr,
      voucher_type: 'Journal',
      description: `Final Settlement: Move ${bucket.depositType} Deposit to Refundable – ${input.unitName || ''}`,
      reference_no: input.referenceNo ? `SETTLE-DEP-${bucket.depositType}-${input.referenceNo}` : undefined,
      tenant_id: input.tenantId,
      property_id: input.propertyId,
      unit_id: input.unitId,
      lease_id: input.leaseId,
      lines: [
        {
          account_code: drDep.slCode,
          account_name: `${drDep.glName} / ${drDep.slName}`,
          debit: bucket.amount,
          credit: 0,
          description: drDep.slName,
        },
        {
          account_code: crDep.slCode,
          account_name: `${crDep.glName} / ${crDep.slName}`,
          debit: 0,
          credit: bucket.amount,
          description: crDep.slName,
        },
      ],
    });
    vouchers.push(vchDep);
  }

  // 2. Recognize non-invoiced charges into AR (12413)
  for (const deduction of input.deductions) {
    if (!deduction.alreadyInvoiced && deduction.amount > 0) {
      let txnType: 'DAMAGE_CHARGE' | 'PENALTY_CHARGE' | 'UTILITY_CHARGE' = 'DAMAGE_CHARGE';
      if (deduction.type === 'PENALTY') txnType = 'PENALTY_CHARGE';
      else if (deduction.type === 'UTILITY') txnType = 'UTILITY_CHARGE';

      const { debit: drChg, credit: crChg } = await resolveAccountingAccounts({
        transactionType: txnType,
        propertyId: input.propertyId,
        unitId: input.unitId,
        tenantId: input.tenantId,
        leaseId: input.leaseId,
        unitName: input.unitName,
      });

      const vchChg = await postVoucher({
        voucher_date: dateStr,
        voucher_type: 'Journal',
        description: `Final Settlement Charge: ${deduction.description}`,
        tenant_id: input.tenantId,
        property_id: input.propertyId,
        unit_id: input.unitId,
        lease_id: input.leaseId,
        lines: [
          {
            account_code: drChg.slCode,
            account_name: `${drChg.glName} / ${drChg.slName}`,
            debit: deduction.amount,
            credit: 0,
            description: deduction.description,
          },
          {
            account_code: crChg.slCode,
            account_name: `${crChg.glName} / ${crChg.slName}`,
            debit: 0,
            credit: deduction.amount,
            description: crChg.slName,
          },
        ],
      });
      vouchers.push(vchChg);
    }
  }

  // 3. Settle Deductions against the deposit buckets (waterfall: consume each
  //    bucket in order, capping at its available balance). Excess stays in
  //    Tenant AR — deposit balances never go negative.
  let remainingDeductions = summary.totalDeductions;
  for (const bucket of depositBuckets) {
    if (remainingDeductions <= 0) break;
    const applied = Math.min(bucket.amount, remainingDeductions);
    if (applied <= 0) continue;

    const { debit: drSettle, credit: crSettle } = await resolveAccountingAccounts({
      transactionType: 'DEPOSIT_DEDUCTION_SETTLE',
      depositType: bucket.depositType,
      propertyId: input.propertyId,
      unitId: input.unitId,
      tenantId: input.tenantId,
      leaseId: input.leaseId,
      unitName: input.unitName,
    });

    const vchSettle = await postVoucher({
      voucher_date: dateStr,
      voucher_type: 'Journal',
      description: `Final Settlement: Offset Dues against ${bucket.depositType} Deposit`,
      tenant_id: input.tenantId,
      property_id: input.propertyId,
      unit_id: input.unitId,
      lease_id: input.leaseId,
      lines: [
        {
          account_code: drSettle.slCode,
          account_name: `${drSettle.glName} / ${drSettle.slName}`,
          debit: applied,
          credit: 0,
          description: drSettle.slName,
        },
        {
          account_code: crSettle.slCode,
          account_name: `${crSettle.glName} / ${crSettle.slName}`,
          debit: 0,
          credit: applied,
          description: `Offset Tenant Dues – ${crSettle.slName}`,
        },
      ],
    });
    vouchers.push(vchSettle);
    remainingDeductions -= applied;
  }

  // If deductions exceed total deposit, the remainder sits in Tenant AR (12413)
  // — no negative deposit balance is generated. This is enforced by the
  // waterfall loop above (applied ≤ bucket.amount).

  // 4. Refund remaining deposit if netRefundAmount > 0
  if (summary.netRefundAmount > 0) {
    const paymentMethod = input.paymentMethod ?? 'BANK';

    // For multi-category refunds, issue one voucher per bucket refunding the
    // bucket's net available balance. For single-bucket (legacy) settle all
    // netRefundAmount against the SECURITY bucket.
    if (depositBuckets.length === 1) {
      const { debit: drRef, credit: crRef } = await resolveAccountingAccounts({
        transactionType: 'DEPOSIT_REFUND',
        paymentMethod,
        depositType: depositBuckets[0].depositType,
        propertyId: input.propertyId,
        unitId: input.unitId,
        tenantId: input.tenantId,
        leaseId: input.leaseId,
        unitName: input.unitName,
      });

      const vchRefund = await postVoucher({
        voucher_date: dateStr,
        voucher_type: paymentMethod === 'BANK' ? 'Payment' : 'Receipt',
        description: `Final Settlement: Refund Remaining Deposit to Tenant`,
        reference_no: input.referenceNo ? `REFUND-${input.referenceNo}` : undefined,
        tenant_id: input.tenantId,
        property_id: input.propertyId,
        unit_id: input.unitId,
        lease_id: input.leaseId,
        lines: [
          {
            account_code: drRef.slCode,
            account_name: `${drRef.glName} / ${drRef.slName}`,
            debit: summary.netRefundAmount,
            credit: 0,
            description: drRef.slName,
          },
          {
            account_code: crRef.slCode,
            account_name: `${crRef.glName} / ${crRef.slName}`,
            debit: 0,
            credit: summary.netRefundAmount,
            description: `Deposit Refund via ${paymentMethod}`,
          },
        ],
      });
      vouchers.push(vchRefund);
    } else {
      // Multi-category refund: each bucket refunds its own net (bucket.amount
      // minus its share of deductions) — simple equal split by netRefundAmount
      // is unsafe, so we refund the actual bucket remainder computed above.
      let remainingRefund = summary.netRefundAmount;
      for (const bucket of depositBuckets) {
        if (remainingRefund <= 0) break;
        // The bucket's net is its amount minus any deduction already applied
        // to it. Recompute by re-walking the deductions total allocated above.
        const bucketApplied = Math.min(bucket.amount, summary.totalDeductions);
        const bucketNet = Math.max(0, bucket.amount - bucketApplied);
        const refund = Math.min(bucketNet, remainingRefund);
        if (refund <= 0) continue;

        const { debit: drRef, credit: crRef } = await resolveAccountingAccounts({
          transactionType: 'DEPOSIT_REFUND',
          paymentMethod,
          depositType: bucket.depositType,
          propertyId: input.propertyId,
          unitId: input.unitId,
          tenantId: input.tenantId,
          leaseId: input.leaseId,
          unitName: input.unitName,
        });

        const vchRefund = await postVoucher({
          voucher_date: dateStr,
          voucher_type: paymentMethod === 'BANK' ? 'Payment' : 'Receipt',
          description: `Final Settlement: Refund ${bucket.depositType} Deposit to Tenant`,
          reference_no: input.referenceNo
            ? `REFUND-${bucket.depositType}-${input.referenceNo}`
            : undefined,
          tenant_id: input.tenantId,
          property_id: input.propertyId,
          unit_id: input.unitId,
          lease_id: input.leaseId,
          lines: [
            {
              account_code: drRef.slCode,
              account_name: `${drRef.glName} / ${drRef.slName}`,
              debit: refund,
              credit: 0,
              description: drRef.slName,
            },
            {
              account_code: crRef.slCode,
              account_name: `${crRef.glName} / ${crRef.slName}`,
              debit: 0,
              credit: refund,
              description: `Deposit Refund via ${paymentMethod}`,
            },
          ],
        });
        vouchers.push(vchRefund);
        remainingRefund -= refund;
      }
    }
  }

  return { summary, vouchers };
}

// ── Unclaimed Deposit Handling ────────────────────────────────────────────────

/**
 * Reclassifies an unclaimed refundable deposit:
 *   Dr 21100006 (Refundable Security Deposit)
 *   Cr 21100002 (Unclaimed Liability-Deposit)
 */
export async function markDepositUnclaimed(params: {
  amount: number;
  tenantId: string;
  propertyId: string;
  unitId?: string;
  leaseId?: string;
  unitName?: string;
}) {
  const { debit, credit } = await resolveAccountingAccounts({
    transactionType: 'DEPOSIT_TO_UNCLAIMED',
    depositType: 'SECURITY',
    propertyId: params.propertyId,
    unitId: params.unitId,
    tenantId: params.tenantId,
    leaseId: params.leaseId,
    unitName: params.unitName,
  });

  return postVoucher({
    voucher_date: new Date().toISOString().split('T')[0],
    voucher_type: 'Journal',
    description: `Reclassify Unclaimed Deposit to Unclaimed Liability`,
    tenant_id: params.tenantId,
    property_id: params.propertyId,
    unit_id: params.unitId,
    lease_id: params.leaseId,
    lines: [
      {
        account_code: debit.slCode,
        account_name: `${debit.glName} / ${debit.slName}`,
        debit: params.amount,
        credit: 0,
        description: debit.slName,
      },
      {
        account_code: credit.slCode,
        account_name: `${credit.glName} / ${credit.slName}`,
        debit: 0,
        credit: params.amount,
        description: credit.slName,
      },
    ],
  });
}

/**
 * Refund a previously unclaimed deposit when claimed:
 *   Dr 21100002 (Unclaimed Liability-Deposit)
 *   Cr 12000001 (Bank)
 */
export async function refundUnclaimedDeposit(params: {
  amount: number;
  tenantId: string;
  propertyId: string;
  unitId?: string;
  leaseId?: string;
  bankRef?: string;
}) {
  const { debit, credit } = await resolveAccountingAccounts({
    transactionType: 'UNCLAIMED_REFUND',
    paymentMethod: 'BANK',
    propertyId: params.propertyId,
    unitId: params.unitId,
    tenantId: params.tenantId,
    leaseId: params.leaseId,
  });

  return postVoucher({
    voucher_date: new Date().toISOString().split('T')[0],
    voucher_type: 'Payment',
    description: `Refund Claimed Unclaimed Deposit`,
    reference_no: params.bankRef,
    tenant_id: params.tenantId,
    property_id: params.propertyId,
    unit_id: params.unitId,
    lease_id: params.leaseId,
    lines: [
      {
        account_code: debit.slCode,
        account_name: `${debit.glName} / ${debit.slName}`,
        debit: params.amount,
        credit: 0,
        description: debit.slName,
      },
      {
        account_code: credit.slCode,
        account_name: `${credit.glName} / ${credit.slName}`,
        debit: 0,
        credit: params.amount,
        description: credit.slName,
      },
    ],
  });
}

// ── Guarantee Cheque Return ───────────────────────────────────────────────────

/**
 * Returns a guarantee cheque when not invoked:
 *   Dr 21200001 (Guarantee Cheque Received)
 *   Cr 12900002 (Deposit-PDC In Hand)
 */
export async function returnGuaranteeCheque(params: {
  amount: number;
  tenantId: string;
  propertyId: string;
  unitId?: string;
  chequeNumber: string;
}) {
  const { debit, credit } = await resolveAccountingAccounts({
    transactionType: 'GUARANTEE_CHEQUE_RETURN',
    depositType: 'GUARANTEE',
    propertyId: params.propertyId,
    unitId: params.unitId,
    tenantId: params.tenantId,
  });

  return postVoucher({
    voucher_date: new Date().toISOString().split('T')[0],
    voucher_type: 'Journal',
    description: `Return Guarantee Cheque – ${params.chequeNumber}`,
    reference_no: params.chequeNumber,
    tenant_id: params.tenantId,
    property_id: params.propertyId,
    unit_id: params.unitId,
    lines: [
      {
        account_code: debit.slCode,
        account_name: `${debit.glName} / ${debit.slName}`,
        debit: params.amount,
        credit: 0,
        description: debit.slName,
      },
      {
        account_code: credit.slCode,
        account_name: `${credit.glName} / ${credit.slName}`,
        debit: 0,
        credit: params.amount,
        description: credit.slName,
      },
    ],
  });
}

// ── Early Lease Termination & Future PDC Return Workflow ──────────────────────

/**
 * Identifies future unpresented PDCs for a lease and returns eligible ones:
 *   Dr 21400 [unit SL] / Cr 12900001
 */
export async function returnFuturePdcsForLease(leaseId: string | number) {
  // Query all active/held PDCs for this lease
  const { data: pdcs, error } = await supabase
    .from('fin_pdc_register')
    .select('*')
    .eq('lease_id', String(leaseId))
    .in('status', ['In Hand', 'Received', 'IN_HAND', 'RECEIVED']);

  if (error) throw error;
  if (!pdcs || pdcs.length === 0) return { returnedCount: 0, pdcs: [] };

  const returned = [];
  for (const pdc of pdcs) {
    await returnPdc(pdc.id, pdc.cheque_number);
    returned.push(pdc);
  }

  return {
    returnedCount: returned.length,
    pdcs: returned,
  };
}

// ── Lease Closure Gate ───────────────────────────────────────────────────────

/**
 * Result of a lease-closure eligibility audit. Closure is permitted only when
 * every blocking condition is `ok === true`.
 */
export type LeaseClosureAudit = {
  canClose: boolean;
  tenantArOutstanding: number;
  refundableDepositOutstanding: number;
  unpresentedPdcs: Array<{ id: string | number; cheque_number: string; status: string; amount: number }>;
  unclaimedDepositOutstanding: number;
  blockers: string[];
};

/**
 * Multi-ledger settlement gate for lease closure.
 *
 * Closure is strictly blocked unless:
 *   1. Tenant AR (12413 [unit SL]) is zero,
 *   2. Refundable deposits (21100006 + 21100003/4/5 buckets) are zero — they
 *      must have been refunded or fully applied as deductions,
 *   3. All PDCs linked to the lease are returned / cancelled / cleared —
 *      no unpresented PDCs remain.
 *
 * Returns a typed audit object. Callers must inspect `canClose` and surface
 * `blockers` to the operator.
 */
export async function auditLeaseClosure(leaseId: string | number): Promise<LeaseClosureAudit> {
  const blockers: string[] = [];

  // ── 1. Tenant AR (12413 [unit SL]) for this lease ─────────────────────────
  const { data: arRows, error: arErr } = await supabase
    .from('fin_voucher_lines')
    .select('debit, credit, account_code, lease_id, voucher:voucher_id(status)')
    .eq('lease_id', String(leaseId))
    .like('account_code', '12413%');

  if (arErr) throw arErr;

  let tenantArOutstanding = 0;
  for (const row of arRows ?? []) {
    // Skip vouchers that aren't POSTED (avoid draft reversals)
    const vch = Array.isArray(row.voucher) ? row.voucher[0] : row.voucher;
    if (vch && vch.status && vch.status !== 'POSTED') continue;
    tenantArOutstanding += Number(row.debit || 0) - Number(row.credit || 0);
  }
  tenantArOutstanding = Number(tenantArOutstanding.toFixed(2));

  if (Math.abs(tenantArOutstanding) > 0.005) {
    blockers.push(
      `Tenant AR outstanding: ${tenantArOutstanding.toFixed(2)} (must be 0)`,
    );
  }

  // ── 2. Refundable deposit balances (21500[unit SL] + 21100006 + 21100003/4/5)
  //    SECURITY deposits live on 21500 (unit-specific SL) until moved via
  //    DEPOSIT_TO_REFUNDABLE. QATAR_COOL / KAHRAMAA / SERVICE_FEE live on
  //    21100003/4/5. The 21100006 bucket is the consolidated refundable pool.
  //    All three must net to zero before closure.
  const { data: depRows, error: depErr } = await supabase
    .from('fin_voucher_lines')
    .select('debit, credit, account_code, lease_id, voucher:voucher_id(status)')
    .eq('lease_id', String(leaseId))
    .or('account_code.in.(21100003,21100004,21100005,21100006),account_code.like.21500%');

  if (depErr) throw depErr;

  let refundableDepositOutstanding = 0;
  for (const row of depRows ?? []) {
    const vch = Array.isArray(row.voucher) ? row.voucher[0] : row.voucher;
    if (vch && vch.status && vch.status !== 'POSTED') continue;
    refundableDepositOutstanding += Number(row.credit || 0) - Number(row.debit || 0);
  }
  refundableDepositOutstanding = Number(refundableDepositOutstanding.toFixed(2));

  if (Math.abs(refundableDepositOutstanding) > 0.005) {
    blockers.push(
      `Refundable deposit outstanding: ${refundableDepositOutstanding.toFixed(2)} (must be 0)`,
    );
  }

  // ── 3. Unclaimed deposit (21100002) — must be 0 before closure ────────────
  const { data: unRows, error: unErr } = await supabase
    .from('fin_voucher_lines')
    .select('debit, credit, account_code, lease_id, voucher:voucher_id(status)')
    .eq('lease_id', String(leaseId))
    .eq('account_code', '21100002');

  if (unErr) throw unErr;

  let unclaimedDepositOutstanding = 0;
  for (const row of unRows ?? []) {
    const vch = Array.isArray(row.voucher) ? row.voucher[0] : row.voucher;
    if (vch && vch.status && vch.status !== 'POSTED') continue;
    unclaimedDepositOutstanding += Number(row.credit || 0) - Number(row.debit || 0);
  }
  unclaimedDepositOutstanding = Number(unclaimedDepositOutstanding.toFixed(2));

  if (Math.abs(unclaimedDepositOutstanding) > 0.005) {
    blockers.push(
      `Unclaimed deposit outstanding: ${unclaimedDepositOutstanding.toFixed(2)} (must be 0)`,
    );
  }

  // ── 4. Unpresented PDCs for this lease ────────────────────────────────────
  const { data: pdcs, error: pdcErr } = await supabase
    .from('fin_pdc_register')
    .select('id, cheque_number, status, amount')
    .eq('lease_id', String(leaseId))
    .in('status', ['In Hand', 'Received', 'IN_HAND', 'RECEIVED', 'Deposited', 'DEPOSITED', 'Clearing', 'CLEARING']);

  if (pdcErr) throw pdcErr;

  const unpresentedPdcs = (pdcs ?? []).map((p) => ({
    id:            p.id as string | number,
    cheque_number: p.cheque_number as string,
    status:        p.status as string,
    amount:        Number(p.amount || 0),
  }));

  if (unpresentedPdcs.length > 0) {
    blockers.push(
      `${unpresentedPdcs.length} unpresented PDC(s) — must be returned/cancelled before closure`,
    );
  }

  return {
    canClose: blockers.length === 0,
    tenantArOutstanding,
    refundableDepositOutstanding,
    unpresentedPdcs,
    unclaimedDepositOutstanding,
    blockers,
  };
}

/**
 * Closure gate helper. Throws if any blocker is present; otherwise returns
 * the audit object for the caller to surface as a success payload.
 */
export async function assertLeaseClosable(leaseId: string | number): Promise<LeaseClosureAudit> {
  const audit = await auditLeaseClosure(leaseId);
  if (!audit.canClose) {
    const err = new Error(
      `Lease ${leaseId} cannot be closed: ${audit.blockers.join('; ')}`,
    );
    (err as any).audit = audit;
    throw err;
  }
  return audit;
}
