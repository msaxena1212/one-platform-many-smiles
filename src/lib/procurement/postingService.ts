import { supabase } from '../supabase';
import { createAccountingEvent, type AccountingEventLine } from '../finance/accounting-event-engine';
import { postAccountingEvent, type PostingResult } from '../finance/posting-engine';
import { resolveGlOnlyAccount } from '../finance/account-resolver';
import { runThreeWayMatch } from './lifecycle';

/**
 * Procurement Posting Service (Phase 2 — Resolver-driven)
 *
 * Previously the procurement paths hard-coded CWIP / GR-IR / AP / input-tax
 * account codes. They now resolve every GL/SL through the canonical
 * fin_coa_accounts table via resolveGlOnlyAccount(), so admin renames
 * propagate automatically.
 *
 * The posting engine (postAccountingEvent) independently re-validates
 * every account_code against fin_coa_accounts and rejects unknown codes
 * before creating the voucher.
 */

async function createAndPost(
  sourceType: string,
  sourceId: string,
  reference: string,
  description: string,
  lines: AccountingEventLine[],
  idempotencyKey: string,
): Promise<{ eventId: string; posting: PostingResult }> {
  const event = await createAccountingEvent({
    event_type: 'ADJUSTMENT',
    source_type: sourceType,
    source_id: sourceId,
    reference_number: reference,
    description,
    idempotency_key: idempotencyKey,
    lines,
  });
  const posting = await postAccountingEvent(event.id);
  return { eventId: event.id, posting };
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

  // Resolve the two fixed SLs: 13400001 CWIP and 13410001 Goods In Transit
  // on the debit side, and 21610001 GR/IR Clearing on the credit side.
  const [cwip, goodsInTransit, grir] = await Promise.all([
    resolveGlOnlyAccount('13400'),
    resolveGlOnlyAccount('13410'),
    resolveGlOnlyAccount('21610'),
  ]);

  const accountingLines: AccountingEventLine[] = [];
  if (capex > 0) {
    accountingLines.push({
      account_code: cwip.slCode,
      account_name: `${cwip.groupName} / ${cwip.className} / ${cwip.glName} / ${cwip.slName}`,
      debit: capex,
      credit: 0,
      description: 'GRN CAPEX receipt',
    });
  }
  if (inventory > 0) {
    accountingLines.push({
      account_code: goodsInTransit.slCode,
      account_name: `${goodsInTransit.groupName} / ${goodsInTransit.className} / ${goodsInTransit.glName} / ${goodsInTransit.slName}`,
      debit: inventory,
      credit: 0,
      description: 'GRN inventory receipt',
    });
  }
  accountingLines.push({
    account_code: grir.slCode,
    account_name: `${grir.groupName} / ${grir.className} / ${grir.glName} / ${grir.slName}`,
    debit: 0,
    credit: total,
    description: 'GR/IR clearing for GRN',
  });

  const result = await createAndPost('GRN', grn.id, grn.doc_number, 'Procurement GRN posting', accountingLines, `PROC:GRN:${grn.id}`);
  const { data: updated, error: updateError } = await supabase.from('proc_goods_receipts').update({ posting_status: 'POSTED', status: 'APPROVED', accounting_event_id: result.eventId }).eq('id', grnId).select().single();
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

  // Resolve: 21610001 GR/IR (debit), 21000001 AP (credit), 12500001 Input VAT (optional debit)
  const [grir, ap, inputVat] = await Promise.all([
    resolveGlOnlyAccount('21610'),
    resolveGlOnlyAccount('21000'),
    resolveGlOnlyAccount('12500'),
  ]);

  const lines: AccountingEventLine[] = [
    {
      account_code: grir.slCode,
      account_name: `${grir.groupName} / ${grir.className} / ${grir.glName} / ${grir.slName}`,
      debit: subtotal,
      credit: 0,
      description: 'Clear GR/IR against supplier invoice',
    },
  ];
  if (tax > 0) {
    lines.push({
      account_code: inputVat.slCode,
      account_name: `${inputVat.groupName} / ${inputVat.className} / ${inputVat.glName} / ${inputVat.slName}`,
      debit: tax,
      credit: 0,
      description: 'Recoverable input tax',
    });
  }
  lines.push({
    account_code: ap.slCode,
    account_name: `${ap.groupName} / ${ap.className} / ${ap.glName} / ${ap.slName}`,
    debit: 0,
    credit: total,
    description: 'Supplier payable',
  });

  const result = await createAndPost('AP_INVOICE', invoice.id, invoice.doc_number, 'Procurement payable invoice posting', lines, `PROC:AP:${invoice.id}`);
  const { data: updated, error: updateError } = await supabase.from('proc_payable_invoices').update({ posting_status: 'POSTED', status: 'APPROVED', accounting_event_id: result.eventId, outstanding_amount: total }).eq('id', invoiceId).select().single();
  if (updateError) throw updateError;
  return updated;
}

export async function postLandedCost(landedCostId: string) {
  const { data: cost, error } = await supabase.from('proc_landed_costs').select('*').eq('id', landedCostId).single();
  if (error) throw error;
  if (cost.posting_status === 'POSTED') return cost;
  const amount = Number(cost.amount || 0);
  if (amount <= 0) throw new Error('Landed cost amount must be greater than zero.');

  const isCustomsOrDuty = ['CUSTOMS', 'DUTY'].includes(String(cost.cost_type).toUpperCase());

  // Resolve the four possible SLs up front.
  const [cwip, goodsInTransit, customsAccrual, freightAccrual] = await Promise.all([
    resolveGlOnlyAccount('13400'),
    resolveGlOnlyAccount('13410'),
    resolveGlOnlyAccount('21620'),
    resolveGlOnlyAccount('21610'),
  ]);

  const debitAcct  = isCustomsOrDuty ? cwip : goodsInTransit;
  const creditAcct = isCustomsOrDuty ? customsAccrual : freightAccrual;

  const lines: AccountingEventLine[] = [
    {
      account_code: debitAcct.slCode,
      account_name: `${debitAcct.groupName} / ${debitAcct.className} / ${debitAcct.glName} / ${debitAcct.slName}`,
      debit: amount,
      credit: 0,
      description: 'Capitalizable / in-transit landed cost',
    },
    {
      account_code: creditAcct.slCode,
      account_name: `${creditAcct.groupName} / ${creditAcct.className} / ${creditAcct.glName} / ${creditAcct.slName}`,
      debit: 0,
      credit: amount,
      description: 'Accrued landed cost',
    },
  ];

  const result = await createAndPost('LANDED_COST', cost.id, cost.doc_number, `Procurement landed cost: ${cost.cost_type}`, lines, `PROC:LC:${cost.id}`);
  const { data: updated, error: updateError } = await supabase.from('proc_landed_costs').update({ posting_status: 'POSTED', status: 'APPROVED', accounting_event_id: result.eventId }).eq('id', landedCostId).select().single();
  if (updateError) throw updateError;
  return updated;
}
