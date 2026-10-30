-- Procurement Phase 17: Approval Analytics, SLA Intelligence & Management Dashboard.
-- Read-only management intelligence over the Phase 15/16 approval workflow.

CREATE OR REPLACE FUNCTION public.proc_approval_intelligence_dashboard(
  p_days INTEGER DEFAULT 90,
  p_limit INTEGER DEFAULT 20,
  p_high_value_threshold NUMERIC DEFAULT 100000
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_days INTEGER := GREATEST(1, LEAST(COALESCE(p_days,90),3650));
  v_limit INTEGER := GREATEST(5, LEAST(COALESCE(p_limit,20),100));
  v_threshold NUMERIC := GREATEST(COALESCE(p_high_value_threshold,100000),0);
  v_from TIMESTAMPTZ := NOW() - make_interval(days => v_days);
  v_completed INTEGER := 0;
  v_approved INTEGER := 0;
  v_rejected INTEGER := 0;
  v_escalated INTEGER := 0;
  v_total_stages INTEGER := 0;
  v_approved_stages INTEGER := 0;
  v_sla_met INTEGER := 0;
  v_pending INTEGER := 0;
  v_overdue INTEGER := 0;
  v_due_24h INTEGER := 0;
  v_avg_stage_hours NUMERIC := 0;
  v_avg_request_days NUMERIC := 0;
  v_rejection_rate NUMERIC := 0;
  v_escalation_rate NUMERIC := 0;
  v_sla_compliance NUMERIC := 0;
  v_delegated_actions INTEGER := 0;
  v_approval_actions INTEGER := 0;
  v_delegation_utilization NUMERIC := 0;
  v_health_score INTEGER := 100;
  v_workload JSONB := '[]'::jsonb;
  v_bottlenecks JSONB := '[]'::jsonb;
  v_aging JSONB := '[]'::jsonb;
  v_high_value JSONB := '[]'::jsonb;
  v_trends JSONB := '[]'::jsonb;
BEGIN
  SELECT COUNT(*) FILTER (WHERE r.status IN ('APPROVED','REJECTED')),
         COUNT(*) FILTER (WHERE r.status='APPROVED'),
         COUNT(*) FILTER (WHERE r.status='REJECTED')
    INTO v_completed,v_approved,v_rejected
  FROM public.proc_approval_requests r
  WHERE r.created_at >= v_from;

  SELECT COUNT(*),
         COUNT(*) FILTER (WHERE s.status='APPROVED'),
         COUNT(*) FILTER (WHERE s.status='APPROVED' AND s.approved_at IS NOT NULL AND s.approved_at <= s.due_at),
         COUNT(*) FILTER (WHERE s.status='ESCALATED' OR EXISTS (
           SELECT 1 FROM public.proc_approval_actions a WHERE a.stage_id=s.id AND a.action='ESCALATED'
         ))
    INTO v_total_stages,v_approved_stages,v_sla_met,v_escalated
  FROM public.proc_approval_stages s
  JOIN public.proc_approval_requests r ON r.id=s.request_id
  WHERE s.created_at >= v_from;

  SELECT COUNT(*) FILTER (WHERE r.status='PENDING'),
         COUNT(*) FILTER (WHERE r.status='PENDING' AND s.status IN ('PENDING','ESCALATED') AND s.due_at < NOW()),
         COUNT(*) FILTER (WHERE r.status='PENDING' AND s.status IN ('PENDING','ESCALATED') AND s.due_at >= NOW() AND s.due_at <= NOW()+INTERVAL '24 hours')
    INTO v_pending,v_overdue,v_due_24h
  FROM public.proc_approval_requests r
  JOIN public.proc_approval_stages s ON s.request_id=r.id
  WHERE r.status='PENDING';

  SELECT COALESCE(ROUND(AVG(EXTRACT(EPOCH FROM (s.approved_at-s.created_at))/3600.0)::numeric,2),0)
    INTO v_avg_stage_hours
  FROM public.proc_approval_stages s
  JOIN public.proc_approval_requests r ON r.id=s.request_id
  WHERE s.status='APPROVED' AND s.approved_at IS NOT NULL AND s.approved_at >= v_from;

  SELECT COALESCE(ROUND(AVG(EXTRACT(EPOCH FROM (r.completed_at-r.submitted_at))/86400.0)::numeric,2),0)
    INTO v_avg_request_days
  FROM public.proc_approval_requests r
  WHERE r.status IN ('APPROVED','REJECTED') AND r.completed_at IS NOT NULL AND r.completed_at >= v_from;

  v_rejection_rate := CASE WHEN v_completed=0 THEN 0 ELSE ROUND((v_rejected::numeric/v_completed)*100,2) END;
  v_escalation_rate := CASE WHEN v_total_stages=0 THEN 0 ELSE ROUND((v_escalated::numeric/v_total_stages)*100,2) END;
  v_sla_compliance := CASE WHEN v_approved_stages=0 THEN 100 ELSE ROUND((v_sla_met::numeric/v_approved_stages)*100,2) END;

  SELECT COUNT(*) FILTER (WHERE COALESCE((a.metadata->>'delegated')::boolean,false)), COUNT(*)
    INTO v_delegated_actions,v_approval_actions
  FROM public.proc_approval_actions a
  WHERE a.action='APPROVED' AND a.created_at >= v_from;
  v_delegation_utilization := CASE WHEN v_approval_actions=0 THEN 0 ELSE ROUND((v_delegated_actions::numeric/v_approval_actions)*100,2) END;

  v_health_score := GREATEST(0, LEAST(100,
    ROUND(100 - LEAST(v_rejection_rate,30) - LEAST(v_escalation_rate*1.5,30) - GREATEST(80-v_sla_compliance,0)*0.5 - LEAST(v_overdue*2,20))::integer
  ));

  SELECT COALESCE(jsonb_agg(to_jsonb(x) ORDER BY x.pending_count DESC), '[]'::jsonb)
    INTO v_workload
  FROM (
    SELECT s.assigned_role AS role,
           COUNT(*) FILTER (WHERE r.status='PENDING' AND s.status IN ('PENDING','ESCALATED')) AS pending_count,
           COUNT(*) FILTER (WHERE r.status='PENDING' AND s.status IN ('PENDING','ESCALATED') AND s.due_at < NOW()) AS overdue_count,
           COUNT(*) FILTER (WHERE s.status='APPROVED' AND s.approved_at IS NOT NULL) AS completed_stage_count,
           ROUND(AVG(CASE WHEN s.status='APPROVED' AND s.approved_at IS NOT NULL THEN EXTRACT(EPOCH FROM (s.approved_at-s.created_at))/3600.0 END)::numeric,2) AS avg_completion_hours
    FROM public.proc_approval_stages s
    JOIN public.proc_approval_requests r ON r.id=s.request_id
    GROUP BY s.assigned_role
    ORDER BY COUNT(*) FILTER (WHERE r.status='PENDING' AND s.status IN ('PENDING','ESCALATED')) DESC, s.assigned_role
    LIMIT v_limit
  ) x;

  SELECT COALESCE(jsonb_agg(to_jsonb(x) ORDER BY x.avg_cycle_hours DESC), '[]'::jsonb)
    INTO v_bottlenecks
  FROM (
    SELECT s.assigned_role AS role,
           COUNT(*) FILTER (WHERE s.status='APPROVED') AS approved_stage_count,
           ROUND(AVG(EXTRACT(EPOCH FROM (s.approved_at-s.created_at))/3600.0)::numeric,2) AS avg_cycle_hours,
           ROUND(AVG(EXTRACT(EPOCH FROM (s.approved_at-s.created_at))/3600.0 - s.sla_hours)::numeric,2) AS avg_variance_hours,
           COUNT(*) FILTER (WHERE s.status='APPROVED' AND s.approved_at > s.due_at) AS sla_breach_count
    FROM public.proc_approval_stages s
    JOIN public.proc_approval_requests r ON r.id=s.request_id
    WHERE s.status='APPROVED' AND s.approved_at IS NOT NULL AND s.approved_at >= v_from
    GROUP BY s.assigned_role
    HAVING COUNT(*) FILTER (WHERE s.status='APPROVED') > 0
    ORDER BY AVG(EXTRACT(EPOCH FROM (s.approved_at-s.created_at))/3600.0) DESC
    LIMIT v_limit
  ) x;

  SELECT COALESCE(jsonb_agg(to_jsonb(x) ORDER BY x.bucket_order), '[]'::jsonb)
    INTO v_aging
  FROM (
    SELECT '0-24h' AS bucket, 1 AS bucket_order, COUNT(*) AS count
    FROM public.proc_approval_stages s JOIN public.proc_approval_requests r ON r.id=s.request_id
    WHERE r.status='PENDING' AND s.status IN ('PENDING','ESCALATED') AND NOW()-s.created_at < INTERVAL '24 hours'
    UNION ALL
    SELECT '24-72h',2,COUNT(*) FROM public.proc_approval_stages s JOIN public.proc_approval_requests r ON r.id=s.request_id
    WHERE r.status='PENDING' AND s.status IN ('PENDING','ESCALATED') AND NOW()-s.created_at >= INTERVAL '24 hours' AND NOW()-s.created_at < INTERVAL '72 hours'
    UNION ALL
    SELECT '3-7d',3,COUNT(*) FROM public.proc_approval_stages s JOIN public.proc_approval_requests r ON r.id=s.request_id
    WHERE r.status='PENDING' AND s.status IN ('PENDING','ESCALATED') AND NOW()-s.created_at >= INTERVAL '72 hours' AND NOW()-s.created_at < INTERVAL '7 days'
    UNION ALL
    SELECT '7d+',4,COUNT(*) FROM public.proc_approval_stages s JOIN public.proc_approval_requests r ON r.id=s.request_id
    WHERE r.status='PENDING' AND s.status IN ('PENDING','ESCALATED') AND NOW()-s.created_at >= INTERVAL '7 days'
  ) x;

  SELECT COALESCE(jsonb_agg(to_jsonb(x) ORDER BY x.total_amount DESC), '[]'::jsonb)
    INTO v_high_value
  FROM (
    SELECT r.id AS request_id,r.document_id,r.document_type,r.status,r.submitted_at,r.completed_at,
           COALESCE(public.proc_document_amount(r.document_type,r.document_id),0) AS total_amount,
           COUNT(s.id) AS stage_count,
           COUNT(s.id) FILTER (WHERE s.status='APPROVED') AS approved_stage_count,
           COUNT(s.id) FILTER (WHERE s.status='ESCALATED') AS escalated_stage_count
    FROM public.proc_approval_requests r
    LEFT JOIN public.proc_approval_stages s ON s.request_id=r.id
    WHERE r.created_at >= v_from
      AND public.proc_document_amount(r.document_type,r.document_id) >= v_threshold
    GROUP BY r.id,r.document_id,r.document_type,r.status,r.submitted_at,r.completed_at
    ORDER BY total_amount DESC
    LIMIT v_limit
  ) x;

  SELECT COALESCE(jsonb_agg(to_jsonb(x) ORDER BY x.period), '[]'::jsonb)
    INTO v_trends
  FROM (
    SELECT to_char(date_trunc('month',r.created_at),'YYYY-MM') AS period,
           COUNT(*) AS request_count,
           COUNT(*) FILTER (WHERE r.status='APPROVED') AS approved_count,
           COUNT(*) FILTER (WHERE r.status='REJECTED') AS rejected_count,
           ROUND(COALESCE(AVG(EXTRACT(EPOCH FROM (r.completed_at-r.submitted_at))/86400.0) FILTER (WHERE r.completed_at IS NOT NULL),0)::numeric,2) AS avg_cycle_days
    FROM public.proc_approval_requests r
    WHERE r.created_at >= v_from
    GROUP BY date_trunc('month',r.created_at)
    ORDER BY date_trunc('month',r.created_at)
  ) x;

  RETURN jsonb_build_object(
    'suite','PROCUREMENT_APPROVAL_INTELLIGENCE',
    'period_days',v_days,
    'from_timestamp',v_from,
    'generated_at',NOW(),
    'threshold',v_threshold,
    'health_score',v_health_score,
    'kpis',jsonb_build_object(
      'completed_requests',v_completed,
      'approved_requests',v_approved,
      'rejected_requests',v_rejected,
      'pending_requests',v_pending,
      'overdue_stages',v_overdue,
      'due_24h_stages',v_due_24h,
      'total_stages',v_total_stages,
      'approved_stages',v_approved_stages
    ),
    'performance',jsonb_build_object(
      'avg_stage_completion_hours',v_avg_stage_hours,
      'avg_request_cycle_days',v_avg_request_days,
      'sla_compliance_percent',v_sla_compliance,
      'rejection_rate_percent',v_rejection_rate,
      'escalation_rate_percent',v_escalation_rate,
      'delegation_utilization_percent',v_delegation_utilization
    ),
    'aging',v_aging,
    'workload_by_role',v_workload,
    'bottlenecks',v_bottlenecks,
    'high_value_requests',v_high_value,
    'monthly_trends',v_trends
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.proc_approval_intelligence_dashboard(INTEGER,INTEGER,NUMERIC) TO authenticated, service_role;
