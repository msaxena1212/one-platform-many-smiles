-- Complete Procurement foundation. Finance posting is intentionally deferred.
-- Flow: Request -> Approval -> PO -> GRN/Inspection -> Asset or Maintenance Inventory.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.procurement_items (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), item_code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, category TEXT NOT NULL, item_type TEXT NOT NULL CHECK (item_type IN ('asset','maintenance_spare','consumable','service')), unit_of_measure TEXT NOT NULL DEFAULT 'Nos', reorder_level NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (reorder_level >= 0), active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.procurement_purchase_orders (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), po_number TEXT NOT NULL UNIQUE, vendor_name TEXT NOT NULL, order_date DATE NOT NULL DEFAULT CURRENT_DATE, status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','partially_received','received','cancelled')), property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL, unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL, total_amount NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0), notes TEXT, created_by UUID, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.procurement_purchase_order_lines (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), po_id UUID NOT NULL REFERENCES public.procurement_purchase_orders(id) ON DELETE CASCADE, item_id UUID NOT NULL REFERENCES public.procurement_items(id), description TEXT NOT NULL, quantity NUMERIC(14,2) NOT NULL CHECK (quantity > 0), unit_price NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (unit_price >= 0), received_quantity NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (received_quantity >= 0 AND received_quantity <= quantity), property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL, unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL, asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.procurement_grns (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), grn_number TEXT NOT NULL UNIQUE, po_id UUID NOT NULL REFERENCES public.procurement_purchase_orders(id) ON DELETE RESTRICT, received_date DATE NOT NULL DEFAULT CURRENT_DATE, status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('draft','received','inspected','rejected','closed')), notes TEXT, created_by UUID, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.procurement_grn_lines (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), grn_id UUID NOT NULL REFERENCES public.procurement_grns(id) ON DELETE CASCADE, po_line_id UUID NOT NULL REFERENCES public.procurement_purchase_order_lines(id) ON DELETE RESTRICT, received_quantity NUMERIC(14,2) NOT NULL CHECK (received_quantity > 0), accepted_quantity NUMERIC(14,2) NOT NULL DEFAULT 0, rejected_quantity NUMERIC(14,2) NOT NULL DEFAULT 0, remarks TEXT);

