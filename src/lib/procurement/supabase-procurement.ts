import { supabase } from '../supabase';
import type { GoodsReceipt, PayableInvoice, Purchase, PurchaseOrder, PurchaseRequest, PurchaseRequestLine, Rfx, VendorQuote } from './types';

const crud = <T extends { id: string }>(table: string, sort = 'created_at') => ({
  list: async (): Promise<T[]> => {
    const { data, error } = await supabase.from(table).select('*').order(sort, { ascending: false });
    if (error) throw error;
    return (data ?? []) as T[];
  },
  get: async (id: string): Promise<T> => {
    const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
    if (error) throw error;
    return data as T;
  },
  create: async (payload: Record<string, unknown>): Promise<T> => {
    const { data, error } = await supabase.from(table).insert(payload).select().single();
    if (error) throw error;
    return data as T;
  },
  update: async (id: string, payload: Record<string, unknown>): Promise<T> => {
    const { data, error } = await supabase.from(table).update(payload).eq('id', id).select().single();
    if (error) throw error;
    return data as T;
  },
});

export const PurchaseRequestsApi = crud<PurchaseRequest>('proc_purchase_requests');
export const PurchaseRequestLinesApi = crud<PurchaseRequestLine>('proc_purchase_request_lines');
export const RfxApi = crud<Rfx>('proc_rfx');
export const VendorQuotesApi = crud<VendorQuote>('proc_vendor_quotes');
export const PurchaseOrdersApi = crud<PurchaseOrder>('proc_purchase_orders');
export const GoodsReceiptsApi = crud<GoodsReceipt>('proc_goods_receipts');
export const PayableInvoicesApi = crud<PayableInvoice>('proc_payable_invoices');
export const PurchasesApi = crud<Purchase>('proc_purchases');

export async function listRfxVendors(rfxId: string) {
  const { data, error } = await supabase.from('proc_rfx_vendors').select('*').eq('rfx_id', rfxId).order('created_at');
  if (error) throw error;
  return data ?? [];
}

export async function listQuotesForRfx(rfxId: string) {
  const { data, error } = await supabase.from('proc_vendor_quotes').select('*, proc_vendor_quote_lines(*)').eq('rfx_id', rfxId).order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listPoLines(purchaseOrderId: string) {
  const { data, error } = await supabase.from('proc_po_lines').select('*').eq('purchase_order_id', purchaseOrderId).order('line_no');
  if (error) throw error;
  return data ?? [];
}

export async function listGrnLines(goodsReceiptId: string) {
  const { data, error } = await supabase.from('proc_grn_lines').select('*').eq('goods_receipt_id', goodsReceiptId).order('line_no');
  if (error) throw error;
  return data ?? [];
}

export async function getProcurementLifecycleSummary() {
  const tables = ['proc_purchase_requests', 'proc_rfx', 'proc_vendor_quotes', 'proc_purchase_orders', 'proc_shipments', 'proc_goods_receipts', 'proc_landed_costs', 'proc_payable_invoices', 'proc_purchases'] as const;
  const counts = await Promise.all(tables.map(async table => {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (error) throw error;
    return [table, count ?? 0] as const;
  }));
  return Object.fromEntries(counts);
}
