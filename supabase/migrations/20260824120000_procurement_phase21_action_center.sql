-- Procurement Phase 21: Action Center & Continuous Monitoring.
-- Operational work items are separate from source transactions. Actions never
-- mutate POs, GRNs, invoices, approvals or accounting records.

CREATE TABLE IF NOT EXISTS public.proc_action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_key TEXT NOT NULL UNIQUE,
  source_type TEXT NOT NULL,
  source_id UUID,
  source_reference TEXT,
  action_code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (severity IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','ACKNOWLEDGED','IN_PROGRESS','RESOLVED','CLOSED','REOPENED')),
  owner_user_id UUID REFERENCES auth.users(id),
  due_at TIMESTAMPTZ,
  evidence_reference TEXT,
  resolution_notes TEXT,
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_proc_action_queue ON public.proc_action_items(status, severity, due_at, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_proc_action_source ON public.proc_action_items(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_proc_action_owner ON public.proc_action_items(owner_user_id, status, due_at);

ALTER TABLE public.proc_action_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS proc_action_items_read ON public.proc_action_items;
CREATE POLICY proc_action_items_read ON public.proc_action_items FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS proc_action_items_no_direct_write ON public.proc_action_items;
CREATE POLICY proc_action_items_no_direct_write ON public.proc_action_items FOR ALL TO authenticated USING (false) WITH CHECK (false);

CREATE OR REPLACE FUNCTION public.proc_action_can_manage()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id=auth.uid() AND p.role IN ('FINANCE','ADMIN','SUPER_ADMIN')
  );
$$;

CREATE OR REPLACE FUNCTION public.proc_refresh_action_center(
  p_days INTEGER DEFAULT 30,
  p_due_hours INTEGER DEFAULT 24,
  p_limit INTEGER DEFAULT 100
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  v_days INTEGER := GREATEST(1, LEAST(COALESCE(p_days,30),3650));
  v_due INTEGER := GREATEST(1, LEAST(COALESCE(p_due_hours,24),168));
  v_limit INTEGER := GREATEST(10, LEAST(COALESCE(p_limit,100),500));
  v_from TIMESTAMPTZ := now() - make_interval(days=>v_days);
  v_count INTEGER := 0;
  v_row RECORD;
BEGIN
  IF NOT public.proc_action_can_manage() THEN RAISE EXCEPTION 'You are not authorized to refresh procurement actions'; END IF;

  -- Approval SLA signals.
  FOR v_row IN
    SELECT s.id, r.document_id, r.document_type, s.due_at, s.assigned_role, s.sequence_no,
           CASE WHEN s.due_at < now() THEN 'HIGH' ELSE 'MEDIUM' END severity
    FROM public.proc_approval_stages s
    JOIN public.proc_approval_requests r ON r.id=s.request_id
    WHERE r.status='PENDING' AND s.status IN ('PENDING','ESCALATED')
      AND s.due_at <= now() + make_interval(hours=>v_due)
    ORDER BY s.due_at
    LIMIT v_limit
  LOOP
    INSERT INTO public.proc_action_items(signal_key,source_type,source_id,source_reference,action_code,title,description,severity,due_at,updated_at)
    VALUES(
      'APPROVAL_STAGE:'||v_row.id::text,'APPROVAL_STAGE',v_row.id,v_row.document_type||':'||v_row.document_id::text,
      CASE WHEN v_row.due_at < now() THEN 'APPROVAL_OVERDUE' ELSE 'APPROVAL_DUE_SOON' END,
      CASE WHEN v_row.due_at < now() THEN 'Approval stage overdue' ELSE 'Approval stage due soon' END,
      format('Approval stage %s for %s is assigned to %s and is due at %s.',v_row.sequence_no,v_row.document_type,v_row.assigned_role,to_char(v_row.due_at,'YYYY-MM-DD HH24:MI')),
      v_row.severity,v_row.due_at,now()
    ) ON CONFLICT (signal_key) DO UPDATE SET
      title=EXCLUDED.title,description=EXCLUDED.description,severity=EXCLUDED.severity,due_at=EXCLUDED.due_at,updated_at=now()
    WHERE proc_action_items.status NOT IN ('RESOLVED','CLOSED');
    v_count:=v_count+1;
  END LOOP;

  -- Deterministic anomaly cases.
  FOR v_row IN
    SELECT po.id,po.doc_number,po.vendor_id,po.total_amount,'DUPLICATE_PO' code,'HIGH' severity,
      'Approved PO matches another approved PO for the same vendor and amount within seven days.' description
    FROM public.proc_purchase_orders po
    WHERE po.created_at>=v_from AND po.status='APPROVED'
      AND EXISTS (SELECT 1 FROM public.proc_purchase_orders p2 WHERE p2.id<>po.id AND p2.vendor_id=po.vendor_id AND p2.total_amount=po.total_amount AND p2.status='APPROVED' AND p2.order_date BETWEEN po.order_date-7 AND po.order_date+7)
    UNION ALL
    SELECT po.id,po.doc_number,po.vendor_id,po.total_amount,'PRICE_VARIANCE','HIGH','PO total differs from the linked vendor quote by more than ten percent.'
    FROM public.proc_purchase_orders po JOIN public.proc_vendor_quotes q ON q.id=po.vendor_quote_id
    WHERE po.created_at>=v_from AND po.status='APPROVED' AND q.total_amount>0 AND ABS(po.total_amount-q.total_amount)/q.total_amount>0.10
    UNION ALL
    SELECT po.id,po.doc_number,po.vendor_id,po.total_amount,'SPLIT_PO','CRITICAL','Same vendor/cost-center/date has sub-threshold POs whose combined value reaches the anomaly threshold.'
    FROM public.proc_purchase_orders po
    WHERE po.created_at>=v_from AND po.status='APPROVED' AND po.total_amount < 100000
      AND EXISTS (SELECT 1 FROM public.proc_purchase_orders s WHERE s.vendor_id=po.vendor_id AND s.cost_center_id IS NOT DISTINCT FROM po.cost_center_id AND s.order_date=po.order_date AND s.id<>po.id AND s.status='APPROVED' AND s.total_amount<100000 GROUP BY s.vendor_id,s.cost_center_id,s.order_date HAVING SUM(s.total_amount)+po.total_amount>=100000)
    ORDER BY severity DESC, id DESC LIMIT v_limit
  LOOP
    INSERT INTO public.proc_action_items(signal_key,source_type,source_id,source_reference,action_code,title,description,severity,due_at,updated_at)
    VALUES('ANOMALY:'||v_row.code||':'||v_row.id::text,'PURCHASE_ORDER',v_row.id,v_row.doc_number,v_row.code,'Procurement anomaly requires review',v_row.description,v_row.severity,now()+interval '2 days',now())
    ON CONFLICT(signal_key) DO UPDATE SET description=EXCLUDED.description,severity=EXCLUDED.severity,updated_at=now()
    WHERE proc_action_items.status NOT IN ('RESOLVED','CLOSED');
    v_count:=v_count+1;
  END LOOP;

  -- Supplier concentration and low performance signals, aligned with Phase 20 methodology.
  FOR v_row IN
    WITH po AS (
      SELECT vendor_id,SUM(total_amount) spend FROM public.proc_purchase_orders WHERE status='APPROVED' AND order_date>=CURRENT_DATE-v_days GROUP BY vendor_id
    ), total AS (SELECT COALESCE(SUM(spend),0) spend FROM po)
    SELECT po.vendor_id,po.spend,v.name vendor_name,CASE WHEN total.spend>0 THEN 100*po.spend/total.spend ELSE 0 END share
    FROM po CROSS JOIN total LEFT JOIN public.fin_vendors v ON v.id=po.vendor_id
    WHERE total.spend>0 AND 100*po.spend/total.spend>=30
    ORDER BY po.spend DESC LIMIT v_limit
  LOOP
    INSERT INTO public.proc_action_items(signal_key,source_type,source_id,source_reference,action_code,title,description,severity,due_at,updated_at)
    VALUES('SUPPLIER_CONCENTRATION:'||v_row.vendor_id::text,'SUPPLIER',NULL,v_row.vendor_id::text,'SUPPLIER_CONCENTRATION_REVIEW','Supplier concentration review required',format('Supplier %s represents %.1f%% of approved PO spend in the selected period, meeting the 30%% concentration threshold.',COALESCE(v_row.vendor_name,v_row.vendor_id::text),v_row.share),'HIGH',now()+interval '7 days',now())
    ON CONFLICT(signal_key) DO UPDATE SET description=EXCLUDED.description,updated_at=now()
    WHERE proc_action_items.status NOT IN ('RESOLVED','CLOSED');
    v_count:=v_count+1;
  END LOOP;

  RETURN jsonb_build_object('suite','PROCUREMENT_ACTION_REFRESH','generated_at',now(),'signals_upserted',v_count,'period_days',v_days,'due_hours',v_due);
END $$;

-- Exception discovery is kept separate because proc_exception_queue returns JSON.
CREATE OR REPLACE FUNCTION public.proc_refresh_exception_actions(p_limit INTEGER DEFAULT 100)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE x JSONB; e JSONB; v_count INTEGER:=0;
BEGIN
  IF NOT public.proc_action_can_manage() THEN RAISE EXCEPTION 'You are not authorized to refresh procurement actions'; END IF;
  x:=public.proc_exception_queue(p_limit);
  FOR e IN SELECT value FROM jsonb_array_elements(x->'exceptions') LOOP
    IF COALESCE(e->>'status','OPEN') IN ('OPEN','REOPENED','IN_PROGRESS') THEN
      INSERT INTO public.proc_action_items(signal_key,source_type,source_id,source_reference,action_code,title,description,severity,due_at,updated_at)
      VALUES('EXCEPTION:'||(e->>'exception_key'),'EXCEPTION',(e->>'source_id')::uuid,e->>'source_number','EXCEPTION_RESOLUTION','Procurement exception requires resolution',e->>'detail',e->>'severity',now()+interval '2 days',now())
      ON CONFLICT(signal_key) DO UPDATE SET description=EXCLUDED.description,severity=EXCLUDED.severity,updated_at=now()
      WHERE proc_action_items.status NOT IN ('RESOLVED','CLOSED');
      v_count:=v_count+1;
    END IF;
  END LOOP;
  RETURN v_count;
END $$;

CREATE OR REPLACE FUNCTION public.proc_action_center(p_limit INTEGER DEFAULT 100)
RETURNS JSONB LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  WITH q AS (
    SELECT * FROM public.proc_action_items
    WHERE status NOT IN ('CLOSED')
    ORDER BY CASE severity WHEN 'CRITICAL' THEN 4 WHEN 'HIGH' THEN 3 WHEN 'MEDIUM' THEN 2 ELSE 1 END DESC,
             CASE WHEN due_at IS NOT NULL AND due_at < now() THEN 0 ELSE 1 END,
             due_at NULLS LAST, created_at DESC
    LIMIT GREATEST(1,LEAST(COALESCE(p_limit,100),500))
  )
  SELECT jsonb_build_object(
    'suite','PROCUREMENT_ACTION_CENTER','generated_at',now(),
    'kpis',jsonb_build_object(
      'open_count',(SELECT COUNT(*) FROM public.proc_action_items WHERE status IN ('OPEN','REOPENED')),
      'acknowledged_count',(SELECT COUNT(*) FROM public.proc_action_items WHERE status='ACKNOWLEDGED'),
      'in_progress_count',(SELECT COUNT(*) FROM public.proc_action_items WHERE status='IN_PROGRESS'),
      'overdue_count',(SELECT COUNT(*) FROM public.proc_action_items WHERE status NOT IN ('RESOLVED','CLOSED') AND due_at<now()),
      'critical_count',(SELECT COUNT(*) FROM public.proc_action_items WHERE status NOT IN ('RESOLVED','CLOSED') AND severity='CRITICAL'),
      'unassigned_count',(SELECT COUNT(*) FROM public.proc_action_items WHERE status NOT IN ('RESOLVED','CLOSED') AND owner_user_id IS NULL)
    ),
    'items',COALESCE((SELECT jsonb_agg(to_jsonb(q)) FROM q),'[]'::jsonb),
    'methodology',jsonb_build_array('Action items are operational dispositions generated from approval SLA, deterministic anomaly, supplier concentration and unresolved exception signals.','Resolving or closing an action item never changes the underlying procurement or accounting transaction.','Evidence and resolution notes are retained with the action item for auditability.','A refresh can update open signals but does not automatically close previously resolved or closed actions.')
  );
$$;

CREATE OR REPLACE FUNCTION public.proc_update_action_item(
  p_action_id UUID,
  p_status TEXT,
  p_owner_user_id UUID DEFAULT NULL,
  p_due_at TIMESTAMPTZ DEFAULT NULL,
  p_resolution_notes TEXT DEFAULT NULL,
  p_evidence_reference TEXT DEFAULT NULL
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_item public.proc_action_items;
BEGIN
  IF NOT public.proc_action_can_manage() THEN RAISE EXCEPTION 'You are not authorized to manage procurement actions'; END IF;
  IF p_status NOT IN ('OPEN','ACKNOWLEDGED','IN_PROGRESS','RESOLVED','CLOSED','REOPENED') THEN RAISE EXCEPTION 'Invalid action status'; END IF;
  UPDATE public.proc_action_items SET
    status=p_status,owner_user_id=COALESCE(p_owner_user_id,owner_user_id),due_at=COALESCE(p_due_at,due_at),
    resolution_notes=COALESCE(NULLIF(trim(p_resolution_notes),''),resolution_notes),
    evidence_reference=COALESCE(NULLIF(trim(p_evidence_reference),''),evidence_reference),
    acknowledged_at=CASE WHEN p_status IN ('ACKNOWLEDGED','IN_PROGRESS','RESOLVED','CLOSED') THEN COALESCE(acknowledged_at,now()) ELSE acknowledged_at END,
    resolved_at=CASE WHEN p_status='RESOLVED' THEN COALESCE(resolved_at,now()) ELSE resolved_at END,
    closed_at=CASE WHEN p_status='CLOSED' THEN COALESCE(closed_at,now()) ELSE closed_at END,
    updated_at=now()
  WHERE id=p_action_id RETURNING * INTO v_item;
  IF v_item.id IS NULL THEN RAISE EXCEPTION 'Action item not found'; END IF;
  RETURN jsonb_build_object('success',true,'action',to_jsonb(v_item),'warning','Operational action status only; source procurement/accounting records remain unchanged.');
END $$;

REVOKE ALL ON FUNCTION public.proc_refresh_action_center(INTEGER,INTEGER,INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.proc_refresh_exception_actions(INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.proc_action_center(INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.proc_update_action_item(UUID,TEXT,UUID,TIMESTAMPTZ,TEXT,TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.proc_refresh_action_center(INTEGER,INTEGER,INTEGER) TO authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.proc_refresh_exception_actions(INTEGER) TO authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.proc_action_center(INTEGER) TO authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.proc_update_action_item(UUID,TEXT,UUID,TIMESTAMPTZ,TEXT,TEXT) TO authenticated,service_role;
