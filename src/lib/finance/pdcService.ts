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

export async function depositPdc(pdcId: number) {
  // Fetch PDC
  const { data: pdc, error } = await supabase.from('fin_pdc_register').select('*').eq('id', pdcId).single();
  if (error) throw error;
  if (pdc.status !== 'In Hand' && pdc.status !== 'Received') throw new Error('PDC must be In Hand to deposit.');

  const today = new Date().toISOString().split('T')[0];

  // Post Journal Entry
  await postPdcDeposit(
    pdc.amount,
    pdc.tenant_id,
    pdc.property_id,
    pdc.unit_id,
    pdc.cheque_number
  );

  // Update Status
  await FinPdcRegisterApi.update(pdcId, { status: 'Deposited', deposit_date: today });
}

export async function clearPdc(pdcId: number) {
  const { data: pdc, error } = await supabase.from('fin_pdc_register').select('*').eq('id', pdcId).single();
  if (error) throw error;
  if (pdc.status !== 'Deposited') throw new Error('PDC must be Deposited to clear.');

  const today = new Date().toISOString().split('T')[0];

  // No journal needed on clear since bank balance already increased on deposit.
  // We just update the subledger status.
  await FinPdcRegisterApi.update(pdcId, { status: 'Cleared', cleared_date: today });
}

export async function returnPdc(pdcId: number) {
  const { data: pdc, error } = await supabase.from('fin_pdc_register').select('*').eq('id', pdcId).single();
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
  await FinPdcRegisterApi.update(pdcId, { status: 'Returned', returned_date: today });
}
