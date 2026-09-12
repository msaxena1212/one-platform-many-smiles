-- Procurement Phase 18: Continuous control & risk intelligence.
-- Read-only, explainable risk signals over approval and PO controls.

CREATE OR REPLACE FUNCTION public.proc_approval_risk_intelligence(
  p_days INTEGER DEFAULT 90,
  p_limit INTEGER DEFAULT 25,
  p_high_value_threshold NUMERIC DEFAULT 100000
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_days INTEGER := GREATEST(1, LEAST(COALESCE(p_days,90),3650));
  v_limit INTEGER := GREATEST(5, LEAST(COALESCE(p_limit,25),100));
  v_threshold NUMERIC := GREATEST(COALESCE(p_high_value_threshold,100000),0);
  v_from TIMESTAMPTZ := NOW() - make_interval(days => v_days);
  v_total INTEGER := 0;
  v_high INTEGER := 0;
  v_sod INTEGER := 0;
  v_bypass INTEGER := 0;
  v_repeated INTEGER := 0;
  v_sla INTEGER := 0;
  v_delegated INTEGER := 0;
  v_risk_score INTEGER := 0;
  v_signals JSONB := '[]'::jsonb;
  v_recommendations JSONB := '[]'::jsonb;
  v_hotspots JSONB := '[]'::jsonb;
  v_vendor_concentration JSONB := '[]'::jsonb;
BEGIN
  SELECT COUNT(*) INTO v_total
  FROM public.proc_approval_requests r WHERE r.created_at >= v_from;

  SELECT COUNT(*) INTO v_high
  FROM public.proc_approval_requests r
  WHERE r.created_at >= v_from
    AND public.proc_document_amount(r.document_type,r.document_id) >= v_threshold;

  -- Segregation-of-duties signal: same user submitted and approved a request.
  SELECT COUNT(DISTINCT r.id) INTO v_sod
  FROM public.proc_approval_requests r
  JOIN public.proc_approval_actions a ON a.request_id=r.id AND a.action='APPROVED'
  WHERE r.created_at >= v_from
    AND r.submitted_by IS NOT NULL
    AND a.actor_user_id IS NOT NULL
    AND a.actor_user_id=r.submitted_by;

  -- Approval bypass signal: approved PO with no completed approval request.
  SELECT COUNT(*) INTO v_bypass
  FROM public.proc_purchase_orders po
  WHERE po.created_at >= v_from
    AND po.status='APPROVED'
    AND NOT EXISTS (
      SELECT 1 FROM public.proc_approval_requests r
      WHERE r.document_type='PO' AND r.document_id=po.id AND r.status='APPROVED'
    );

  -- Repeated rejection signal: same document has two or more rejected requests.
  SELECT COUNT(*) INTO v_repeated
  FROM (
    SELECT r.document_type,r.document_id
    FROM public.proc_approval_requests r
    WHERE r.created_at >= v_from AND r.status='REJECTED'
    GROUP BY r.document_type,r.document_id
    HAVING COUNT(*) >= 2
  ) x;

  -- SLA breach signal from approval history.
  SELECT COUNT(DISTINCT s.id) INTO v_sla
  FROM public.proc_approval_stages s
  JOIN public.proc_approval_requests r ON r.id=s.request_id
  WHERE r.created_at >= v_from
    AND ((s.status='APPROVED' AND s.approved_at > s.due_at)
      OR s.status='ESCALATED'
      OR EXISTS (SELECT 1 FROM public.proc_approval_actions a WHERE a.stage_id=s.id AND a.action='ESCALATED'));

  SELECT COUNT(DISTINCT a.id) INTO v_delegated
  FROM public.proc_approval_actions a
  JOIN public.proc_approval_requests r ON r.id=a.request_id
  WHERE a.created_at >= v_from AND a.action='APPROVED'
    AND COALESCE((a.metadata->>'delegated')::boolean,false);

  v_risk_score := LEAST(100,
    LEAST(v_sod*20,30) +
    LEAST(v_bypass*30,40) +
    LEAST(v_repeated*10,20) +
    LEAST(v_sla*2,15) +
    CASE WHEN v_high > 0 THEN LEAST(v_high,10) ELSE 0 END
  );

  IF v_bypass > 0 THEN
    v_signals := v_signals || jsonb_build_array(jsonb_build_object(
      'code','APPROVAL_BYPASS','severity','CRITICAL','count',v_bypass,
      'title','Approved POs without completed approval workflow',
      'description','A purchase order is approved but no APPROVED procurement approval request exists.'
    ));
  END IF;
  IF v_sod > 0 THEN
    v_signals := v_signals || jsonb_build_array(jsonb_build_object(
      'code','SOD_SUBMITTER_APPROVER','severity','HIGH','count',v_sod,
      'title','Submitter also approved the request',
      'description','The same user submitted and recorded an approval action for a procurement approval request.'
    ));
  END IF;
  IF v_repeated > 0 THEN
    v_signals := v_signals || jsonb_build_array(jsonb_build_object(
      'code','REPEATED_REJECTION','severity','MEDIUM','count',v_repeated,
      'title','Documents repeatedly rejected',
      'description','The same procurement document has two or more rejected approval requests in the selected period.'
    ));
  END IF;
  IF v_sla > 0 THEN
    v_signals := v_signals || jsonb_build_array(jsonb_build_object(
      'code','SLA_BREACH','severity','MEDIUM','count',v_sla,
      'title','Approval SLA breaches detected',
      'description','Approval stages were completed after their due time or escalated after SLA breach.'
    ));
  END IF;
  IF v_high > 0 THEN
    v_signals := v_signals || jsonb_build_array(jsonb_build_object(
      'code','HIGH_VALUE_EXPOSURE','severity','LOW','count',v_high,
      'title','High-value approvals require enhanced oversight',
      'description','Approval requests exceed the configured high-value threshold.'
    ));
  END IF;

  IF v_bypass > 0 THEN
    v_recommendations := v_recommendations || jsonb_build_array('Investigate every approval bypass and enforce the approval gate before production release.');
  END IF;
  IF v_sod > 0 THEN
    v_recommendations := v_recommendations || jsonb_build_array('Review submitter/approver segregation of duties and require independent approval for affected requests.');
  END IF;
  IF v_repeated > 0 THEN
    v_recommendations := v_recommendations || jsonb_build_array('Review repeatedly rejected documents for policy ambiguity, vendor quality, or approval preparation issues.');
  END IF;
  IF v_sla > 0 THEN
    v_recommendations := v_recommendations || jsonb_build_array('Review overloaded approval roles and adjust SLA, delegation, or escalation coverage.');
  END IF;
  IF v_high > 0 THEN
    v_recommendations := v_recommendations || jsonb_build_array('Apply enhanced review to high-value approvals and periodically validate delegation limits.');
  END IF;
  IF jsonb_array_length(v_recommendations)=0 THEN
    v_recommendations := jsonb_build_array('No material approval risk signals were detected for the selected period. Continue periodic control review.');
  END IF;

  -- Risk hotspots by approval role.
  SELECT COALESCE(jsonb_agg(to_jsonb(x) ORDER BY x.risk_points DESC, x.role), '[]'::jsonb)
  INTO v_hotspots
  FROM (
    SELECT s.assigned_role AS role,
      COUNT(*) FILTER (WHERE s.status IN ('PENDING','ESCALATED')) AS open_stages,
      COUNT(*) FILTER (WHERE s.status='ESCALATED' OR EXISTS (SELECT 1 FROM public.proc_approval_actions a WHERE a.stage_id=s.id AND a.action='ESCALATED')) AS escalated_stages,
      COUNT(*) FILTER (WHERE s.status='APPROVED' AND s.approved_at>s.due_at) AS sla_breaches,
      COUNT(*) FILTER (WHERE s.status='APPROVED' AND s.approved_by=r.submitted_by AND r.submitted_by IS NOT NULL) AS sod_events,
      (COUNT(*) FILTER (WHERE s.status='ESCALATED')*3 + COUNT(*) FILTER (WHERE s.status='APPROVED' AND s.approved_at>s.due_at)*2 + COUNT(*) FILTER (WHERE s.status='APPROVED' AND s.approved_by=r.submitted_by AND r.submitted_by IS NOT NULL)*5) AS risk_points
    FROM public.proc_approval_stages s
    JOIN public.proc_approval_requests r ON r.id=s.request_id
    WHERE r.created_at>=v_from
    GROUP BY s.assigned_role
    HAVING COUNT(*) FILTER (WHERE s.status IN ('PENDING','ESCALATED')) > 0
       OR COUNT(*) FILTER (WHERE s.status='ESCALATED') > 0
       OR COUNT(*) FILTER (WHERE s.status='APPROVED' AND s.approved_at>s.due_at) > 0
       OR COUNT(*) FILTER (WHERE s.status='APPROVED' AND s.approved_by=r.submitted_by AND r.submitted_by IS NOT NULL) > 0
    LIMIT v_limit
  ) x;

  -- Concentration of approved PO value by vendor_id. This is a control signal, not a supplier score.
  SELECT COALESCE(jsonb_agg(to_jsonb(x) ORDER BY x.total_amount DESC), '[]'::jsonb)
  INTO v_vendor_concentration
  FROM (
    SELECT po.vendor_id,
      COUNT(*) AS approved_po_count,
      ROUND(SUM(po.total_amount)::numeric,2) AS total_amount,
      ROUND(CASE WHEN SUM(SUM(po.total_amount)) OVER ()=0 THEN 0 ELSE (SUM(po.total_amount)/SUM(SUM(po.total_amount)) OVER ())*100 END,2) AS value_share_percent
    FROM public.proc_purchase_orders po
    WHERE po.created_at>=v_from AND po.status='APPROVED'
    GROUP BY po.vendor_id
    ORDER BY SUM(po.total_amount) DESC
    LIMIT v_limit
  ) x;

  RETURN jsonb_build_object(
    'suite','PROCUREMENT_RISK_INTELLIGENCE',
    'period_days',v_days,
    'from_timestamp',v_from,
    'generated_at',NOW(),
    'threshold',v_threshold,
    'risk_score',v_risk_score,
    'risk_level',CASE WHEN v_risk_score>=70 THEN 'CRITICAL' WHEN v_risk_score>=40 THEN 'HIGH' WHEN v_risk_score>=20 THEN 'MEDIUM' ELSE 'LOW' END,
    'kpis',jsonb_build_object('approval_requests',v_total,'high_value_requests',v_high,'sod_events',v_sod,'bypass_events',v_bypass,'repeated_rejection_documents',v_repeated,'sla_breaches',v_sla,'delegated_approvals',v_delegated),
    'signals',v_signals,
    'recommendations',v_recommendations,
    'role_hotspots',v_hotspots,
    'vendor_concentration',v_vendor_concentration
  );
END $$;

REVOKE ALL ON FUNCTION public.proc_approval_risk_intelligence(INTEGER,INTEGER,NUMERIC) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.proc_approval_risk_intelligence(INTEGER,INTEGER,NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION public.proc_approval_risk_intelligence(INTEGER,INTEGER,NUMERIC) TO service_role;
