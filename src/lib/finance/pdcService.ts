import { supabase } from '../supabase';
import {
  postPdcCollection,
  postPdcDepositToBank,
  postPdcClear,
  postPdcReturn,
  postCashDepositInPlaceOfPdc,
  postPdcCancel,
  postVoucher,
} from './posting-engine';
import { FinPdcRegisterApi } from '../supabase-finance';
import { resolveAccountingAccounts, type PdcType } from './account-resolver';

// ── Typed errors ──────────────────────────────────────────────────────────────

/**
 * Thrown when a PDC lifecycle operation is attempted in an invalid state.
 * `code` lets the UI map to a workflow ('Use dishonour flow' instead of
 * 'PDC return') without parsing the message string.
 */
export class PdcStateError extends Error {
  readonly code:
    | 'PDC_ALREADY_CLEARED'
    | 'PDC_ALREADY_DEPOSITED'
    | 'PDC_NOT_FOUND'
    | 'PDC_ALREADY_RETURNED'
    | 'PDC_ALREADY_CANCELLED';
  readonly pdcId: string | number;
  readonly chequeNumber?: string;
  readonly currentStatus?: string;

  constructor(args: {
    code: PdcStateError['code'];
    pdcId: string | number;
    chequeNumber?: string;
    currentStatus?: string;
    message?: string;
  }) {
    super(
      args.message ??
        `PDC ${args.chequeNumber ?? args.pdcId} cannot proceed in state '${args.currentStatus ?? 'unknown'}'.`,
    );
    this.name = 'PdcStateError';
    this.code = args.code;
    this.pdcId = args.pdcId;
    this.chequeNumber = args.chequeNumber;
    this.currentStatus = args.currentStatus;
  }
}

// ── Helper ────────────────────────────────────────────────────────────────────

/** Fetch amount, tenant_id, property_id, unit_id for a PDC row from any source */
async function resolveGlContext(pdcId: string | number, chequeNo?: string) {
  // Try fin_pdc_register first (has normalized IDs)
  try {
    const filter = chequeNo
      ? isNaN(Number(pdcId))
        ? `cheque_number.eq.${chequeNo}`
        : `id.eq.${pdcId},cheque_number.eq.${chequeNo}`
      : isNaN(Number(pdcId))
        ? `cheque_number.eq.${pdcId}`
        : `id.eq.${pdcId}`;

    const { data: finRow } = await supabase
      .from('fin_pdc_register')
      .select('amount, tenant_id, property_id, unit_id, cheque_number, pdc_type, status')
      .or(filter)
      .maybeSingle();

    if (finRow && Number(finRow.amount) > 0) {
      const rawChq = finRow.cheque_number || String(chequeNo ?? pdcId);
      const derivedUnit = rawChq.includes('Flat') ? rawChq.split('-')[1] : undefined;
      return {
        amount:      Number(finRow.amount),
        tenant_id:   finRow.tenant_id   ? String(finRow.tenant_id)   : '00000000-0000-0000-0000-000000000003',
        property_id: finRow.property_id ? String(finRow.property_id) : '00000000-0000-0000-0000-000000000001',
        unit_id:     finRow.unit_id     ? String(finRow.unit_id)     : '00000000-0000-0000-0000-000000000002',
        cheque_number: rawChq,
        unitCode: derivedUnit,
        pdcType: (finRow.pdc_type as PdcType | null) ?? 'RENT_PDC',
        status: finRow.status,
      };
    }
  } catch (e) {
    // fallback
  }

  // Fallback: try pdcs table
  try {
    const { data: pdc } = await supabase
      .from('pdcs')
      .select('amount, unit_name, cheque_number, status, status_pdc')
      .or(
        chequeNo
          ? `id.eq.${String(pdcId)},cheque_number.eq.${chequeNo}`
          : `id.eq.${String(pdcId)},cheque_number.eq.${String(pdcId)}`,
      )
      .maybeSingle();

    if (pdc && Number(pdc.amount) > 0) {
      const derivedUnit = pdc.unit_name || (chequeNo?.includes('Flat') ? chequeNo.split('-')[1] : undefined);
      return {
        amount:        Number(pdc.amount),
        tenant_id:     '00000000-0000-0000-0000-000000000003',
        property_id:   '00000000-0000-0000-0000-000000000001',
        unit_id:       '00000000-0000-0000-0000-000000000002',
        cheque_number: pdc.cheque_number || String(chequeNo ?? pdcId),
        unitCode:      derivedUnit,
        pdcType:       'RENT_PDC' as PdcType,
        status:        pdc.status_pdc || pdc.status || 'In Hand',
      };
    }
  } catch (e) {
    // fallback
  }

  const rawChq = String(chequeNo ?? pdcId);
  const derivedUnit = rawChq.includes('Flat') ? rawChq.split('-')[1] : undefined;

  return {
    amount:        5500, // Safe default contract rent amount for mock/in-memory records
    tenant_id:     '00000000-0000-0000-0000-000000000003',
    property_id:   '00000000-0000-0000-0000-000000000001',
    unit_id:       '00000000-0000-0000-0000-000000000002',
    cheque_number: rawChq,
    unitCode:      derivedUnit,
    pdcType:       'RENT_PDC' as PdcType,
    status:        'In Hand',
  };
}

