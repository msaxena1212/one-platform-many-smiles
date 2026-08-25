import { supabase } from '../supabase';

export type FinancialReceiptLine = {
  line_number: number;
  account_code?: string | null;
  account_name?: string | null;
  debit: number;
  credit: number;
  description?: string | null;
};

export type FinancialReceipt = {
  id: string;
  receipt_no: string;
  acknowledgement_no: string;
  accounting_event_id: string;
  voucher_id?: string | null;
  receipt_date: string;
  receipt_category: string;
  direction: 'IN' | 'OUT' | 'NON_CASH';
  amount: number;
  currency_code: string;
  source_type?: string | null;
  source_id?: string | null;
  reference_no?: string | null;
  description?: string | null;
  tenant_id?: string | null;
  customer_id?: string | null;
  property_id?: string | null;
  unit_id?: string | null;
  lease_id?: string | null;
  payment_method?: string | null;
  instrument_reference?: string | null;
  status: 'ISSUED' | 'VOIDED';
  issued_at: string;
  receipt_payload: Record<string, unknown> & { lines?: FinancialReceiptLine[] };
  metadata: Record<string, unknown>;
};

export async function fetchFinancialReceipts(limit = 100) {
  const { data, error } = await supabase
    .from('fin_transaction_receipts')
    .select('*')
    .order('issued_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []) as FinancialReceipt[];
}

export async function fetchFinancialReceiptByEvent(eventId: string) {
  const { data, error } = await supabase
    .from('fin_transaction_receipts')
    .select('*')
    .eq('accounting_event_id', eventId)
    .maybeSingle();

  if (error) throw error;
  return data as FinancialReceipt | null;
}
