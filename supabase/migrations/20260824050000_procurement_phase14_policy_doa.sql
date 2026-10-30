-- Procurement Phase 14: versioned policy configuration, delegation of authority,
-- approval resolution and controlled PO approval enforcement.

CREATE TABLE IF NOT EXISTS public.procurement_policy_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_code TEXT NOT NULL,
  version_no INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','ACTIVE','RETIRED')),
  enforcement_mode TEXT NOT NULL DEFAULT 'REPORT_ONLY' CHECK (enforcement_mode IN ('REPORT_ONLY','ENFORCE')),
  effective_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  effective_to TIMESTAMPTZ,
  tenant_id UUID,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ux_proc_policy_version UNIQUE (policy_code, version_no, tenant_id),
  CONSTRAINT ck_proc_policy_dates CHECK (effective_to IS NULL OR effective_to > effective_from)
);

CREATE TABLE IF NOT EXISTS public.procurement_policy_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_version_id UUID NOT NULL REFERENCES public.procurement_policy_versions(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL DEFAULT 'PO',
  min_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  max_amount NUMERIC(18,2),
  required_role TEXT NOT NULL,
  approval_sequence INTEGER NOT NULL DEFAULT 1,
  sla_hours INTEGER NOT NULL DEFAULT 48,
  escalation_role TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_proc_policy_rule_amounts CHECK (min_amount >= 0 AND (max_amount IS NULL OR max_amount >= min_amount)),
  CONSTRAINT ck_proc_policy_rule_sla CHECK (sla_hours > 0)
);

CREATE TABLE IF NOT EXISTS public.procurement_approval_delegations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_version_id UUID REFERENCES public.procurement_policy_versions(id) ON DELETE CASCADE,
  source_role TEXT,
  delegate_role TEXT,
  source_user_id UUID,
  delegate_user_id UUID,
  max_amount NUMERIC(18,2),
  effective_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  effective_to TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT','ACTIVE','REVOKED','EXPIRED')),
  reason TEXT,
  tenant_id UUID,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_proc_delegation_principal CHECK (source_role IS NOT NULL OR source_user_id IS NOT NULL),
  CONSTRAINT ck_proc_delegation_delegate CHECK (delegate_role IS NOT NULL OR delegate_user_id IS NOT NULL),
  CONSTRAINT ck_proc_delegation_dates CHECK (effective_to > effective_from),
  CONSTRAINT ck_proc_delegation_amount CHECK (max_amount IS NULL OR max_amount >= 0)
);

CREATE INDEX IF NOT EXISTS idx_proc_policy_active ON public.procurement_policy_versions(policy_code, tenant_id, status, effective_from DESC);
CREATE INDEX IF NOT EXISTS idx_proc_policy_rules_lookup ON public.procurement_policy_rules(policy_version_id, document_type, min_amount, max_amount, active);
CREATE INDEX IF NOT EXISTS idx_proc_delegations_active ON public.procurement_approval_delegations(tenant_id, status, effective_from, effective_to);

ALTER TABLE public.procurement_policy_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_policy_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_approval_delegations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Procurement policy versions readable" ON public.procurement_policy_versions;
CREATE POLICY "Procurement policy versions readable" ON public.procurement_policy_versions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Procurement policy rules readable" ON public.procurement_policy_rules;
CREATE POLICY "Procurement policy rules readable" ON public.procurement_policy_rules FOR SELECT USING (true);
DROP POLICY IF EXISTS "Procurement delegations readable" ON public.procurement_approval_delegations;
CREATE POLICY "Procurement delegations readable" ON public.procurement_approval_delegations FOR SELECT USING (true);

-- Administrative writes are restricted to SUPER_ADMIN/ADMIN where the application has a profile row.
DROP POLICY IF EXISTS "Procurement policy versions managed by admins" ON public.procurement_policy_versions;
CREATE POLICY "Procurement policy versions managed by admins" ON public.procurement_policy_versions FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('SUPER_ADMIN','ADMIN')))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('SUPER_ADMIN','ADMIN')));
DROP POLICY IF EXISTS "Procurement policy rules managed by admins" ON public.procurement_policy_rules;
CREATE POLICY "Procurement policy rules managed by admins" ON public.procurement_policy_rules FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('SUPER_ADMIN','ADMIN')))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('SUPER_ADMIN','ADMIN')));
DROP POLICY IF EXISTS "Procurement delegations managed by admins" ON public.procurement_approval_delegations;
CREATE POLICY "Procurement delegations managed by admins" ON public.procurement_approval_delegations FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('SUPER_ADMIN','ADMIN')))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('SUPER_ADMIN','ADMIN')));