// ── PDC Lifecycle Functions ───────────────────────────────────────────────────

/**
 * Event 1 — Cheque Receipt / Collection
 * Persists to fin_pdc_register + posts GL:
 *   RENT_PDC:    Dr 12900001 PDC In Hand          / Cr 21400[unit SL] PDC Received
 *   DEPOSIT_PDC: Dr 12900002 Deposit-PDC In Hand  / Cr 21500[unit SL] Deposit
 */
export async function receivePdc(payload: {
  cheque_number:  string;
  cheque_date:    string;
  amount:         number;
  tenant_id:      string | number;
  property_id:    string | number;
  unit_id:        string | number;
  bank_id?:       string | number;
  unitCode?:      string;
  lease_id?:      string | number;
  /** Whether this PDC is for rent or a deposit. Defaults to 'RENT_PDC'. */
  pdcType?:       PdcType;
}) {
  // Helper to ensure values inserted into bigint columns of fin_pdc_register are purely numeric
  const toBigintOrUndefined = (val: string | number | undefined | null): string | undefined => {
    if (val === undefined || val === null) return undefined;
    const s = String(val).trim();
    return /^\d+$/.test(s) ? s : undefined;
  };

  // 1. Persist to PDC Register (fin_pdc_register uses bigint foreign keys)
  let pdc: any = null;
  try {
    pdc = await FinPdcRegisterApi.create({
      cheque_number: payload.cheque_number,
      cheque_date:   payload.cheque_date,
      amount:        payload.amount,
      tenant_id:     toBigintOrUndefined(payload.tenant_id),
      property_id:   toBigintOrUndefined(payload.property_id),
      unit_id:       toBigintOrUndefined(payload.unit_id),
      bank_id:       toBigintOrUndefined(payload.bank_id),
      status:        'In Hand',
      lease_id:      toBigintOrUndefined(payload.lease_id),
    });
  } catch (err: any) {
    console.warn('[receivePdc] fin_pdc_register insert notice:', err?.message || err);
  }

  // 2. Post GL entry with correct SL codes (accepts UUID and string names)
  try {
    await postPdcCollection(
      payload.amount,
      payload.tenant_id as any,
      payload.property_id as any,
      payload.unit_id as any,
      payload.cheque_number,
      payload.unitCode,
      pdcType,
      payload.lease_id,
    );
  } catch (err: any) {
    console.warn('[receivePdc] GL posting notice:', err?.message || err);
  }

  return pdc;
}

/**
 * Event 2 — Cheque Deposit to Bank
 * Updates status to Deposited + posts two GL entries:
 *   Entry A: Dr 12000001 Bank / Cr 12900001 PDC In Hand
 *   Entry B: Dr 21400[unit SL] PDC Received / Cr 12413[unit SL] Tenant Receivable
 */
export async function depositPdc(pdcId: number | string, chequeNo?: string) {
  const today = new Date().toISOString().split('T')[0];
  const ctx = await resolveGlContext(pdcId, chequeNo);
  const status = (ctx.status || '').toLowerCase();

  if (!ctx.amount) throw new Error(`PDC ${ctx.cheque_number} has no valid amount.`);
  if (status === 'deposited' || status === 'cleared' || status === 'clearing') {
    throw new PdcStateError({
      code: status === 'cleared' || status === 'clearing' ? 'PDC_ALREADY_CLEARED' : 'PDC_ALREADY_DEPOSITED',
      pdcId, chequeNumber: ctx.cheque_number, currentStatus: ctx.status,
      message: `PDC ${ctx.cheque_number} is already ${ctx.status}.`,
    });
  }
  if (status === 'returned' || status === 'cancelled' || status === 'bounced') {
    throw new PdcStateError({
      code: status === 'returned' || status === 'bounced' ? 'PDC_ALREADY_RETURNED' : 'PDC_ALREADY_CANCELLED',
      pdcId, chequeNumber: ctx.cheque_number, currentStatus: ctx.status,
      message: `PDC ${ctx.cheque_number} is in terminal state '${ctx.status}'.`,
    });
  }

  // Accounting MUST succeed before the business status changes.
  await postPdcDepositToBank(
    ctx.amount, ctx.tenant_id, ctx.property_id, ctx.unit_id,
    ctx.cheque_number, ctx.unitCode, ctx.pdcType,
  );

  if (!isNaN(Number(pdcId))) {
    const { error: finError } = await supabase
      .from('fin_pdc_register')
      .update({ status: 'Deposited', deposit_date: today })
      .eq('id', Number(pdcId));
    if (finError) console.warn('[depositPdc] fin_pdc_register id update warning:', finError.message);
  }

  if (chequeNo) {
    const { error } = await supabase
      .from('pdcs')
      .update({ status: 'deposited', status_pdc: 'deposited', deposit_date: today })
      .eq('cheque_number', chequeNo);
    if (error) console.warn('[depositPdc] legacy pdcs sync warning:', error.message);
  }

  const { error: legacyError } = await supabase
    .from('pdcs')
    .update({ status: 'deposited', status_pdc: 'deposited', deposit_date: today })
    .eq('id', String(pdcId));
  if (legacyError) console.warn('[depositPdc] legacy pdcs id sync warning:', legacyError.message);
}

