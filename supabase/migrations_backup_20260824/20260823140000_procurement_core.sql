BEGIN;

-- ============================================================
-- Procurement Core
-- End-to-end PR -> RFI/RFQ/RFP -> Quote -> Negotiation -> PO
-- -> Shipping/Import/Transport -> Gate Inward -> GRN
-- -> Landed Cost -> Payable Invoice -> Purchase/Capitalization.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 1. Enums
-- ============================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'proc_doc_status') THEN
    CREATE TYPE public.proc_doc_status AS ENUM
      ('DRAFT','SUBMITTED','APPROVED','REJECTED','CANCELLED','CLOSED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'proc_rfx_type') THEN
    CREATE TYPE public.proc_rfx_type AS ENUM ('RFI','RFQ','RFP');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'proc_item_type') THEN
    CREATE TYPE public.proc_item_type AS ENUM ('CAPEX','OPEX','INVENTORY');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'proc_partner_type') THEN
    CREATE TYPE public.proc_partner_type AS ENUM ('FORWARDER','CHA','TRANSPORTER');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'proc_shipment_status') THEN
    CREATE TYPE public.proc_shipment_status AS ENUM
      ('ALERTED','IN_TRANSIT','ARRIVED','CLEARED','DELIVERED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'proc_posting_status') THEN
    CREATE TYPE public.proc_posting_status AS ENUM ('UNPOSTED','POSTED','REVERSED');
  END IF;
END $$;

-- ============================================================
-- 2. Shared trigger
-- ============================================================

CREATE OR REPLACE FUNCTION public.proc_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================
-- 3. Masters
-- ============================================================

CREATE TABLE IF NOT EXISTS public.proc_logistics_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_type public.proc_partner_type NOT NULL,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  tax_number TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.proc_document_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_type TEXT NOT NULL,
  fiscal_year INTEGER NOT NULL,
  prefix TEXT NOT NULL,
  last_number INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ux_proc_document_sequences_type_year UNIQUE (doc_type, fiscal_year)
);

-- ============================================================
-- 4. Sourcing
-- ============================================================

CREATE TABLE IF NOT EXISTS public.proc_purchase_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_number TEXT NOT NULL UNIQUE,
  status public.proc_doc_status NOT NULL DEFAULT 'DRAFT',
  posting_status public.proc_posting_status NOT NULL DEFAULT 'UNPOSTED',
  accounting_event_id UUID,
  property_id UUID,
  cost_center_id BIGINT,
  requested_by UUID,
  request_date DATE NOT NULL DEFAULT CURRENT_DATE,
  required_date DATE,
  priority TEXT DEFAULT 'NORMAL',
  total_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.proc_purchase_request_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_request_id UUID NOT NULL,
  line_no INTEGER NOT NULL,
  item_code TEXT,
  description TEXT NOT NULL,
  item_type public.proc_item_type NOT NULL DEFAULT 'CAPEX',
  quantity NUMERIC(18,3) NOT NULL DEFAULT 1,
  unit_rate NUMERIC(18,2) NOT NULL DEFAULT 0,
  line_total NUMERIC(18,2) NOT NULL DEFAULT 0,
  expense_account_code TEXT,
  asset_category TEXT,
  uom TEXT,
  required_date DATE,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_proc_pr_line_qty CHECK (quantity > 0),
  CONSTRAINT ck_proc_pr_line_rate CHECK (unit_rate >= 0),
  CONSTRAINT ux_proc_pr_line_no UNIQUE (purchase_request_id, line_no)
);

CREATE TABLE IF NOT EXISTS public.proc_rfx (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_number TEXT NOT NULL UNIQUE,
  rfx_type public.proc_rfx_type NOT NULL,
  purchase_request_id UUID,
  status public.proc_doc_status NOT NULL DEFAULT 'DRAFT',
  posting_status public.proc_posting_status NOT NULL DEFAULT 'UNPOSTED',
  accounting_event_id UUID,
  property_id UUID,
  cost_center_id BIGINT,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  closing_date DATE,
  total_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.proc_rfx_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfx_id UUID NOT NULL,
  line_no INTEGER NOT NULL,
  item_code TEXT,
  description TEXT NOT NULL,
  item_type public.proc_item_type NOT NULL DEFAULT 'CAPEX',
  quantity NUMERIC(18,3) NOT NULL DEFAULT 1,
  unit_rate NUMERIC(18,2) NOT NULL DEFAULT 0,
  line_total NUMERIC(18,2) NOT NULL DEFAULT 0,
  expense_account_code TEXT,
  asset_category TEXT,
  uom TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ux_proc_rfx_line_no UNIQUE (rfx_id, line_no)
);

