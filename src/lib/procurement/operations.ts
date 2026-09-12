import { supabase } from '../supabase';
import { nextProcurementDocumentNumber } from './numbering';

export type ProcurementVendor = Record<string, any> & { id: number };

export async function listProcurementVendors(): Promise<ProcurementVendor[]> {
  const { data, error } = await supabase.from('fin_vendors').select('*').order('id', { ascending: true }).limit(500);
  if (error) throw error;
  return (data ?? []) as ProcurementVendor[];
}

function today() { return new Date().toISOString().slice(0, 10); }

export async function createPurchaseRequest(input: {
  requestedBy?: string | null;
  priority: string;
  requiredDate?: string | null;
  remarks?: string | null;
  lines: Array<{
    description: string; itemCode?: string; itemType: 'CAPEX' | 'OPEX' | 'INVENTORY';
    quantity: number; unitRate: number; uom?: string; expenseAccountCode?: string; assetCategory?: string;
  }>;
}) {
  if (!input.lines.length) throw new Error('At least one purchase-request line is required.');
  const total = input.lines.reduce((s, l) => s + Number(l.quantity) * Number(l.unitRate), 0);
  const docNumber = await nextProcurementDocumentNumber('PR');
  const { data: pr, error } = await supabase.from('proc_purchase_requests').insert({
    doc_number: docNumber, status: 'DRAFT', posting_status: 'UNPOSTED', requested_by: input.requestedBy ?? null,
    request_date: today(), required_date: input.requiredDate || null, priority: input.priority,
    total_amount: total, remarks: input.remarks || null,
  }).select().single();
  if (error) throw error;
  const { error: lineError } = await supabase.from('proc_purchase_request_lines').insert(input.lines.map((l, i) => ({
    purchase_request_id: pr.id, line_no: i + 1, item_code: l.itemCode || null, description: l.description,
    item_type: l.itemType, quantity: Number(l.quantity), unit_rate: Number(l.unitRate),
    line_total: Number(l.quantity) * Number(l.unitRate), uom: l.uom || null,
    expense_account_code: l.expenseAccountCode || null, asset_category: l.assetCategory || null,
  })));
  if (lineError) { await supabase.from('proc_purchase_requests').delete().eq('id', pr.id); throw lineError; }
  return pr;
}

export async function inviteVendorToRfx(rfxId: string, vendorId: number) {
  const { data, error } = await supabase.from('proc_rfx_vendors').upsert({ rfx_id: rfxId, vendor_id: vendorId, response_status: 'INVITED' }, { onConflict: 'rfx_id,vendor_id' }).select().single();
  if (error) throw error;
  return data;
}

export async function selectVendorQuote(quoteId: string) {
  const { data: quote, error: quoteError } = await supabase.from('proc_vendor_quotes').select('rfx_id').eq('id', quoteId).single();
  if (quoteError) throw quoteError;
  const { error: resetError } = await supabase.from('proc_vendor_quotes').update({ is_selected: false }).eq('rfx_id', quote.rfx_id);
  if (resetError) throw resetError;
  const { data, error } = await supabase.from('proc_vendor_quotes').update({ is_selected: true, status: 'APPROVED' }).eq('id', quoteId).select().single();
  if (error) throw error;
  return data;
}

export async function createShipment(input: {
  purchaseOrderId: string; forwarderId?: string | null; chaId?: string | null; blAwbNo?: string;
  incoterm?: string; originCountry?: string; originPort?: string; destinationPort?: string;
  etd?: string | null; eta?: string | null; goodsInTransitAmount?: number; remarks?: string;
}) {
  const docNumber = await nextProcurementDocumentNumber('SHIP');
  const { data, error } = await supabase.from('proc_shipments').insert({
    doc_number: docNumber, purchase_order_id: input.purchaseOrderId, status: 'ALERTED',
    forwarder_id: input.forwarderId || null, cha_id: input.chaId || null, bl_awb_no: input.blAwbNo || null,
    incoterm: input.incoterm || null, origin_country: input.originCountry || null, origin_port: input.originPort || null,
    destination_port: input.destinationPort || null, etd: input.etd || null, eta: input.eta || null,
    goods_in_transit_amount: Number(input.goodsInTransitAmount || 0), remarks: input.remarks || null,
  }).select().single();
  if (error) throw error;
  return data;
}

export async function createGateInward(input: { shipmentId: string; purchaseOrderId: string; vehicleNo?: string; remarks?: string; }) {
  const docNumber = await nextProcurementDocumentNumber('GATE');
  const { data, error } = await supabase.from('proc_gate_inwards').insert({
    doc_number: docNumber, shipment_id: input.shipmentId, purchase_order_id: input.purchaseOrderId,
    gate_in_date: today(), vehicle_no: input.vehicleNo || null, status: 'RECEIVED', remarks: input.remarks || null,
  }).select().single();
  if (error) throw error;
  return data;
}