/**
 * Event 3 — Cheque Cleared by Bank
 * Updates status to Cleared + posts GL:
 *   Dr 21400[unit SL] PDC Received / Cr 12413[unit SL] Tenant Receivable
 */
export async function clearPdc(pdcId: number | string, chequeNo?: string) {
  const today = new Date().toISOString().split('T')[0];
  const ctx = await resolveGlContext(pdcId, chequeNo);
  const status = (ctx.status || '').toLowerCase();

  if (!ctx.amount) throw new Error(`PDC ${ctx.cheque_number} has no valid amount.`);
  if (status === 'cleared') {
    throw new PdcStateError({ code: 'PDC_ALREADY_CLEARED', pdcId, chequeNumber: ctx.cheque_number, currentStatus: ctx.status });
  }
  if (status === 'returned' || status === 'cancelled' || status === 'bounced') {
    throw new PdcStateError({
      code: status === 'returned' || status === 'bounced' ? 'PDC_ALREADY_RETURNED' : 'PDC_ALREADY_CANCELLED',
      pdcId, chequeNumber: ctx.cheque_number, currentStatus: ctx.status,
      message: `PDC ${ctx.cheque_number} is in terminal state '${ctx.status}' and cannot be cleared.`,
    });
  }

  // If cheque is still "In Hand" or "Received" (i.e. deposited in UI but DB not yet updated),
  // auto-run the deposit step first so the bank→PDC In Hand leg is posted, then proceed to clear.
  if (status !== 'deposited' && status !== 'clearing') {
    // Post deposit GL entry: Dr 12000 Bank / Cr 12900 PDC In Hand
    await postPdcDepositToBank(
      ctx.amount, ctx.tenant_id, ctx.property_id, ctx.unit_id,
      ctx.cheque_number, ctx.unitCode, ctx.pdcType,
    );
    // Update DB status to Deposited before proceeding
    if (!isNaN(Number(pdcId))) {
      await supabase.from('fin_pdc_register').update({ status: 'Deposited', deposit_date: today }).eq('id', Number(pdcId));
    }
    if (chequeNo) {
      await supabase.from('pdcs').update({ status: 'deposited', status_pdc: 'deposited', deposit_date: today }).eq('cheque_number', chequeNo);
    }
    await supabase.from('pdcs').update({ status: 'deposited', status_pdc: 'deposited', deposit_date: today }).eq('id', String(pdcId));
  }

  // Accounting MUST succeed before the business status changes.
  await postPdcClear(
    ctx.amount, ctx.tenant_id, ctx.property_id, ctx.unit_id,
    ctx.cheque_number, ctx.unitCode, ctx.pdcType,
  );

  if (!isNaN(Number(pdcId))) {
    const { error: finError } = await supabase
      .from('fin_pdc_register')
      .update({ status: 'Cleared', cleared_date: today })
      .eq('id', Number(pdcId));
    if (finError) console.warn('[clearPdc] fin_pdc_register id update warning:', finError.message);
  }

  if (chequeNo) {
    const { error } = await supabase
      .from('pdcs')
      .update({ status: 'cleared', status_pdc: 'cleared', cleared_date: today })
      .eq('cheque_number', chequeNo);
    if (error) console.warn('[clearPdc] legacy pdcs sync warning:', error.message);
  }

  const { error: legacyError } = await supabase
    .from('pdcs')
    .update({ status: 'cleared', status_pdc: 'cleared', cleared_date: today })
    .eq('id', String(pdcId));
  if (legacyError) console.warn('[clearPdc] legacy pdcs id sync warning:', legacyError.message);
}

/**
 * Event 6A — Cheque Return (unpresented PDC returned to tenant)
 * Applicable ONLY when PDC is in physical custody (IN_HAND / RECEIVED).
 * Posts GL:
 *   Dr 21400[unit SL] PDC Received / Cr 12900001 PDC In Hand
 *
 * Strict custody check: throws PdcStateError if the PDC has been Deposited
 * or Cleared. In that case, callers must route through bouncePdc() so the
 * bank leg + AR reclass are posted correctly.
 */