CREATE TABLE IF NOT EXISTS public.proc_rfx_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfx_id UUID NOT NULL,
  vendor_id BIGINT NOT NULL,
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  response_status TEXT NOT NULL DEFAULT 'INVITED',
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ux_proc_rfx_vendor UNIQUE (rfx_id, vendor_id)
);

CREATE TABLE IF NOT EXISTS public.proc_vendor_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_number TEXT NOT NULL UNIQUE,
  rfx_id UUID NOT NULL,
  vendor_id BIGINT NOT NULL,
  status public.proc_doc_status NOT NULL DEFAULT 'DRAFT',
  posting_status public.proc_posting_status NOT NULL DEFAULT 'UNPOSTED',
  accounting_event_id UUID,
  quote_date DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE,
  total_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  payment_terms TEXT,
  delivery_terms TEXT,
  is_selected BOOLEAN NOT NULL DEFAULT FALSE,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.proc_vendor_quote_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_quote_id UUID NOT NULL,
  line_no INTEGER NOT NULL,
  description TEXT NOT NULL,
  item_type public.proc_item_type NOT NULL DEFAULT 'CAPEX',
  quantity NUMERIC(18,3) NOT NULL DEFAULT 1,
  unit_rate NUMERIC(18,2) NOT NULL DEFAULT 0,
  line_total NUMERIC(18,2) NOT NULL DEFAULT 0,
  expense_account_code TEXT,
  asset_category TEXT,
  uom TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ux_proc_quote_line_no UNIQUE (vendor_quote_id, line_no)
);

CREATE TABLE IF NOT EXISTS public.proc_negotiations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_quote_id UUID NOT NULL,
  round_no INTEGER NOT NULL,
  negotiation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  counter_amount NUMERIC(18,2),
  counter_terms TEXT,
  outcome TEXT,
  negotiated_by UUID,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ux_proc_negotiation_round UNIQUE (vendor_quote_id, round_no)
);

-- ============================================================
-- 5. Ordering
-- ============================================================

CREATE TABLE IF NOT EXISTS public.proc_purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_number TEXT NOT NULL UNIQUE,
  vendor_id BIGINT NOT NULL,
  vendor_quote_id UUID,
  purchase_request_id UUID,
  status public.proc_doc_status NOT NULL DEFAULT 'DRAFT',
  posting_status public.proc_posting_status NOT NULL DEFAULT 'UNPOSTED',
  accounting_event_id UUID,
  property_id UUID,
  cost_center_id BIGINT,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery_date DATE,
  subtotal NUMERIC(18,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  payment_terms TEXT,
  delivery_terms TEXT,
  incoterm TEXT,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.proc_po_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL,
  line_no INTEGER NOT NULL,
  description TEXT NOT NULL,
  item_code TEXT,
  item_type public.proc_item_type NOT NULL DEFAULT 'CAPEX',
  quantity NUMERIC(18,3) NOT NULL DEFAULT 1,
  unit_rate NUMERIC(18,2) NOT NULL DEFAULT 0,
  line_total NUMERIC(18,2) NOT NULL DEFAULT 0,
  expense_account_code TEXT,
  asset_category TEXT,
  uom TEXT,
  received_quantity NUMERIC(18,3) NOT NULL DEFAULT 0,
  invoiced_quantity NUMERIC(18,3) NOT NULL DEFAULT 0,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ux_proc_po_line_no UNIQUE (purchase_order_id, line_no)
);

-- ============================================================
-- 6. Logistics
-- ============================================================