export async function createGrnFromPo(input: { purchaseOrderId: string; gateInwardId?: string | null; remarks?: string; }) {
  const { data: po, error: poError } = await supabase.from('proc_purchase_orders').select('*').eq('id', input.purchaseOrderId).single();
  if (poError) throw poError;
  const { data: poLines, error: linesError } = await supabase.from('proc_po_lines').select('*').eq('purchase_order_id', input.purchaseOrderId).order('line_no');
  if (linesError) throw linesError;
  if (!(poLines ?? []).length) throw new Error('The selected purchase order has no lines.');
  const docNumber = await nextProcurementDocumentNumber('GRN');
  const total = (poLines ?? []).reduce((s: number, l: any) => s + Number(l.quantity || 0) * Number(l.unit_rate || 0), 0);
  const { data: grn, error } = await supabase.from('proc_goods_receipts').insert({
    doc_number: docNumber, purchase_order_id: input.purchaseOrderId, gate_inward_id: input.gateInwardId || null,
    status: 'DRAFT', posting_status: 'UNPOSTED', property_id: po.property_id ?? null, cost_center_id: po.cost_center_id ?? null,
    receipt_date: today(), total_amount: total, remarks: input.remarks || null,
  }).select().single();
  if (error) throw error;
  const { error: grnLineError } = await supabase.from('proc_grn_lines').insert((poLines ?? []).map((l: any, i: number) => ({
    goods_receipt_id: grn.id, po_line_id: l.id, line_no: i + 1, item_type: l.item_type, description: l.description,
    ordered_quantity: Number(l.quantity || 0), accepted_quantity: Number(l.quantity || 0), rejected_quantity: 0,
    unit_rate: Number(l.unit_rate || 0), line_total: Number(l.quantity || 0) * Number(l.unit_rate || 0),
    expense_account_code: l.expense_account_code || null, asset_category: l.asset_category || null,
  })));
  if (grnLineError) { await supabase.from('proc_goods_receipts').delete().eq('id', grn.id); throw grnLineError; }
  await supabase.rpc('proc_recalculate_grn_total', { p_grn_id: grn.id });
  return grn;
}

export async function createPayableInvoice(input: {
  vendorId: number; purchaseOrderId?: string | null; goodsReceiptId?: string | null; invoiceDate?: string;
  dueDate?: string | null; subtotal: number; taxAmount: number; discountAmount: number; remarks?: string;
  lines: Array<{ description: string; itemType: 'CAPEX' | 'OPEX' | 'INVENTORY'; quantity: number; unitRate: number; taxAmount?: number; expenseAccountCode?: string; assetCategory?: string; sourceLineId?: string; }>;
}) {
  if (!input.lines.length) throw new Error('At least one invoice line is required.');
  const total = Number(input.subtotal) + Number(input.taxAmount) - Number(input.discountAmount);
  if (total < 0) throw new Error('Invoice total cannot be negative.');
  const docNumber = await nextProcurementDocumentNumber('AP');
  const { data: invoice, error } = await supabase.from('proc_payable_invoices').insert({
    doc_number: docNumber, vendor_id: input.vendorId, purchase_order_id: input.purchaseOrderId || null,
    goods_receipt_id: input.goodsReceiptId || null, invoice_date: input.invoiceDate || today(), due_date: input.dueDate || null,
    status: 'DRAFT', posting_status: 'UNPOSTED', invoice_type: 'GOODS', subtotal: Number(input.subtotal),
    tax_amount: Number(input.taxAmount), discount_amount: Number(input.discountAmount), total_amount: total,
    paid_amount: 0, outstanding_amount: 0, payment_status: 'UNPAID', remarks: input.remarks || null,
  }).select().single();
  if (error) throw error;
  const { error: lineError } = await supabase.from('proc_payable_invoice_lines').insert(input.lines.map((l, i) => ({
    payable_invoice_id: invoice.id, line_no: i + 1, source_line_id: l.sourceLineId || null, description: l.description,
    item_type: l.itemType, quantity: Number(l.quantity), unit_rate: Number(l.unitRate), line_total: Number(l.quantity) * Number(l.unitRate),
    tax_amount: Number(l.taxAmount || 0), expense_account_code: l.expenseAccountCode || null, asset_category: l.assetCategory || null,
  })));
  if (lineError) { await supabase.from('proc_payable_invoices').delete().eq('id', invoice.id); throw lineError; }
  await supabase.rpc('proc_recalculate_invoice_total', { p_invoice_id: invoice.id });
  return invoice;
}

