import { supabase } from '../supabase';

const tableForType: Record<string, string> = {
  PR: 'proc_purchase_requests', RFX: 'proc_rfx', QUOTE: 'proc_vendor_quotes', PO: 'proc_purchase_orders',
  GRN: 'proc_goods_receipts', INVOICE: 'proc_payable_invoices', PURCHASE: 'proc_purchases',
};

export async function submitProcurementApproval(type: keyof typeof tableForType, id: string) {
  const table = tableForType[type];
  if (!table) throw new Error(`Unsupported procurement approval type: ${type}`);
  const { data, error } = await supabase.from(table).update({ status: 'SUBMITTED' }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function decideProcurementApproval(type: keyof typeof tableForType, id: string, decision: 'APPROVED' | 'REJECTED', remarks?: string) {
  const table = tableForType[type];
  if (!table) throw new Error(`Unsupported procurement approval type: ${type}`);
  const { data, error } = await supabase.from(table).update({ status: decision, remarks: remarks ?? null }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}