CREATE TABLE IF NOT EXISTS public.procurement_requisitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number TEXT NOT NULL UNIQUE,
  requested_by UUID,
  request_date DATE NOT NULL DEFAULT CURRENT_DATE,
  required_date DATE,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','approved','rejected','converted','cancelled')),
  justification TEXT,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.procurement_requisition_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requisition_id UUID NOT NULL REFERENCES public.procurement_requisitions(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.procurement_items(id),
  description TEXT NOT NULL,
  quantity NUMERIC(14,2) NOT NULL CHECK (quantity > 0),
  estimated_unit_price NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (estimated_unit_price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.procurement_purchase_orders
  ADD COLUMN IF NOT EXISTS requisition_id UUID REFERENCES public.procurement_requisitions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_by UUID,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

ALTER TABLE public.procurement_purchase_order_lines
  ADD COLUMN IF NOT EXISTS rejected_quantity NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (rejected_quantity >= 0),
  ADD COLUMN IF NOT EXISTS received_accepted_quantity NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (received_accepted_quantity >= 0);

ALTER TABLE public.procurement_grns
  ADD COLUMN IF NOT EXISTS inspection_status TEXT NOT NULL DEFAULT 'pending' CHECK (inspection_status IN ('pending','passed','failed','partial')),
  ADD COLUMN IF NOT EXISTS inspected_by UUID,
  ADD COLUMN IF NOT EXISTS inspected_at TIMESTAMPTZ;

ALTER TABLE public.procurement_grn_lines
  ADD COLUMN IF NOT EXISTS item_condition TEXT NOT NULL DEFAULT 'good' CHECK (item_condition IN ('good','damaged','short','wrong_item'));

-- Existing installations already have inventory_parts. Extend rather than replace it.
ALTER TABLE public.inventory_parts
  ADD COLUMN IF NOT EXISTS procurement_item_id UUID REFERENCES public.procurement_items(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS unit_of_measure TEXT DEFAULT 'Nos';
CREATE UNIQUE INDEX IF NOT EXISTS uq_inventory_parts_procurement_item
  ON public.inventory_parts(procurement_item_id) WHERE procurement_item_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_proc_req_property_unit ON public.procurement_requisitions(property_id, unit_id);
CREATE INDEX IF NOT EXISTS idx_proc_req_status ON public.procurement_requisitions(status);
CREATE INDEX IF NOT EXISTS idx_proc_po_status ON public.procurement_purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_proc_grn_inspection ON public.procurement_grns(inspection_status);

CREATE OR REPLACE FUNCTION public.procurement_refresh_po_status(p_po_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_total NUMERIC;
  v_received NUMERIC;
BEGIN
  SELECT COALESCE(SUM(quantity),0), COALESCE(SUM(received_quantity),0)
    INTO v_total, v_received
  FROM procurement_purchase_order_lines WHERE po_id = p_po_id;
  UPDATE procurement_purchase_orders
  SET status = CASE
    WHEN status = 'cancelled' THEN 'cancelled'
    WHEN v_received <= 0 THEN status
    WHEN v_received < v_total THEN 'partially_received'
    ELSE 'received'
  END, updated_at = now()
  WHERE id = p_po_id;
END;
$$;

-- Atomic receipt: create GRN, update accepted quantities, and bridge maintenance stock.
CREATE OR REPLACE FUNCTION public.receive_procurement_grn(
  p_po_id UUID,
  p_lines JSONB,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_grn_id UUID := gen_random_uuid();
  r JSONB;
  v_line public.procurement_purchase_order_lines%ROWTYPE;
  v_item public.procurement_items%ROWTYPE;
  v_received NUMERIC;
  v_accepted NUMERIC;
  v_rejected NUMERIC;
  v_part public.inventory_parts%ROWTYPE;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM procurement_purchase_orders WHERE id=p_po_id AND status NOT IN ('cancelled','received')) THEN
    RAISE EXCEPTION 'Purchase order % is not receivable.', p_po_id;
  END IF;

  INSERT INTO procurement_grns(id, grn_number, po_id, received_date, status, inspection_status, notes)
  VALUES (v_grn_id, 'GRN-' || to_char(current_date,'YYYY') || '-' || lpad((floor(random()*900000)+100000)::text,6,'0'), p_po_id, current_date, 'received', 'passed', p_notes);

  FOR r IN SELECT * FROM jsonb_array_elements(p_lines)
  LOOP
    SELECT * INTO v_line FROM procurement_purchase_order_lines WHERE id=(r->>'po_line_id')::uuid AND po_id=p_po_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'PO line not found for receipt.'; END IF;
    v_received := (r->>'received_quantity')::numeric;
    v_accepted := COALESCE((r->>'accepted_quantity')::numeric, v_received);
    v_rejected := GREATEST(v_received-v_accepted,0);
    IF v_received <= 0 OR v_received > (v_line.quantity-v_line.received_quantity) THEN
      RAISE EXCEPTION 'Invalid receipt quantity for PO line %.', v_line.id;
    END IF;
    IF v_accepted < 0 OR v_accepted > v_received THEN RAISE EXCEPTION 'Invalid accepted quantity.'; END IF;

    INSERT INTO procurement_grn_lines(grn_id, po_line_id, received_quantity, accepted_quantity, rejected_quantity, item_condition, remarks)
    VALUES(v_grn_id, v_line.id, v_received, v_accepted, v_rejected, COALESCE(r->>'item_condition','good'), r->>'remarks');

    UPDATE procurement_purchase_order_lines
    SET received_quantity=received_quantity+v_received,
        received_accepted_quantity=received_accepted_quantity+v_accepted,
        rejected_quantity=rejected_quantity+v_rejected
    WHERE id=v_line.id;

    SELECT * INTO v_item FROM procurement_items WHERE id=v_line.item_id;
    IF v_item.item_type IN ('maintenance_spare','consumable') AND v_accepted > 0 THEN
      SELECT * INTO v_part FROM inventory_parts WHERE procurement_item_id=v_item.id FOR UPDATE;
      IF FOUND THEN
        UPDATE inventory_parts SET quantity_on_hand=quantity_on_hand+v_accepted::integer, unit_cost=v_line.unit_price, unit_of_measure=v_item.unit_of_measure WHERE id=v_part.id;
      ELSE
        INSERT INTO inventory_parts(procurement_item_id, sku, name, quantity_on_hand, unit_cost, unit_of_measure)
        VALUES(v_item.id, v_item.item_code, v_item.name, v_accepted::integer, v_line.unit_price, v_item.unit_of_measure);
      END IF;
    END IF;
  END LOOP;

  PERFORM procurement_refresh_po_status(p_po_id);
  RETURN v_grn_id;
END;
$$;

ALTER TABLE public.procurement_requisitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_requisition_lines ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS procurement_requisitions_all ON public.procurement_requisitions;
CREATE POLICY procurement_requisitions_all ON public.procurement_requisitions FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS procurement_requisition_lines_all ON public.procurement_requisition_lines;
CREATE POLICY procurement_requisition_lines_all ON public.procurement_requisition_lines FOR ALL USING (true) WITH CHECK (true);