CREATE TABLE IF NOT EXISTS public.proc_shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_number TEXT NOT NULL UNIQUE,
  purchase_order_id UUID NOT NULL,
  status public.proc_shipment_status NOT NULL DEFAULT 'ALERTED',
  forwarder_id UUID,
  cha_id UUID,
  bl_awb_no TEXT,
  incoterm TEXT,
  origin_country TEXT,
  origin_port TEXT,
  destination_port TEXT,
  etd DATE,
  eta DATE,
  actual_arrival_date DATE,
  goods_in_transit_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.proc_customs_clearances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_number TEXT NOT NULL UNIQUE,
  shipment_id UUID NOT NULL,
  cha_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN',
  declaration_no TEXT,
  bill_of_entry_no TEXT,
  clearance_date DATE,
  customs_value NUMERIC(18,2) NOT NULL DEFAULT 0,
  duty_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  clearing_charge NUMERIC(18,2) NOT NULL DEFAULT 0,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.proc_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_number TEXT NOT NULL UNIQUE,
  shipment_id UUID NOT NULL,
  customs_clearance_id UUID,
  declaration_no TEXT,
  bill_of_entry_no TEXT,
  import_date DATE,
  duty_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  other_charges NUMERIC(18,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'OPEN',
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.proc_transports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_number TEXT NOT NULL UNIQUE,
  shipment_id UUID NOT NULL,
  transporter_id UUID NOT NULL,
  pickup_date DATE,
  delivery_date DATE,
  vehicle_no TEXT,
  driver_name TEXT,
  freight_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'PLANNED',
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.proc_gate_inwards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_number TEXT NOT NULL UNIQUE,
  shipment_id UUID NOT NULL,
  purchase_order_id UUID NOT NULL,
  gate_in_date DATE NOT NULL DEFAULT CURRENT_DATE,
  vehicle_no TEXT,
  received_by UUID,
  status TEXT NOT NULL DEFAULT 'RECEIVED',
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 7. Receiving
-- ============================================================

CREATE TABLE IF NOT EXISTS public.proc_goods_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_number TEXT NOT NULL UNIQUE,
  purchase_order_id UUID NOT NULL,
  gate_inward_id UUID,
  status public.proc_doc_status NOT NULL DEFAULT 'DRAFT',
  posting_status public.proc_posting_status NOT NULL DEFAULT 'UNPOSTED',
  accounting_event_id UUID,
  property_id UUID,
  cost_center_id BIGINT,
  receipt_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.proc_grn_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goods_receipt_id UUID NOT NULL,
  po_line_id UUID NOT NULL,
  line_no INTEGER NOT NULL,
  item_type public.proc_item_type NOT NULL DEFAULT 'CAPEX',
  description TEXT NOT NULL,
  ordered_quantity NUMERIC(18,3) NOT NULL DEFAULT 0,
  accepted_quantity NUMERIC(18,3) NOT NULL DEFAULT 0,
  rejected_quantity NUMERIC(18,3) NOT NULL DEFAULT 0,
  unit_rate NUMERIC(18,2) NOT NULL DEFAULT 0,
  line_total NUMERIC(18,2) NOT NULL DEFAULT 0,
  expense_account_code TEXT,
  asset_category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ux_proc_grn_line_no UNIQUE (goods_receipt_id, line_no)
);

-- ============================================================
-- 8. Financials
-- ============================================================

CREATE TABLE IF NOT EXISTS public.proc_landed_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_number TEXT NOT NULL UNIQUE,
  purchase_order_id UUID,
  goods_receipt_id UUID,
  cost_type TEXT NOT NULL,
  vendor_id BIGINT,
  amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  status public.proc_doc_status NOT NULL DEFAULT 'DRAFT',
  posting_status public.proc_posting_status NOT NULL DEFAULT 'UNPOSTED',
  accounting_event_id UUID,
  allocation_basis TEXT NOT NULL DEFAULT 'VALUE',
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_proc_landed_cost_amount CHECK (amount >= 0)
);

