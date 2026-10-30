-- Procurement Phase 20: supplier performance, spend & delivery intelligence.
-- Read-only analytics. No procurement/accounting transaction is mutated.

CREATE OR REPLACE FUNCTION public.procurement_supplier_performance(
  p_days INTEGER DEFAULT 365,
  p_limit INTEGER DEFAULT 25,
  p_concentration_threshold NUMERIC DEFAULT 30
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_days INTEGER := GREATEST(30, LEAST(COALESCE(p_days,365),3650));
  v_limit INTEGER := GREATEST(5, LEAST(COALESCE(p_limit,25),100));
  v_concentration NUMERIC := GREATEST(1, LEAST(COALESCE(p_concentration_threshold,30),100));
  v_from DATE := CURRENT_DATE - v_days;
  v_total_spend NUMERIC := 0;
  v_vendor_count INTEGER := 0;
  v_approved_pos INTEGER := 0;
  v_quoted_count INTEGER := 0;
  v_selected_quotes INTEGER := 0;
  v_grn_count INTEGER := 0;
  v_otif_count INTEGER := 0;
  v_quality_ordered NUMERIC := 0;
  v_quality_accepted NUMERIC := 0;
  v_outstanding NUMERIC := 0;
  v_supplier_rows JSONB := '[]'::jsonb;
  v_concentration_rows JSONB := '[]'::jsonb;
BEGIN
  SELECT COALESCE(SUM(total_amount),0), COUNT(*)
    INTO v_total_spend, v_approved_pos
  FROM public.proc_purchase_orders
  WHERE status='APPROVED' AND order_date >= v_from;

  SELECT COUNT(DISTINCT vendor_id)
    INTO v_vendor_count
  FROM public.proc_purchase_orders
  WHERE status='APPROVED' AND order_date >= v_from;

  SELECT COUNT(*), COUNT(*) FILTER (WHERE is_selected)
    INTO v_quoted_count, v_selected_quotes
  FROM public.proc_vendor_quotes
  WHERE quote_date >= v_from;

  SELECT COUNT(*),
         COALESCE(SUM(gl.ordered_quantity),0),
         COALESCE(SUM(gl.accepted_quantity),0)
    INTO v_grn_count, v_quality_ordered, v_quality_accepted
  FROM public.proc_goods_receipts gr
  JOIN public.proc_grn_lines gl ON gl.goods_receipt_id=gr.id
  WHERE gr.receipt_date >= v_from
    AND gr.status <> 'CANCELLED';

  SELECT COUNT(*)
    INTO v_otif_count
  FROM public.proc_purchase_orders po
  JOIN public.proc_goods_receipts gr ON gr.purchase_order_id=po.id
  WHERE po.status='APPROVED'
    AND po.order_date >= v_from
    AND gr.status <> 'CANCELLED'
    AND gr.receipt_date <= COALESCE(po.expected_delivery_date, gr.receipt_date);

  SELECT COALESCE(SUM(GREATEST(total_amount-paid_amount,0)),0)
    INTO v_outstanding
  FROM public.proc_payable_invoices
  WHERE invoice_date >= v_from AND status <> 'CANCELLED';

  WITH po AS (
    SELECT vendor_id, COUNT(*) po_count, COALESCE(SUM(total_amount),0) spend,
           COALESCE(AVG(total_amount),0) avg_po
    FROM public.proc_purchase_orders
    WHERE status='APPROVED' AND order_date >= v_from
    GROUP BY vendor_id
  ), q AS (
    SELECT vendor_id, COUNT(*) quote_count,
           COUNT(*) FILTER (WHERE is_selected) selected_count
    FROM public.proc_vendor_quotes
    WHERE quote_date >= v_from
    GROUP BY vendor_id
  ), gr AS (
    SELECT po.vendor_id,
           COUNT(DISTINCT gr.id) grn_count,
           COALESCE(SUM(gl.ordered_quantity),0) ordered_qty,
           COALESCE(SUM(gl.accepted_quantity),0) accepted_qty,
           COUNT(DISTINCT gr.id) FILTER (WHERE gr.receipt_date <= COALESCE(po.expected_delivery_date,gr.receipt_date)) otif_count
    FROM public.proc_purchase_orders po
    JOIN public.proc_goods_receipts gr ON gr.purchase_order_id=po.id
    JOIN public.proc_grn_lines gl ON gl.goods_receipt_id=gr.id
    WHERE po.status='APPROVED' AND po.order_date >= v_from AND gr.status <> 'CANCELLED'
    GROUP BY po.vendor_id
  ), inv AS (
    SELECT vendor_id, COALESCE(SUM(GREATEST(total_amount-paid_amount,0)),0) outstanding
    FROM public.proc_payable_invoices
    WHERE invoice_date >= v_from AND status <> 'CANCELLED'
    GROUP BY vendor_id
  ), ranked AS (
    SELECT po.vendor_id, po.po_count, po.spend, po.avg_po,
           COALESCE(q.quote_count,0) quote_count, COALESCE(q.selected_count,0) selected_count,
           COALESCE(gr.grn_count,0) grn_count, COALESCE(gr.ordered_qty,0) ordered_qty,
           COALESCE(gr.accepted_qty,0) accepted_qty, COALESCE(gr.otif_count,0) otif_count,
           COALESCE(inv.outstanding,0) outstanding,
           CASE WHEN COALESCE(q.quote_count,0)>0 THEN ROUND(100*q.selected_count/q.quote_count,1) ELSE 0 END award_rate,
           CASE WHEN COALESCE(gr.grn_count,0)>0 THEN ROUND(100*gr.otif_count/gr.grn_count,1) ELSE 0 END otif_rate,
           CASE WHEN COALESCE(gr.ordered_qty,0)>0 THEN ROUND(100*gr.accepted_qty/gr.ordered_qty,1) ELSE 0 END acceptance_rate,
           CASE WHEN v_total_spend>0 THEN ROUND(100*po.spend/v_total_spend,1) ELSE 0 END spend_share
    FROM po
    LEFT JOIN q ON q.vendor_id=po.vendor_id
    LEFT JOIN gr ON gr.vendor_id=po.vendor_id
    LEFT JOIN inv ON inv.vendor_id=po.vendor_id
  )
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'vendor_id',r.vendor_id,
    'vendor_code',v.code,
    'vendor_name',v.name,
    'po_count',r.po_count,
    'spend',r.spend,
    'avg_po',r.avg_po,
    'quote_count',r.quote_count,
    'selected_quotes',r.selected_count,
    'award_rate',r.award_rate,
    'grn_count',r.grn_count,
    'otif_rate',r.otif_rate,
    'acceptance_rate',r.acceptance_rate,
    'outstanding',r.outstanding,
    'spend_share',r.spend_share,
    'concentration_flag',r.spend_share >= v_concentration,
    'performance_score',ROUND((0.40*r.otif_rate + 0.35*r.acceptance_rate + 0.25*LEAST(r.award_rate,100)),1)
  ) ORDER BY r.spend DESC), '[]'::jsonb)
  INTO v_supplier_rows
  FROM (SELECT * FROM ranked ORDER BY spend DESC LIMIT v_limit) r
  LEFT JOIN public.fin_vendors v ON v.id=r.vendor_id;

  WITH po AS (
    SELECT vendor_id, COALESCE(SUM(total_amount),0) spend
    FROM public.proc_purchase_orders
    WHERE status='APPROVED' AND order_date >= v_from
    GROUP BY vendor_id
  )
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'vendor_id',p.vendor_id,'vendor_name',v.name,'spend',p.spend,
    'spend_share',CASE WHEN v_total_spend>0 THEN ROUND(100*p.spend/v_total_spend,1) ELSE 0 END,
    'concentration_flag',CASE WHEN v_total_spend>0 THEN 100*p.spend/v_total_spend >= v_concentration ELSE false END
  ) ORDER BY p.spend DESC LIMIT 10),'[]'::jsonb)
  INTO v_concentration_rows
  FROM po p LEFT JOIN public.fin_vendors v ON v.id=p.vendor_id;

  RETURN jsonb_build_object(
    'suite','PROCUREMENT_SUPPLIER_PERFORMANCE',
    'period_days',v_days,
    'from_date',v_from,
    'generated_at',NOW(),
    'concentration_threshold',v_concentration,
    'kpis',jsonb_build_object(
      'total_spend',v_total_spend,
      'approved_pos',v_approved_pos,
      'supplier_count',v_vendor_count,
      'quote_count',v_quoted_count,
      'selected_quotes',v_selected_quotes,
      'quote_award_rate',CASE WHEN v_quoted_count>0 THEN ROUND(100*v_selected_quotes/v_quoted_count,1) ELSE 0 END,
      'grn_count',v_grn_count,
      'otif_rate',CASE WHEN v_grn_count>0 THEN ROUND(100*v_otif_count/v_grn_count,1) ELSE 0 END,
      'quality_acceptance_rate',CASE WHEN v_quality_ordered>0 THEN ROUND(100*v_quality_accepted/v_quality_ordered,1) ELSE 0 END,
      'outstanding_payables',v_outstanding
    ),
    'suppliers',v_supplier_rows,
    'concentration',v_concentration_rows,
    'methodology',jsonb_build_array(
      'Spend uses APPROVED purchase orders within the selected period.',
      'OTIF counts a GRN as on-time when receipt_date is on or before expected_delivery_date; POs without an expected date are treated as on-time for this operational metric.',
      'Quality acceptance rate is accepted GRN quantity divided by ordered GRN quantity.',
      'Award rate is selected vendor quotes divided by all vendor quotes in the period.',
      'Performance score weights OTIF 40%, quality acceptance 35% and quote award rate 25%.',
      'Concentration flags a supplier when its share of approved PO spend meets the configured threshold.'
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.procurement_supplier_performance(INTEGER,INTEGER,NUMERIC) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.procurement_supplier_performance(INTEGER,INTEGER,NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION public.procurement_supplier_performance(INTEGER,INTEGER,NUMERIC) TO service_role;