-- Seed one global, versioned procurement policy. It starts in ENFORCE mode with
-- conservative authority tiers; organisations can create a new version instead of editing history.
DO $$
DECLARE
  v_policy UUID;
BEGIN
  SELECT id INTO v_policy
  FROM public.procurement_policy_versions
  WHERE policy_code='DEFAULT_PROCUREMENT_DOA' AND version_no=1 AND tenant_id IS NULL;

  IF v_policy IS NULL THEN
    INSERT INTO public.procurement_policy_versions
      (policy_code,version_no,status,enforcement_mode,effective_from,notes)
    VALUES
      ('DEFAULT_PROCUREMENT_DOA',1,'ACTIVE','ENFORCE',NOW(),
       'Default procurement delegation-of-authority policy. Replace with an organisation-approved policy version before production compliance reliance.')
    RETURNING id INTO v_policy;

    INSERT INTO public.procurement_policy_rules
      (policy_version_id,document_type,min_amount,max_amount,required_role,approval_sequence,sla_hours,escalation_role)
    VALUES
      (v_policy,'PO',0,100000,'FINANCE',1,48,'ADMIN'),
      (v_policy,'PO',100000.01,500000,'ADMIN',1,48,'SUPER_ADMIN'),
      (v_policy,'PO',500000.01,NULL,'SUPER_ADMIN',1,24,NULL);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.proc_get_current_profile_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.role::TEXT FROM public.profiles p WHERE p.id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.proc_resolve_approval_policy(
  p_document_type TEXT,
  p_amount NUMERIC,
  p_tenant_id UUID DEFAULT NULL,
  p_actor_user_id UUID DEFAULT NULL,
  p_at TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor UUID := COALESCE(p_actor_user_id, auth.uid());
  v_role TEXT;
  v_tenant UUID := p_tenant_id;
  v_policy public.procurement_policy_versions%ROWTYPE;
  v_rule public.procurement_policy_rules%ROWTYPE;
  v_delegated BOOLEAN := FALSE;
  v_allowed BOOLEAN := FALSE;
  v_reason TEXT := 'No applicable approval rule found';
BEGIN
  IF v_role IS NULL AND v_actor IS NOT NULL THEN
    SELECT p.role::TEXT, COALESCE(v_tenant,p.tenant_id) INTO v_role,v_tenant FROM public.profiles p WHERE p.id=v_actor LIMIT 1;
  END IF;

  SELECT * INTO v_policy
  FROM public.procurement_policy_versions p
  WHERE p.policy_code='DEFAULT_PROCUREMENT_DOA'
    AND p.status='ACTIVE'
    AND p.effective_from <= p_at
    AND (p.effective_to IS NULL OR p.effective_to > p_at)
    AND (p.tenant_id IS NULL OR p.tenant_id=v_tenant)
  ORDER BY CASE WHEN p.tenant_id=v_tenant THEN 0 ELSE 1 END, p.effective_from DESC, p.version_no DESC
  LIMIT 1;

  IF v_policy.id IS NULL THEN
    RETURN jsonb_build_object('allowed',FALSE,'enforcement_mode','REPORT_ONLY','reason','No active procurement policy');
  END IF;

  SELECT * INTO v_rule
  FROM public.procurement_policy_rules r
  WHERE r.policy_version_id=v_policy.id
    AND r.document_type=COALESCE(p_document_type,'PO')
    AND r.active=TRUE
    AND p_amount >= r.min_amount
    AND (r.max_amount IS NULL OR p_amount <= r.max_amount)
  ORDER BY r.approval_sequence, r.min_amount DESC
  LIMIT 1;

  IF v_rule.id IS NULL THEN
    v_reason := 'Amount does not fall within an approval tier';
  ELSE
    v_allowed := COALESCE(v_role = v_rule.required_role,FALSE);
    IF NOT v_allowed THEN
      SELECT EXISTS (
        SELECT 1 FROM public.procurement_approval_delegations d
        WHERE d.status='ACTIVE'
          AND (d.policy_version_id IS NULL OR d.policy_version_id=v_policy.id)
          AND d.effective_from <= p_at AND d.effective_to > p_at
          AND (d.tenant_id IS NULL OR d.tenant_id=v_tenant)
          AND (d.max_amount IS NULL OR p_amount <= d.max_amount)
          AND (d.source_role=v_rule.required_role OR (d.source_role IS NULL AND d.source_user_id IS NOT NULL))
          AND (d.delegate_user_id=v_actor OR d.delegate_role=v_role)
      ) INTO v_delegated;
      v_allowed := v_delegated;
    END IF;
    IF v_allowed THEN
      v_reason := CASE WHEN v_delegated THEN 'Approved under active delegation' ELSE 'Actor role matches required approval role' END;
    ELSE
      v_reason := format('Required role: %s',v_rule.required_role);
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'allowed',v_allowed,
    'enforcement_mode',v_policy.enforcement_mode,
    'policy_id',v_policy.id,
    'policy_code',v_policy.policy_code,
    'version_no',v_policy.version_no,
    'document_type',COALESCE(p_document_type,'PO'),
    'amount',p_amount,
    'actor_user_id',v_actor,
    'actor_role',v_role,
    'required_role',NULLIF(v_rule.required_role,''),
    'approval_sequence',v_rule.approval_sequence,
    'sla_hours',v_rule.sla_hours,
    'escalation_role',v_rule.escalation_role,
    'delegated',v_delegated,
    'reason',v_reason
  );