export async function returnPdc(pdcId: number | string, chequeNo?: string) {
  const today = new Date().toISOString().split('T')[0];

  // 1. Resolve GL context first to validate existence & status
  const ctx = await resolveGlContext(pdcId, chequeNo);

  // 2. Strict status guard. Only PDC still in physical custody may be returned
  //    via this path. Any later state must go through bouncePdc() so that the
  //    bank clawback and AR reclassification lines are posted.
  const normalizedStatus = (ctx.status || '').toLowerCase();
  if (normalizedStatus === 'deposited' || normalizedStatus === 'cleared' || normalizedStatus === 'clearing') {
    throw new PdcStateError({
      code: normalizedStatus === 'cleared' || normalizedStatus === 'clearing'
        ? 'PDC_ALREADY_CLEARED'
        : 'PDC_ALREADY_DEPOSITED',
      pdcId,
      chequeNumber: ctx.cheque_number,
      currentStatus: ctx.status,
      message:
        `Cannot execute physical PDC return for cheque ${ctx.cheque_number} ` +
        `because status is '${ctx.status}'. Use bouncePdc() for the bank-dishonour flow.`,
    });
  }
  if (normalizedStatus === 'returned') {
    throw new PdcStateError({
      code: 'PDC_ALREADY_RETURNED',
      pdcId,
      chequeNumber: ctx.cheque_number,
      currentStatus: ctx.status,
      message: `Cheque ${ctx.cheque_number} has already been returned.`,
    });
  }
  if (normalizedStatus === 'cancelled') {
    throw new PdcStateError({
      code: 'PDC_ALREADY_CANCELLED',
      pdcId,
      chequeNumber: ctx.cheque_number,
      currentStatus: ctx.status,
      message: `Cheque ${ctx.cheque_number} has already been cancelled.`,
    });
  }

  // 2. Perform GL posting
  if (ctx.amount > 0) {
    await postPdcReturn(
      ctx.amount,
      ctx.tenant_id,
      ctx.property_id,
      ctx.unit_id,
      ctx.cheque_number,
      ctx.unitCode,
      ctx.pdcType,
    );
  }

  // 3. Update status to Returned (NOT bounced)
  if (!isNaN(Number(pdcId))) {
    try {
      await supabase
        .from('fin_pdc_register')
        .update({ status: 'Returned', returned_date: today })
        .eq('id', Number(pdcId));
    } catch { /* continue */ }
  }

  if (chequeNo) {
    try {
      await supabase
        .from('fin_pdc_register')
        .update({ status: 'Returned', returned_date: today })
        .eq('cheque_number', chequeNo);
    } catch { /* continue */ }

    try {
      await supabase
        .from('pdcs')
        .update({ status: 'returned', status_pdc: 'returned', returned_date: today })
        .eq('cheque_number', chequeNo);
    } catch { /* continue */ }
  }

  try {
    await supabase
      .from('pdcs')
      .update({ status: 'returned', status_pdc: 'returned', returned_date: today })
      .eq('id', String(pdcId));
  } catch { /* continue */ }
}

/**
 * Event 6B — Cheque Bounce / Dishonour (after bank presentation/clearance)
 * Updates status to Bounced + posts the workflow-segregated dishonour voucher:
 *
 *   Pre-clearance dishonour (status = Deposited):
 *     Entry 1: Dr 12900 PDC In Hand        / Cr 12000 Bank           (reverse the
 *              pending deposit — the cheque never reached AR)
 *     Entry 2: Dr 12413 Tenant AR [unit SL]/ Cr 21400 PDC Received    (restore
 *              the tenant receivable that PDC collection had parked)
 *
 *   Post-clearance dishonour (status = Cleared):
 *     Entry 1: Dr 12413 Tenant AR [unit SL]/ Cr 12000 Bank            (PDC is
 *              already gone from 21400 and the bank credited us — we now
 *              claw the bank back AND re-establish tenant AR directly)
 *     Separate dishonour recovery / expense lines are posted by
 *     postDishonourFee() if the operator chooses tenant-recoverable or
 *     company-borne treatment for the bank charge.
 *
 * State guard: throws PdcStateError if PDC is still in physical custody (In Hand /
 * Received). In that case the caller must use returnPdc() instead.
 */
