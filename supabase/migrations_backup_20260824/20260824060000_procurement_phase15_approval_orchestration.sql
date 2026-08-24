-- Procurement Phase 15: multi-step approval orchestration, SLA escalation,
-- delegation-aware approval execution and immutable approval history.

CREATE TABLE IF NOT EXISTS public.proc_approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type TEXT NOT NULL,
  document_id UUID NOT NULL,
  policy_version_id UUID REFERENCES public.procurement_policy_versions(id),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','APPROVED','REJECTED','CANCELLED')),
  submitted_by UUID,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_proc_approval_request_open
  ON public.proc_approval_requests(document_type, document_id)
  WHERE status = 'PENDING';
CREATE INDEX IF NOT EXISTS idx_proc_approval_request_doc
  ON public.proc_approval_requests(document_type, document_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.proc_approval_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.proc_approval_requests(id) ON DELETE CASCADE,
  sequence_no INTEGER NOT NULL,
  required_role TEXT NOT NULL,
  escalation_role TEXT,
  sla_hours INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','APPROVED','REJECTED','ESCALATED','CANCELLED')),
  assigned_role TEXT NOT NULL,
  assigned_user_id UUID,
  due_at TIMESTAMPTZ NOT NULL,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ux_proc_approval_stage_sequence UNIQUE(request_id, sequence_no),
  CONSTRAINT ck_proc_approval_stage_sla CHECK (sla_hours > 0)
);
CREATE INDEX IF NOT EXISTS idx_proc_approval_stage_queue
  ON public.proc_approval_stages(status, assigned_role, due_at);

CREATE TABLE IF NOT EXISTS public.proc_approval_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.proc_approval_requests(id) ON DELETE CASCADE,
  stage_id UUID REFERENCES public.proc_approval_stages(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('SUBMITTED','APPROVED','REJECTED','ESCALATED','RESUBMITTED','CANCELLED')),
  actor_user_id UUID,
  actor_role TEXT,
  from_status TEXT,
  to_status TEXT,
  remarks TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_proc_approval_actions_request
  ON public.proc_approval_actions(request_id, created_at DESC);

ALTER TABLE public.proc_approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proc_approval_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proc_approval_actions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Procurement approval requests readable" ON public.proc_approval_requests;
CREATE POLICY "Procurement approval requests readable" ON public.proc_approval_requests FOR SELECT USING (true);
DROP POLICY IF EXISTS "Procurement approval stages readable" ON public.proc_approval_stages;
CREATE POLICY "Procurement approval stages readable" ON public.proc_approval_stages FOR SELECT USING (true);
DROP POLICY IF EXISTS "Procurement approval actions readable" ON public.proc_approval_actions;
CREATE POLICY "Procurement approval actions readable" ON public.proc_approval_actions FOR SELECT USING (true);

-- Mutations occur through SECURITY DEFINER orchestration RPCs so approval state
-- cannot be bypassed by directly editing stage rows from the client.
DROP POLICY IF EXISTS "Procurement approval requests managed by orchestration" ON public.proc_approval_requests;
CREATE POLICY "Procurement approval requests managed by orchestration" ON public.proc_approval_requests FOR ALL
USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS "Procurement approval stages managed by orchestration" ON public.proc_approval_stages;
CREATE POLICY "Procurement approval stages managed by orchestration" ON public.proc_approval_stages FOR ALL
USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS "Procurement approval actions managed by orchestration" ON public.proc_approval_actions;
CREATE POLICY "Procurement approval actions managed by orchestration" ON public.proc_approval_actions FOR ALL
USING (false) WITH CHECK (false);

