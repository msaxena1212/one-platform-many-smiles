-- Procurement Phase 8: operational health, exception visibility and release monitoring.
-- Read-only controls; does not mutate procurement or accounting data.

CREATE OR REPLACE FUNCTION public.proc_operational_health()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_open_pr INTEGER;
  v_open_rfx INTEGER;
  v_open_quotes INTEGER;
  v_open_pos INTEGER;
  v_open_shipments INTEGER;
  v_open_grns INTEGER;
  v_unposted_costs INTEGER;
  v_unposted_invoices INTEGER;
  v_unfinalized_purchases INTEGER;
  v_failed_matches INTEGER;
  v_exception_pos JSONB := '[]'::jsonb;
BEGIN
  SELECT COUNT(*) INTO v_open_pr FROM public.proc_purchase_requests WHERE status IN ('DRAFT','SUBMITTED');
  SELECT COUNT(*) INTO v_open_rfx FROM public.proc_rfx WHERE status IN ('DRAFT','SUBMITTED');
  SELECT COUNT(*) INTO v_open_quotes FROM public.proc_vendor_quotes WHERE status IN ('DRAFT','SUBMITTED');
  SELECT COUNT(*) INTO v_open_pos FROM public.proc_purchase_orders WHERE status IN ('DRAFT','SUBMITTED','APPROVED');
  SELECT COUNT(*) INTO v_open_shipments FROM public.proc_shipments WHERE status <> 'DELIVERED';
  SELECT COUNT(*) INTO v_open_grns FROM public.proc_goods_receipts WHERE posting_status <> 'POSTED';
  SELECT COUNT(*) INTO v_unposted_costs FROM public.proc_landed_costs WHERE posting_status <> 'POSTED';
  SELECT COUNT(*) INTO v_unposted_invoices FROM public.proc_payable_invoices WHERE posting_status <> 'POSTED';
  SELECT COUNT(*) INTO v_unfinalized_purchases FROM public.proc_purchases WHERE status <> 'APPROVED';
  SELECT COUNT(*) INTO v_failed_matches FROM public.proc_three_way_matches WHERE status = 'FAILED';

  SELECT COALESCE(jsonb_agg(x ORDER BY x->>'doc_number'), '[]'::jsonb)
  INTO v_exception_pos
  FROM (
    SELECT jsonb_build_object(
      'po_id', po.id,
      'doc_number', po.doc_number,
      'status', po.status,
      'posting_status', po.posting_status,
      'exception', CASE
        WHEN po.status <> 'APPROVED' THEN 'PO_NOT_APPROVED'
        WHEN NOT EXISTS (SELECT 1 FROM public.proc_goods_receipts g WHERE g.purchase_order_id = po.id AND g.posting_status = 'POSTED') THEN 'GRN_NOT_POSTED'
        WHEN NOT EXISTS (SELECT 1 FROM public.proc_payable_invoices i WHERE i.purchase_order_id = po.id AND i.posting_status = 'POSTED') THEN 'AP_INVOICE_NOT_POSTED'
        ELSE 'REQUIRES_RELEASE_CHECK'
      END
    ) AS x
    FROM public.proc_purchase_orders po
    WHERE po.status NOT IN ('CANCELLED','REJECTED')
      AND (
        po.status <> 'APPROVED'
        OR NOT EXISTS (SELECT 1 FROM public.proc_goods_receipts g WHERE g.purchase_order_id = po.id AND g.posting_status = 'POSTED')
        OR NOT EXISTS (SELECT 1 FROM public.proc_payable_invoices i WHERE i.purchase_order_id = po.id AND i.posting_status = 'POSTED')
      )
    LIMIT 50
  ) q;

  RETURN jsonb_build_object(
    'ready', v_failed_matches = 0 AND v_unposted_costs = 0,
    'generated_at', NOW(),
    'counts', jsonb_build_object(
      'open_purchase_requests', v_open_pr,
      'open_rfx', v_open_rfx,
      'open_vendor_quotes', v_open_quotes,
      'open_purchase_orders', v_open_pos,
      'open_shipments', v_open_shipments,
      'unposted_grns', v_open_grns,
      'unposted_landed_costs', v_unposted_costs,
      'unposted_ap_invoices', v_unposted_invoices,
      'unfinalized_purchases', v_unfinalized_purchases,
      'failed_three_way_matches', v_failed_matches
    ),
    'exception_purchase_orders', v_exception_pos
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.proc_operational_health() TO authenticated;