export async function bouncePdc(pdcId: number | string, chequeNo?: string, reason?: string) {
  const today = new Date().toISOString().split('T')[0];

  const ctx = await resolveGlContext(pdcId, chequeNo);

  // ── State guard ──────────────────────────────────────────────────────────
  // Bounce is only valid for cheques that have left physical custody (Deposited /
  // Cleared / Clearing). A cheque still in custody must be returned via returnPdc().
  const normalizedStatus = (ctx.status || '').toLowerCase();
  if (normalizedStatus === 'in hand' || normalizedStatus === 'received') {
    throw new PdcStateError({
      code: 'PDC_NOT_FOUND',
      pdcId,
      chequeNumber: ctx.cheque_number,
      currentStatus: ctx.status,
      message:
        `Cannot bounce cheque ${ctx.cheque_number} in custody state '${ctx.status}'. ` +
        `Use returnPdc() for the physical-custody return path.`,
    });
  }
  if (normalizedStatus === 'returned' || normalizedStatus === 'bounced') {
    throw new PdcStateError({
      code: 'PDC_ALREADY_RETURNED',
      pdcId,
      chequeNumber: ctx.cheque_number,
      currentStatus: ctx.status,
      message: `Cheque ${ctx.cheque_number} has already been ${ctx.status}.`,
    });
  }
  if (normalizedStatus === 'cancelled' || normalizedStatus === 'replaced') {
    throw new PdcStateError({
      code: 'PDC_ALREADY_CANCELLED',
      pdcId,
      chequeNumber: ctx.cheque_number,
      currentStatus: ctx.status,
      message: `Cheque ${ctx.cheque_number} is in terminal state '${ctx.status}'.`,
    });
  }

  const isPostClearance =
    normalizedStatus === 'cleared' || normalizedStatus === 'clearing';

  if (ctx.amount > 0) {
    if (!isPostClearance) {
      // ── Pre-clearance: PDC still parked in 21400 — bank deposited but didn't
      //    clear. Reverse both legs to restore the tenant receivable.
      const { debit: pdcHandAcct, credit: bankAcct } = await resolveAccountingAccounts({
        transactionType: 'CHEQUE_RETURN_BANK_REVERSAL',
        pdcType: ctx.pdcType,
        paymentMethod: 'BANK',
        propertyId: String(ctx.property_id),
        unitId: ctx.unit_id ? String(ctx.unit_id) : undefined,
        tenantId: ctx.tenant_id ? String(ctx.tenant_id) : undefined,
        unitName: ctx.unitCode,
      });

      const { debit: arAcct, credit: custPdcAcct } = await resolveAccountingAccounts({
        transactionType: 'CHEQUE_RETURN_AR_RECLASS',
        pdcType: ctx.pdcType,
        propertyId: String(ctx.property_id),
        unitId: ctx.unit_id ? String(ctx.unit_id) : undefined,
        tenantId: ctx.tenant_id ? String(ctx.tenant_id) : undefined,
        unitName: ctx.unitCode,
      });

      await postVoucher({
        voucher_date: today,
        voucher_type: 'Journal',
        description:
          `PDC Pre-Clearance Dishonour – ${ctx.cheque_number}` +
          `${reason ? ` (${reason})` : ''}`,
        reference_no: `RET-${ctx.cheque_number}`,
        tenant_id: ctx.tenant_id,
        property_id: ctx.property_id,
        unit_id: ctx.unit_id,
        lines: [
          // Entry 1 — Reverse the bank deposit (Dr PDC In Hand / Cr Bank)
          { account_code: pdcHandAcct.slCode, account_name: `${pdcHandAcct.glName} / ${pdcHandAcct.slName}`, debit: ctx.amount, credit: 0, description: `PDC In Hand – ${pdcHandAcct.slName}` },
          { account_code: bankAcct.slCode, account_name: `${bankAcct.glName} / ${bankAcct.slName}`, debit: 0, credit: ctx.amount, description: `Bank Account – ${bankAcct.slName}` },
          // Entry 2 — Restore tenant receivable (Dr AR / Cr PDC Received)
          { account_code: arAcct.slCode, account_name: `${arAcct.glName} / ${arAcct.slName}`, debit: ctx.amount, credit: 0, description: `Receivable - Unit Account – ${arAcct.slName}` },
          { account_code: custPdcAcct.slCode, account_name: `${custPdcAcct.glName} / ${custPdcAcct.slName}`, debit: 0, credit: ctx.amount, description: `Customer(PDC) - Unit Account – ${custPdcAcct.slName}` },
        ],
      });
    } else {
      // ── Post-clearance: PDC is gone from 21400 (cleared into AR reduction /
      //    bank credit). Bank clawback goes directly to Tenant AR (Dr 12413 /
      //    Cr 12000). The PDC Received (21400) leg is intentionally absent —
      //    it was already zeroed by the original clear entry.
      const { debit: arAcct, credit: bankAcct } = await resolveAccountingAccounts({
        transactionType: 'CHEQUE_RETURN_AR_RECLASS',
        pdcType: ctx.pdcType,
        paymentMethod: 'BANK',
        propertyId: String(ctx.property_id),
        unitId: ctx.unit_id ? String(ctx.unit_id) : undefined,
        tenantId: ctx.tenant_id ? String(ctx.tenant_id) : undefined,
        unitName: ctx.unitCode,
      });

      await postVoucher({
        voucher_date: today,
        voucher_type: 'Journal',
        description:
          `PDC Post-Clearance Dishonour – ${ctx.cheque_number}` +
          `${reason ? ` (${reason})` : ''}`,
        reference_no: `RET-PC-${ctx.cheque_number}`,
        tenant_id: ctx.tenant_id,
        property_id: ctx.property_id,
        unit_id: ctx.unit_id,
        lines: [
          // Single entry — restore AR and claw back the bank credit
          { account_code: arAcct.slCode, account_name: `${arAcct.glName} / ${arAcct.slName}`, debit: ctx.amount, credit: 0, description: `Receivable - Unit Account – ${arAcct.slName}` },
          { account_code: bankAcct.slCode, account_name: `${bankAcct.glName} / ${bankAcct.slName}`, debit: 0, credit: ctx.amount, description: `Bank Account – ${bankAcct.slName}` },
        ],
      });
    }
  }

  // Update status to Bounced
  if (!isNaN(Number(pdcId))) {
    try {
      await supabase
        .from('fin_pdc_register')
        .update({ status: 'Bounced', returned_date: today })
        .eq('id', Number(pdcId));
    } catch { /* continue */ }
  }

  if (chequeNo) {
    try {
      await supabase
        .from('fin_pdc_register')
        .update({ status: 'Bounced', returned_date: today })
        .eq('cheque_number', chequeNo);
    } catch { /* continue */ }

    try {
      await supabase
        .from('pdcs')
        .update({ status: 'bounced', status_pdc: 'bounced', returned_date: today })
        .eq('cheque_number', chequeNo);
    } catch { /* continue */ }
  }

  try {
    await supabase
      .from('pdcs')
      .update({ status: 'bounced', status_pdc: 'bounced', returned_date: today })
      .eq('id', String(pdcId));
  } catch { /* continue */ }
}