export async function createLandedCost(input: { purchaseOrderId?: string | null; goodsReceiptId?: string | null; costType: string; vendorId?: number | null; amount: number; allocationBasis: 'VALUE' | 'QUANTITY' | 'EQUAL'; remarks?: string; }) {
  if (Number(input.amount) < 0) throw new Error('Landed cost cannot be negative.');
  const docNumber = await nextProcurementDocumentNumber('LC');
  const { data, error } = await supabase.from('proc_landed_costs').insert({
    doc_number: docNumber, purchase_order_id: input.purchaseOrderId || null, goods_receipt_id: input.goodsReceiptId || null,
    cost_type: input.costType, vendor_id: input.vendorId || null, amount: Number(input.amount), status: 'DRAFT', posting_status: 'UNPOSTED',
    allocation_basis: input.allocationBasis, remarks: input.remarks || null,
  }).select().single();
  if (error) throw error;
  return data;
}

export async function createPurchaseFromGrn(input: { purchaseOrderId: string; goodsReceiptId: string; payableInvoiceId?: string | null; }) {
  const { data: existing } = await supabase.from('proc_purchases').select('*').eq('goods_receipt_id', input.goodsReceiptId).maybeSingle();
  if (existing) return existing;
  const { data: grn, error: grnError } = await supabase.from('proc_goods_receipts').select('*').eq('id', input.goodsReceiptId).single();
  if (grnError) throw grnError;
  const { data: po, error: poError } = await supabase.from('proc_purchase_orders').select('*').eq('id', input.purchaseOrderId).single();
  if (poError) throw poError;
  const { data: grnLines, error: linesError } = await supabase.from('proc_grn_lines').select('*').eq('goods_receipt_id', input.goodsReceiptId).order('line_no');
  if (linesError) throw linesError;
  const docNumber = await nextProcurementDocumentNumber('PURCHASE');
  const total = (grnLines ?? []).reduce((s: number, l: any) => s + Number(l.line_total || 0), 0);
  const { data: purchase, error } = await supabase.from('proc_purchases').insert({
    doc_number: docNumber, purchase_order_id: input.purchaseOrderId, goods_receipt_id: input.goodsReceiptId,
    payable_invoice_id: input.payableInvoiceId || null, status: 'DRAFT', posting_status: 'UNPOSTED', property_id: po.property_id ?? null,
    cost_center_id: po.cost_center_id ?? null, purchase_date: today(), total_amount: total, capitalized_amount: 0,
  }).select().single();
  if (error) throw error;
  const { error: lineError } = await supabase.from('proc_purchase_lines').insert((grnLines ?? []).map((l: any, i: number) => ({
    purchase_id: purchase.id, line_no: i + 1, grn_line_id: l.id, description: l.description, item_type: l.item_type,
    quantity: Number(l.accepted_quantity || 0), unit_rate: Number(l.unit_rate || 0), base_amount: Number(l.line_total || 0),
    landed_cost_amount: 0, total_amount: Number(l.line_total || 0), asset_category: l.asset_category || null,
    expense_account_code: l.expense_account_code || null,
  })));
  if (lineError) { await supabase.from('proc_purchases').delete().eq('id', purchase.id); throw lineError; }
  await supabase.rpc('proc_recalculate_purchase_total', { p_purchase_id: purchase.id });
  return purchase;
}

export async function createPayableInvoiceFromGrn(input: {
  goodsReceiptId: string;
  dueDate?: string | null;
  taxRate?: number;
  discountAmount?: number;
  remarks?: string;
}) {
  const { data: grn, error: grnError } = await supabase.from('proc_goods_receipts').select('*').eq('id', input.goodsReceiptId).single();
  if (grnError) throw grnError;
  const { data: po, error: poError } = await supabase.from('proc_purchase_orders').select('*').eq('id', grn.purchase_order_id).single();
  if (poError) throw poError;
  const { data: grnLines, error: lineError } = await supabase.from('proc_grn_lines').select('*').eq('goods_receipt_id', input.goodsReceiptId).order('line_no');
  if (lineError) throw lineError;
  if (!(grnLines ?? []).length) throw new Error('The GRN has no receipt lines.');
  const subtotal = (grnLines ?? []).reduce((sum: number, line: any) => sum + Number(line.line_total || 0), 0);
  const taxRate = Math.max(0, Number(input.taxRate ?? 0));
  const taxAmount = Number((subtotal * taxRate / 100).toFixed(2));
  const discountAmount = Math.max(0, Number(input.discountAmount ?? 0));
  return createPayableInvoice({
    vendorId: Number(po.vendor_id),
    purchaseOrderId: po.id,
    goodsReceiptId: grn.id,
    dueDate: input.dueDate ?? null,
    subtotal,
    taxAmount,
    discountAmount,
    remarks: input.remarks,
    lines: (grnLines ?? []).map((line: any) => {
      const lineSubtotal = Number(line.line_total || 0);
      return {
        description: line.description,
        itemType: line.item_type,
        quantity: Number(line.accepted_quantity || 0),
        unitRate: Number(line.unit_rate || 0),
        taxAmount: Number((lineSubtotal * taxRate / 100).toFixed(2)),
        expenseAccountCode: line.expense_account_code || undefined,
        assetCategory: line.asset_category || undefined,
        sourceLineId: line.id,
      };
    }),
  });
}