CREATE OR REPLACE FUNCTION public.proc_document_amount(p_document_type TEXT, p_document_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public
AS $$
DECLARE v_amount NUMERIC;
BEGIN
  CASE UPPER(p_document_type)
    WHEN 'PO' THEN SELECT total_amount INTO v_amount FROM public.proc_purchase_orders WHERE id=p_document_id;
    WHEN 'QUOTE' THEN SELECT total_amount INTO v_amount FROM public.proc_vendor_quotes WHERE id=p_document_id;
    WHEN 'INVOICE' THEN SELECT total_amount INTO v_amount FROM public.proc_payable_invoices WHERE id=p_document_id;
    WHEN 'GRN' THEN SELECT total_amount INTO v_amount FROM public.proc_goods_receipts WHERE id=p_document_id;
    ELSE v_amount := NULL;
  END CASE;
  RETURN COALESCE(v_amount,0);
END $$;

CREATE OR REPLACE FUNCTION public.proc_actor_authorized_for_stage(
  p_required_role TEXT, p_assigned_role TEXT, p_actor UUID, p_amount NUMERIC, p_policy_id UUID, p_at TIMESTAMPTZ
)
RETURNS JSONB
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public
AS $$
DECLARE v_role TEXT; v_delegated BOOLEAN := FALSE;
BEGIN
  SELECT p.role::TEXT INTO v_role FROM public.profiles p WHERE p.id=p_actor LIMIT 1;
  IF v_role = COALESCE(p_assigned_role,p_required_role) OR v_role = p_required_role THEN
    RETURN jsonb_build_object('allowed',true,'role',v_role,'delegated',false,'reason','Actor role matches approval stage');
  END IF;
  SELECT EXISTS (
    SELECT 1 FROM public.procurement_approval_delegations d
    WHERE d.status='ACTIVE'
      AND (d.policy_version_id IS NULL OR d.policy_version_id=p_policy_id)
      AND d.effective_from <= p_at AND d.effective_to > p_at
      AND (d.max_amount IS NULL OR p_amount <= d.max_amount)
      AND (d.source_role=p_required_role OR d.source_role=p_assigned_role OR (d.source_user_id IS NOT NULL AND d.source_user_id=p_actor))
      AND (d.delegate_user_id=p_actor OR d.delegate_role=v_role)
  ) INTO v_delegated;
  RETURN jsonb_build_object('allowed',v_delegated,'role',v_role,'delegated',v_delegated,
    'reason',CASE WHEN v_delegated THEN 'Actor authorized under active delegation' ELSE format('Required role: %s',p_assigned_role) END);
END $$;

CREATE OR REPLACE FUNCTION public.proc_submit_approval_request(p_document_type TEXT, p_document_id UUID)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public
AS $$
DECLARE
  v_actor UUID := auth.uid(); v_amount NUMERIC; v_tenant UUID; v_policy public.procurement_policy_versions%ROWTYPE;
  v_request UUID; v_rule RECORD; v_count INTEGER := 0; v_first UUID; v_status TEXT := 'PENDING';
BEGIN
  IF v_actor IS NULL THEN RAISE EXCEPTION 'AUTHENTICATION_REQUIRED'; END IF;
  IF UPPER(p_document_type) <> 'PO' THEN RAISE EXCEPTION 'PHASE15_SUPPORTS_PO_ONLY'; END IF;
  SELECT property_id INTO v_tenant FROM public.proc_purchase_orders WHERE id=p_document_id;
  v_amount := public.proc_document_amount('PO',p_document_id);
  IF v_amount IS NULL THEN RAISE EXCEPTION 'DOCUMENT_NOT_FOUND'; END IF;

  SELECT * INTO v_policy FROM public.procurement_policy_versions p
  WHERE p.policy_code='DEFAULT_PROCUREMENT_DOA' AND p.status='ACTIVE'
    AND p.effective_from <= NOW() AND (p.effective_to IS NULL OR p.effective_to > NOW())
    AND (p.tenant_id IS NULL OR p.tenant_id=v_tenant)
  ORDER BY CASE WHEN p.tenant_id=v_tenant THEN 0 ELSE 1 END,p.effective_from DESC,p.version_no DESC LIMIT 1;
  IF v_policy.id IS NULL THEN RAISE EXCEPTION 'NO_ACTIVE_PROCUREMENT_POLICY'; END IF;

  SELECT id INTO v_request FROM public.proc_approval_requests WHERE document_type='PO' AND document_id=p_document_id AND status='PENDING' LIMIT 1;
  IF v_request IS NOT NULL THEN RETURN jsonb_build_object('request_id',v_request,'status','PENDING','reused',true); END IF;

  INSERT INTO public.proc_approval_requests(document_type,document_id,policy_version_id,submitted_by)
  VALUES('PO',p_document_id,v_policy.id,v_actor) RETURNING id INTO v_request;

  FOR v_rule IN SELECT * FROM public.procurement_policy_rules r
    WHERE r.policy_version_id=v_policy.id AND r.document_type='PO' AND r.active
      AND v_amount >= r.min_amount AND (r.max_amount IS NULL OR v_amount <= r.max_amount)
    ORDER BY r.approval_sequence, r.min_amount DESC
  LOOP
    v_count := v_count + 1;
    INSERT INTO public.proc_approval_stages(request_id,sequence_no,required_role,escalation_role,sla_hours,assigned_role,due_at)
    VALUES(v_request,v_rule.approval_sequence,v_rule.required_role,v_rule.escalation_role,v_rule.sla_hours,v_rule.required_role,NOW() + make_interval(hours=>v_rule.sla_hours))
    RETURNING id INTO v_first;
  END LOOP;
  IF v_count=0 THEN
    UPDATE public.proc_approval_requests SET status='APPROVED',completed_at=NOW(),updated_at=NOW() WHERE id=v_request;
    v_status := 'APPROVED';
  END IF;
  IF v_status='PENDING' THEN
    UPDATE public.proc_purchase_orders SET status='SUBMITTED',updated_at=NOW() WHERE id=p_document_id AND status::TEXT NOT IN ('APPROVED','CLOSED','CANCELLED');
  END IF;
  INSERT INTO public.proc_approval_actions(request_id,action,actor_user_id,to_status,remarks)
  VALUES(v_request,'SUBMITTED',v_actor,v_status,'Approval workflow submitted');
  RETURN jsonb_build_object('request_id',v_request,'status',v_status,'stage_count',v_count);
EXCEPTION WHEN unique_violation THEN
  SELECT id INTO v_request FROM public.proc_approval_requests WHERE document_type='PO' AND document_id=p_document_id AND status='PENDING' LIMIT 1;
  IF v_request IS NOT NULL THEN RETURN jsonb_build_object('request_id',v_request,'status','PENDING','reused',true); END IF;
  RAISE;
END $$;

CREATE OR REPLACE FUNCTION public.proc_approve_stage(p_stage_id UUID, p_decision TEXT, p_remarks TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public
AS $$
DECLARE
  v_actor UUID := auth.uid(); v_stage public.proc_approval_stages%ROWTYPE; v_req public.proc_approval_requests%ROWTYPE;
  v_amount NUMERIC; v_auth JSONB; v_next public.proc_approval_stages%ROWTYPE; v_final BOOLEAN := FALSE;
BEGIN
  IF v_actor IS NULL THEN RAISE EXCEPTION 'AUTHENTICATION_REQUIRED'; END IF;
  SELECT * INTO v_stage FROM public.proc_approval_stages WHERE id=p_stage_id FOR UPDATE;
  IF v_stage.id IS NULL THEN RAISE EXCEPTION 'APPROVAL_STAGE_NOT_FOUND'; END IF;
  SELECT * INTO v_req FROM public.proc_approval_requests WHERE id=v_stage.request_id FOR UPDATE;
  IF v_req.status <> 'PENDING' THEN RAISE EXCEPTION 'APPROVAL_REQUEST_NOT_PENDING'; END IF;
  IF v_stage.status NOT IN ('PENDING','ESCALATED') THEN RAISE EXCEPTION 'APPROVAL_STAGE_NOT_ACTIONABLE'; END IF;

  v_amount := public.proc_document_amount(v_req.document_type,v_req.document_id);
  v_auth := public.proc_actor_authorized_for_stage(v_stage.required_role,v_stage.assigned_role,v_actor,v_amount,v_req.policy_version_id,NOW());
  IF COALESCE((v_auth->>'allowed')::BOOLEAN,FALSE)=FALSE THEN RAISE EXCEPTION 'APPROVAL_ACTOR_NOT_AUTHORIZED: %',v_auth->>'reason'; END IF;

  IF UPPER(p_decision) NOT IN ('APPROVED','REJECTED') THEN RAISE EXCEPTION 'INVALID_APPROVAL_DECISION'; END IF;
  IF UPPER(p_decision)='REJECTED' THEN
    UPDATE public.proc_approval_stages SET status='REJECTED',approved_by=v_actor,approved_at=NOW(),remarks=p_remarks,updated_at=NOW() WHERE id=v_stage.id;
    UPDATE public.proc_approval_requests SET status='REJECTED',completed_at=NOW(),rejection_reason=p_remarks,updated_at=NOW() WHERE id=v_req.id;
    IF v_req.document_type='PO' THEN UPDATE public.proc_purchase_orders SET status='REJECTED',updated_at=NOW() WHERE id=v_req.document_id AND status::TEXT <> 'CLOSED'; END IF;
    INSERT INTO public.proc_approval_actions(request_id,stage_id,action,actor_user_id,actor_role,from_status,to_status,remarks,metadata)
    VALUES(v_req.id,v_stage.id,'REJECTED',v_actor,v_auth->>'role',v_stage.status,'REJECTED',p_remarks,v_auth);
    RETURN jsonb_build_object('request_id',v_req.id,'status','REJECTED','stage_id',v_stage.id);
  END IF;

  UPDATE public.proc_approval_stages SET status='APPROVED',approved_by=v_actor,approved_at=NOW(),remarks=p_remarks,updated_at=NOW() WHERE id=v_stage.id;
  SELECT * INTO v_next FROM public.proc_approval_stages WHERE request_id=v_req.id AND status='PENDING' ORDER BY sequence_no LIMIT 1;
  IF v_next.id IS NULL THEN
    v_final := TRUE;
    UPDATE public.proc_approval_requests SET status='APPROVED',completed_at=NOW(),updated_at=NOW() WHERE id=v_req.id;
    IF v_req.document_type='PO' THEN UPDATE public.proc_purchase_orders SET status='APPROVED',updated_at=NOW() WHERE id=v_req.document_id AND status::TEXT <> 'APPROVED'; END IF;
  END IF;
  INSERT INTO public.proc_approval_actions(request_id,stage_id,action,actor_user_id,actor_role,from_status,to_status,remarks,metadata)
  VALUES(v_req.id,v_stage.id,'APPROVED',v_actor,v_auth->>'role',v_stage.status,CASE WHEN v_final THEN 'APPROVED' ELSE 'PENDING' END,p_remarks,v_auth);
  RETURN jsonb_build_object('request_id',v_req.id,'status',CASE WHEN v_final THEN 'APPROVED' ELSE 'PENDING' END,'stage_id',v_stage.id,'next_stage_id',v_next.id,'delegated',COALESCE((v_auth->>'delegated')::BOOLEAN,FALSE));
END $$;

CREATE OR REPLACE FUNCTION public.proc_escalate_due_approvals(p_limit INTEGER DEFAULT 100)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public
AS $$
DECLARE v_stage RECORD; v_count INTEGER:=0; v_request public.proc_approval_requests%ROWTYPE;
BEGIN
  FOR v_stage IN SELECT s.*,r.policy_version_id,r.document_id,r.document_type FROM public.proc_approval_stages s JOIN public.proc_approval_requests r ON r.id=s.request_id
    WHERE r.status='PENDING' AND s.status='PENDING' AND s.due_at <= NOW() ORDER BY s.due_at LIMIT GREATEST(p_limit,1)
  LOOP
    UPDATE public.proc_approval_stages SET status='ESCALATED',assigned_role=COALESCE(escalation_role,assigned_role),due_at=NOW()+make_interval(hours=>sla_hours),updated_at=NOW() WHERE id=v_stage.id;
    INSERT INTO public.proc_approval_actions(request_id,stage_id,action,to_status,remarks,metadata)
    VALUES(v_stage.request_id,v_stage.id,'ESCALATED','ESCALATED','Approval SLA breached; routed to escalation role',jsonb_build_object('from_role',v_stage.assigned_role,'to_role',COALESCE(v_stage.escalation_role,v_stage.assigned_role),'previous_due_at',v_stage.due_at));
    v_count:=v_count+1;
  END LOOP;
  RETURN jsonb_build_object('escalated_count',v_count,'executed_at',NOW());
END $$;

CREATE OR REPLACE FUNCTION public.proc_approval_queue(p_limit INTEGER DEFAULT 100)
RETURNS JSONB
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public
AS $$
  SELECT jsonb_build_object(
    'generated_at',NOW(),
    'requests',COALESCE((SELECT jsonb_agg(to_jsonb(x) ORDER BY x.created_at DESC) FROM (
      SELECT r.*,p.doc_number,p.total_amount FROM public.proc_approval_requests r
      LEFT JOIN public.proc_purchase_orders p ON r.document_type='PO' AND p.id=r.document_id
      WHERE r.status='PENDING' LIMIT GREATEST(p_limit,1)
    ) x),'[]'::jsonb),
    'stages',COALESCE((SELECT jsonb_agg(to_jsonb(x) ORDER BY x.due_at) FROM (
      SELECT s.*,r.document_type,r.document_id,r.status AS request_status,p.doc_number,p.total_amount
      FROM public.proc_approval_stages s JOIN public.proc_approval_requests r ON r.id=s.request_id
      LEFT JOIN public.proc_purchase_orders p ON r.document_type='PO' AND p.id=r.document_id
      WHERE r.status='PENDING' AND s.status IN ('PENDING','ESCALATED') LIMIT GREATEST(p_limit,1)
    ) x),'[]'::jsonb),
    'history',COALESCE((SELECT jsonb_agg(to_jsonb(x) ORDER BY x.created_at DESC) FROM (
      SELECT a.* FROM public.proc_approval_actions a ORDER BY a.created_at DESC LIMIT GREATEST(p_limit,1)
    ) x),'[]'::jsonb)
  );
$$;

CREATE OR REPLACE FUNCTION public.proc_approval_request_detail(p_request_id UUID)
RETURNS JSONB LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT jsonb_build_object(
    'request',(SELECT to_jsonb(r) FROM public.proc_approval_requests r WHERE r.id=p_request_id),
    'stages',COALESCE((SELECT jsonb_agg(to_jsonb(s) ORDER BY s.sequence_no) FROM public.proc_approval_stages s WHERE s.request_id=p_request_id),'[]'::jsonb),
    'history',COALESCE((SELECT jsonb_agg(to_jsonb(a) ORDER BY a.created_at DESC) FROM public.proc_approval_actions a WHERE a.request_id=p_request_id),'[]'::jsonb)
  );
$$;

GRANT EXECUTE ON FUNCTION public.proc_submit_approval_request(TEXT,UUID) TO authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.proc_approve_stage(UUID,TEXT,TEXT) TO authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.proc_escalate_due_approvals(INTEGER) TO authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.proc_approval_queue(INTEGER) TO authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.proc_approval_request_detail(UUID) TO authenticated,service_role;

-- Phase 14's direct role check is replaced by an orchestration-complete check.
-- REPORT_ONLY remains non-blocking; ENFORCE requires a completed approval request.
CREATE OR REPLACE FUNCTION public.proc_enforce_po_approval_policy()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_policy public.procurement_policy_versions%ROWTYPE; v_request public.proc_approval_requests%ROWTYPE;
BEGIN
  IF NEW.status::TEXT='APPROVED' AND COALESCE(OLD.status::TEXT,'') <> 'APPROVED' THEN
    SELECT * INTO v_policy FROM public.procurement_policy_versions p
    WHERE p.policy_code='DEFAULT_PROCUREMENT_DOA' AND p.status='ACTIVE' AND p.effective_from<=NOW()
      AND (p.effective_to IS NULL OR p.effective_to>NOW()) AND (p.tenant_id IS NULL OR p.tenant_id=NEW.property_id)
    ORDER BY CASE WHEN p.tenant_id=NEW.property_id THEN 0 ELSE 1 END,p.effective_from DESC,p.version_no DESC LIMIT 1;
    IF COALESCE(v_policy.enforcement_mode,'REPORT_ONLY')='ENFORCE' THEN
      SELECT * INTO v_request FROM public.proc_approval_requests r WHERE r.document_type='PO' AND r.document_id=NEW.id ORDER BY r.created_at DESC LIMIT 1;
      IF v_request.id IS NULL OR v_request.status <> 'APPROVED' THEN
        RAISE EXCEPTION 'PROCUREMENT_APPROVAL_POLICY_BLOCKED: multi-step approval is not complete';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_proc_po_approval_policy ON public.proc_purchase_orders;
CREATE TRIGGER trg_proc_po_approval_policy BEFORE UPDATE OF status ON public.proc_purchase_orders
FOR EACH ROW EXECUTE FUNCTION public.proc_enforce_po_approval_policy();