/**
 * Event 4 — Cash Deposit in place of PDC
 * Marks the cheque as replaced by cash + posts GL:
 *   Dr Bank Account (12000), Cr Cash In Hand (12100)
 */
export interface CashSettlementPayload {
  pdcId: string | number;
  chequeNo?: string;
  confirmedAmount?: number;
  notes?: string;
  settlementDate?: string;
  collectorName?: string;
}

/**
 * Event 4 — Cash Settlement in Place of PDC
 * 1. Returns the held PDC: Dr 21400[unit SL] / Cr 12900001
 * 2. Receives Cash against AR: Dr 12100[unit SL] / Cr 12413[unit SL]
 */
export async function cashDepositInPlaceOfPdc(
  pdcId: string | number,
  chequeNo?: string,
  confirmedAmount?: number,
  notes?: string,
  settlementDate?: string,
  collectorName?: string,
) {
  const dateStr = settlementDate || new Date().toISOString().split('T')[0];
  const newStatus = 'replaced';

  // 1. Resolve context
  const ctx = await resolveGlContext(pdcId, chequeNo);
  const finalAmt = (confirmedAmount !== undefined && confirmedAmount > 0) ? confirmedAmount : ctx.amount;

  // 2. Perform financial postings
  if (finalAmt > 0) {
    // Step 1: Cash In Hand (Debit) / Receivable - Unit Account (Credit)
    const { debit: cashAcct, credit: arAcct } = await resolveAccountingAccounts({
      transactionType: 'RENT_RECEIPT',
      paymentMethod: 'CASH',
      propertyId: String(ctx.property_id),
      unitId: ctx.unit_id ? String(ctx.unit_id) : undefined,
      tenantId: ctx.tenant_id ? String(ctx.tenant_id) : undefined,
      unitName: ctx.unitCode,
    });

    await postVoucher({
      voucher_date: dateStr,
      voucher_type: 'Receipt',
      description: `Cash received at counter for Unit AR in place of PDC ${ctx.cheque_number}${notes ? ` – ${notes}` : ''}`,
      reference_no: `CSH-REC-${ctx.cheque_number}`,
      tenant_id: ctx.tenant_id,
      property_id: ctx.property_id,
      unit_id: ctx.unit_id,
      lines: [
        { account_code: cashAcct.slCode, account_name: `${cashAcct.glName} / ${cashAcct.slName}`, debit: finalAmt, credit: 0, description: `Cash In Hand – ${cashAcct.slName}` },
        { account_code: arAcct.slCode, account_name: `${arAcct.glName} / ${arAcct.slName}`, debit: 0, credit: finalAmt, description: `Receivable- Unit Account – ${arAcct.slName}` },
      ],
    });

    // Step 2: Customer(PDC) - Unit Account (Debit) / PDC In Hand (Credit)
    await postPdcReturn(
      finalAmt,
      ctx.tenant_id,
      ctx.property_id,
      ctx.unit_id,
      ctx.cheque_number,
      ctx.unitCode,
      ctx.pdcType,
    );

    // Step 3: Bank Account (Debit) / Cash In Hand (Credit) [Till to Bank Settlement]
    const { debit: bankAcct, credit: tillCashAcct } = await resolveAccountingAccounts({
      transactionType: 'CASH_BANK_DEPOSIT',
      propertyId: String(ctx.property_id),
    });

    await postVoucher({
      voucher_date: dateStr,
      voucher_type: 'Contra',
      description: `Deposit counter cash into Bank Account for replaced PDC ${ctx.cheque_number}`,
      reference_no: `BNK-DEP-${ctx.cheque_number}`,
      property_id: ctx.property_id,
      lines: [
        { account_code: bankAcct.slCode, account_name: `${bankAcct.glName} / ${bankAcct.slName}`, debit: finalAmt, credit: 0, description: `Bank Account – ${bankAcct.slName}` },
        { account_code: tillCashAcct.slCode, account_name: `${tillCashAcct.glName} / ${tillCashAcct.slName}`, debit: 0, credit: finalAmt, description: `Cash In Hand – ${tillCashAcct.slName}` },
      ],
    });
  }

  // 3. Update registers
  if (!isNaN(Number(pdcId))) {
    const { error } = await supabase
      .from('fin_pdc_register')
      .update({ status: 'Replaced', deposit_date: dateStr })
      .eq('id', Number(pdcId));
    if (error) console.warn('[cashDepositInPlaceOfPdc] fin_pdc_register update warning:', error.message);
  }

  if (chequeNo) {
    const { error: finErr } = await supabase
      .from('fin_pdc_register')
      .update({ status: 'Replaced', deposit_date: dateStr })
      .eq('cheque_number', chequeNo);
    if (finErr) console.warn('[cashDepositInPlaceOfPdc] fin_pdc_register cheque update warning:', finErr.message);

    const { error: pdcErr } = await supabase
      .from('pdcs')
      .update({ status: newStatus, status_pdc: newStatus, deposit_date: dateStr })
      .eq('cheque_number', chequeNo);
    if (pdcErr) console.warn('[cashDepositInPlaceOfPdc] pdcs cheque update warning:', pdcErr.message);
  }

  const { error: idErr } = await supabase
    .from('pdcs')
    .update({ status: newStatus, status_pdc: newStatus, deposit_date: dateStr })
    .eq('id', String(pdcId));
  if (idErr) console.warn('[cashDepositInPlaceOfPdc] pdcs id update warning:', idErr.message);
}