CREATE TABLE IF NOT EXISTS public.proc_payable_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_number TEXT NOT NULL UNIQUE,
  vendor_id BIGINT NOT NULL,
  purchase_order_id UUID,
  goods_receipt_id UUID,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  status public.proc_doc_status NOT NULL DEFAULT 'DRAFT',
  posting_status public.proc_posting_status NOT NULL DEFAULT 'UNPOSTED',
  accounting_event_id UUID,
  invoice_type TEXT NOT NULL DEFAULT 'GOODS',
  subtotal NUMERIC(18,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  paid_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  outstanding_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'UNPAID',
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.proc_payable_invoice_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payable_invoice_id UUID NOT NULL,
  line_no INTEGER NOT NULL,
  source_line_id UUID,
  description TEXT NOT NULL,
  item_type public.proc_item_type NOT NULL DEFAULT 'CAPEX',
  quantity NUMERIC(18,3) NOT NULL DEFAULT 1,
  unit_rate NUMERIC(18,2) NOT NULL DEFAULT 0,
  line_total NUMERIC(18,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  expense_account_code TEXT,
  asset_category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ux_proc_payable_line_no UNIQUE (payable_invoice_id, line_no)
);

CREATE TABLE IF NOT EXISTS public.proc_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_number TEXT NOT NULL UNIQUE,
  purchase_order_id UUID NOT NULL,
  goods_receipt_id UUID,
  payable_invoice_id UUID,
  status public.proc_doc_status NOT NULL DEFAULT 'DRAFT',
  posting_status public.proc_posting_status NOT NULL DEFAULT 'UNPOSTED',
  accounting_event_id UUID,
  property_id UUID,
  cost_center_id BIGINT,
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  capitalized_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.proc_purchase_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID NOT NULL,
  line_no INTEGER NOT NULL,
  grn_line_id UUID,
  description TEXT NOT NULL,
  item_type public.proc_item_type NOT NULL DEFAULT 'CAPEX',
  quantity NUMERIC(18,3) NOT NULL DEFAULT 1,
  unit_rate NUMERIC(18,2) NOT NULL DEFAULT 0,
  base_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  landed_cost_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  asset_category TEXT,
  asset_id UUID,
  expense_account_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ux_proc_purchase_line_no UNIQUE (purchase_id, line_no)
);

