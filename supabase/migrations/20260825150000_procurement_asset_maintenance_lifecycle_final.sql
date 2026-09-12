BEGIN;

-- ============================================================
-- PROCUREMENT -> ASSET / MAINTENANCE STOCK -> TICKET LIFECYCLE
-- Final hardening:
--   1. Accepted asset GRN quantity auto-creates individual assets.
--   2. Assets inherit PO property/unit when supplied; otherwise General Pool.
--   3. Asset allocation is controlled and auditable.
--   4. Maintenance/consumable GRN quantities feed procurement-linked stock.
--   5. Maintenance material issue is atomic and cannot create negative stock.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.asset_allocation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  from_property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  from_unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  to_property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  to_unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  allocation_type TEXT NOT NULL DEFAULT 'ALLOCATE',
  source TEXT NOT NULL DEFAULT 'ASSET_MANAGEMENT',
  reference TEXT,
  remarks TEXT,
  allocated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  allocated_by UUID
);

CREATE INDEX IF NOT EXISTS idx_asset_allocation_history_asset
  ON public.asset_allocation_history(asset_id, allocated_at DESC);

ALTER TABLE public.assets
  ADD COLUMN IF NOT EXISTS procurement_item_id UUID REFERENCES public.procurement_items(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_assets_procurement_item
  ON public.assets(procurement_item_id);

ALTER TABLE public.procurement_asset_registrations
  DROP CONSTRAINT IF EXISTS procurement_asset_registration_destination_consistency;

-- A procured asset may initially live in the General Pool and be allocated later.
CREATE INDEX IF NOT EXISTS idx_proc_asset_registration_destination
  ON public.procurement_asset_registrations(property_id, unit_id);

-- Stock is procurement-controlled for this lifecycle.
ALTER TABLE public.inventory_parts
  ADD COLUMN IF NOT EXISTS procurement_item_id UUID REFERENCES public.procurement_items(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS unit_of_measure TEXT DEFAULT 'Nos';

CREATE UNIQUE INDEX IF NOT EXISTS uq_inventory_parts_procurement_item
  ON public.inventory_parts(procurement_item_id) WHERE procurement_item_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.maintenance_inventory_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_part_id UUID NOT NULL REFERENCES public.inventory_parts(id) ON DELETE RESTRICT,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('RECEIPT','ISSUE','ADJUSTMENT','RETURN')),
  quantity NUMERIC(18,3) NOT NULL CHECK (quantity <> 0),
  quantity_before NUMERIC(18,3) NOT NULL,
  quantity_after NUMERIC(18,3) NOT NULL,
  unit_cost NUMERIC(18,4) NOT NULL DEFAULT 0,
  reference_type TEXT,
  reference_id UUID,
  procurement_grn_id UUID REFERENCES public.procurement_grns(id) ON DELETE SET NULL,
  maintenance_ticket_id UUID,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_maintenance_inventory_ledger_part
  ON public.maintenance_inventory_ledger(inventory_part_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.material_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID,
  part_id UUID REFERENCES public.inventory_parts(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  cost NUMERIC(18,4) NOT NULL DEFAULT 0,
  procurement_item_id UUID REFERENCES public.procurement_items(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.material_usage
  ADD COLUMN IF NOT EXISTS procurement_item_id UUID REFERENCES public.procurement_items(id) ON DELETE SET NULL;

-- ------------------------------------------------------------
-- Controlled asset allocation
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.allocate_procurement_asset(
  p_asset_id UUID,
  p_property_id UUID DEFAULT NULL,
  p_unit_id UUID DEFAULT NULL,
  p_remarks TEXT DEFAULT NULL,
  p_source TEXT DEFAULT 'ASSET_MANAGEMENT'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_asset public.assets%ROWTYPE;
  v_history UUID;
BEGIN
  SELECT * INTO v_asset FROM public.assets WHERE id = p_asset_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Asset % was not found.', p_asset_id; END IF;

  IF p_unit_id IS NOT NULL THEN
    IF p_property_id IS NULL THEN
      RAISE EXCEPTION 'A property is required when a unit is selected.';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.units WHERE id = p_unit_id AND property_id = p_property_id) THEN
      RAISE EXCEPTION 'Unit % does not belong to property %.', p_unit_id, p_property_id;
    END IF;
  END IF;

  INSERT INTO public.asset_allocation_history (
    asset_id, from_property_id, from_unit_id, to_property_id, to_unit_id,
    allocation_type, source, remarks
  ) VALUES (
    p_asset_id, v_asset.assigned_property_id, v_asset.assigned_unit_id,
    p_property_id, p_unit_id,
    CASE WHEN p_property_id IS NULL THEN 'UNALLOCATE' ELSE 'ALLOCATE' END,
    COALESCE(NULLIF(trim(p_source), ''), 'ASSET_MANAGEMENT'),
    p_remarks
  ) RETURNING id INTO v_history;

  UPDATE public.assets
  SET assigned_property_id = p_property_id,
      assigned_unit_id = p_unit_id,
      assignment_date = CASE WHEN p_property_id IS NULL THEN NULL ELSE CURRENT_DATE END,
      asset_status = CASE WHEN p_property_id IS NULL THEN 'Available' ELSE 'Assigned' END,
      updated_at = now()
  WHERE id = p_asset_id;

  RETURN v_history;
END;
$$;

GRANT EXECUTE ON FUNCTION public.allocate_procurement_asset(UUID, UUID, UUID, TEXT, TEXT) TO anon, authenticated;

-- ------------------------------------------------------------
-- Automatic asset creation from accepted procurement quantity
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.register_procurement_asset(
  p_po_line_id UUID,
  p_asset_name TEXT DEFAULT NULL,
  p_asset_code TEXT DEFAULT NULL,
  p_serial_number TEXT DEFAULT NULL,
  p_warranty_expiry_date DATE DEFAULT NULL,
  p_asset_condition TEXT DEFAULT 'New',
  p_purchase_date DATE DEFAULT CURRENT_DATE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_line procurement_purchase_order_lines%ROWTYPE;
  v_po procurement_purchase_orders%ROWTYPE;
  v_item procurement_items%ROWTYPE;
  v_asset_id UUID;
  v_property_id UUID;
  v_unit_id UUID;
  v_property_code TEXT;
  v_unit_code TEXT;
  v_generated_code TEXT;
  v_cost NUMERIC(18,2);
  v_registered NUMERIC(14,2);
  v_accepted NUMERIC(14,2);
BEGIN
  SELECT * INTO v_line FROM procurement_purchase_order_lines WHERE id = p_po_line_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Procurement PO line % was not found.', p_po_line_id; END IF;
  SELECT * INTO v_po FROM procurement_purchase_orders WHERE id = v_line.po_id;
  SELECT * INTO v_item FROM procurement_items WHERE id = v_line.item_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Procurement item for PO line % was not found.', p_po_line_id; END IF;
  IF v_item.item_type <> 'asset' THEN RAISE EXCEPTION 'PO line % is not an asset item.', p_po_line_id; END IF;

  v_accepted := COALESCE(v_line.received_accepted_quantity, 0);
  v_registered := COALESCE(v_line.registered_asset_quantity, 0);
  IF v_accepted <= v_registered THEN RAISE EXCEPTION 'No accepted asset quantity remains for PO line %.', p_po_line_id; END IF;

  v_property_id := COALESCE(v_line.property_id, v_po.property_id);
  v_unit_id := COALESCE(v_line.unit_id, v_po.unit_id);
  IF v_unit_id IS NOT NULL AND v_property_id IS NULL THEN RAISE EXCEPTION 'A property is required when a unit is assigned.'; END IF;
  IF v_unit_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM units WHERE id=v_unit_id AND property_id=v_property_id) THEN
    RAISE EXCEPTION 'Unit % does not belong to property %.', v_unit_id, v_property_id;
  END IF;

  SELECT property_code INTO v_property_code FROM properties WHERE id=v_property_id;
  IF v_unit_id IS NOT NULL THEN SELECT unit_code INTO v_unit_code FROM units WHERE id=v_unit_id; END IF;

  v_cost := COALESCE(v_line.unit_price,0);
  v_generated_code := COALESCE(NULLIF(trim(p_asset_code),''), 'AST-' || to_char(CURRENT_DATE,'YYYY') || '-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,10)));
  IF EXISTS (SELECT 1 FROM assets WHERE asset_code=v_generated_code) THEN RAISE EXCEPTION 'Asset code % already exists.', v_generated_code; END IF;

  INSERT INTO assets (
    asset_code, asset_name, category, subcategory, serial_number, purchase_date,
    supplier, purchase_cost, warranty_expiry_date, warranty_status,
    assigned_property_id, assigned_unit_id, assignment_date, asset_condition,
    asset_status, opening_cost, addition_during_year, total_asset_value,
    net_book_value, assigned_property_code, assigned_unit_code, remarks, procurement_item_id
  ) VALUES (
    v_generated_code, COALESCE(NULLIF(trim(p_asset_name),''),v_item.name), v_item.category,
    v_item.item_code, NULLIF(trim(p_serial_number),''), COALESCE(p_purchase_date,CURRENT_DATE),
    v_po.vendor_name, v_cost, p_warranty_expiry_date,
    CASE WHEN p_warranty_expiry_date IS NULL THEN NULL WHEN p_warranty_expiry_date >= CURRENT_DATE THEN 'Under Warranty' ELSE 'Expired' END,
    v_property_id, v_unit_id, CASE WHEN v_property_id IS NULL THEN NULL ELSE COALESCE(p_purchase_date,CURRENT_DATE) END,
    COALESCE(NULLIF(trim(p_asset_condition),''),'New'), CASE WHEN v_property_id IS NULL THEN 'Available' ELSE 'Assigned' END,
    0, v_cost, v_cost, v_cost, v_property_code, v_unit_code,
    'Auto-created from Procurement PO ' || v_po.po_number || ' / line ' || p_po_line_id::text,
    v_item.id
  ) RETURNING id INTO v_asset_id;

  INSERT INTO procurement_asset_registrations (po_line_id, asset_id, quantity, property_id, unit_id, registered_at)
  VALUES (p_po_line_id, v_asset_id, 1, v_property_id, v_unit_id, now());

  UPDATE procurement_purchase_order_lines
  SET registered_asset_quantity=v_registered+1, asset_id=v_asset_id
  WHERE id=p_po_line_id;

  INSERT INTO asset_allocation_history(asset_id, from_property_id, from_unit_id, to_property_id, to_unit_id, allocation_type, source, remarks)
  VALUES(v_asset_id, NULL, NULL, v_property_id, v_unit_id, CASE WHEN v_property_id IS NULL THEN 'POOL' ELSE 'ALLOCATE' END, 'PROCUREMENT_GRN', 'Initial procurement allocation');

  RETURN v_asset_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.register_procurement_asset(UUID, TEXT, TEXT, TEXT, DATE, TEXT, DATE) TO anon, authenticated;

-- ------------------------------------------------------------
-- Atomic material issue from procurement-controlled maintenance stock
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.issue_maintenance_material(
  p_ticket_id UUID,
  p_part_id UUID,
  p_quantity NUMERIC
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_part inventory_parts%ROWTYPE;
  v_item procurement_items%ROWTYPE;
  v_before NUMERIC(18,3);
  v_after NUMERIC(18,3);
  v_cost NUMERIC(18,4);
  v_usage UUID;
BEGIN
  IF p_quantity IS NULL OR p_quantity <= 0 THEN RAISE EXCEPTION 'Material quantity must be greater than zero.'; END IF;

  SELECT * INTO v_part FROM inventory_parts WHERE id=p_part_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Maintenance stock item % was not found.', p_part_id; END IF;
  IF v_part.procurement_item_id IS NULL THEN RAISE EXCEPTION 'Only procurement-controlled stock may be issued to maintenance tickets.'; END IF;
  SELECT * INTO v_item FROM procurement_items WHERE id=v_part.procurement_item_id;
  IF NOT FOUND OR v_item.item_type NOT IN ('maintenance_spare','consumable') THEN RAISE EXCEPTION 'Stock item is not a maintenance/consumable procurement item.'; END IF;

  v_before := COALESCE(v_part.quantity_on_hand,0);
  IF v_before < p_quantity THEN RAISE EXCEPTION 'Insufficient stock for %. Available: %, requested: %.', v_part.name, v_before, p_quantity; END IF;
  v_after := v_before - p_quantity;
  v_cost := COALESCE(v_part.unit_cost,0) * p_quantity;

  UPDATE inventory_parts SET quantity_on_hand=v_after::integer WHERE id=p_part_id;

  INSERT INTO material_usage(ticket_id, part_id, quantity, cost, procurement_item_id)
  VALUES(p_ticket_id,p_part_id,p_quantity::integer,v_cost,v_part.procurement_item_id)
  RETURNING id INTO v_usage;

  INSERT INTO maintenance_inventory_ledger(
    inventory_part_id,movement_type,quantity,quantity_before,quantity_after,unit_cost,
    reference_type,reference_id,maintenance_ticket_id,remarks
  ) VALUES(
    p_part_id,'ISSUE',-p_quantity,v_before,v_after,COALESCE(v_part.unit_cost,0),
    'MAINTENANCE_TICKET',p_ticket_id,p_ticket_id,'Issued to maintenance ticket'
  );

  RETURN v_usage;
END;
$$;

GRANT EXECUTE ON FUNCTION public.issue_maintenance_material(UUID, UUID, NUMERIC) TO anon, authenticated;

-- ------------------------------------------------------------
-- Atomic GRN receipt: maintenance stock + automatic asset creation
-- ------------------------------------------------------------
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
  v_before NUMERIC;
  v_after NUMERIC;
  v_asset_count INTEGER;
  v_asset_idx INTEGER;
  v_asset_id UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM procurement_purchase_orders WHERE id=p_po_id AND status NOT IN ('cancelled','received')) THEN
    RAISE EXCEPTION 'Purchase order % is not receivable.', p_po_id;
  END IF;

  INSERT INTO procurement_grns(id, grn_number, po_id, received_date, status, inspection_status, notes)
  VALUES(v_grn_id, 'GRN-' || to_char(current_date,'YYYY') || '-' || lpad((floor(random()*900000)+100000)::text,6,'0'), p_po_id, current_date, 'received', 'passed', p_notes);

  FOR r IN SELECT * FROM jsonb_array_elements(p_lines) LOOP
    SELECT * INTO v_line FROM procurement_purchase_order_lines WHERE id=(r->>'po_line_id')::uuid AND po_id=p_po_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'PO line not found for receipt.'; END IF;

    v_received := (r->>'received_quantity')::numeric;
    v_accepted := COALESCE((r->>'accepted_quantity')::numeric, v_received);
    v_rejected := COALESCE((r->>'rejected_quantity')::numeric, GREATEST(v_received-v_accepted,0));
    IF v_received <= 0 OR v_received > (v_line.quantity-v_line.received_quantity) THEN RAISE EXCEPTION 'Invalid receipt quantity for PO line %.', v_line.id; END IF;
    IF v_accepted < 0 OR v_accepted > v_received OR v_rejected < 0 OR v_accepted + v_rejected <> v_received THEN RAISE EXCEPTION 'Invalid accepted/rejected quantity for PO line %.', v_line.id; END IF;

    SELECT * INTO v_item FROM procurement_items WHERE id=v_line.item_id;
    IF v_item.item_type='asset' AND v_accepted <> trunc(v_accepted) THEN
      RAISE EXCEPTION 'Asset quantity for PO line % must be a whole number.', v_line.id;
    END IF;

    INSERT INTO procurement_grn_lines(grn_id, po_line_id, received_quantity, accepted_quantity, rejected_quantity, item_condition, remarks)
    VALUES(v_grn_id,v_line.id,v_received,v_accepted,v_rejected,COALESCE(r->>'item_condition','good'),r->>'remarks');

    UPDATE procurement_purchase_order_lines
    SET received_quantity=received_quantity+v_received,
        received_accepted_quantity=received_accepted_quantity+v_accepted,
        rejected_quantity=rejected_quantity+v_rejected
    WHERE id=v_line.id;

    IF v_item.item_type IN ('maintenance_spare','consumable') AND v_accepted > 0 THEN
      SELECT * INTO v_part FROM inventory_parts WHERE procurement_item_id=v_item.id FOR UPDATE;
      IF FOUND THEN
        v_before := COALESCE(v_part.quantity_on_hand,0);
        v_after := v_before + v_accepted;
        UPDATE inventory_parts SET quantity_on_hand=v_after::integer, unit_cost=v_line.unit_price, unit_of_measure=v_item.unit_of_measure WHERE id=v_part.id;
      ELSE
        v_before := 0;
        v_after := v_accepted;
        INSERT INTO inventory_parts(procurement_item_id,sku,name,quantity_on_hand,unit_cost,unit_of_measure)
        VALUES(v_item.id,v_item.item_code,v_item.name,v_accepted::integer,v_line.unit_price,v_item.unit_of_measure)
        RETURNING * INTO v_part;
      END IF;

      INSERT INTO maintenance_inventory_ledger(inventory_part_id,movement_type,quantity,quantity_before,quantity_after,unit_cost,reference_type,reference_id,procurement_grn_id,remarks)
      VALUES(v_part.id,'RECEIPT',v_accepted,v_before,v_after,COALESCE(v_part.unit_cost,0),'PROCUREMENT_GRN',v_grn_id,v_grn_id,'Accepted procurement receipt');
    END IF;

    IF v_item.item_type='asset' AND v_accepted > 0 THEN
      v_asset_count := v_accepted::integer;
      FOR v_asset_idx IN 1..v_asset_count LOOP
        v_asset_id := public.register_procurement_asset(v_line.id, v_item.name, NULL, NULL, NULL, 'New', current_date);
      END LOOP;
    END IF;
  END LOOP;

  PERFORM procurement_refresh_po_status(p_po_id);
  RETURN v_grn_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.receive_procurement_grn(UUID, JSONB, TEXT) TO anon, authenticated;

COMMIT;
