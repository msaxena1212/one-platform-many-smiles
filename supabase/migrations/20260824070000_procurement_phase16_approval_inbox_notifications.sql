-- Procurement Phase 16: Approval Inbox, Notifications & Operational Escalation

CREATE TABLE IF NOT EXISTS public.proc_approval_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.proc_approval_requests(id) ON DELETE CASCADE,
  stage_id UUID REFERENCES public.proc_approval_stages(id) ON DELETE CASCADE,
  recipient_user_id UUID,
  recipient_role TEXT,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('APPROVAL_REQUIRED','SLA_DUE_SOON','ESCALATED','REJECTED','APPROVED','DELEGATION_ACTIVE')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'INFO' CHECK (severity IN ('INFO','WARNING','CRITICAL')),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_proc_approval_notifications_recipient
  ON public.proc_approval_notifications(recipient_user_id, read_at, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_proc_approval_notifications_role
  ON public.proc_approval_notifications(recipient_role, read_at, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_proc_approval_notifications_stage
  ON public.proc_approval_notifications(stage_id, notification_type, created_at DESC);

ALTER TABLE public.proc_approval_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Procurement approval notifications readable" ON public.proc_approval_notifications;
CREATE POLICY "Procurement approval notifications readable"
ON public.proc_approval_notifications FOR SELECT
USING (
  recipient_user_id = auth.uid()
  OR recipient_role = public.proc_get_current_profile_role()
);
DROP POLICY IF EXISTS "Procurement approval notifications immutable" ON public.proc_approval_notifications;
CREATE POLICY "Procurement approval notifications immutable"
ON public.proc_approval_notifications FOR ALL
USING (false) WITH CHECK (false);

CREATE OR REPLACE FUNCTION public.proc_notify_stage(
  p_stage_id UUID,
  p_notification_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_severity TEXT DEFAULT 'INFO',
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public
AS $$
DECLARE
  v_stage public.proc_approval_stages%ROWTYPE;
  v_req public.proc_approval_requests%ROWTYPE;
  v_count INTEGER := 0;
  v_user RECORD;
  v_role TEXT;
BEGIN
  SELECT * INTO v_stage FROM public.proc_approval_stages WHERE id=p_stage_id;
  IF v_stage.id IS NULL THEN RETURN 0; END IF;
  SELECT * INTO v_req FROM public.proc_approval_requests WHERE id=v_stage.request_id;
  IF v_req.id IS NULL THEN RETURN 0; END IF;
  v_role := COALESCE(v_stage.assigned_role, v_stage.required_role);

  -- Create user-targeted notifications for users currently holding the assigned role.
  FOR v_user IN SELECT p.id FROM public.profiles p WHERE p.role::TEXT=v_role LOOP
    IF NOT EXISTS (
      SELECT 1 FROM public.proc_approval_notifications n
      WHERE n.stage_id=v_stage.id AND n.recipient_user_id=v_user.id
        AND n.notification_type=p_notification_type
        AND n.created_at > NOW() - INTERVAL '20 minutes'
    ) THEN
      INSERT INTO public.proc_approval_notifications(request_id,stage_id,recipient_user_id,recipient_role,notification_type,title,message,severity,metadata)
      VALUES(v_req.id,v_stage.id,v_user.id,v_role,p_notification_type,p_title,p_message,p_severity,COALESCE(p_metadata,'{}'::jsonb));
      v_count := v_count + 1;
    END IF;
  END LOOP;

  -- Always retain a role-routed notification so newly created users and role-based
  -- inboxes can still see the event even when no profile currently matches.
  IF NOT EXISTS (
    SELECT 1 FROM public.proc_approval_notifications n
    WHERE n.stage_id=v_stage.id AND n.recipient_user_id IS NULL
      AND n.recipient_role=v_role AND n.notification_type=p_notification_type
      AND n.created_at > NOW() - INTERVAL '20 minutes'
  ) THEN
    INSERT INTO public.proc_approval_notifications(request_id,stage_id,recipient_role,notification_type,title,message,severity,metadata)
    VALUES(v_req.id,v_stage.id,v_role,p_notification_type,p_title,p_message,p_severity,COALESCE(p_metadata,'{}'::jsonb));
    v_count := v_count + 1;
  END IF;

  -- Active direct delegations receive the same operational event.
  FOR v_user IN
    SELECT DISTINCT d.delegate_user_id AS id
    FROM public.procurement_approval_delegations d
    WHERE d.status='ACTIVE' AND d.delegate_user_id IS NOT NULL
      AND (d.policy_version_id IS NULL OR d.policy_version_id=v_req.policy_version_id)
      AND d.effective_from <= NOW() AND d.effective_to > NOW()
      AND (d.source_role=v_stage.required_role OR d.source_role=v_stage.assigned_role)
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM public.proc_approval_notifications n
      WHERE n.stage_id=v_stage.id AND n.recipient_user_id=v_user.id
        AND n.notification_type='DELEGATION_ACTIVE'
        AND n.created_at > NOW() - INTERVAL '20 minutes'
    ) THEN
      INSERT INTO public.proc_approval_notifications(request_id,stage_id,recipient_user_id,recipient_role,notification_type,title,message,severity,metadata)
      VALUES(v_req.id,v_stage.id,v_user.id,v_role,'DELEGATION_ACTIVE','Delegated procurement approval',
        format('You are an active delegate for %s approval on this procurement request.',v_stage.required_role),'INFO',
        jsonb_build_object('source_role',v_stage.required_role,'assigned_role',v_stage.assigned_role));
      v_count := v_count + 1;
    END IF;
  END LOOP;

  RETURN v_count;
END $$;

CREATE OR REPLACE FUNCTION public.proc_generate_approval_notifications(p_limit INTEGER DEFAULT 100)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public
AS $$
DECLARE
  v_stage RECORD;
  v_created INTEGER := 0;
  v_due_soon INTEGER := 0;
BEGIN
  FOR v_stage IN
    SELECT s.*,r.document_id,r.document_type,p.doc_number,p.total_amount
    FROM public.proc_approval_stages s
    JOIN public.proc_approval_requests r ON r.id=s.request_id
    LEFT JOIN public.proc_purchase_orders p ON p.id=r.document_id AND r.document_type='PO'
    WHERE r.status='PENDING' AND s.status IN ('PENDING','ESCALATED')
    ORDER BY s.due_at LIMIT GREATEST(p_limit,1)
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM public.proc_approval_notifications n
      WHERE n.stage_id=v_stage.id AND n.notification_type='APPROVAL_REQUIRED'
    ) THEN
      v_created := v_created + public.proc_notify_stage(v_stage.id,'APPROVAL_REQUIRED','Procurement approval required',
        format('%s is awaiting Stage %s approval for amount %s.',COALESCE(v_stage.doc_number,v_stage.document_id::TEXT),v_stage.sequence_no,to_char(COALESCE(v_stage.total_amount,0),'FM999,999,999,990.00')),'INFO',
        jsonb_build_object('document_type',v_stage.document_type,'document_id',v_stage.document_id,'sequence_no',v_stage.sequence_no));
    END IF;

    IF v_stage.due_at <= NOW() + INTERVAL '24 hours' AND NOT EXISTS (
      SELECT 1 FROM public.proc_approval_notifications n
      WHERE n.stage_id=v_stage.id AND n.notification_type='SLA_DUE_SOON'
        AND n.created_at > NOW() - INTERVAL '24 hours'
    ) THEN
      v_due_soon := v_due_soon + public.proc_notify_stage(v_stage.id,'SLA_DUE_SOON','Approval SLA due soon',
        format('%s Stage %s is due by %s.',COALESCE(v_stage.doc_number,v_stage.document_id::TEXT),v_stage.sequence_no,to_char(v_stage.due_at,'YYYY-MM-DD HH24:MI')),
        CASE WHEN v_stage.due_at <= NOW() THEN 'CRITICAL' ELSE 'WARNING' END,
        jsonb_build_object('due_at',v_stage.due_at));
    END IF;
  END LOOP;
  RETURN jsonb_build_object('created_count',v_created,'due_soon_notifications',v_due_soon,'generated_at',NOW());
END $$;

CREATE OR REPLACE FUNCTION public.proc_approval_inbox(p_limit INTEGER DEFAULT 100)
RETURNS JSONB
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public
AS $$
DECLARE
  v_actor UUID := auth.uid();
  v_role TEXT;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  IF v_actor IS NULL THEN RAISE EXCEPTION 'AUTHENTICATION_REQUIRED'; END IF;
  SELECT p.role::TEXT INTO v_role FROM public.profiles p WHERE p.id=v_actor LIMIT 1;
  RETURN jsonb_build_object(
    'generated_at',v_now,
    'actor_user_id',v_actor,
    'actor_role',v_role,
    'summary',jsonb_build_object(
      'pending_count',(SELECT COUNT(*) FROM public.proc_approval_stages s JOIN public.proc_approval_requests r ON r.id=s.request_id WHERE r.status='PENDING' AND s.status IN ('PENDING','ESCALATED') AND (s.assigned_user_id=v_actor OR s.assigned_role=v_role OR EXISTS (SELECT 1 FROM public.procurement_approval_delegations d WHERE d.status='ACTIVE' AND d.effective_from<=v_now AND d.effective_to>v_now AND d.delegate_user_id=v_actor AND (d.source_role=s.required_role OR d.source_role=s.assigned_role)))),
      'overdue_count',(SELECT COUNT(*) FROM public.proc_approval_stages s JOIN public.proc_approval_requests r ON r.id=s.request_id WHERE r.status='PENDING' AND s.status IN ('PENDING','ESCALATED') AND s.due_at<v_now AND (s.assigned_user_id=v_actor OR s.assigned_role=v_role OR EXISTS (SELECT 1 FROM public.procurement_approval_delegations d WHERE d.status='ACTIVE' AND d.effective_from<=v_now AND d.effective_to>v_now AND d.delegate_user_id=v_actor AND (d.source_role=s.required_role OR d.source_role=s.assigned_role)))),
      'due_24h_count',(SELECT COUNT(*) FROM public.proc_approval_stages s JOIN public.proc_approval_requests r ON r.id=s.request_id WHERE r.status='PENDING' AND s.status IN ('PENDING','ESCALATED') AND s.due_at>=v_now AND s.due_at<=v_now+INTERVAL '24 hours' AND (s.assigned_user_id=v_actor OR s.assigned_role=v_role OR EXISTS (SELECT 1 FROM public.procurement_approval_delegations d WHERE d.status='ACTIVE' AND d.effective_from<=v_now AND d.effective_to>v_now AND d.delegate_user_id=v_actor AND (d.source_role=s.required_role OR d.source_role=s.assigned_role)))),
      'unread_notifications',(SELECT COUNT(*) FROM public.proc_approval_notifications n WHERE n.read_at IS NULL AND (n.recipient_user_id=v_actor OR n.recipient_role=v_role))
    ),
    'stages',COALESCE((SELECT jsonb_agg(to_jsonb(x) ORDER BY x.due_at) FROM (
      SELECT s.id,s.request_id,s.sequence_no,s.required_role,s.assigned_role,s.status,s.due_at,s.sla_hours,
             r.document_type,r.document_id,r.submitted_at,p.doc_number,p.total_amount,
             EXTRACT(EPOCH FROM (v_now-s.created_at))/3600.0 AS age_hours,
             CASE WHEN s.due_at<v_now THEN 'OVERDUE' WHEN s.due_at<=v_now+INTERVAL '24 hours' THEN 'DUE_SOON' ELSE 'ON_TRACK' END AS sla_state,
             EXISTS (SELECT 1 FROM public.procurement_approval_delegations d WHERE d.status='ACTIVE' AND d.effective_from<=v_now AND d.effective_to>v_now AND d.delegate_user_id=v_actor AND (d.source_role=s.required_role OR d.source_role=s.assigned_role)) AS delegated_for_actor
      FROM public.proc_approval_stages s JOIN public.proc_approval_requests r ON r.id=s.request_id
      LEFT JOIN public.proc_purchase_orders p ON p.id=r.document_id AND r.document_type='PO'
      WHERE r.status='PENDING' AND s.status IN ('PENDING','ESCALATED')
        AND (s.assigned_user_id=v_actor OR s.assigned_role=v_role OR EXISTS (SELECT 1 FROM public.procurement_approval_delegations d WHERE d.status='ACTIVE' AND d.effective_from<=v_now AND d.effective_to>v_now AND d.delegate_user_id=v_actor AND (d.source_role=s.required_role OR d.source_role=s.assigned_role)))
      LIMIT GREATEST(p_limit,1)
    ) x),'[]'::jsonb),
    'notifications',COALESCE((SELECT jsonb_agg(to_jsonb(n) ORDER BY n.created_at DESC) FROM (
      SELECT n.*,p.doc_number,p.total_amount
      FROM public.proc_approval_notifications n
      LEFT JOIN public.proc_approval_requests r ON r.id=n.request_id
      LEFT JOIN public.proc_purchase_orders p ON p.id=r.document_id AND r.document_type='PO'
      WHERE n.recipient_user_id=v_actor OR n.recipient_role=v_role
      ORDER BY n.created_at DESC LIMIT GREATEST(p_limit,1)
    ) n),'[]'::jsonb)
  );
END $$;

CREATE OR REPLACE FUNCTION public.proc_mark_approval_notification_read(p_notification_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public
AS $$
DECLARE v_actor UUID := auth.uid(); v_role TEXT; v_exists BOOLEAN;
BEGIN
  IF v_actor IS NULL THEN RAISE EXCEPTION 'AUTHENTICATION_REQUIRED'; END IF;
  SELECT p.role::TEXT INTO v_role FROM public.profiles p WHERE p.id=v_actor LIMIT 1;
  SELECT EXISTS(SELECT 1 FROM public.proc_approval_notifications n WHERE n.id=p_notification_id AND (n.recipient_user_id=v_actor OR n.recipient_role=v_role)) INTO v_exists;
  IF NOT v_exists THEN RAISE EXCEPTION 'NOTIFICATION_NOT_ACCESSIBLE'; END IF;
  UPDATE public.proc_approval_notifications SET read_at=COALESCE(read_at,NOW()) WHERE id=p_notification_id;
  RETURN TRUE;
END $$;

CREATE OR REPLACE FUNCTION public.proc_mark_all_approval_notifications_read()
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public
AS $$
DECLARE v_actor UUID := auth.uid(); v_role TEXT; v_count INTEGER;
BEGIN
  IF v_actor IS NULL THEN RAISE EXCEPTION 'AUTHENTICATION_REQUIRED'; END IF;
  SELECT p.role::TEXT INTO v_role FROM public.profiles p WHERE p.id=v_actor LIMIT 1;
  UPDATE public.proc_approval_notifications SET read_at=NOW() WHERE read_at IS NULL AND (recipient_user_id=v_actor OR recipient_role=v_role);
  GET DIAGNOSTICS v_count=ROW_COUNT;
  RETURN v_count;
END $$;

-- Generate operational notifications as part of lifecycle events.
CREATE OR REPLACE FUNCTION public.proc_escalate_due_approvals(p_limit INTEGER DEFAULT 100)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public
AS $$
DECLARE v_stage RECORD; v_count INTEGER:=0; v_notified INTEGER:=0;
BEGIN
  FOR v_stage IN SELECT s.*,r.policy_version_id,r.document_id,r.document_type FROM public.proc_approval_stages s JOIN public.proc_approval_requests r ON r.id=s.request_id
    WHERE r.status='PENDING' AND s.status IN ('PENDING','ESCALATED') AND s.due_at <= NOW() ORDER BY s.due_at LIMIT GREATEST(p_limit,1)
  LOOP
    UPDATE public.proc_approval_stages SET status='ESCALATED',assigned_role=COALESCE(escalation_role,assigned_role),due_at=NOW()+make_interval(hours=>sla_hours),updated_at=NOW() WHERE id=v_stage.id;
    INSERT INTO public.proc_approval_actions(request_id,stage_id,action,to_status,remarks,metadata)
    VALUES(v_stage.request_id,v_stage.id,'ESCALATED','ESCALATED','Approval SLA breached; routed to escalation role',jsonb_build_object('from_role',v_stage.assigned_role,'to_role',COALESCE(v_stage.escalation_role,v_stage.assigned_role),'previous_due_at',v_stage.due_at));
    v_notified := v_notified + public.proc_notify_stage(v_stage.id,'ESCALATED','Procurement approval escalated',
      format('Approval Stage %s breached its SLA and is now assigned to %s.',v_stage.sequence_no,COALESCE(v_stage.escalation_role,v_stage.assigned_role)),'CRITICAL',
      jsonb_build_object('previous_due_at',v_stage.due_at,'escalation_role',COALESCE(v_stage.escalation_role,v_stage.assigned_role)));
    v_count:=v_count+1;
  END LOOP;
  RETURN jsonb_build_object('escalated_count',v_count,'notification_count',v_notified,'executed_at',NOW());
END $$;

GRANT EXECUTE ON FUNCTION public.proc_notify_stage(UUID,TEXT,TEXT,TEXT,TEXT,JSONB) TO authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.proc_generate_approval_notifications(INTEGER) TO authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.proc_approval_inbox(INTEGER) TO authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.proc_mark_approval_notification_read(UUID) TO authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.proc_mark_all_approval_notifications_read() TO authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.proc_escalate_due_approvals(INTEGER) TO authenticated,service_role;