-- ============================================================
-- 9. Foreign keys (idempotent)
-- ============================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_pr_lines_header') THEN
    ALTER TABLE public.proc_purchase_request_lines
      ADD CONSTRAINT fk_proc_pr_lines_header
      FOREIGN KEY (purchase_request_id) REFERENCES public.proc_purchase_requests(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_rfx_pr') THEN
    ALTER TABLE public.proc_rfx
      ADD CONSTRAINT fk_proc_rfx_pr
      FOREIGN KEY (purchase_request_id) REFERENCES public.proc_purchase_requests(id) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_rfx_lines_header') THEN
    ALTER TABLE public.proc_rfx_lines
      ADD CONSTRAINT fk_proc_rfx_lines_header
      FOREIGN KEY (rfx_id) REFERENCES public.proc_rfx(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_rfx_vendor_rfx') THEN
    ALTER TABLE public.proc_rfx_vendors
      ADD CONSTRAINT fk_proc_rfx_vendor_rfx
      FOREIGN KEY (rfx_id) REFERENCES public.proc_rfx(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_rfx_vendor_vendor') THEN
    ALTER TABLE public.proc_rfx_vendors
      ADD CONSTRAINT fk_proc_rfx_vendor_vendor
      FOREIGN KEY (vendor_id) REFERENCES public.fin_vendors(id) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_quote_rfx') THEN
    ALTER TABLE public.proc_vendor_quotes
      ADD CONSTRAINT fk_proc_quote_rfx
      FOREIGN KEY (rfx_id) REFERENCES public.proc_rfx(id) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_quote_vendor') THEN
    ALTER TABLE public.proc_vendor_quotes
      ADD CONSTRAINT fk_proc_quote_vendor
      FOREIGN KEY (vendor_id) REFERENCES public.fin_vendors(id) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_quote_lines_header') THEN
    ALTER TABLE public.proc_vendor_quote_lines
      ADD CONSTRAINT fk_proc_quote_lines_header
      FOREIGN KEY (vendor_quote_id) REFERENCES public.proc_vendor_quotes(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_negotiation_quote') THEN
    ALTER TABLE public.proc_negotiations
      ADD CONSTRAINT fk_proc_negotiation_quote
      FOREIGN KEY (vendor_quote_id) REFERENCES public.proc_vendor_quotes(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_po_vendor') THEN
    ALTER TABLE public.proc_purchase_orders
      ADD CONSTRAINT fk_proc_po_vendor
      FOREIGN KEY (vendor_id) REFERENCES public.fin_vendors(id) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_po_quote') THEN
    ALTER TABLE public.proc_purchase_orders
      ADD CONSTRAINT fk_proc_po_quote
      FOREIGN KEY (vendor_quote_id) REFERENCES public.proc_vendor_quotes(id) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_po_pr') THEN
    ALTER TABLE public.proc_purchase_orders
      ADD CONSTRAINT fk_proc_po_pr
      FOREIGN KEY (purchase_request_id) REFERENCES public.proc_purchase_requests(id) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_po_lines_header') THEN
    ALTER TABLE public.proc_po_lines
      ADD CONSTRAINT fk_proc_po_lines_header
      FOREIGN KEY (purchase_order_id) REFERENCES public.proc_purchase_orders(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_ship_po') THEN
    ALTER TABLE public.proc_shipments
      ADD CONSTRAINT fk_proc_ship_po
      FOREIGN KEY (purchase_order_id) REFERENCES public.proc_purchase_orders(id) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_ship_forwarder') THEN
    ALTER TABLE public.proc_shipments
      ADD CONSTRAINT fk_proc_ship_forwarder
      FOREIGN KEY (forwarder_id) REFERENCES public.proc_logistics_partners(id) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_ship_cha') THEN
    ALTER TABLE public.proc_shipments
      ADD CONSTRAINT fk_proc_ship_cha
      FOREIGN KEY (cha_id) REFERENCES public.proc_logistics_partners(id) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_customs_ship') THEN
    ALTER TABLE public.proc_customs_clearances
      ADD CONSTRAINT fk_proc_customs_ship
      FOREIGN KEY (shipment_id) REFERENCES public.proc_shipments(id) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_customs_cha') THEN
    ALTER TABLE public.proc_customs_clearances
      ADD CONSTRAINT fk_proc_customs_cha
      FOREIGN KEY (cha_id) REFERENCES public.proc_logistics_partners(id) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_import_ship') THEN
    ALTER TABLE public.proc_imports
      ADD CONSTRAINT fk_proc_import_ship
      FOREIGN KEY (shipment_id) REFERENCES public.proc_shipments(id) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_import_customs') THEN
    ALTER TABLE public.proc_imports
      ADD CONSTRAINT fk_proc_import_customs
      FOREIGN KEY (customs_clearance_id) REFERENCES public.proc_customs_clearances(id) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_transport_ship') THEN
    ALTER TABLE public.proc_transports
      ADD CONSTRAINT fk_proc_transport_ship
      FOREIGN KEY (shipment_id) REFERENCES public.proc_shipments(id) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_transport_partner') THEN
    ALTER TABLE public.proc_transports
      ADD CONSTRAINT fk_proc_transport_partner
      FOREIGN KEY (transporter_id) REFERENCES public.proc_logistics_partners(id) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_gate_ship') THEN
    ALTER TABLE public.proc_gate_inwards
      ADD CONSTRAINT fk_proc_gate_ship
      FOREIGN KEY (shipment_id) REFERENCES public.proc_shipments(id) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_gate_po') THEN
    ALTER TABLE public.proc_gate_inwards
      ADD CONSTRAINT fk_proc_gate_po
      FOREIGN KEY (purchase_order_id) REFERENCES public.proc_purchase_orders(id) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_grn_po') THEN
    ALTER TABLE public.proc_goods_receipts
      ADD CONSTRAINT fk_proc_grn_po
      FOREIGN KEY (purchase_order_id) REFERENCES public.proc_purchase_orders(id) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_grn_gate') THEN
    ALTER TABLE public.proc_goods_receipts
      ADD CONSTRAINT fk_proc_grn_gate
      FOREIGN KEY (gate_inward_id) REFERENCES public.proc_gate_inwards(id) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_grn_lines_header') THEN
    ALTER TABLE public.proc_grn_lines
      ADD CONSTRAINT fk_proc_grn_lines_header
      FOREIGN KEY (goods_receipt_id) REFERENCES public.proc_goods_receipts(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_grn_lines_po_line') THEN
    ALTER TABLE public.proc_grn_lines
      ADD CONSTRAINT fk_proc_grn_lines_po_line
      FOREIGN KEY (po_line_id) REFERENCES public.proc_po_lines(id) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_lc_po') THEN
    ALTER TABLE public.proc_landed_costs
      ADD CONSTRAINT fk_proc_lc_po
      FOREIGN KEY (purchase_order_id) REFERENCES public.proc_purchase_orders(id) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_lc_grn') THEN
    ALTER TABLE public.proc_landed_costs
      ADD CONSTRAINT fk_proc_lc_grn
      FOREIGN KEY (goods_receipt_id) REFERENCES public.proc_goods_receipts(id) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_lc_vendor') THEN
    ALTER TABLE public.proc_landed_costs
      ADD CONSTRAINT fk_proc_lc_vendor
      FOREIGN KEY (vendor_id) REFERENCES public.fin_vendors(id) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_invoice_vendor') THEN
    ALTER TABLE public.proc_payable_invoices
      ADD CONSTRAINT fk_proc_invoice_vendor
      FOREIGN KEY (vendor_id) REFERENCES public.fin_vendors(id) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_invoice_po') THEN
    ALTER TABLE public.proc_payable_invoices
      ADD CONSTRAINT fk_proc_invoice_po
      FOREIGN KEY (purchase_order_id) REFERENCES public.proc_purchase_orders(id) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_invoice_grn') THEN
    ALTER TABLE public.proc_payable_invoices
      ADD CONSTRAINT fk_proc_invoice_grn
      FOREIGN KEY (goods_receipt_id) REFERENCES public.proc_goods_receipts(id) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_invoice_lines_header') THEN
    ALTER TABLE public.proc_payable_invoice_lines
      ADD CONSTRAINT fk_proc_invoice_lines_header
      FOREIGN KEY (payable_invoice_id) REFERENCES public.proc_payable_invoices(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_purchase_po') THEN
    ALTER TABLE public.proc_purchases
      ADD CONSTRAINT fk_proc_purchase_po
      FOREIGN KEY (purchase_order_id) REFERENCES public.proc_purchase_orders(id) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_purchase_grn') THEN
    ALTER TABLE public.proc_purchases
      ADD CONSTRAINT fk_proc_purchase_grn
      FOREIGN KEY (goods_receipt_id) REFERENCES public.proc_goods_receipts(id) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_purchase_invoice') THEN
    ALTER TABLE public.proc_purchases
      ADD CONSTRAINT fk_proc_purchase_invoice
      FOREIGN KEY (payable_invoice_id) REFERENCES public.proc_payable_invoices(id) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_purchase_lines_header') THEN
    ALTER TABLE public.proc_purchase_lines
      ADD CONSTRAINT fk_proc_purchase_lines_header
      FOREIGN KEY (purchase_id) REFERENCES public.proc_purchases(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_purchase_line_grn') THEN
    ALTER TABLE public.proc_purchase_lines
      ADD CONSTRAINT fk_proc_purchase_line_grn
      FOREIGN KEY (grn_line_id) REFERENCES public.proc_grn_lines(id) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_purchase_asset') THEN
    ALTER TABLE public.proc_purchase_lines
      ADD CONSTRAINT fk_proc_purchase_asset
      FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE RESTRICT;
  END IF;
END $$;

-- Accounting-event references are only added when the finance core exists.
DO $$ BEGIN
  IF to_regclass('public.fin_accounting_events') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_pr_accounting_event') THEN
      ALTER TABLE public.proc_purchase_requests ADD CONSTRAINT fk_proc_pr_accounting_event
        FOREIGN KEY (accounting_event_id) REFERENCES public.fin_accounting_events(id) ON DELETE RESTRICT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_rfx_accounting_event') THEN
      ALTER TABLE public.proc_rfx ADD CONSTRAINT fk_proc_rfx_accounting_event
        FOREIGN KEY (accounting_event_id) REFERENCES public.fin_accounting_events(id) ON DELETE RESTRICT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_quote_accounting_event') THEN
      ALTER TABLE public.proc_vendor_quotes ADD CONSTRAINT fk_proc_quote_accounting_event
        FOREIGN KEY (accounting_event_id) REFERENCES public.fin_accounting_events(id) ON DELETE RESTRICT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_po_accounting_event') THEN
      ALTER TABLE public.proc_purchase_orders ADD CONSTRAINT fk_proc_po_accounting_event
        FOREIGN KEY (accounting_event_id) REFERENCES public.fin_accounting_events(id) ON DELETE RESTRICT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_grn_accounting_event') THEN
      ALTER TABLE public.proc_goods_receipts ADD CONSTRAINT fk_proc_grn_accounting_event
        FOREIGN KEY (accounting_event_id) REFERENCES public.fin_accounting_events(id) ON DELETE RESTRICT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_lc_accounting_event') THEN
      ALTER TABLE public.proc_landed_costs ADD CONSTRAINT fk_proc_lc_accounting_event
        FOREIGN KEY (accounting_event_id) REFERENCES public.fin_accounting_events(id) ON DELETE RESTRICT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_invoice_accounting_event') THEN
      ALTER TABLE public.proc_payable_invoices ADD CONSTRAINT fk_proc_invoice_accounting_event
        FOREIGN KEY (accounting_event_id) REFERENCES public.fin_accounting_events(id) ON DELETE RESTRICT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_purchase_accounting_event') THEN
      ALTER TABLE public.proc_purchases ADD CONSTRAINT fk_proc_purchase_accounting_event
        FOREIGN KEY (accounting_event_id) REFERENCES public.fin_accounting_events(id) ON DELETE RESTRICT;
    END IF;
  END IF;
END $$;

-- ============================================================
-- 10. Vendor extension (defensive)
-- ============================================================

ALTER TABLE public.fin_vendors ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.fin_vendors ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.fin_vendors ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.fin_vendors ADD COLUMN IF NOT EXISTS payment_terms TEXT;
ALTER TABLE public.fin_vendors ADD COLUMN IF NOT EXISTS credit_days INTEGER;
ALTER TABLE public.fin_vendors ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE public.fin_vendors ADD COLUMN IF NOT EXISTS bank_account_no TEXT;
ALTER TABLE public.fin_vendors ADD COLUMN IF NOT EXISTS iban TEXT;
ALTER TABLE public.fin_vendors ADD COLUMN IF NOT EXISTS vendor_type TEXT;
ALTER TABLE public.fin_vendors ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.fin_vendors ADD COLUMN IF NOT EXISTS rating NUMERIC(3,1);

-- ============================================================
-- 11. Procurement COA accounts
-- Current repository uses BIGINT fin_coa_accounts.id.
-- Insert defensively; never create/alter the authoritative table.
-- ============================================================

DO $$
BEGIN
  IF to_regclass('public.fin_coa_accounts') IS NOT NULL THEN
    INSERT INTO public.fin_coa_accounts
      (account_code, account_name, account_type, is_active)
    VALUES
      ('13400','Capital Work In Progress / Assets Under Acquisition','Asset',TRUE),
      ('13410','Goods In Transit','Asset',TRUE),
      ('12500','Input Tax Recoverable','Asset',TRUE),
      ('21600','Goods Received Not Invoiced (GR/IR Clearing)','Liability',TRUE),
      ('21610','Accrued Freight & Logistics','Liability',TRUE),
      ('21620','Accrued Customs & Duty','Liability',TRUE)
    ON CONFLICT (account_code) DO NOTHING;
  END IF;
END $$;

-- ============================================================
-- 12. Document numbering
-- ============================================================

CREATE OR REPLACE FUNCTION public.proc_next_document_number(
  p_doc_type TEXT,
  p_fiscal_year INTEGER
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prefix TEXT;
  v_number INTEGER;
BEGIN
  v_prefix := upper(regexp_replace(trim(p_doc_type), '[^A-Za-z0-9]+', '_', 'g'));

  INSERT INTO public.proc_document_sequences
    (doc_type, fiscal_year, prefix, last_number)
  VALUES
    (upper(p_doc_type), p_fiscal_year, v_prefix, 1)
  ON CONFLICT (doc_type, fiscal_year)
  DO UPDATE SET
    last_number = public.proc_document_sequences.last_number + 1,
    updated_at = NOW()
  RETURNING last_number INTO v_number;

  RETURN format('%s-%s-%s', v_prefix, p_fiscal_year, lpad(v_number::TEXT, 4, '0'));
END;
$$;

GRANT EXECUTE ON FUNCTION public.proc_next_document_number(TEXT, INTEGER)
TO anon, authenticated, service_role;

-- ============================================================
-- 13. Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_proc_pr_status ON public.proc_purchase_requests(status);
CREATE INDEX IF NOT EXISTS idx_proc_rfx_type_status ON public.proc_rfx(rfx_type, status);
CREATE INDEX IF NOT EXISTS idx_proc_rfx_vendors_vendor ON public.proc_rfx_vendors(vendor_id);
CREATE INDEX IF NOT EXISTS idx_proc_quotes_vendor ON public.proc_vendor_quotes(vendor_id);
CREATE INDEX IF NOT EXISTS idx_proc_quotes_rfx ON public.proc_vendor_quotes(rfx_id);
CREATE INDEX IF NOT EXISTS idx_proc_po_vendor ON public.proc_purchase_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_proc_shipments_po ON public.proc_shipments(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_proc_grn_po ON public.proc_goods_receipts(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_proc_landed_cost_po ON public.proc_landed_costs(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_proc_invoice_vendor ON public.proc_payable_invoices(vendor_id);
CREATE INDEX IF NOT EXISTS idx_proc_purchase_po ON public.proc_purchases(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_proc_purchase_asset ON public.proc_purchase_lines(asset_id);

-- ============================================================
-- 14. Updated-at triggers
-- ============================================================

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'proc_logistics_partners','proc_document_sequences',
    'proc_purchase_requests','proc_purchase_request_lines',
    'proc_rfx','proc_rfx_lines','proc_rfx_vendors',
    'proc_vendor_quotes','proc_vendor_quote_lines','proc_negotiations',
    'proc_purchase_orders','proc_po_lines',
    'proc_shipments','proc_customs_clearances','proc_imports',
    'proc_transports','proc_gate_inwards',
    'proc_goods_receipts','proc_grn_lines',
    'proc_landed_costs','proc_payable_invoices','proc_payable_invoice_lines',
    'proc_purchases','proc_purchase_lines'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON public.%I', t, t);
    EXECUTE format(
      'CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.proc_set_updated_at()',
      t, t
    );
  END LOOP;
END $$;

-- ============================================================
-- 15. RLS + browser grants
-- ============================================================

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'proc_logistics_partners','proc_document_sequences',
    'proc_purchase_requests','proc_purchase_request_lines',
    'proc_rfx','proc_rfx_lines','proc_rfx_vendors',
    'proc_vendor_quotes','proc_vendor_quote_lines','proc_negotiations',
    'proc_purchase_orders','proc_po_lines',
    'proc_shipments','proc_customs_clearances','proc_imports',
    'proc_transports','proc_gate_inwards',
    'proc_goods_receipts','proc_grn_lines',
    'proc_landed_costs','proc_payable_invoices','proc_payable_invoice_lines',
    'proc_purchases','proc_purchase_lines'
  ]
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = t AND policyname = 'allow_all_' || t
    ) THEN
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR ALL USING (true) WITH CHECK (true)',
        'allow_all_' || t, t
      );
    END IF;

    EXECUTE format(
      'GRANT ALL ON TABLE public.%I TO anon, authenticated, service_role',
      t
    );
  END LOOP;
END $$;

COMMIT;
