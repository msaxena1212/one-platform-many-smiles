-- Procurement Phase 12: analytics, SLA monitoring and management reporting.
-- Read-only reporting layer. No procurement or accounting transactions are mutated.

CREATE OR REPLACE FUNCTION public.proc_analytics_dashboard(
  p_days INTEGER DEFAULT 90,
  p_limit INTEGER DEFAULT 20
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_days INTEGER := GREATEST(1, LEAST(COALESCE(p_days,90),3650));
  v_limit INTEGER := GREATEST(5, LEAST(COALESCE(p_limit,20),100));
  v_from TIMESTAMPTZ := now() - make_interval(days => v_days);
  v_total_spend NUMERIC := 0;
  v_po_count INTEGER := 0;
  v_open_po_count INTEGER := 0;
  v_overdue_po_count INTEGER := 0;
  v_grn_count INTEGER := 0;
  v_invoice_count INTEGER := 0;
  v_exception_count INTEGER := 0;
  v_open_exception_count INTEGER := 0;
  v_avg_pr_to_po NUMERIC := 0;
  v_avg_po_to_grn NUMERIC := 0;
  v_avg_po_to_ap NUMERIC := 0;
  v_avg_exception_age NUMERIC := 0;
  v_sla_pr_to_po INTEGER := 3;
  v_sla_po_to_grn INTEGER := 7;
  v_sla_po_to_ap INTEGER := 10;
  v_sla_exception INTEGER := 2;
  v_spend_by_month JSONB := '[]'::jsonb;
  v_vendor_performance JSONB := '[]'::jsonb;
  v_overdue_pos JSONB := '[]'::jsonb;
  v_exceptions JSONB := '[]'::jsonb;
BEGIN
  SELECT COALESCE(SUM(total_amount),0), COUNT(*)
    INTO v_total_spend, v_po_count
  FROM public.proc_purchase_orders
  WHERE created_at >= v_from
    AND status NOT IN ('CANCELLED','REJECTED');

  SELECT COUNT(*) INTO v_open_po_count
  FROM public.proc_purchase_orders
  WHERE status NOT IN ('CANCELLED','REJECTED','CLOSED');

  SELECT COUNT(*) INTO v_overdue_po_count
  FROM public.proc_purchase_orders
  WHERE status NOT IN ('CANCELLED','REJECTED','CLOSED')
    AND expected_delivery_date IS NOT NULL
    AND expected_delivery_date < CURRENT_DATE;

  SELECT COUNT(*) INTO v_grn_count
  FROM public.proc_goods_receipts WHERE created_at >= v_from;
  SELECT COUNT(*) INTO v_invoice_count
  FROM public.proc_payable_invoices WHERE created_at >= v_from;

  SELECT COUNT(*), COUNT(*) FILTER (WHERE status <> 'RESOLVED')
    INTO v_exception_count, v_open_exception_count
  FROM public.proc_exception_resolutions
  WHERE created_at >= v_from;

  SELECT COALESCE(ROUND(AVG(EXTRACT(EPOCH FROM (po.created_at - pr.created_at))/86400.0)::numeric,2),0)
    INTO v_avg_pr_to_po
  FROM public.proc_purchase_orders po
  JOIN public.proc_purchase_requests pr ON pr.id = po.purchase_request_id
  WHERE po.created_at >= v_from AND po.created_at >= pr.created_at;

  SELECT COALESCE(ROUND(AVG(EXTRACT(EPOCH FROM (grn.created_at - po.created_at))/86400.0)::numeric,2),0)
    INTO v_avg_po_to_grn
  FROM public.proc_goods_receipts grn
  JOIN public.proc_purchase_orders po ON po.id = grn.purchase_order_id
  WHERE grn.created_at >= v_from AND grn.created_at >= po.created_at;

  SELECT COALESCE(ROUND(AVG(EXTRACT(EPOCH FROM (inv.created_at - po.created_at))/86400.0)::numeric,2),0)
    INTO v_avg_po_to_ap
  FROM public.proc_payable_invoices inv
  JOIN public.proc_purchase_orders po ON po.id = inv.purchase_order_id
  WHERE inv.created_at >= v_from AND inv.created_at >= po.created_at;

  SELECT COALESCE(ROUND(AVG(EXTRACT(EPOCH FROM (now() - created_at))/86400.0)::numeric,2),0)
    INTO v_avg_exception_age
  FROM public.proc_exception_resolutions
  WHERE status <> 'RESOLVED' AND created_at >= v_from;

  SELECT COALESCE(jsonb_agg(to_jsonb(x) ORDER BY x.month), '[]'::jsonb)
    INTO v_spend_by_month
  FROM (
    SELECT to_char(date_trunc('month', created_at),'YYYY-MM') AS month,
           ROUND(SUM(total_amount),2) AS spend,
           COUNT(*) AS po_count
    FROM public.proc_purchase_orders
    WHERE created_at >= v_from AND status NOT IN ('CANCELLED','REJECTED')
    GROUP BY date_trunc('month', created_at)
  ) x;

  SELECT COALESCE(jsonb_agg(to_jsonb(x) ORDER BY x.spend DESC), '[]'::jsonb)
    INTO v_vendor_performance
  FROM (
    SELECT po.vendor_id,
           ROUND(SUM(po.total_amount),2) AS spend,
           COUNT(*) AS po_count,
           COUNT(*) FILTER (WHERE po.status IN ('CLOSED')) AS completed_po_count,
           COUNT(*) FILTER (WHERE po.status NOT IN ('CANCELLED','REJECTED','CLOSED')
                              AND po.expected_delivery_date < CURRENT_DATE) AS overdue_po_count,
           ROUND(AVG(CASE WHEN po.expected_delivery_date IS NOT NULL AND po.expected_delivery_date >= po.order_date
                          THEN (po.expected_delivery_date - po.order_date)::numeric END),2) AS planned_delivery_days
    FROM public.proc_purchase_orders po
    WHERE po.created_at >= v_from AND po.status NOT IN ('CANCELLED','REJECTED')
    GROUP BY po.vendor_id
    ORDER BY SUM(po.total_amount) DESC
    LIMIT v_limit
  ) x;

  SELECT COALESCE(jsonb_agg(to_jsonb(x) ORDER BY x.days_overdue DESC), '[]'::jsonb)
    INTO v_overdue_pos
  FROM (
    SELECT po.id AS po_id, po.doc_number AS po_number, po.vendor_id,
           po.total_amount, po.expected_delivery_date,
           (CURRENT_DATE - po.expected_delivery_date) AS days_overdue
    FROM public.proc_purchase_orders po
    WHERE po.status NOT IN ('CANCELLED','REJECTED','CLOSED')
      AND po.expected_delivery_date IS NOT NULL
      AND po.expected_delivery_date < CURRENT_DATE
    ORDER BY (CURRENT_DATE - po.expected_delivery_date) DESC
    LIMIT v_limit
  ) x;

  SELECT COALESCE(jsonb_agg(to_jsonb(x) ORDER BY x.age_days DESC), '[]'::jsonb)
    INTO v_exceptions
  FROM (
    SELECT exception_key, source_number, control_id, severity, status,
           ROUND(EXTRACT(EPOCH FROM (now() - created_at))/86400.0,1) AS age_days,
           resolution_notes
    FROM public.proc_exception_resolutions
    WHERE status <> 'RESOLVED' AND created_at >= v_from
    ORDER BY now() - created_at DESC
    LIMIT v_limit
  ) x;

  RETURN jsonb_build_object(
    'suite','PROCUREMENT_ANALYTICS_DASHBOARD',
    'period_days',v_days,
    'from_timestamp',v_from,
    'generated_at',now(),
    'kpis',jsonb_build_object(
      'total_spend',v_total_spend,
      'po_count',v_po_count,
      'open_po_count',v_open_po_count,
      'overdue_po_count',v_overdue_po_count,
      'grn_count',v_grn_count,
      'invoice_count',v_invoice_count,
      'exception_count',v_exception_count,
      'open_exception_count',v_open_exception_count
    ),
    'cycle_times',jsonb_build_object(
      'avg_pr_to_po_days',v_avg_pr_to_po,
      'avg_po_to_grn_days',v_avg_po_to_grn,
      'avg_po_to_ap_days',v_avg_po_to_ap
    ),
    'sla',jsonb_build_object(
      'pr_to_po_days',v_sla_pr_to_po,
      'po_to_grn_days',v_sla_po_to_grn,
      'po_to_ap_days',v_sla_po_to_ap,
      'exception_resolution_days',v_sla_exception
    ),
    'exception_age',jsonb_build_object('avg_open_exception_age_days',v_avg_exception_age),
    'spend_by_month',v_spend_by_month,
    'vendor_performance',v_vendor_performance,
    'overdue_purchase_orders',v_overdue_pos,
    'open_exceptions',v_exceptions
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.proc_analytics_dashboard(INTEGER,INTEGER) TO authenticated, service_role;
