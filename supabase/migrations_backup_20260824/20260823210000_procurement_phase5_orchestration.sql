-- Procurement Phase 5: transaction orchestration, three-way match and lifecycle controls.

CREATE TABLE IF NOT EXISTS public.proc_three_way_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payable_invoice_id UUID NOT NULL UNIQUE,
  purchase_order_id UUID NOT NULL,
  goods_receipt_id UUID NOT NULL,
  vendor_id BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'FAILED',
  tolerance_amount NUMERIC(18,2) NOT NULL DEFAULT 0.01,
  po_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  grn_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  invoice_subtotal NUMERIC(18,2) NOT NULL DEFAULT 0,
  invoice_total NUMERIC(18,2) NOT NULL DEFAULT 0,
  amount_variance NUMERIC(18,2) NOT NULL DEFAULT 0,
  quantity_variance NUMERIC(18,3) NOT NULL DEFAULT 0,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  matched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_proc_3wm_status CHECK (status IN ('PASSED','FAILED','OVERRIDE'))
);

CREATE TABLE IF NOT EXISTS public.proc_landed_cost_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landed_cost_id UUID NOT NULL,
  purchase_line_id UUID NOT NULL,
  allocation_basis TEXT NOT NULL,
  allocation_ratio NUMERIC(18,8) NOT NULL DEFAULT 0,
  allocated_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ux_proc_lc_allocation UNIQUE (landed_cost_id, purchase_line_id),
  CONSTRAINT ck_proc_lc_allocation_amount CHECK (allocated_amount >= 0)
);

