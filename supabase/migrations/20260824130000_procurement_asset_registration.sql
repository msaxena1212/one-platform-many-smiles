-- Procurement -> Asset Management integration.
-- Uses the existing public.assets table as the authoritative asset register.
-- No Finance posting is introduced here.

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
  v_asset_code TEXT;
  v_cost NUMERIC(18,2);
  v_registered NUMERIC(14,2);
  v_accepted NUMERIC(14,2);
BEGIN
  SELECT * INTO v_line
  FROM procurement_purchase_order_lines
  WHERE id = p_po_line_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Procurement PO line % was not found.', p_po_line_id;
  END IF;

  SELECT * INTO v_po
  FROM procurement_purchase_orders
  WHERE id = v_line.po_id;

  SELECT * INTO v_item
  FROM procurement_items
  WHERE id = v_line.item_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Procurement item for PO line % was not found.', p_po_line_id;
  END IF;

  IF v_item.item_type <> 'asset' THEN
    RAISE EXCEPTION 'PO line % is not an asset item.', p_po_line_id;
  END IF;

  v_accepted := COALESCE(v_line.received_accepted_quantity, 0);
  v_registered := COALESCE(v_line.registered_asset_quantity, 0);

  IF v_accepted <= v_registered THEN
    RAISE EXCEPTION 'No accepted asset quantity remains for PO line %.', p_po_line_id;
  END IF;

  -- Line-level destination wins; PO header is the fallback for legacy rows.
  v_property_id := COALESCE(v_line.property_id, v_po.property_id);
  v_unit_id := COALESCE(v_line.unit_id, v_po.unit_id);

  IF v_property_id IS NULL THEN
    RAISE EXCEPTION 'A property must be assigned before registering an asset from PO line %.', p_po_line_id;
  END IF;

  IF v_unit_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM units WHERE id = v_unit_id AND property_id = v_property_id
  ) THEN
    RAISE EXCEPTION 'Unit % does not belong to property %.', v_unit_id, v_property_id;
  END IF;

  SELECT property_code INTO v_property_code
  FROM properties WHERE id = v_property_id;

  IF v_unit_id IS NOT NULL THEN
    SELECT unit_code INTO v_unit_code
    FROM units WHERE id = v_unit_id;
  END IF;

  v_cost := COALESCE(v_line.unit_price, 0);
  v_asset_code := COALESCE(
    NULLIF(trim(p_asset_code), ''),
    'AST-' || to_char(CURRENT_DATE, 'YYYY') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))
  );

  IF EXISTS (SELECT 1 FROM assets WHERE asset_code = v_asset_code) THEN
    RAISE EXCEPTION 'Asset code % already exists.', v_asset_code;
  END IF;

  INSERT INTO assets (
    asset_code,
    asset_name,
    category,
    subcategory,
    serial_number,
    purchase_date,
    supplier,
    purchase_cost,
    warranty_expiry_date,
    warranty_status,
    assigned_property_id,
    assigned_unit_id,
    assignment_date,
    asset_condition,
    asset_status,
    opening_cost,
    addition_during_year,
    total_asset_value,
    net_book_value,
    assigned_property_code,
    assigned_unit_code,
    remarks
  ) VALUES (
    v_asset_code,
    COALESCE(NULLIF(trim(p_asset_name), ''), v_item.name),
    v_item.category,
    v_item.item_code,
    NULLIF(trim(p_serial_number), ''),
    COALESCE(p_purchase_date, CURRENT_DATE),
    v_po.vendor_name,
    v_cost,
    p_warranty_expiry_date,
    CASE
      WHEN p_warranty_expiry_date IS NULL THEN NULL
      WHEN p_warranty_expiry_date >= CURRENT_DATE THEN 'Under Warranty'
      ELSE 'Expired'
    END,
    v_property_id,
    v_unit_id,
    COALESCE(p_purchase_date, CURRENT_DATE),
    COALESCE(NULLIF(trim(p_asset_condition), ''), 'New'),
    CASE WHEN v_unit_id IS NULL THEN 'Available' ELSE 'Assigned' END,
    0,
    v_cost,
    v_cost,
    v_cost,
    v_property_code,
    v_unit_code,
    'Created from Procurement PO ' || v_po.po_number || ' / line ' || p_po_line_id::text
  )
  RETURNING id INTO v_asset_id;

  INSERT INTO procurement_asset_registrations (
    po_line_id,
    asset_id,
    quantity,
    property_id,
    unit_id,
    registered_at
  ) VALUES (
    p_po_line_id,
    v_asset_id,
    1,
    v_property_id,
    v_unit_id,
    now()
  );

  UPDATE procurement_purchase_order_lines
  SET
    registered_asset_quantity = v_registered + 1,
    asset_id = v_asset_id
  WHERE id = p_po_line_id;

  RETURN v_asset_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.register_procurement_asset(UUID, TEXT, TEXT, TEXT, DATE, TEXT, DATE) TO anon, authenticated;

ALTER TABLE public.procurement_asset_registrations
  DROP CONSTRAINT IF EXISTS procurement_asset_registration_destination_consistency;

ALTER TABLE public.procurement_asset_registrations
  ADD CONSTRAINT procurement_asset_registration_destination_consistency
  CHECK (property_id IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_proc_asset_reg_property_unit
  ON public.procurement_asset_registrations(property_id, unit_id);

CREATE INDEX IF NOT EXISTS idx_proc_po_line_registration_progress
  ON public.procurement_purchase_order_lines(id, received_accepted_quantity, registered_asset_quantity);