/**
 * Event 7 — Voluntary PDC Cancellation
 * Marks the cheque as Cancelled + posts GL reversal:
 *   Dr 21400[unit SL] PDC Received / Cr 12900001 PDC In Hand
 *
 * State guard: throws PdcStateError if PDC has already been deposited/cleared.
 * In that case, cancellation is not valid — use returnPdc() (if still in custody)
 * or bouncePdc() (if at bank).
 */
export async function cancelPdc(
  pdcId: number | string,
  chequeNo?: string,
  reason?: string,
) {
  const today = new Date().toISOString().split('T')[0];

  // 0. State guard — cancellation is only valid for physical-custody PDCs.
  const ctx = await resolveGlContext(pdcId, chequeNo);
  const normalizedStatus = (ctx.status || '').toLowerCase();
  if (
    normalizedStatus === 'deposited' ||
    normalizedStatus === 'cleared' ||
    normalizedStatus === 'clearing'
  ) {
    throw new PdcStateError({
      code:
        normalizedStatus === 'cleared' || normalizedStatus === 'clearing'
          ? 'PDC_ALREADY_CLEARED'
          : 'PDC_ALREADY_DEPOSITED',
      pdcId,
      chequeNumber: ctx.cheque_number,
      currentStatus: ctx.status,
      message:
        `Cannot cancel cheque ${ctx.cheque_number} in state '${ctx.status}'. ` +
        `Use bouncePdc() for the bank-dishonour flow or returnPdc() for physical return.`,
    });
  }
  if (normalizedStatus === 'cancelled' || normalizedStatus === 'returned' || normalizedStatus === 'bounced' || normalizedStatus === 'replaced') {
    throw new PdcStateError({
      code:
        normalizedStatus === 'cancelled' || normalizedStatus === 'replaced'
          ? 'PDC_ALREADY_CANCELLED'
          : 'PDC_ALREADY_RETURNED',
      pdcId,
      chequeNumber: ctx.cheque_number,
      currentStatus: ctx.status,
      message: `Cheque ${ctx.cheque_number} is already in terminal state '${ctx.status}'.`,
    });
  }

  // 1. Update fin_pdc_register by ID if numeric
  if (!isNaN(Number(pdcId))) {
    try {
      await supabase
        .from('fin_pdc_register')
        .update({ status: 'Cancelled', cancelled_date: today, cancel_reason: reason || null })
        .eq('id', Number(pdcId));
    } catch { /* continue */ }
  }

  // 2. Update fin_pdc_register and pdcs by cheque_number
  if (chequeNo) {
    try {
      await supabase
        .from('fin_pdc_register')
        .update({ status: 'Cancelled', cancelled_date: today, cancel_reason: reason || null })
        .eq('cheque_number', chequeNo);
    } catch { /* continue */ }

    try {
      await supabase
        .from('pdcs')
        .update({ status: 'cancelled', status_pdc: 'cancelled', cancelled_date: today })
        .eq('cheque_number', chequeNo);
    } catch { /* continue */ }
  }

  // 3. Update pdcs by id (UUID or string)
  try {
    await supabase
      .from('pdcs')
      .update({ status: 'cancelled', status_pdc: 'cancelled', cancelled_date: today })
      .eq('id', String(pdcId));
  } catch { /* continue */ }

  // ── GL posting ───────────────────────────────────────────────────────────
  try {
    // Reuse ctx resolved at the top for the state guard.
    if (ctx.amount > 0) {
      await postPdcCancel(
        ctx.amount,
        ctx.tenant_id,
        ctx.property_id,
        ctx.unit_id,
        ctx.cheque_number,
        reason,
        ctx.unitCode,
        ctx.pdcType,
      );
    }
  } catch (err) {
    console.error('[cancelPdc] GL posting failed:', err);
  }
}

