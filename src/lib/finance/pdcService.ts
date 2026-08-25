import { supabase } from '../supabase';
import {
  postPdcCollection,
  postPdcDepositToBank,
  postPdcClear,
  postPdcReturn,
  postCashDepositInPlaceOfPdc,
  postPdcCancel,
} from './posting-engine';
import { FinPdcRegisterApi } from '../supabase-finance';

// ── Helper ────────────────────────────────────────────────────────────────────

/** Fetch amount, tenant_id, property_id, unit_id for a PDC row from any source */
async function resolveGlContext(pdcId: string | number, chequeNo?: string) {
  // Try fin_pdc_register first (has normalized IDs)
  const { data: finRow } = await supabase
    .from('fin_pdc_register')
    .select('amount, tenant_id, property_id, unit_id, cheque_number')
    .or(
      chequeNo
        ? `id.eq.${pdcId},cheque_number.eq.${chequeNo}`
        : `id.eq.${pdcId}`,
    )
    .maybeSingle();

  if (finRow?.amount) {
    return {
      amount:      Number(finRow.amount),
      tenant_id:   Number(finRow.tenant_id)   || 0,
      property_id: Number(finRow.property_id) || 0,
      unit_id:     Number(finRow.unit_id)     || 0,
      cheque_number: finRow.cheque_number || String(chequeNo ?? pdcId),
    };
  }

  // Fallback: try pdcs table
  const { data: pdc } = await supabase
    .from('pdcs')
    .select('amount, unit_name, cheque_number')
    .or(
      chequeNo
        ? `id.eq.${String(pdcId)},cheque_number.eq.${chequeNo}`
        : `id.eq.${String(pdcId)}`,
    )
    .maybeSingle();

  return {
    amount:        Number(pdc?.amount)  || 0,
    tenant_id:     0,
    property_id:   0,
    unit_id:       0,
    cheque_number: pdc?.cheque_number || String(chequeNo ?? pdcId),
    unitCode:      pdc?.unit_name,
  };
}

// ── PDC Lifecycle Functions ───────────────────────────────────────────────────

/**
 * Event 1 — Cheque Receipt / Collection
 * Persists to fin_pdc_register + posts GL:
 *   Dr PDC In Hand (12900), Cr Customer(PDC)-Unit (21400)
 */
export async function receivePdc(payload: {
  cheque_number:  string;
  cheque_date:    string;
  amount:         number;
  tenant_id:      number;
  property_id:    number;
  unit_id:        number;
  bank_id?:       number;
  unitCode?:      string;
}) {
  // 1. Persist to PDC Register
  const pdc = await FinPdcRegisterApi.create({
    cheque_number: payload.cheque_number,
    cheque_date:   payload.cheque_date,
    amount:        payload.amount,
    tenant_id:     payload.tenant_id,
    property_id:   payload.property_id,
    unit_id:       payload.unit_id,
    bank_id:       payload.bank_id,
    status:        'In Hand',
  });

  // 2. Post GL entry
  await postPdcCollection(
    payload.amount,
    payload.tenant_id,
    payload.property_id,
    payload.unit_id,
    payload.cheque_number,
    payload.unitCode,
  );

  return pdc;
}

/**
 * Event 2 — Cheque Deposit to Bank
 * Updates status to Deposited + posts GL:
 *   Dr Bank Account (12000), Cr PDC In Hand (12900)
 */
export async function depositPdc(pdcId: number | string, chequeNo?: string) {
  const today = new Date().toISOString().split('T')[0];

  // ── DB status updates ────────────────────────────────────────────────────

  // fin_pdc_register (numeric ID)
  if (!isNaN(Number(pdcId))) {
    try {
      await supabase
        .from('fin_pdc_register')
        .update({ status: 'Deposited', deposit_date: today })
        .eq('id', Number(pdcId));
    } catch { /* continue */ }
  }

  // pdcs table — by cheque_number
  if (chequeNo) {
    try {
      await supabase
        .from('fin_pdc_register')
        .update({ status: 'Deposited', deposit_date: today })
        .eq('cheque_number', chequeNo);
    } catch { /* continue */ }

    try {
      await supabase
        .from('pdcs')
        .update({ status: 'deposited', status_pdc: 'deposited', deposit_date: today })
        .eq('cheque_number', chequeNo);
    } catch { /* continue */ }
  }

  // pdcs table — by UUID id
  try {
    await supabase
      .from('pdcs')
      .update({ status: 'deposited', status_pdc: 'deposited', deposit_date: today })
      .eq('id', String(pdcId));
  } catch { /* continue */ }

  // ── GL posting ───────────────────────────────────────────────────────────
  try {
    const ctx = await resolveGlContext(pdcId, chequeNo);
    if (ctx.amount > 0) {
      await postPdcDepositToBank(
        ctx.amount,
        ctx.tenant_id,
        ctx.property_id,
        ctx.unit_id,
        ctx.cheque_number,
      );
    }
  } catch (err) {
    console.error('[depositPdc] GL posting failed:', err);
  }
}

/**
 * Event 3 — Cheque Cleared by Bank
 * Updates status to Cleared + posts GL:
 *   Dr Customer(PDC)-Unit (21400), Cr Receivable-Unit (12413)
 */
