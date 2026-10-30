-- Procurement Phase 7: production release hardening, idempotency and readiness validation.

-- ---------------------------------------------------------------------------
-- 1. Repair landed-cost reallocation so repeated allocation is idempotent.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.proc_allocate_landed_cost(
  p_landed_cost_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cost RECORD;
  v_purchase RECORD;
  v_total_base NUMERIC(18,2);
  v_total_qty NUMERIC(18,3);
  v_allocated NUMERIC(18,2) := 0;
  v_line RECORD;
  v_ratio NUMERIC(18,8);
  v_amount NUMERIC(18,2);
  v_basis TEXT;
BEGIN
  SELECT * INTO v_cost FROM public.proc_landed_costs WHERE id = p_landed_cost_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Landed cost % not found', p_landed_cost_id; END IF;
  IF v_cost.posting_status = 'POSTED' THEN
    RAISE EXCEPTION 'Posted landed cost % cannot be reallocated', v_cost.doc_number;
  END IF;
  IF v_cost.goods_receipt_id IS NULL THEN
    RAISE EXCEPTION 'Landed cost must reference a GRN before allocation';
  END IF;

  SELECT p.* INTO v_purchase
  FROM public.proc_purchases p
  WHERE p.goods_receipt_id = v_cost.goods_receipt_id
  ORDER BY p.created_at DESC
  LIMIT 1
  FOR UPDATE;
  IF v_purchase.id IS NULL THEN
    RAISE EXCEPTION 'Create the Purchase from GRN before allocating landed cost';
  END IF;

  -- Remove this cost's previous contribution before rebuilding allocations.
  UPDATE public.proc_purchase_lines pl
  SET landed_cost_amount = GREATEST(0, COALESCE(pl.landed_cost_amount,0) - COALESCE(a.allocated_amount,0)),
      total_amount = COALESCE(pl.base_amount,0) + GREATEST(0, COALESCE(pl.landed_cost_amount,0) - COALESCE(a.allocated_amount,0)),
      updated_at = NOW()
  FROM public.proc_landed_cost_allocations a
  WHERE a.landed_cost_id = p_landed_cost_id
    AND a.purchase_line_id = pl.id
    AND pl.purchase_id = v_purchase.id;

  DELETE FROM public.proc_landed_cost_allocations WHERE landed_cost_id = p_landed_cost_id;

  SELECT COALESCE(SUM(base_amount),0), COALESCE(SUM(quantity),0)
    INTO v_total_base, v_total_qty
  FROM public.proc_purchase_lines
  WHERE purchase_id = v_purchase.id;

  v_basis := UPPER(COALESCE(v_cost.allocation_basis,'VALUE'));
  IF v_basis NOT IN ('VALUE','QUANTITY','EQUAL') THEN
    RAISE EXCEPTION 'Unsupported landed cost allocation basis: %', v_basis;
  END IF;
  IF v_basis = 'VALUE' AND v_total_base = 0 THEN
    RAISE EXCEPTION 'Cannot allocate by VALUE when purchase base is zero';
  END IF;
  IF v_basis = 'QUANTITY' AND v_total_qty = 0 THEN
    RAISE EXCEPTION 'Cannot allocate by QUANTITY when purchase quantity is zero';
  END IF;

  FOR v_line IN SELECT * FROM public.proc_purchase_lines WHERE purchase_id=v_purchase.id ORDER BY line_no LOOP
    IF v_basis = 'VALUE' THEN
      v_ratio := COALESCE(v_line.base_amount,0) / v_total_base;
    ELSIF v_basis = 'QUANTITY' THEN
      v_ratio := COALESCE(v_line.quantity,0) / v_total_qty;
    ELSE
      v_ratio := 1.0 / NULLIF((SELECT COUNT(*) FROM public.proc_purchase_lines WHERE purchase_id=v_purchase.id),0);
    END IF;

    v_amount := ROUND((COALESCE(v_cost.amount,0) * v_ratio)::NUMERIC,2);
    IF v_line.id = (SELECT id FROM public.proc_purchase_lines WHERE purchase_id=v_purchase.id ORDER BY line_no DESC LIMIT 1) THEN
      v_amount := COALESCE(v_cost.amount,0) - v_allocated;
    END IF;

    INSERT INTO public.proc_landed_cost_allocations(
      landed_cost_id,purchase_line_id,allocation_basis,allocation_ratio,allocated_amount
    ) VALUES (
      p_landed_cost_id,v_line.id,v_basis,v_ratio,v_amount
    );

    UPDATE public.proc_purchase_lines
    SET landed_cost_amount = COALESCE(landed_cost_amount,0) + v_amount,
        total_amount = COALESCE(base_amount,0) + COALESCE(landed_cost_amount,0) + v_amount,
        updated_at = NOW()
    WHERE id = v_line.id;

    v_allocated := v_allocated + v_amount;
  END LOOP;

  PERFORM public.proc_recalculate_purchase_total(v_purchase.id);

  RETURN jsonb_build_object(
    'purchase_id',v_purchase.id,
    'landed_cost_id',p_landed_cost_id,
    'allocated_amount',v_allocated,
    'basis',v_basis,
    'idempotent',true
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- 2. Enforce line-level receiving and invoice-source integrity.
-- ---------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS ux_proc_invoice_source_line
ON public.proc_payable_invoice_lines(payable_invoice_id, source_line_id)
WHERE source_line_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.proc_validate_receiving_line()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.accepted_quantity < 0 OR NEW.rejected_quantity < 0 THEN
    RAISE EXCEPTION 'Accepted and rejected quantities cannot be negative';
  END IF;
  IF NEW.accepted_quantity + NEW.rejected_quantity > NEW.ordered_quantity THEN
    RAISE EXCEPTION 'Accepted plus rejected quantity cannot exceed ordered quantity';
  END IF;
  NEW.line_total := ROUND((COALESCE(NEW.accepted_quantity,0) * COALESCE(NEW.unit_rate,0))::NUMERIC,2);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_proc_validate_grn_line ON public.proc_grn_lines;
CREATE TRIGGER trg_proc_validate_grn_line
BEFORE INSERT OR UPDATE ON public.proc_grn_lines
FOR EACH ROW EXECUTE FUNCTION public.proc_validate_receiving_line();

CREATE OR REPLACE FUNCTION public.proc_validate_invoice_source_line()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_grn_id UUID;
  v_accepted NUMERIC(18,3);
BEGIN
  IF NEW.source_line_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT g.goods_receipt_id, g.accepted_quantity
    INTO v_grn_id, v_accepted
  FROM public.proc_grn_lines g
  WHERE g.id = NEW.source_line_id;

  IF v_grn_id IS NULL THEN
    RAISE EXCEPTION 'Invoice source GRN line % does not exist', NEW.source_line_id;
  END IF;

  IF NEW.quantity < 0 OR NEW.quantity > v_accepted THEN
    RAISE EXCEPTION 'Invoice quantity % exceeds accepted GRN quantity %', NEW.quantity, v_accepted;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_proc_validate_invoice_source_line ON public.proc_payable_invoice_lines;
CREATE TRIGGER trg_proc_validate_invoice_source_line
BEFORE INSERT OR UPDATE ON public.proc_payable_invoice_lines
FOR EACH ROW EXECUTE FUNCTION public.proc_validate_invoice_source_line();

-- ---------------------------------------------------------------------------
-- 3. Release readiness validator.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.proc_release_readiness(p_po_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_po RECORD;
  v_pr RECORD;
  v_quote RECORD;
  v_grn RECORD;
  v_invoice RECORD;
  v_match RECORD;
  v_purchase RECORD;
  v_issues JSONB := '[]'::jsonb;
  v_checks JSONB := '{}'::jsonb;
  v_duplicate_sources INTEGER := 0;
  v_unposted_costs INTEGER := 0;
  v_event_count INTEGER := 0;
  v_posted_events INTEGER := 0;
BEGIN
  SELECT * INTO v_po FROM public.proc_purchase_orders WHERE id=p_po_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Purchase order % not found', p_po_id; END IF;

  SELECT * INTO v_pr FROM public.proc_purchase_requests WHERE id=v_po.purchase_request_id;
  SELECT * INTO v_quote FROM public.proc_vendor_quotes WHERE id=v_po.vendor_quote_id;
  SELECT * INTO v_grn FROM public.proc_goods_receipts WHERE purchase_order_id=p_po_id ORDER BY created_at DESC LIMIT 1;
  SELECT * INTO v_invoice FROM public.proc_payable_invoices WHERE purchase_order_id=p_po_id ORDER BY created_at DESC LIMIT 1;
  IF v_invoice.id IS NOT NULL THEN
    SELECT * INTO v_match FROM public.proc_three_way_matches WHERE payable_invoice_id=v_invoice.id;
  END IF;
  SELECT * INTO v_purchase FROM public.proc_purchases WHERE purchase_order_id=p_po_id ORDER BY created_at DESC LIMIT 1;

  SELECT COUNT(*) INTO v_duplicate_sources
  FROM (
    SELECT source_line_id
    FROM public.proc_payable_invoice_lines
    WHERE payable_invoice_id=COALESCE(v_invoice.id,'00000000-0000-0000-0000-000000000000'::uuid)
      AND source_line_id IS NOT NULL
    GROUP BY source_line_id HAVING COUNT(*) > 1
  ) d;

  SELECT COUNT(*) INTO v_unposted_costs
  FROM public.proc_landed_costs
  WHERE purchase_order_id=p_po_id AND posting_status <> 'POSTED';

  SELECT COUNT(*), COUNT(*) FILTER (WHERE status='POSTED')
    INTO v_event_count, v_posted_events
  FROM public.fin_accounting_events
  WHERE source_id IN (p_po_id, COALESCE(v_grn.id,p_po_id), COALESCE(v_invoice.id,p_po_id), COALESCE(v_purchase.id,p_po_id))
    AND source_type IN ('GRN','AP_INVOICE','PURCHASE_CAPITALIZATION');

  v_checks := jsonb_build_object(
    'purchase_request_approved', COALESCE(v_pr.status='APPROVED',false),
    'selected_quote', COALESCE(v_quote.is_selected,false),
    'purchase_order_approved', v_po.status='APPROVED',
    'grn_present', v_grn.id IS NOT NULL,
    'grn_posted', COALESCE(v_grn.posting_status='POSTED',false),
    'invoice_present', v_invoice.id IS NOT NULL,
    'three_way_match_passed', COALESCE(v_match.status='PASSED',false),
    'duplicate_invoice_source_lines', v_duplicate_sources,
    'unposted_landed_costs', v_unposted_costs,
    'purchase_present', v_purchase.id IS NOT NULL,
    'accounting_events_posted', CASE WHEN v_event_count=0 THEN false ELSE v_event_count=v_posted_events END
  );

  IF NOT COALESCE(v_pr.status='APPROVED',false) THEN v_issues := v_issues || jsonb_build_array('Purchase Request is not approved.'); END IF;
  IF NOT COALESCE(v_quote.is_selected,false) THEN v_issues := v_issues || jsonb_build_array('Selected vendor quote is missing.'); END IF;
  IF v_po.status <> 'APPROVED' THEN v_issues := v_issues || jsonb_build_array('Purchase Order is not approved.'); END IF;
  IF v_grn.id IS NULL THEN v_issues := v_issues || jsonb_build_array('Posted GRN is missing.');
  ELSIF v_grn.posting_status <> 'POSTED' THEN v_issues := v_issues || jsonb_build_array('GRN is not posted.'); END IF;
  IF v_invoice.id IS NULL THEN v_issues := v_issues || jsonb_build_array('Procurement AP invoice is missing.');
  ELSIF COALESCE(v_match.status,'FAILED') <> 'PASSED' THEN v_issues := v_issues || jsonb_build_array('Three-way match has not passed.'); END IF;
  IF v_duplicate_sources > 0 THEN v_issues := v_issues || jsonb_build_array('Duplicate invoice-to-GRN source-line mappings exist.'); END IF;
  IF v_unposted_costs > 0 THEN v_issues := v_issues || jsonb_build_array('One or more landed costs are not posted.'); END IF;
  IF v_purchase.id IS NULL THEN v_issues := v_issues || jsonb_build_array('Purchase record is missing.'); END IF;
  IF v_event_count=0 OR v_event_count<>v_posted_events THEN v_issues := v_issues || jsonb_build_array('Procurement accounting events are incomplete or not fully posted.'); END IF;

  RETURN jsonb_build_object(
    'po_id',p_po_id,
    'po_number',v_po.doc_number,
    'ready',jsonb_array_length(v_issues)=0,
    'issue_count',jsonb_array_length(v_issues),
    'issues',v_issues,
    'checks',v_checks
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.proc_release_readiness(UUID) TO authenticated;

-- ---------------------------------------------------------------------------
-- 4. Test-friendly validation function for deployment smoke checks.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.proc_schema_smoke_check()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tables TEXT[] := ARRAY[
    'proc_purchase_requests','proc_rfx','proc_vendor_quotes','proc_purchase_orders',
    'proc_shipments','proc_gate_inwards','proc_goods_receipts','proc_landed_costs',
    'proc_payable_invoices','proc_purchases','proc_three_way_matches',
    'proc_landed_cost_allocations','proc_audit_log'
  ];
  v_missing TEXT[] := ARRAY[]::TEXT[];
  v_table TEXT;
BEGIN
  FOREACH v_table IN ARRAY v_tables LOOP
    IF to_regclass('public.' || v_table) IS NULL THEN
      v_missing := array_append(v_missing, v_table);
    END IF;
  END LOOP;
  RETURN jsonb_build_object(
    'ready', cardinality(v_missing)=0,
    'missing_tables', to_jsonb(v_missing),
    'checked_table_count', cardinality(v_tables)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.proc_schema_smoke_check() TO authenticated;
