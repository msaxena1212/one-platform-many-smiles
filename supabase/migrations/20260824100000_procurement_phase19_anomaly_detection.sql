-- Procurement Phase 19: deterministic procurement anomaly detection & predictive-control signals.
-- Read-only and explainable. Signals are investigation prompts, not proof of misconduct.

CREATE OR REPLACE FUNCTION public.procurement_anomaly_intelligence(
  p_days INTEGER DEFAULT 90,
  p_limit INTEGER DEFAULT 50,
  p_high_value_threshold NUMERIC DEFAULT 100000
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_days INTEGER := GREATEST(7, LEAST(COALESCE(p_days,90),3650));
  v_limit INTEGER := GREATEST(10, LEAST(COALESCE(p_limit,50),200));
  v_threshold NUMERIC := GREATEST(COALESCE(p_high_value_threshold,100000),0);
  v_from TIMESTAMPTZ := NOW() - make_interval(days => v_days);
  v_anomalies INTEGER := 0;
  v_critical INTEGER := 0;
  v_high INTEGER := 0;
  v_medium INTEGER := 0;
  v_duplicate INTEGER := 0;
  v_price INTEGER := 0;
  v_split INTEGER := 0;
  v_unusual INTEGER := 0;
  v_after_hours INTEGER := 0;
  v_frequency INTEGER := 0;
  v_cases JSONB := '[]'::jsonb;
  v_recommendations JSONB := '[]'::jsonb;
  v_score INTEGER := 0;
BEGIN
  -- Exact/near duplicate approved POs: same vendor and amount within a 7-day window.
  WITH x AS (
    SELECT a.id, a.doc_number, a.vendor_id, a.total_amount, a.order_date,
           COUNT(b.id) AS peer_count
    FROM public.proc_purchase_orders a
    JOIN public.proc_purchase_orders b
      ON b.id <> a.id
     AND b.vendor_id = a.vendor_id
     AND b.total_amount = a.total_amount
     AND b.order_date BETWEEN a.order_date - 7 AND a.order_date + 7
     AND b.status='APPROVED'
    WHERE a.created_at >= v_from AND a.status='APPROVED'
    GROUP BY a.id,a.doc_number,a.vendor_id,a.total_amount,a.order_date
  )
  SELECT COUNT(*) INTO v_duplicate FROM x;

  -- PO vs selected vendor quote variance above 10%.
  SELECT COUNT(*) INTO v_price
  FROM public.proc_purchase_orders po
  JOIN public.proc_vendor_quotes q ON q.id=po.vendor_quote_id
  WHERE po.created_at>=v_from
    AND po.status='APPROVED'
    AND q.total_amount > 0
    AND ABS(po.total_amount-q.total_amount)/q.total_amount > 0.10;

  -- Split-PO heuristic: multiple same-vendor POs on the same day/cost center,
  -- each below the high-value threshold but collectively above it.
  SELECT COUNT(*) INTO v_split
  FROM (
    SELECT vendor_id, cost_center_id, order_date,
           COUNT(*) AS po_count, SUM(total_amount) AS combined_amount
    FROM public.proc_purchase_orders
    WHERE created_at>=v_from AND status='APPROVED'
      AND total_amount < NULLIF(v_threshold,0)
    GROUP BY vendor_id,cost_center_id,order_date
    HAVING COUNT(*) >= 2 AND SUM(total_amount) >= v_threshold
  ) x;

  -- Unusual amount: approved PO is >2x the vendor's historical average amount
  -- over the preceding period and has at least one historical peer.
  SELECT COUNT(*) INTO v_unusual
  FROM public.proc_purchase_orders po
  WHERE po.created_at>=v_from AND po.status='APPROVED'
    AND EXISTS (
      SELECT 1
      FROM public.proc_purchase_orders h
      WHERE h.vendor_id=po.vendor_id AND h.status='APPROVED'
        AND h.order_date < po.order_date
        AND h.order_date >= po.order_date - v_days
      GROUP BY h.vendor_id
      HAVING po.total_amount > 2 * AVG(h.total_amount)
    );

  -- Approval actions recorded outside the documented 08:00-20:00 UTC operating window.
  SELECT COUNT(*) INTO v_after_hours
  FROM public.proc_approval_actions a
  WHERE a.created_at>=v_from
    AND a.action='APPROVED'
    AND (EXTRACT(HOUR FROM a.created_at) < 8 OR EXTRACT(HOUR FROM a.created_at) >= 20);

  -- Frequency anomaly: vendor receives >=4 approved POs on one day.
  SELECT COUNT(*) INTO v_frequency
  FROM (
    SELECT vendor_id, order_date, COUNT(*) po_count
    FROM public.proc_purchase_orders
    WHERE created_at>=v_from AND status='APPROVED'
    GROUP BY vendor_id,order_date
    HAVING COUNT(*) >= 4
  ) x;

  v_anomalies := v_duplicate+v_price+v_split+v_unusual+v_after_hours+v_frequency;
  v_critical := LEAST(v_split,5);
  v_high := LEAST(v_duplicate,10)+LEAST(v_price,10)+LEAST(v_unusual,10);
  v_medium := LEAST(v_after_hours,10)+LEAST(v_frequency,10);
  v_score := LEAST(100, v_critical*15 + v_high*6 + v_medium*3);

  -- Build explainable cases, capped for UI consumption.
  SELECT COALESCE(jsonb_agg(to_jsonb(x) ORDER BY x.severity_rank DESC, x.detected_at DESC), '[]'::jsonb)
  INTO v_cases
  FROM (
    SELECT * FROM (
      SELECT po.id::text AS reference_id, po.doc_number AS reference_number, 'DUPLICATE_PO' AS code,
        CASE WHEN po.total_amount>=v_threshold THEN 'HIGH' ELSE 'MEDIUM' END AS severity,
        CASE WHEN po.total_amount>=v_threshold THEN 3 ELSE 2 END AS severity_rank,
        'Approved PO matches another approved PO for the same vendor and amount within 7 days.' AS reason,
        po.vendor_id::text AS vendor_id, po.total_amount, po.created_at AS detected_at
      FROM public.proc_purchase_orders po
      WHERE po.created_at>=v_from AND po.status='APPROVED'
        AND EXISTS (SELECT 1 FROM public.proc_purchase_orders p2 WHERE p2.id<>po.id AND p2.vendor_id=po.vendor_id AND p2.total_amount=po.total_amount AND p2.status='APPROVED' AND p2.order_date BETWEEN po.order_date-7 AND po.order_date+7)
      UNION ALL
      SELECT po.id::text, po.doc_number, 'PRICE_VARIANCE', 'HIGH', 3,
        'PO total differs from the linked vendor quote by more than 10%.', po.vendor_id::text, po.total_amount, po.created_at
      FROM public.proc_purchase_orders po JOIN public.proc_vendor_quotes q ON q.id=po.vendor_quote_id
      WHERE po.created_at>=v_from AND po.status='APPROVED' AND q.total_amount>0 AND ABS(po.total_amount-q.total_amount)/q.total_amount>0.10
      UNION ALL
      SELECT po.id::text, po.doc_number, 'UNUSUAL_PO_AMOUNT', 'HIGH', 3,
        'Approved PO is more than 2x the vendor historical average for the selected baseline period.', po.vendor_id::text, po.total_amount, po.created_at
      FROM public.proc_purchase_orders po
      WHERE po.created_at>=v_from AND po.status='APPROVED' AND EXISTS (
        SELECT 1 FROM public.proc_purchase_orders h WHERE h.vendor_id=po.vendor_id AND h.status='APPROVED' AND h.order_date<po.order_date AND h.order_date>=po.order_date-v_days GROUP BY h.vendor_id HAVING po.total_amount>2*AVG(h.total_amount)
      )
      UNION ALL
      SELECT po.id::text, po.doc_number, 'SPLIT_PO', 'CRITICAL', 4,
        'Same vendor/cost-center has multiple same-day POs below the threshold whose combined value reaches the threshold.', po.vendor_id::text, po.total_amount, po.created_at
      FROM public.proc_purchase_orders po
      WHERE po.created_at>=v_from AND po.status='APPROVED' AND po.total_amount<v_threshold AND EXISTS (
        SELECT 1 FROM public.proc_purchase_orders s WHERE s.vendor_id=po.vendor_id AND s.cost_center_id IS NOT DISTINCT FROM po.cost_center_id AND s.order_date=po.order_date AND s.id<>po.id AND s.status='APPROVED' AND s.total_amount<v_threshold
        GROUP BY s.vendor_id,s.cost_center_id,s.order_date HAVING SUM(s.total_amount)+po.total_amount>=v_threshold
      )
      UNION ALL
      SELECT r.id::text, r.id::text, 'AFTER_HOURS_APPROVAL', 'MEDIUM', 2,
        'Approval action was recorded outside the documented 08:00-20:00 UTC operating window.', NULL, NULL, a.created_at
      FROM public.proc_approval_actions a JOIN public.proc_approval_requests r ON r.id=a.request_id
      WHERE a.created_at>=v_from AND a.action='APPROVED' AND (EXTRACT(HOUR FROM a.created_at)<8 OR EXTRACT(HOUR FROM a.created_at)>=20)
      UNION ALL
      SELECT po.id::text, po.doc_number, 'VENDOR_FREQUENCY', 'MEDIUM', 2,
        'Vendor has four or more approved POs on the same order date.', po.vendor_id::text, po.total_amount, po.created_at
      FROM public.proc_purchase_orders po
      WHERE po.created_at>=v_from AND po.status='APPROVED' AND EXISTS (
        SELECT 1 FROM public.proc_purchase_orders f WHERE f.vendor_id=po.vendor_id AND f.order_date=po.order_date AND f.status='APPROVED' GROUP BY f.vendor_id,f.order_date HAVING COUNT(*)>=4
      )
    ) cases
    LIMIT v_limit
  ) x;

  IF v_split>0 THEN v_recommendations := v_recommendations || jsonb_build_array('Review same-day POs for the same vendor/cost center and verify that purchases were not intentionally split around an approval threshold.'); END IF;
  IF v_duplicate>0 THEN v_recommendations := v_recommendations || jsonb_build_array('Compare flagged duplicate POs against receiving, invoice and business-need records before treating them as separate purchases.'); END IF;
  IF v_price>0 THEN v_recommendations := v_recommendations || jsonb_build_array('Reconcile PO totals to the selected vendor quote and document any approved commercial change or negotiation round.'); END IF;
  IF v_unusual>0 THEN v_recommendations := v_recommendations || jsonb_build_array('Review large deviations from vendor historical purchasing levels and confirm business justification.'); END IF;
  IF v_after_hours>0 THEN v_recommendations := v_recommendations || jsonb_build_array('Validate after-hours approval events against delegation, emergency procurement and timezone policy.'); END IF;
  IF v_frequency>0 THEN v_recommendations := v_recommendations || jsonb_build_array('Review high-frequency vendor ordering for operational demand, project batching or possible purchase fragmentation.'); END IF;
  IF jsonb_array_length(v_recommendations)=0 THEN v_recommendations := jsonb_build_array('No material deterministic procurement anomalies were detected for the selected period. Continue baseline monitoring.'); END IF;

  RETURN jsonb_build_object(
    'suite','PROCUREMENT_ANOMALY_INTELLIGENCE',
    'period_days',v_days,'from_timestamp',v_from,'generated_at',NOW(),'threshold',v_threshold,
    'anomaly_score',v_score,
    'anomaly_level',CASE WHEN v_score>=70 THEN 'CRITICAL' WHEN v_score>=40 THEN 'HIGH' WHEN v_score>=20 THEN 'MEDIUM' ELSE 'LOW' END,
    'kpis',jsonb_build_object('anomalies',v_anomalies,'critical',v_critical,'high',v_high,'medium',v_medium,'duplicate_po',v_duplicate,'price_variance',v_price,'split_po',v_split,'unusual_amount',v_unusual,'after_hours_approval',v_after_hours,'vendor_frequency',v_frequency),
    'cases',v_cases,'recommendations',v_recommendations,
    'methodology',jsonb_build_array('Duplicate PO: same vendor and amount within +/-7 days.','Price variance: PO vs linked vendor quote exceeds 10%.','Split PO: same vendor/cost center/date, multiple sub-threshold POs collectively reaching the threshold.','Unusual amount: PO exceeds 2x vendor historical average.','After-hours: approval recorded outside 08:00-20:00 UTC.','Vendor frequency: four or more approved POs for one vendor on one date.')
  );
END $$;

REVOKE ALL ON FUNCTION public.procurement_anomaly_intelligence(INTEGER,INTEGER,NUMERIC) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.procurement_anomaly_intelligence(INTEGER,INTEGER,NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION public.procurement_anomaly_intelligence(INTEGER,INTEGER,NUMERIC) TO service_role;