export async function clearPdc(pdcId: number | string, chequeNo?: string) {
  const today = new Date().toISOString().split('T')[0];

  // ── DB status updates ────────────────────────────────────────────────────

  if (!isNaN(Number(pdcId))) {
    try {
      await supabase
        .from('fin_pdc_register')
        .update({ status: 'Cleared', cleared_date: today })
        .eq('id', Number(pdcId));
    } catch { /* continue */ }
  }

  if (chequeNo) {
    try {
      await supabase
        .from('fin_pdc_register')
        .update({ status: 'Cleared', cleared_date: today })
        .eq('cheque_number', chequeNo);
    } catch { /* continue */ }

    try {
      await supabase
        .from('pdcs')
        .update({ status: 'cleared', status_pdc: 'cleared', cleared_date: today })
        .eq('cheque_number', chequeNo);
    } catch { /* continue */ }
  }

  try {
    await supabase
      .from('pdcs')
      .update({ status: 'cleared', status_pdc: 'cleared', cleared_date: today })
      .eq('id', String(pdcId));
  } catch { /* continue */ }

  // ── GL posting ───────────────────────────────────────────────────────────
  try {
    const ctx = await resolveGlContext(pdcId, chequeNo);
    if (ctx.amount > 0) {
      await postPdcClear(
        ctx.amount,
        ctx.tenant_id,
        ctx.property_id,
        ctx.unit_id,
        ctx.cheque_number,
        ctx.unitCode,
      );
    }
  } catch (err) {
    console.error('[clearPdc] GL posting failed:', err);
  }
}

/**
 * Event 6 — Cheque Return / Bounce
 * Updates status to Returned/Bounced + posts GL (full reversal):
 *   Dr PDC In Hand (12900), Dr Receivable-Unit (12413)
 *   Cr Bank Account (12000), Cr Customer(PDC)-Unit (21400)
 */
export async function returnPdc(pdcId: number | string, chequeNo?: string) {
  const today = new Date().toISOString().split('T')[0];

  // ── DB status updates ────────────────────────────────────────────────────

  // 1. Update fin_pdc_register by ID if numeric
  if (!isNaN(Number(pdcId))) {
    try {
      await supabase
        .from('fin_pdc_register')
        .update({ status: 'Returned', returned_date: today })
        .eq('id', Number(pdcId));
    } catch { /* continue */ }
  }

  // 2. Update fin_pdc_register and pdcs by cheque_number
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
        .update({ status: 'bounced', status_pdc: 'bounced', returned_date: today })
        .eq('cheque_number', chequeNo);
    } catch { /* continue */ }
  }

  // 3. Update pdcs by id (UUID or string)
  try {
    await supabase
      .from('pdcs')
      .update({ status: 'bounced', status_pdc: 'bounced', returned_date: today })
      .eq('id', String(pdcId));
  } catch { /* continue */ }

  // ── GL posting (full reversal) ───────────────────────────────────────────
  try {
    const ctx = await resolveGlContext(pdcId, chequeNo);
    if (ctx.amount > 0) {
      await postPdcReturn(
        ctx.amount,
        ctx.tenant_id,
        ctx.property_id,
        ctx.unit_id,
        ctx.cheque_number,
        ctx.unitCode,
      );
    }
  } catch (err) {
    console.error('[returnPdc] GL posting failed:', err);
  }
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

  // 1. Update fin_pdc_register — preserve original amount
  if (!isNaN(Number(pdcId))) {
    const { error } = await supabase
      .from('fin_pdc_register')
      .update({ status: 'Replaced', deposit_date: dateStr })
      .eq('id', Number(pdcId));
    if (error) console.warn('[cashDepositInPlaceOfPdc] fin_pdc_register update warning:', error.message);
  }

  // 2. Update by cheque_number
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

  // 3. Update pdcs by id
  const { error: idErr } = await supabase
    .from('pdcs')
    .update({ status: newStatus, status_pdc: newStatus, deposit_date: dateStr })
    .eq('id', String(pdcId));
  if (idErr) console.warn('[cashDepositInPlaceOfPdc] pdcs id update warning:', idErr.message);

  // 4. GL posting
  try {
    const ctx = await resolveGlContext(pdcId, chequeNo);
    const finalAmt = (confirmedAmount !== undefined && confirmedAmount > 0) ? confirmedAmount : ctx.amount;
    if (finalAmt > 0) {
      await postCashDepositInPlaceOfPdc(
        finalAmt,
        ctx.tenant_id,
        ctx.property_id,
        ctx.unit_id,
        ctx.cheque_number,
      );
    }
  } catch (err) {
    console.error('[cashDepositInPlaceOfPdc] GL posting failed:', err);
  }
}

/**
 * Event 7 — Voluntary PDC Cancellation
 * Marks the cheque as Cancelled + posts GL reversal:
 *   Dr Customer(PDC)-Unit (21400), Cr PDC In Hand (12900)
 */
export async function cancelPdc(
  pdcId: number | string,
  chequeNo?: string,
  reason?: string,
) {
  const today = new Date().toISOString().split('T')[0];

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
    const ctx = await resolveGlContext(pdcId, chequeNo);
    if (ctx.amount > 0) {
      await postPdcCancel(
        ctx.amount,
        ctx.tenant_id,
        ctx.property_id,
        ctx.unit_id,
        ctx.cheque_number,
        reason,
      );
    }
  } catch (err) {
    console.error('[cancelPdc] GL posting failed:', err);
  }
}