CREATE INDEX IF NOT EXISTS idx_proc_3wm_status ON public.proc_three_way_matches(status, matched_at);
CREATE INDEX IF NOT EXISTS idx_proc_lc_allocations_cost ON public.proc_landed_cost_allocations(landed_cost_id);
CREATE INDEX IF NOT EXISTS idx_proc_lc_allocations_purchase ON public.proc_landed_cost_allocations(purchase_line_id);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_3wm_invoice') THEN
    ALTER TABLE public.proc_three_way_matches ADD CONSTRAINT fk_proc_3wm_invoice
      FOREIGN KEY (payable_invoice_id) REFERENCES public.proc_payable_invoices(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_3wm_po') THEN
    ALTER TABLE public.proc_three_way_matches ADD CONSTRAINT fk_proc_3wm_po
      FOREIGN KEY (purchase_order_id) REFERENCES public.proc_purchase_orders(id) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_3wm_grn') THEN
    ALTER TABLE public.proc_three_way_matches ADD CONSTRAINT fk_proc_3wm_grn
      FOREIGN KEY (goods_receipt_id) REFERENCES public.proc_goods_receipts(id) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_3wm_vendor') THEN
    ALTER TABLE public.proc_three_way_matches ADD CONSTRAINT fk_proc_3wm_vendor
      FOREIGN KEY (vendor_id) REFERENCES public.fin_vendors(id) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_lc_alloc_cost') THEN
    ALTER TABLE public.proc_landed_cost_allocations ADD CONSTRAINT fk_proc_lc_alloc_cost
      FOREIGN KEY (landed_cost_id) REFERENCES public.proc_landed_costs(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_proc_lc_alloc_purchase') THEN
    ALTER TABLE public.proc_landed_cost_allocations ADD CONSTRAINT fk_proc_lc_alloc_purchase
      FOREIGN KEY (purchase_line_id) REFERENCES public.proc_purchase_lines(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.proc_run_three_way_match(
  p_invoice_id UUID,
  p_tolerance_amount NUMERIC DEFAULT 0.01
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invoice RECORD;
  v_po RECORD;
  v_grn RECORD;
  v_vendor_ok BOOLEAN := FALSE;
  v_amount_ok BOOLEAN := FALSE;
  v_qty_ok BOOLEAN := FALSE;
  v_source_ok BOOLEAN := TRUE;
  v_po_amount NUMERIC(18,2) := 0;
  v_grn_amount NUMERIC(18,2) := 0;
  v_invoice_subtotal NUMERIC(18,2) := 0;
  v_invoice_total NUMERIC(18,2) := 0;
  v_amount_variance NUMERIC(18,2) := 0;
  v_quantity_variance NUMERIC(18,3) := 0;
  v_missing_source INTEGER := 0;
  v_invalid_source INTEGER := 0;
  v_status TEXT;
  v_details JSONB;
BEGIN
  SELECT * INTO v_invoice FROM public.proc_payable_invoices WHERE id = p_invoice_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Payable invoice % not found', p_invoice_id; END IF;
  IF v_invoice.purchase_order_id IS NULL OR v_invoice.goods_receipt_id IS NULL THEN
    v_details := jsonb_build_object('reason','Invoice must be linked to both PO and GRN');
    v_status := 'FAILED';
    DELETE FROM public.proc_three_way_matches WHERE payable_invoice_id = p_invoice_id;
    RETURN jsonb_build_object('status',v_status,'passed',false,'details',v_details);
  END IF;

  SELECT * INTO v_po FROM public.proc_purchase_orders WHERE id = v_invoice.purchase_order_id;
  SELECT * INTO v_grn FROM public.proc_goods_receipts WHERE id = v_invoice.goods_receipt_id;
  IF v_po.id IS NULL THEN
    v_details := jsonb_build_object('reason','Purchase order not found');
    DELETE FROM public.proc_three_way_matches WHERE payable_invoice_id = p_invoice_id;
    RETURN jsonb_build_object('status','FAILED','passed',false,'details',v_details);
  ELSIF v_grn.id IS NULL THEN
    v_details := jsonb_build_object('reason','Goods receipt not found');
    DELETE FROM public.proc_three_way_matches WHERE payable_invoice_id = p_invoice_id;
    RETURN jsonb_build_object('status','FAILED','passed',false,'details',v_details);
  ELSE
    v_vendor_ok := v_invoice.vendor_id = v_po.vendor_id;
    IF v_grn.purchase_order_id <> v_po.id THEN
      v_details := jsonb_build_object('reason','Goods receipt does not belong to the invoice purchase order');
      v_status := 'FAILED';
      INSERT INTO public.proc_three_way_matches(payable_invoice_id,purchase_order_id,goods_receipt_id,vendor_id,status,tolerance_amount,invoice_subtotal,invoice_total,details)
      VALUES (p_invoice_id,v_po.id,v_grn.id,v_invoice.vendor_id,v_status,p_tolerance_amount,COALESCE(v_invoice.subtotal,0),COALESCE(v_invoice.total_amount,0),v_details)
      ON CONFLICT (payable_invoice_id) DO UPDATE SET status=EXCLUDED.status,tolerance_amount=EXCLUDED.tolerance_amount,details=EXCLUDED.details,matched_at=NOW(),updated_at=NOW();
      RETURN jsonb_build_object('status',v_status,'passed',false,'details',v_details);
    END IF;
    v_amount_variance := ABS(COALESCE(v_invoice.subtotal,0) - COALESCE(v_grn.total_amount,0));
    v_amount_ok := v_amount_variance <= COALESCE(p_tolerance_amount,0.01);
    SELECT COUNT(*) INTO v_missing_source
      FROM public.proc_payable_invoice_lines l
      WHERE l.payable_invoice_id = p_invoice_id AND l.source_line_id IS NULL;
    SELECT COUNT(*) INTO v_invalid_source
      FROM public.proc_payable_invoice_lines l
      LEFT JOIN public.proc_grn_lines g ON g.id = l.source_line_id
      WHERE l.payable_invoice_id = p_invoice_id AND (l.source_line_id IS NOT NULL AND (g.id IS NULL OR g.goods_receipt_id <> v_grn.id));
    v_source_ok := v_missing_source = 0 AND v_invalid_source = 0;

    SELECT COALESCE(SUM(ABS(COALESCE(l.quantity,0) - COALESCE(g.accepted_quantity,0))),0)
      INTO v_quantity_variance
    FROM public.proc_payable_invoice_lines l
    LEFT JOIN public.proc_grn_lines g ON g.id = l.source_line_id
    WHERE l.payable_invoice_id = p_invoice_id;
    v_qty_ok := v_source_ok AND v_quantity_variance <= 0.0005;
    SELECT COALESCE(SUM(line_total),0) INTO v_po_amount FROM public.proc_po_lines WHERE purchase_order_id = v_po.id;
    SELECT COALESCE(SUM(line_total),0) INTO v_grn_amount FROM public.proc_grn_lines WHERE goods_receipt_id = v_grn.id;
    v_invoice_subtotal := COALESCE(v_invoice.subtotal,0);
    v_invoice_total := COALESCE(v_invoice.total_amount,0);
    v_details := jsonb_build_object(
      'vendor_match', v_vendor_ok,
      'amount_match', v_amount_ok,
      'quantity_match', v_qty_ok,
      'source_line_mapping', v_source_ok,
      'missing_source_lines', v_missing_source,
      'invalid_source_lines', v_invalid_source,
      'po_amount', v_po_amount,
      'grn_amount', v_grn_amount,
      'invoice_subtotal', v_invoice_subtotal,
      'invoice_total', v_invoice_total,
      'amount_variance', v_amount_variance,
      'quantity_variance', v_quantity_variance
    );
  END IF;

  IF v_vendor_ok AND v_amount_ok AND v_qty_ok THEN v_status := 'PASSED'; ELSE v_status := 'FAILED'; END IF;
  INSERT INTO public.proc_three_way_matches(payable_invoice_id,purchase_order_id,goods_receipt_id,vendor_id,status,tolerance_amount,po_amount,grn_amount,invoice_subtotal,invoice_total,amount_variance,quantity_variance,details)
  VALUES (p_invoice_id,v_po.id,v_grn.id,v_invoice.vendor_id,v_status,p_tolerance_amount,v_po_amount,v_grn_amount,v_invoice_subtotal,v_invoice_total,v_amount_variance,v_quantity_variance,v_details)
  ON CONFLICT (payable_invoice_id) DO UPDATE SET status=EXCLUDED.status,tolerance_amount=EXCLUDED.tolerance_amount,po_amount=EXCLUDED.po_amount,grn_amount=EXCLUDED.grn_amount,invoice_subtotal=EXCLUDED.invoice_subtotal,invoice_total=EXCLUDED.invoice_total,amount_variance=EXCLUDED.amount_variance,quantity_variance=EXCLUDED.quantity_variance,details=EXCLUDED.details,matched_at=NOW(),updated_at=NOW();
  RETURN jsonb_build_object('status',v_status,'passed',v_status='PASSED','details',v_details);
END;
$$;

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
  SELECT * INTO v_cost FROM public.proc_landed_costs WHERE id=p_landed_cost_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Landed cost % not found', p_landed_cost_id; END IF;
  IF v_cost.goods_receipt_id IS NULL THEN RAISE EXCEPTION 'Landed cost must reference a GRN before allocation'; END IF;
  SELECT p.* INTO v_purchase
  FROM public.proc_purchases p
  WHERE p.goods_receipt_id=v_cost.goods_receipt_id
  ORDER BY p.created_at DESC LIMIT 1;
  IF v_purchase.id IS NULL THEN RAISE EXCEPTION 'Create the Purchase from GRN before allocating landed cost'; END IF;

  DELETE FROM public.proc_landed_cost_allocations WHERE landed_cost_id=p_landed_cost_id;
  SELECT COALESCE(SUM(base_amount),0), COALESCE(SUM(quantity),0) INTO v_total_base,v_total_qty
  FROM public.proc_purchase_lines WHERE purchase_id=v_purchase.id;
  v_basis := UPPER(COALESCE(v_cost.allocation_basis,'VALUE'));
  IF v_basis NOT IN ('VALUE','QUANTITY','EQUAL') THEN RAISE EXCEPTION 'Unsupported landed cost allocation basis: %', v_basis; END IF;
  IF v_basis='VALUE' AND v_total_base=0 THEN RAISE EXCEPTION 'Cannot allocate by VALUE when purchase base is zero'; END IF;
  IF v_basis='QUANTITY' AND v_total_qty=0 THEN RAISE EXCEPTION 'Cannot allocate by QUANTITY when purchase quantity is zero'; END IF;

  FOR v_line IN SELECT * FROM public.proc_purchase_lines WHERE purchase_id=v_purchase.id ORDER BY line_no LOOP
    IF v_basis='VALUE' THEN v_ratio := COALESCE(v_line.base_amount,0)/v_total_base;
    ELSIF v_basis='QUANTITY' THEN v_ratio := COALESCE(v_line.quantity,0)/v_total_qty;
    ELSE v_ratio := 1.0/(SELECT COUNT(*) FROM public.proc_purchase_lines WHERE purchase_id=v_purchase.id); END IF;
    v_amount := ROUND((COALESCE(v_cost.amount,0)*v_ratio)::NUMERIC,2);
    IF v_line.id = (SELECT id FROM public.proc_purchase_lines WHERE purchase_id=v_purchase.id ORDER BY line_no DESC LIMIT 1) THEN
      v_amount := COALESCE(v_cost.amount,0) - v_allocated;
    END IF;
    INSERT INTO public.proc_landed_cost_allocations(landed_cost_id,purchase_line_id,allocation_basis,allocation_ratio,allocated_amount)
    VALUES (p_landed_cost_id,v_line.id,v_basis,v_ratio,v_amount);
    UPDATE public.proc_purchase_lines SET landed_cost_amount=COALESCE(landed_cost_amount,0)+v_amount,total_amount=COALESCE(base_amount,0)+COALESCE(landed_cost_amount,0)+v_amount,updated_at=NOW() WHERE id=v_line.id;
    v_allocated := v_allocated + v_amount;
  END LOOP;
  PERFORM public.proc_recalculate_purchase_total(v_purchase.id);
  RETURN jsonb_build_object('purchase_id',v_purchase.id,'landed_cost_id',p_landed_cost_id,'allocated_amount',v_allocated,'basis',v_basis);
END;
$$;

CREATE OR REPLACE FUNCTION public.proc_validate_lifecycle(p_po_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_po RECORD; v_pr RECORD; v_quote RECORD; v_grn RECORD; v_invoice RECORD; v_match RECORD;
  v_result JSONB;
BEGIN
  SELECT * INTO v_po FROM public.proc_purchase_orders WHERE id=p_po_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Purchase order % not found', p_po_id; END IF;
  SELECT * INTO v_pr FROM public.proc_purchase_requests WHERE id=v_po.purchase_request_id;
  SELECT * INTO v_quote FROM public.proc_vendor_quotes WHERE id=v_po.vendor_quote_id;
  SELECT * INTO v_grn FROM public.proc_goods_receipts WHERE purchase_order_id=p_po_id ORDER BY created_at DESC LIMIT 1;
  SELECT * INTO v_invoice FROM public.proc_payable_invoices WHERE purchase_order_id=p_po_id ORDER BY created_at DESC LIMIT 1;
  IF v_invoice.id IS NOT NULL THEN SELECT * INTO v_match FROM public.proc_three_way_matches WHERE payable_invoice_id=v_invoice.id; END IF;
  v_result := jsonb_build_object(
    'po', jsonb_build_object('id',v_po.id,'doc_number',v_po.doc_number,'status',v_po.status),
    'pr_approved', COALESCE(v_pr.status='APPROVED',false),
    'quote_selected', COALESCE(v_quote.is_selected,false),
    'po_approved', v_po.status='APPROVED',
    'grn_posted', COALESCE(v_grn.posting_status='POSTED',false),
    'invoice_present', v_invoice.id IS NOT NULL,
    'three_way_match_passed', COALESCE(v_match.status='PASSED',false),
    'ready_for_capitalization', v_po.status='APPROVED' AND COALESCE(v_grn.posting_status='POSTED',false) AND COALESCE(v_match.status='PASSED',false)
  );
  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.proc_finalize_purchase(p_purchase_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_purchase RECORD; v_grn RECORD; v_match RECORD; v_costs_unposted INTEGER;
BEGIN
  SELECT * INTO v_purchase FROM public.proc_purchases WHERE id=p_purchase_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Purchase % not found', p_purchase_id; END IF;
  SELECT * INTO v_grn FROM public.proc_goods_receipts WHERE id=v_purchase.goods_receipt_id;
  IF v_grn.id IS NULL OR v_grn.posting_status <> 'POSTED' THEN RAISE EXCEPTION 'GRN must be posted before purchase finalization'; END IF;
  IF v_purchase.payable_invoice_id IS NOT NULL THEN
    SELECT * INTO v_match FROM public.proc_three_way_matches WHERE payable_invoice_id=v_purchase.payable_invoice_id;
    IF v_match.id IS NULL OR v_match.status <> 'PASSED' THEN RAISE EXCEPTION 'Three-way match must pass before purchase finalization'; END IF;
  END IF;
  SELECT COUNT(*) INTO v_costs_unposted FROM public.proc_landed_costs lc WHERE lc.goods_receipt_id=v_purchase.goods_receipt_id AND lc.posting_status <> 'POSTED';
  IF v_costs_unposted > 0 THEN RAISE EXCEPTION 'All linked landed costs must be posted before purchase finalization'; END IF;
  UPDATE public.proc_purchases SET status='APPROVED',updated_at=NOW() WHERE id=p_purchase_id;
  RETURN jsonb_build_object('purchase_id',p_purchase_id,'status','APPROVED','ready_for_capitalization',true);
END;
$$;

GRANT SELECT, INSERT, UPDATE ON public.proc_three_way_matches TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON public.proc_landed_cost_allocations TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.proc_run_three_way_match(UUID, NUMERIC) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.proc_allocate_landed_cost(UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.proc_validate_lifecycle(UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.proc_finalize_purchase(UUID) TO anon, authenticated, service_role;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['proc_three_way_matches','proc_landed_cost_allocations'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=t AND policyname='allow_all_' || t
    ) THEN
      EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL USING (true) WITH CHECK (true)', 'allow_all_' || t, t);
    END IF;
    EXECUTE format('GRANT ALL ON TABLE public.%I TO anon, authenticated, service_role', t);
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON public.%I', t, t);
    EXECUTE format('CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.proc_set_updated_at()', t, t);
  END LOOP;
END $$;
