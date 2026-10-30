-- Procurement Phase 6: reconciliation, audit trail and exception detection.

CREATE TABLE IF NOT EXISTS public.proc_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_table TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE')),
  old_row JSONB,
  new_row JSONB,
  changed_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  actor_user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proc_audit_entity ON public.proc_audit_log(entity_table, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_proc_audit_actor ON public.proc_audit_log(actor_user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.proc_audit_row_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old JSONB := CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN to_jsonb(OLD) ELSE NULL END;
  v_new JSONB := CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN to_jsonb(NEW) ELSE NULL END;
  v_id UUID := COALESCE((v_new->>'id')::uuid, (v_old->>'id')::uuid);
  v_changed JSONB := '[]'::jsonb;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    SELECT COALESCE(jsonb_agg(k ORDER BY k), '[]'::jsonb)
      INTO v_changed
    FROM (
      SELECT key AS k
      FROM jsonb_each(v_old) o
      FULL JOIN jsonb_each(v_new) n USING (key)
      WHERE o.value IS DISTINCT FROM n.value
    ) d;
  END IF;

  INSERT INTO public.proc_audit_log(entity_table, entity_id, action, old_row, new_row, changed_fields, actor_user_id)
  VALUES (TG_TABLE_NAME, v_id, TG_OP, v_old, v_new, v_changed, auth.uid());
  RETURN COALESCE(NEW, OLD);
END;
$$;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'proc_purchase_requests','proc_rfx','proc_vendor_quotes','proc_purchase_orders',
    'proc_shipments','proc_gate_inwards','proc_goods_receipts','proc_landed_costs',
    'proc_payable_invoices','proc_purchases'
  ] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%s_audit ON public.%I', t, t);
    EXECUTE format('CREATE TRIGGER trg_%s_audit AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.proc_audit_row_change()', t, t);
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.proc_reconcile_po(p_po_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_po RECORD;
  v_quote RECORD;
  v_grn RECORD;
  v_invoice RECORD;
  v_purchase RECORD;
  v_po_amount NUMERIC(18,2) := 0;
  v_grn_amount NUMERIC(18,2) := 0;
  v_invoice_amount NUMERIC(18,2) := 0;
  v_landed_amount NUMERIC(18,2) := 0;
  v_allocated_amount NUMERIC(18,2) := 0;
  v_purchase_amount NUMERIC(18,2) := 0;
  v_issues JSONB := '[]'::jsonb;
  v_event_count INTEGER := 0;
  v_posted_event_count INTEGER := 0;
BEGIN
  SELECT * INTO v_po FROM public.proc_purchase_orders WHERE id = p_po_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Purchase order % not found', p_po_id; END IF;

  SELECT * INTO v_quote FROM public.proc_vendor_quotes WHERE id = v_po.vendor_quote_id;
  SELECT * INTO v_grn FROM public.proc_goods_receipts WHERE purchase_order_id = p_po_id ORDER BY created_at DESC LIMIT 1;
  SELECT * INTO v_invoice FROM public.proc_payable_invoices WHERE purchase_order_id = p_po_id ORDER BY created_at DESC LIMIT 1;
  SELECT * INTO v_purchase FROM public.proc_purchases WHERE purchase_order_id = p_po_id ORDER BY created_at DESC LIMIT 1;

  SELECT COALESCE(SUM(line_total),0) INTO v_po_amount FROM public.proc_po_lines WHERE purchase_order_id = p_po_id;
  IF v_grn.id IS NOT NULL THEN
    SELECT COALESCE(SUM(line_total),0) INTO v_grn_amount FROM public.proc_grn_lines WHERE goods_receipt_id = v_grn.id;
  END IF;
  IF v_invoice.id IS NOT NULL THEN v_invoice_amount := COALESCE(v_invoice.subtotal,0); END IF;
  SELECT COALESCE(SUM(amount),0) INTO v_landed_amount FROM public.proc_landed_costs WHERE purchase_order_id = p_po_id AND posting_status = 'POSTED';
  IF v_purchase.id IS NOT NULL THEN
    SELECT COALESCE(SUM(total_amount),0) INTO v_purchase_amount FROM public.proc_purchase_lines WHERE purchase_id = v_purchase.id;
    SELECT COALESCE(SUM(a.allocated_amount),0) INTO v_allocated_amount
      FROM public.proc_landed_cost_allocations a
      JOIN public.proc_landed_costs lc ON lc.id = a.landed_cost_id
      JOIN public.proc_purchase_lines pl ON pl.id = a.purchase_line_id
      WHERE pl.purchase_id = v_purchase.id AND lc.posting_status = 'POSTED';
  END IF;

  SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'POSTED')
    INTO v_event_count, v_posted_event_count
  FROM public.fin_accounting_events
  WHERE source_id IN (
    p_po_id,
    COALESCE(v_grn.id, p_po_id),
    COALESCE(v_invoice.id, p_po_id),
    COALESCE(v_purchase.id, p_po_id)
  )
  AND source_type IN ('GRN','AP_INVOICE','PURCHASE_CAPITALIZATION');

  IF v_quote.id IS NULL OR NOT COALESCE(v_quote.is_selected,false) THEN
    v_issues := v_issues || jsonb_build_array('Selected vendor quote is missing.');
  END IF;
  IF v_po.status <> 'APPROVED' THEN
    v_issues := v_issues || jsonb_build_array('Purchase order is not approved.');
  END IF;
  IF v_grn.id IS NULL THEN
    v_issues := v_issues || jsonb_build_array('No GRN exists for this purchase order.');
  ELSIF v_grn.posting_status <> 'POSTED' THEN
    v_issues := v_issues || jsonb_build_array('Latest GRN is not posted.');
  END IF;
  IF v_grn.id IS NOT NULL AND abs(v_po_amount - v_grn_amount) > 0.01 THEN
    v_issues := v_issues || jsonb_build_array(format('PO/GRN amount variance is %s.', round(v_po_amount - v_grn_amount,2)));
  END IF;
  IF v_invoice.id IS NOT NULL AND abs(v_grn_amount - v_invoice_amount) > 0.01 THEN
    v_issues := v_issues || jsonb_build_array(format('GRN/AP subtotal variance is %s.', round(v_grn_amount - v_invoice_amount,2)));
  END IF;
  IF v_invoice.id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.proc_three_way_matches m WHERE m.payable_invoice_id=v_invoice.id AND m.status='PASSED') THEN
      v_issues := v_issues || jsonb_build_array('Latest AP invoice has no passed three-way match.');
    END IF;
  END IF;
  IF v_purchase.id IS NOT NULL AND v_landed_amount <> v_allocated_amount THEN
    v_issues := v_issues || jsonb_build_array(format('Posted landed cost allocation variance is %s.', round(v_landed_amount-v_allocated_amount,2)));
  END IF;
  IF v_purchase.id IS NOT NULL AND v_purchase.total_amount <> v_purchase_amount THEN
    v_issues := v_issues || jsonb_build_array('Purchase header total does not equal purchase-line total.');
  END IF;
  IF v_event_count > 0 AND v_posted_event_count < v_event_count THEN
    v_issues := v_issues || jsonb_build_array('One or more procurement accounting events are not posted.');
  END IF;

  RETURN jsonb_build_object(
    'po_id', p_po_id,
    'po_number', v_po.doc_number,
    'po_amount', v_po_amount,
    'grn_amount', v_grn_amount,
    'invoice_subtotal', v_invoice_amount,
    'posted_landed_cost', v_landed_amount,
    'allocated_landed_cost', v_allocated_amount,
    'purchase_amount', v_purchase_amount,
    'accounting_event_count', v_event_count,
    'posted_accounting_event_count', v_posted_event_count,
    'issue_count', jsonb_array_length(v_issues),
    'issues', v_issues,
    'reconciled', jsonb_array_length(v_issues) = 0
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.proc_get_audit_log(p_entity_table TEXT, p_entity_id UUID, p_limit INTEGER DEFAULT 50)
RETURNS SETOF public.proc_audit_log
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.proc_audit_log
  WHERE entity_table = p_entity_table AND entity_id = p_entity_id
  ORDER BY created_at DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit,50),200));
$$;

GRANT EXECUTE ON FUNCTION public.proc_reconcile_po(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.proc_get_audit_log(TEXT, UUID, INTEGER) TO authenticated;
GRANT SELECT ON public.proc_audit_log TO authenticated;