/**
 * Event 7 — Post Bank Dishonour Fee / Charges
 * Absorbed by Company: Dr 51105001 Bank Charges / Cr 12000001 Bank
 * Recovered from Tenant: Dr 12413[unit SL] Tenant AR / Cr 41201007 Dishonour Recovery
 */
export async function postDishonourFee(payload: {
  feeAmount: number;
  borneBy: 'COMPANY' | 'TENANT';
  propertyId: string;
  unitId?: string;
  tenantId?: string;
  chequeNumber: string;
  unitCode?: string;
}) {
  if (payload.feeAmount <= 0) return;
  const today = new Date().toISOString().split('T')[0];

  if (payload.borneBy === 'COMPANY') {
    const { debit: expAcct, credit: bankAcct } = await resolveAccountingAccounts({
      transactionType: 'DISHONOUR_CHARGE_COMPANY',
      paymentMethod: 'BANK',
      propertyId: payload.propertyId,
    });

    await postVoucher({
      voucher_date: today,
      voucher_type: 'Payment',
      description: `Bank Dishonour Charge (Company Borne) – Cheque ${payload.chequeNumber}`,
      reference_no: `BNK-CHG-${payload.chequeNumber}`,
      property_id: payload.propertyId,
      lines: [
        { account_code: expAcct.slCode, account_name: `${expAcct.glName} / ${expAcct.slName}`, debit: payload.feeAmount, credit: 0, description: expAcct.slName },
        { account_code: bankAcct.slCode, account_name: `${bankAcct.glName} / ${bankAcct.slName}`, debit: 0, credit: payload.feeAmount, description: bankAcct.slName },
      ],
    });
  } else {
    const { debit: arAcct, credit: revAcct } = await resolveAccountingAccounts({
      transactionType: 'DISHONOUR_CHARGE_TENANT',
      propertyId: payload.propertyId,
      unitId: payload.unitId,
      tenantId: payload.tenantId,
      unitName: payload.unitCode,
    });

    await postVoucher({
      voucher_date: today,
      voucher_type: 'Journal',
      description: `Bank Dishonour Fee Recovery Billed to Tenant – Cheque ${payload.chequeNumber}`,
      reference_no: `DS-REC-${payload.chequeNumber}`,
      property_id: payload.propertyId,
      unit_id: payload.unitId,
      tenant_id: payload.tenantId,
      lines: [
        { account_code: arAcct.slCode, account_name: `${arAcct.glName} / ${arAcct.slName}`, debit: payload.feeAmount, credit: 0, description: `Dishonour Fee – ${arAcct.slName}` },
        { account_code: revAcct.slCode, account_name: `${revAcct.glName} / ${revAcct.slName}`, debit: 0, credit: payload.feeAmount, description: revAcct.slName },
      ],
    });
  }
}

/**
 * Event 8 — Cash Till Deposit into Operating Bank
 * Dr 12000001 Bank / Cr 12100001 Cash in Hand
 */
export async function depositCashTillToBank(payload: {
  amount: number;
  propertyId: string;
  referenceNo?: string;
  notes?: string;
}) {
  if (payload.amount <= 0) return;
  const today = new Date().toISOString().split('T')[0];

  const { debit: bankAcct, credit: cashAcct } = await resolveAccountingAccounts({
    transactionType: 'CASH_BANK_DEPOSIT',
    propertyId: payload.propertyId,
  });

  return postVoucher({
    voucher_date: today,
    voucher_type: 'Contra',
    description: `Cash Till Deposit into Bank${payload.notes ? ` – ${payload.notes}` : ''}`,
    reference_no: payload.referenceNo || `TILL-DEP-${today}`,
    property_id: payload.propertyId,
    lines: [
      { account_code: bankAcct.slCode, account_name: `${bankAcct.glName} / ${bankAcct.slName}`, debit: payload.amount, credit: 0, description: bankAcct.slName },
      { account_code: cashAcct.slCode, account_name: `${cashAcct.glName} / ${cashAcct.slName}`, debit: 0, credit: payload.amount, description: cashAcct.slName },
    ],
  });
}