END $$;

GRANT EXECUTE ON FUNCTION public.proc_resolve_approval_policy(TEXT,NUMERIC,UUID,UUID,TIMESTAMPTZ) TO authenticated, service_role;

-- Controlled enforcement at the database boundary. REPORT_ONLY policies never block.
CREATE OR REPLACE FUNCTION public.proc_enforce_po_approval_policy()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  IF NEW.status::TEXT='APPROVED' AND COALESCE(OLD.status::TEXT,'') <> 'APPROVED' THEN
    v_result := public.proc_resolve_approval_policy('PO',NEW.total_amount,NEW.property_id,auth.uid(),NOW());
    IF COALESCE(v_result->>'enforcement_mode','REPORT_ONLY')='ENFORCE'
       AND COALESCE((v_result->>'allowed')::BOOLEAN,FALSE)=FALSE THEN
      RAISE EXCEPTION 'PROCUREMENT_APPROVAL_POLICY_BLOCKED: %', COALESCE(v_result->>'reason','Approval authority check failed');
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_proc_po_approval_policy ON public.proc_purchase_orders;
CREATE TRIGGER trg_proc_po_approval_policy
BEFORE UPDATE OF status ON public.proc_purchase_orders
FOR EACH ROW EXECUTE FUNCTION public.proc_enforce_po_approval_policy();

CREATE OR REPLACE FUNCTION public.proc_policy_admin_snapshot(
  p_tenant_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'suite','PROCUREMENT_POLICY_ADMIN_SNAPSHOT',
    'generated_at',NOW(),
    'active_policies',COALESCE((SELECT jsonb_agg(to_jsonb(p) ORDER BY p.effective_from DESC) FROM public.procurement_policy_versions p WHERE p.status='ACTIVE' AND (p.tenant_id IS NULL OR p.tenant_id=p_tenant_id)),'[]'::jsonb),
    'rules',COALESCE((SELECT jsonb_agg(to_jsonb(r) ORDER BY r.min_amount) FROM public.procurement_policy_rules r JOIN public.procurement_policy_versions p ON p.id=r.policy_version_id WHERE p.status='ACTIVE' AND (p.tenant_id IS NULL OR p.tenant_id=p_tenant_id)),'[]'::jsonb),
    'delegations',COALESCE((SELECT jsonb_agg(to_jsonb(d) ORDER BY d.effective_to) FROM public.procurement_approval_delegations d WHERE d.status='ACTIVE' AND (d.tenant_id IS NULL OR d.tenant_id=p_tenant_id)),'[]'::jsonb)
  );
$$;

GRANT EXECUTE ON FUNCTION public.proc_policy_admin_snapshot(UUID) TO authenticated, service_role;
