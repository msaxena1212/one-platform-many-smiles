import { supabase } from '../supabase';
import { createAccountingEvent, type AccountingEventLine } from '../finance/accounting-event-engine';
import { runThreeWayMatch } from './lifecycle';


const ACCOUNT = {
  CWIP: '13400', GOODS_IN_TRANSIT: '13410', INPUT_TAX: '12500', GRIR: '21600', FREIGHT_ACCRUAL: '21610', CUSTOMS_ACCRUAL: '21620', AP: '21000',
} as const;

async function postEvent(eventId: string) {
  const { data, error } = await supabase.rpc('post_accounting_event_atomic', { p_event_id: eventId });
  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

async function createAndPost(sourceType: string, sourceId: string, reference: string, description: string, lines: AccountingEventLine[], idempotencyKey: string) {
  const event = await createAccountingEvent({
    event_type: 'ADJUSTMENT',
    source_type: sourceType,
    source_id: sourceId,
    reference_number: reference,
    description,
    idempotency_key: idempotencyKey,
    lines,
  });
  return { event, posting: await postEvent(event.id) };
}

export async function postGrn(grnId: string) {
  const { data: grn, error } = await supabase.from('proc_goods_receipts').select('*').eq('id', grnId).single();
  if (error) throw error;
  if (grn.posting_status === 'POSTED') return grn;
  const { data: lines, error: lineError } = await supabase.from('proc_grn_lines').select('*').eq('goods_receipt_id', grnId);
  if (lineError) throw lineError;
  const total = Number(grn.total_amount ?? 0);
  const capex = (lines ?? []).filter((l: any) => l.item_type === 'CAPEX').reduce((s: number, l: any) => s + Number(l.line_total || 0), 0);
  const inventory = total - capex;
  const accountingLines: AccountingEventLine[] = [];
  if (capex > 0) accountingLines.push({ account_code: ACCOUNT.CWIP, debit: capex, credit: 0, description: 'GRN CAPEX receipt' });
  if (inventory > 0) accountingLines.push({ account_code: ACCOUNT.GOODS_IN_TRANSIT, debit: inventory, credit: 0, description: 'GRN inventory receipt' });
  accountingLines.push({ account_code: ACCOUNT.GRIR, debit: 0, credit: total, description: 'GR/IR clearing for GRN' });
  const result = await createAndPost('GRN', grn.id, grn.doc_number, 'Procurement GRN posting', accountingLines, `PROC:GRN:${grn.id}`);
  const { data: updated, error: updateError } = await supabase.from('proc_goods_receipts').update({ posting_status: 'POSTED', status: 'APPROVED', accounting_event_id: result.event.id }).eq('id', grnId).select().single();
  if (updateError) throw updateError;
  return updated;
}

export async function postPayableInvoice(invoiceId: string) {
  const { data: invoice, error } = await supabase.from('proc_payable_invoices').select('*').eq('id', invoiceId).single();
  if (error) throw error;
  if (invoice.posting_status === 'POSTED') return invoice;
  if (!invoice.purchase_order_id || !invoice.goods_receipt_id) {
    throw new Error('Procurement AP invoices must be linked to both a Purchase Order and GRN before posting.');
  }
  const match = await runThreeWayMatch(invoiceId);
  if (!match.passed) {
    throw new Error(`Three-way match failed for ${invoice.doc_number}: ${JSON.stringify(match.details)}`);
  }
  const subtotal = Number(invoice.subtotal || 0);
  const tax = Number(invoice.tax_amount || 0);
  const total = Number(invoice.total_amount || subtotal + tax - Number(invoice.discount_amount || 0));
  const result = await createAndPost('AP_INVOICE', invoice.id, invoice.doc_number, 'Procurement payable invoice posting', [
    { account_code: ACCOUNT.GRIR, debit: subtotal, credit: 0, description: 'Clear GR/IR against supplier invoice' },
    ...(tax > 0 ? [{ account_code: ACCOUNT.INPUT_TAX, debit: tax, credit: 0, description: 'Recoverable input tax' }] : []),
    { account_code: ACCOUNT.AP, debit: 0, credit: total, description: 'Supplier payable' },
  ], `PROC:AP:${invoice.id}`);
  const { data: updated, error: updateError } = await supabase.from('proc_payable_invoices').update({ posting_status: 'POSTED', status: 'APPROVED', accounting_event_id: result.event.id, outstanding_amount: total }).eq('id', invoiceId).select().single();
  if (updateError) throw updateError;
  return updated;
}

export async function postLandedCost(landedCostId: string) {
  const { data: cost, error } = await supabase.from('proc_landed_costs').select('*').eq('id', landedCostId).single();
  if (error) throw error;
  if (cost.posting_status === 'POSTED') return cost;
  const amount = Number(cost.amount || 0);
  if (amount <= 0) throw new Error('Landed cost amount must be greater than zero.');
  const debitAccount = ['CUSTOMS', 'DUTY'].includes(String(cost.cost_type).toUpperCase()) ? ACCOUNT.CWIP : ACCOUNT.GOODS_IN_TRANSIT;
  const creditAccount = debitAccount === ACCOUNT.CWIP ? ACCOUNT.CUSTOMS_ACCRUAL : ACCOUNT.FREIGHT_ACCRUAL;
  const result = await createAndPost('LANDED_COST', cost.id, cost.doc_number, `Procurement landed cost: ${cost.cost_type}`, [
    { account_code: debitAccount, debit: amount, credit: 0, description: 'Capitalizable / in-transit landed cost' },
    { account_code: creditAccount, debit: 0, credit: amount, description: 'Accrued landed cost' },
  ], `PROC:LC:${cost.id}`);
  const { data: updated, error: updateError } = await supabase.from('proc_landed_costs').update({ posting_status: 'POSTED', status: 'APPROVED', accounting_event_id: result.event.id }).eq('id', landedCostId).select().single();
  if (updateError) throw updateError;
  return updated;
}
