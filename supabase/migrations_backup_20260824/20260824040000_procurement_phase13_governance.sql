-- Procurement Phase 13: governance, audit & compliance reporting.
-- Reporting/control layer only. No procurement, finance, approval or accounting transaction is mutated.

CREATE OR REPLACE FUNCTION public.proc_governance_dashboard(
  p_days INTEGER DEFAULT 90,
  p_po_approval_threshold NUMERIC DEFAULT 100000,
  p_vendor_concentration_pct NUMERIC DEFAULT 50,
  p_limit INTEGER DEFAULT 25
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_days INTEGER := GREATEST(1, LEAST(COALESCE(p_days,90),3650));
  v_limit INTEGER := GREATEST(5, LEAST(COALESCE(p_limit,25),100));
  v_threshold NUMERIC := GREATEST(0, COALESCE(p_po_approval_threshold,100000));
  v_concentration NUMERIC := GREATEST(1, LEAST(COALESCE(p_vendor_concentration_pct,50),100));
  v_from TIMESTAMPTZ := now() - make_interval(days => v_days);
  v_total_audit BIGINT := 0;
  v_actorless_audit BIGINT := 0;
  v_delete_actions BIGINT := 0;
  v_high_value_pos BIGINT := 0;
  v_high_value_unapproved BIGINT := 0;
  v_status_overrides BIGINT := 0;
  v_open_critical_exceptions BIGINT := 0;
  v_sod_flags BIGINT := 0;
  v_policy_violations JSONB := '[]'::jsonb;
  v_audit_activity JSONB := '[]'::jsonb;
  v_high_value JSONB := '[]'::jsonb;
  v_vendor_concentration JSONB := '[]'::jsonb;
BEGIN
  SELECT COUNT(*), COUNT(*) FILTER (WHERE actor_user_id IS NULL), COUNT(*) FILTER (WHERE action='DELETE')
    INTO v_total_audit, v_actorless_audit, v_delete_actions
  FROM public.proc_audit_log
  WHERE created_at >= v_from;

  SELECT COUNT(*), COUNT(*) FILTER (WHERE status NOT IN ('APPROVED','REJECTED','CANCELLED','CLOSED'))
    INTO v_high_value_pos, v_high_value_unapproved
  FROM public.proc_purchase_orders
  WHERE created_at >= v_from AND total_amount >= v_threshold;

  SELECT COUNT(*) INTO v_status_overrides
  FROM public.proc_audit_log
  WHERE created_at >= v_from
    AND entity_table='proc_purchase_orders'
    AND action='UPDATE'
    AND changed_fields ? 'status'
    AND COALESCE(old_row->>'status','') <> COALESCE(new_row->>'status','');

  SELECT COUNT(*) INTO v_open_critical_exceptions
  FROM public.proc_exception_resolutions
  WHERE status <> 'RESOLVED' AND severity='CRITICAL' AND created_at >= v_from;

  -- Segregation-of-duties signal: the same actor both creates a PO and performs its approval status change.
  SELECT COUNT(*) INTO v_sod_flags
  FROM public.proc_purchase_orders po
  WHERE po.created_at >= v_from
    AND EXISTS (
      SELECT 1 FROM public.proc_audit_log a
      WHERE a.entity_table='proc_purchase_orders' AND a.entity_id=po.id AND a.action='INSERT'
        AND a.actor_user_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM public.proc_audit_log b
          WHERE b.entity_table='proc_purchase_orders' AND b.entity_id=po.id AND b.action='UPDATE'
            AND b.actor_user_id=a.actor_user_id AND b.changed_fields ? 'status'
            AND COALESCE(b.new_row->>'status','')='APPROVED'
        )
    );

  SELECT COALESCE(jsonb_agg(to_jsonb(x) ORDER BY x.event_date DESC), '[]'::jsonb)
    INTO v_audit_activity
  FROM (
    SELECT date_trunc('day',created_at) AS event_date,
           COUNT(*) AS event_count,
           COUNT(*) FILTER (WHERE actor_user_id IS NULL) AS actorless_count,
           COUNT(*) FILTER (WHERE action='DELETE') AS delete_count
    FROM public.proc_audit_log
    WHERE created_at >= v_from
    GROUP BY date_trunc('day',created_at)
    ORDER BY date_trunc('day',created_at) DESC
    LIMIT v_limit
  ) x;

  SELECT COALESCE(jsonb_agg(to_jsonb(x) ORDER BY x.total_amount DESC), '[]'::jsonb)
    INTO v_high_value
  FROM (
    SELECT po.id AS po_id, po.doc_number AS po_number, po.vendor_id,
           po.total_amount, po.status, po.created_at,
           CASE WHEN po.status IN ('APPROVED','CLOSED') THEN TRUE ELSE FALSE END AS approval_state_ok
    FROM public.proc_purchase_orders po
    WHERE po.created_at >= v_from AND po.total_amount >= v_threshold
    ORDER BY po.total_amount DESC
    LIMIT v_limit
  ) x;

  SELECT COALESCE(jsonb_agg(to_jsonb(x) ORDER BY x.spend DESC), '[]'::jsonb)
    INTO v_vendor_concentration
  FROM (
    SELECT po.vendor_id,
           ROUND(SUM(po.total_amount),2) AS spend,
           ROUND(100.0 * SUM(po.total_amount) / NULLIF(SUM(SUM(po.total_amount)) OVER (),0),2) AS spend_pct,
           COUNT(*) AS po_count,
           CASE WHEN 100.0 * SUM(po.total_amount) / NULLIF(SUM(SUM(po.total_amount)) OVER (),0) >= v_concentration THEN TRUE ELSE FALSE END AS concentration_flag
    FROM public.proc_purchase_orders po
    WHERE po.created_at >= v_from AND po.status NOT IN ('CANCELLED','REJECTED')
    GROUP BY po.vendor_id
    ORDER BY SUM(po.total_amount) DESC
    LIMIT v_limit
  ) x;

  v_policy_violations := (
    SELECT COALESCE(jsonb_agg(to_jsonb(x)), '[]'::jsonb)
    FROM (
      SELECT 'ACTORLESS_AUDIT' AS policy_id, 'HIGH' AS severity,
             v_actorless_audit AS count,
             'Audit records without an actor identity' AS detail
      WHERE v_actorless_audit > 0
      UNION ALL
      SELECT 'HIGH_VALUE_APPROVAL_REVIEW','HIGH',v_high_value_unapproved,
             format('POs >= %s not in APPROVED/CLOSED state', v_threshold)
      WHERE v_high_value_unapproved > 0
      UNION ALL
      SELECT 'SOD_SAME_ACTOR','CRITICAL',v_sod_flags,
             'Same actor created a PO and later changed its status to APPROVED'
      WHERE v_sod_flags > 0
      UNION ALL
      SELECT 'OPEN_CRITICAL_EXCEPTION','CRITICAL',v_open_critical_exceptions,
             'Critical procurement exceptions remain unresolved'
      WHERE v_open_critical_exceptions > 0
    ) x
  );

  RETURN jsonb_build_object(
    'suite','PROCUREMENT_GOVERNANCE_DASHBOARD',
    'period_days',v_days,
    'from_timestamp',v_from,
    'generated_at',now(),
    'policy_parameters',jsonb_build_object(
      'po_approval_threshold',v_threshold,
      'vendor_concentration_pct',v_concentration
    ),
    'governance_kpis',jsonb_build_object(
      'audit_events',v_total_audit,
      'actorless_audit_events',v_actorless_audit,
      'delete_actions',v_delete_actions,
      'high_value_po_count',v_high_value_pos,
      'high_value_unapproved_count',v_high_value_unapproved,
      'status_change_events',v_status_overrides,
      'sod_same_actor_flags',v_sod_flags,
      'open_critical_exceptions',v_open_critical_exceptions,
      'policy_violation_count',jsonb_array_length(v_policy_violations)
    ),
    'policy_violations',v_policy_violations,
    'audit_activity',v_audit_activity,
    'high_value_purchase_orders',v_high_value,
    'vendor_concentration',v_vendor_concentration
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.proc_governance_dashboard(INTEGER,NUMERIC,NUMERIC,INTEGER) TO authenticated, service_role;
