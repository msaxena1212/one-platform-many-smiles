-- Procurement Phase 9: end-to-end UAT and transactional integrity automation.
-- Read-only UAT harness. It evaluates an existing procurement transaction without mutating data.

CREATE OR REPLACE FUNCTION public.proc_uat_validate_po(p_po_id UUID)
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
  v_reconcile JSONB;
  v_release JSONB;
  v_lifecycle JSONB;
  v_audit_count INTEGER := 0;
  v_tests JSONB := '[]'::jsonb;
  v_passed INTEGER := 0;
  v_failed INTEGER := 0;
  v_test BOOLEAN;
BEGIN
  SELECT * INTO v_po FROM public.proc_purchase_orders WHERE id = p_po_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Purchase order % not found', p_po_id;
  END IF;

  SELECT * INTO v_pr FROM public.proc_purchase_requests WHERE id = v_po.purchase_request_id;
  SELECT * INTO v_quote FROM public.proc_vendor_quotes WHERE id = v_po.vendor_quote_id;
  SELECT * INTO v_grn FROM public.proc_goods_receipts WHERE purchase_order_id = p_po_id ORDER BY created_at DESC LIMIT 1;
  SELECT * INTO v_invoice FROM public.proc_payable_invoices WHERE purchase_order_id = p_po_id ORDER BY created_at DESC LIMIT 1;
  SELECT * INTO v_purchase FROM public.proc_purchases WHERE purchase_order_id = p_po_id ORDER BY created_at DESC LIMIT 1;

  IF v_invoice.id IS NOT NULL THEN
    SELECT * INTO v_match FROM public.proc_three_way_matches WHERE payable_invoice_id = v_invoice.id;
  END IF;

  v_reconcile := public.proc_reconcile_po(p_po_id);
  v_release := public.proc_release_readiness(p_po_id);
  v_lifecycle := public.proc_validate_lifecycle(p_po_id);

  SELECT COUNT(*) INTO v_audit_count
  FROM public.proc_audit_log
  WHERE entity_table = 'proc_purchase_orders' AND entity_id = p_po_id;

  -- Each test is explicit so the UAT output can be consumed by CI, admin UI or audit tooling.
  v_test := v_pr.id IS NOT NULL AND v_pr.status = 'APPROVED';
  v_tests := v_tests || jsonb_build_array(jsonb_build_object('id','PR_APPROVED','passed',v_test,'detail',CASE WHEN v_test THEN 'Purchase Request approved' ELSE 'Purchase Request is missing or not approved' END));
  v_passed := v_passed + v_test::int; v_failed := v_failed + (NOT v_test)::int;

  v_test := v_quote.id IS NOT NULL AND v_quote.is_selected = TRUE;
  v_tests := v_tests || jsonb_build_array(jsonb_build_object('id','QUOTE_SELECTED','passed',v_test,'detail',CASE WHEN v_test THEN 'Selected vendor quote exists' ELSE 'Selected vendor quote is missing' END));
  v_passed := v_passed + v_test::int; v_failed := v_failed + (NOT v_test)::int;

  v_test := v_po.status = 'APPROVED';
  v_tests := v_tests || jsonb_build_array(jsonb_build_object('id','PO_APPROVED','passed',v_test,'detail',CASE WHEN v_test THEN 'Purchase Order approved' ELSE 'Purchase Order is not approved' END));
  v_passed := v_passed + v_test::int; v_failed := v_failed + (NOT v_test)::int;

  v_test := v_grn.id IS NOT NULL AND v_grn.posting_status = 'POSTED';
  v_tests := v_tests || jsonb_build_array(jsonb_build_object('id','GRN_POSTED','passed',v_test,'detail',CASE WHEN v_test THEN 'GRN exists and is posted' ELSE 'Posted GRN is missing' END));
  v_passed := v_passed + v_test::int; v_failed := v_failed + (NOT v_test)::int;

  v_test := v_invoice.id IS NOT NULL;
  v_tests := v_tests || jsonb_build_array(jsonb_build_object('id','AP_INVOICE_PRESENT','passed',v_test,'detail',CASE WHEN v_test THEN 'AP invoice exists' ELSE 'AP invoice is missing' END));
  v_passed := v_passed + v_test::int; v_failed := v_failed + (NOT v_test)::int;

  v_test := v_match.id IS NOT NULL AND v_match.status = 'PASSED';
  v_tests := v_tests || jsonb_build_array(jsonb_build_object('id','THREE_WAY_MATCH','passed',v_test,'detail',CASE WHEN v_test THEN 'Three-way match passed' ELSE 'Three-way match has not passed' END));
  v_passed := v_passed + v_test::int; v_failed := v_failed + (NOT v_test)::int;

  v_test := v_purchase.id IS NOT NULL;
  v_tests := v_tests || jsonb_build_array(jsonb_build_object('id','PURCHASE_CREATED','passed',v_test,'detail',CASE WHEN v_test THEN 'Purchase record exists' ELSE 'Purchase record is missing' END));
  v_passed := v_passed + v_test::int; v_failed := v_failed + (NOT v_test)::int;

  v_test := COALESCE((v_reconcile->>'reconciled')::boolean, FALSE);
  v_tests := v_tests || jsonb_build_array(jsonb_build_object('id','RECONCILIATION','passed',v_test,'detail',CASE WHEN v_test THEN 'PO reconciliation passed' ELSE COALESCE(v_reconcile->>'issues','Reconciliation failed') END));
  v_passed := v_passed + v_test::int; v_failed := v_failed + (NOT v_test)::int;

  v_test := COALESCE((v_release->>'ready')::boolean, FALSE);
  v_tests := v_tests || jsonb_build_array(jsonb_build_object('id','RELEASE_READINESS','passed',v_test,'detail',CASE WHEN v_test THEN 'Release readiness passed' ELSE COALESCE(v_release->>'issues','Release readiness failed') END));
  v_passed := v_passed + v_test::int; v_failed := v_failed + (NOT v_test)::int;

  v_test := COALESCE((v_lifecycle->>'ready_for_capitalization')::boolean, FALSE);
  v_tests := v_tests || jsonb_build_array(jsonb_build_object('id','LIFECYCLE_READY','passed',v_test,'detail',CASE WHEN v_test THEN 'Lifecycle validation passed' ELSE 'Lifecycle validation is incomplete' END));
  v_passed := v_passed + v_test::int; v_failed := v_failed + (NOT v_test)::int;

  v_test := v_audit_count > 0;
  v_tests := v_tests || jsonb_build_array(jsonb_build_object('id','AUDIT_TRAIL','passed',v_test,'detail',CASE WHEN v_test THEN format('%s PO audit records found',v_audit_count) ELSE 'No PO audit records found' END));
  v_passed := v_passed + v_test::int; v_failed := v_failed + (NOT v_test)::int;

  RETURN jsonb_build_object(
    'suite','PROCUREMENT_E2E_UAT',
    'po_id',p_po_id,
    'po_number',v_po.doc_number,
    'passed',v_failed = 0,
    'test_count',v_passed + v_failed,
    'passed_count',v_passed,
    'failed_count',v_failed,
    'tests',v_tests,
    'reconciliation',v_reconcile,
    'release_readiness',v_release,
    'lifecycle',v_lifecycle,
    'generated_at',NOW()
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.proc_uat_dashboard(p_limit INTEGER DEFAULT 25)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_results JSONB := '[]'::jsonb;
  v_po RECORD;
  v_suite JSONB;
  v_total INTEGER := 0;
  v_passed INTEGER := 0;
  v_failed INTEGER := 0;
BEGIN
  FOR v_po IN
    SELECT id, doc_number
    FROM public.proc_purchase_orders
    WHERE status NOT IN ('CANCELLED','REJECTED')
    ORDER BY created_at DESC
    LIMIT GREATEST(1, LEAST(COALESCE(p_limit,25),100))
  LOOP
    v_suite := public.proc_uat_validate_po(v_po.id);
    v_total := v_total + 1;
    IF COALESCE((v_suite->>'passed')::boolean,FALSE) THEN v_passed := v_passed + 1; ELSE v_failed := v_failed + 1; END IF;
    v_results := v_results || jsonb_build_array(jsonb_build_object(
      'po_id',v_po.id,
      'po_number',v_po.doc_number,
      'passed',v_suite->'passed',
      'passed_count',v_suite->'passed_count',
      'failed_count',v_suite->'failed_count'
    ));
  END LOOP;

  RETURN jsonb_build_object(
    'suite','PROCUREMENT_E2E_UAT_DASHBOARD',
    'purchase_orders_checked',v_total,
    'passed_purchase_orders',v_passed,
    'failed_purchase_orders',v_failed,
    'all_passed',v_total > 0 AND v_failed = 0,
    'results',v_results,
    'generated_at',NOW()
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.proc_uat_validate_po(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.proc_uat_dashboard(INTEGER) TO authenticated, service_role;
