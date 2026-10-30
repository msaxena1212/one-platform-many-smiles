import { supabase } from '../supabase';
import { nextProcurementDocumentNumber } from './numbering';

export async function convertPurchaseRequestToRfx(purchaseRequestId: string, rfxType: 'RFI' | 'RFQ' | 'RFP' = 'RFQ') {
  const { data: pr, error: prError } = await supabase.from('proc_purchase_requests').select('*').eq('id', purchaseRequestId).single();
  if (prError) throw prError;
  const { data: lines, error: lineError } = await supabase.from('proc_purchase_request_lines').select('*').eq('purchase_request_id', purchaseRequestId).order('line_no');
  if (lineError) throw lineError;

  const docNumber = await nextProcurementDocumentNumber(rfxType);
  const { data: rfx, error: rfxError } = await supabase.from('proc_rfx').insert({
    doc_number: docNumber, rfx_type: rfxType, purchase_request_id: purchaseRequestId,
    property_id: pr.property_id, cost_center_id: pr.cost_center_id, total_amount: pr.total_amount,
    issue_date: new Date().toISOString().slice(0, 10), status: 'DRAFT', posting_status: 'UNPOSTED',
  }).select().single();
  if (rfxError) throw rfxError;

  if ((lines ?? []).length) {
    const { error } = await supabase.from('proc_rfx_lines').insert((lines ?? []).map((line: any) => ({
      rfx_id: rfx.id, line_no: line.line_no, item_code: line.item_code, description: line.description,
      item_type: line.item_type, quantity: line.quantity, unit_rate: line.unit_rate, line_total: line.line_total,
      expense_account_code: line.expense_account_code, asset_category: line.asset_category, uom: line.uom,
    })));
    if (error) throw error;
  }
  return rfx;
}

export async function convertSelectedQuoteToPurchaseOrder(vendorQuoteId: string) {
  const { data: quote, error: quoteError } = await supabase.from('proc_vendor_quotes').select('*').eq('id', vendorQuoteId).single();
  if (quoteError) throw quoteError;
  if (!quote.is_selected) throw new Error('Only a selected vendor quote can be converted to a purchase order.');

  const { data: rfx } = await supabase.from('proc_rfx').select('*').eq('id', quote.rfx_id).single();
  const docNumber = await nextProcurementDocumentNumber('PO');
  const { data: po, error: poError } = await supabase.from('proc_purchase_orders').insert({
    doc_number: docNumber, vendor_id: quote.vendor_id, vendor_quote_id: quote.id,
    purchase_request_id: rfx?.purchase_request_id ?? null, property_id: rfx?.property_id ?? null,
    cost_center_id: rfx?.cost_center_id ?? null, subtotal: Math.max(0, quote.total_amount - quote.tax_amount),
    tax_amount: quote.tax_amount, discount_amount: quote.discount_amount, total_amount: quote.total_amount,
    payment_terms: quote.payment_terms, delivery_terms: quote.delivery_terms,
    status: 'DRAFT', posting_status: 'UNPOSTED', order_date: new Date().toISOString().slice(0, 10),
  }).select().single();
  if (poError) throw poError;

  const { data: quoteLines, error: linesError } = await supabase.from('proc_vendor_quote_lines').select('*').eq('vendor_quote_id', quote.id).order('line_no');
  if (linesError) throw linesError;
  if ((quoteLines ?? []).length) {
    const { error } = await supabase.from('proc_po_lines').insert((quoteLines ?? []).map((line: any) => ({
      purchase_order_id: po.id, line_no: line.line_no, description: line.description, item_type: line.item_type,
      quantity: line.quantity, unit_rate: line.unit_rate, line_total: line.line_total,
      expense_account_code: line.expense_account_code, asset_category: line.asset_category, uom: line.uom,
    })));
    if (error) throw error;
  }
  return po;
}
