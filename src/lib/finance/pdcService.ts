import { supabase } from '../supabase';
import { postPdcCollection, postPdcDeposit, postPdcReturn } from './posting-engine';
import { FinPdcRegisterApi } from '../supabase-finance';

export async function receivePdc(payload: {
  cheque_number: string;
  cheque_date: string;
  amount: number;
  tenant_id: number;
  property_id: number;
  unit_id: number;
  bank_id?: number;
}) {
  // 1. Create entry in PDC Register
  const pdc = await FinPdcRegisterApi.create({
    cheque_number: payload.cheque_number,
    cheque_date: payload.cheque_date,
    amount: payload.amount,
    tenant_id: payload.tenant_id,
    property_id: payload.property_id,
    unit_id: payload.unit_id,
    bank_id: payload.bank_id,
    status: 'In Hand'
  });

  // 2. Post Journal Entry (Dr PDC In Hand, Cr Customer PDC Liability)
  await postPdcCollection(
    payload.amount, 
    payload.tenant_id, 
    payload.property_id, 
    payload.unit_id, 
    payload.cheque_number
  );

  return pdc;
}

export async function depositPdc(pdcId: number | string) {
  const isNumeric = typeof pdcId === 'number' || (!isNaN(Number(pdcId)) && !String(pdcId).includes('-'));
  const isUuid = typeof pdcId === 'string' && pdcId.includes('-');
  const today = new Date().toISOString().split('T')[0];

  if (isUuid) {
    const { data: pdc } = await supabase.from('pdcs').select('*').eq('id', pdcId).single();
    await supabase.from('pdcs').update({ status: 'deposited', status_pdc: 'deposited', deposit_date: today }).eq('id', pdcId);
    if (pdc) {
      await postPdcDeposit(
        Number(pdc.amount) || 0,
        1,
        1,
        1,
        pdc.cheque_number || 'PDC'
      ).catch(() => {});
    }
    return;
  }

  if (!isNumeric) {
    return;
  }

  // Fetch PDC from fin_pdc_register
  const numId = Number(pdcId);
  const { data: pdc, error } = await supabase.from('fin_pdc_register').select('*').eq('id', numId).single();
  if (error) throw error;
  if (pdc.status !== 'In Hand' && pdc.status !== 'Received') throw new Error('PDC must be In Hand to deposit.');

  // Post Journal Entry
  await postPdcDeposit(
    pdc.amount,
    pdc.tenant_id,
    pdc.property_id,
    pdc.unit_id,
    pdc.cheque_number
  );

  // Update Status
  await FinPdcRegisterApi.update(numId, { status: 'Deposited', deposit_date: today });
}

export async function clearPdc(pdcId: number | string) {
  const isNumeric = typeof pdcId === 'number' || (!isNaN(Number(pdcId)) && !String(pdcId).includes('-'));
  const isUuid = typeof pdcId === 'string' && pdcId.includes('-');
  const today = new Date().toISOString().split('T')[0];

  if (isUuid) {
    await supabase.from('pdcs').update({ status: 'cleared', status_pdc: 'cleared', cleared_date: today }).eq('id', pdcId);
    return;
  }

  if (!isNumeric) {
    return;
  }

  const numId = Number(pdcId);
  const { data: pdc, error } = await supabase.from('fin_pdc_register').select('*').eq('id', numId).single();
  if (error) throw error;
  if (pdc.status !== 'Deposited') throw new Error('PDC must be Deposited to clear.');

  await FinPdcRegisterApi.update(numId, { status: 'Cleared', cleared_date: today });
}

export async function returnPdc(pdcId: number | string) {
  const isNumeric = typeof pdcId === 'number' || (!isNaN(Number(pdcId)) && !String(pdcId).includes('-'));
  const isUuid = typeof pdcId === 'string' && pdcId.includes('-');
  const today = new Date().toISOString().split('T')[0];

  if (isUuid) {
    const { data: pdc } = await supabase.from('pdcs').select('*').eq('id', pdcId).single();
    await supabase.from('pdcs').update({ status: 'bounced', status_pdc: 'bounced', returned_date: today }).eq('id', pdcId);
    if (pdc) {
      await postPdcReturn(
        Number(pdc.amount) || 0,
        1,
        1,
        1,
        pdc.cheque_number || 'PDC'
      ).catch(() => {});
    }
    return;
  }

  if (!isNumeric) {
    return;
  }

  const numId = Number(pdcId);
  const { data: pdc, error } = await supabase.from('fin_pdc_register').select('*').eq('id', numId).single();
  if (error) throw error;
  if (pdc.status !== 'Deposited') throw new Error('PDC must be Deposited to return.');

  const today = new Date().toISOString().split('T')[0];

  // Post Return Journal
  await postPdcReturn(
    pdc.amount,
    pdc.tenant_id,
    pdc.property_id,
    pdc.unit_id,
    pdc.cheque_number
  );

  // Update Status
  await FinPdcRegisterApi.update(numId, { status: 'Returned', returned_date: today });
}
