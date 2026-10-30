export type ProcurementDocStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'CLOSED';
export type ProcurementPostingStatus = 'UNPOSTED' | 'POSTED' | 'REVERSED';
export type ProcurementItemType = 'CAPEX' | 'OPEX' | 'INVENTORY';
export type RfxType = 'RFI' | 'RFQ' | 'RFP';

export type PurchaseRequest = {
  id: string; doc_number: string; status: ProcurementDocStatus; posting_status: ProcurementPostingStatus;
  accounting_event_id?: string | null; property_id?: string | null; cost_center_id?: number | null;
  requested_by?: string | null; request_date: string; required_date?: string | null; priority?: string | null;
  total_amount: number; remarks?: string | null; created_at: string; updated_at: string;
};
export type PurchaseRequestLine = {
  id: string; purchase_request_id: string; line_no: number; item_code?: string | null; description: string;
  item_type: ProcurementItemType; quantity: number; unit_rate: number; line_total: number;
  expense_account_code?: string | null; asset_category?: string | null; uom?: string | null;
  required_date?: string | null; remarks?: string | null; created_at: string; updated_at: string;
};
export type Rfx = {
  id: string; doc_number: string; rfx_type: RfxType; purchase_request_id?: string | null;
  status: ProcurementDocStatus; posting_status: ProcurementPostingStatus; accounting_event_id?: string | null;
  property_id?: string | null; cost_center_id?: number | null; issue_date: string; closing_date?: string | null;
  total_amount: number; remarks?: string | null; created_at: string; updated_at: string;
};
export type VendorQuote = {
  id: string; doc_number: string; rfx_id: string; vendor_id: number; status: ProcurementDocStatus;
  posting_status: ProcurementPostingStatus; accounting_event_id?: string | null; quote_date: string;
  valid_until?: string | null; total_amount: number; tax_amount: number; discount_amount: number;
  payment_terms?: string | null; delivery_terms?: string | null; is_selected: boolean;
  remarks?: string | null; created_at: string; updated_at: string;
};
export type PurchaseOrder = {
  id: string; doc_number: string; vendor_id: number; vendor_quote_id?: string | null; purchase_request_id?: string | null;
  status: ProcurementDocStatus; posting_status: ProcurementPostingStatus; accounting_event_id?: string | null;
  property_id?: string | null; cost_center_id?: number | null; order_date: string; expected_delivery_date?: string | null;
  subtotal: number; tax_amount: number; discount_amount: number; total_amount: number;
  payment_terms?: string | null; delivery_terms?: string | null; incoterm?: string | null;
  remarks?: string | null; created_at: string; updated_at: string;
};
export type GoodsReceipt = {
  id: string; doc_number: string; purchase_order_id: string; gate_inward_id?: string | null;
  status: ProcurementDocStatus; posting_status: ProcurementPostingStatus; accounting_event_id?: string | null;
  property_id?: string | null; cost_center_id?: number | null; receipt_date: string; total_amount: number;
  remarks?: string | null; created_at: string; updated_at: string;
};
export type PayableInvoice = {
  id: string; doc_number: string; vendor_id: number; purchase_order_id?: string | null; goods_receipt_id?: string | null;
  invoice_date: string; due_date?: string | null; status: ProcurementDocStatus; posting_status: ProcurementPostingStatus;
  accounting_event_id?: string | null; invoice_type: string; subtotal: number; tax_amount: number;
  discount_amount: number; total_amount: number; paid_amount: number; outstanding_amount: number;
  payment_status: string; remarks?: string | null; created_at: string; updated_at: string;
};
export type Purchase = {
  id: string; doc_number: string; purchase_order_id: string; goods_receipt_id?: string | null;
  payable_invoice_id?: string | null; status: ProcurementDocStatus; posting_status: ProcurementPostingStatus;
  accounting_event_id?: string | null; property_id?: string | null; cost_center_id?: number | null;
  purchase_date: string; total_amount: number; capitalized_amount: number; remarks?: string | null;
  created_at: string; updated_at: string;
};
