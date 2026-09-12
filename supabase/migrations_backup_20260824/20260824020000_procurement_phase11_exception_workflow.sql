-- Procurement Phase 11: exception resolution workflow.
-- Resolution records are separate from source transactions. Resolving an exception
-- never mutates the underlying PO/GRN/AP/3-way-match/accounting records.

CREATE TABLE IF NOT EXISTS public.proc_exception_resolutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exception_key TEXT NOT NULL UNIQUE,
  source_type TEXT NOT NULL,
  source_id UUID NOT NULL,
  source_number TEXT,
  control_id TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'HIGH' CHECK (severity IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','IN_PROGRESS','RESOLVED','REOPENED')),
  resolution_notes TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_proc_exception_resolution_status
  ON public.proc_exception_resolutions(status, severity, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_proc_exception_resolution_source
  ON public.proc_exception_resolutions(source_type, source_id);

ALTER TABLE public.proc_exception_resolutions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS proc_exception_resolution_read ON public.proc_exception_resolutions;
CREATE POLICY proc_exception_resolution_read
  ON public.proc_exception_resolutions FOR SELECT
  TO authenticated
  USING (true);

CREATE OR REPLACE FUNCTION public.proc_exception_can_manage()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('FINANCE','ADMIN','SUPER_ADMIN')
  );
$$;

CREATE OR REPLACE FUNCTION public.proc_exception_queue(p_limit INTEGER DEFAULT 50)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_po RECORD;
  v_suite JSONB;
  v_test JSONB;
  v_items JSONB := '[]'::jsonb;
  v_count INTEGER := 0;
  v_status TEXT;
  v_resolution RECORD;
  v_key TEXT;
  v_severity TEXT;
BEGIN
  FOR v_po IN
    SELECT id, doc_number, status, created_at
    FROM public.proc_purchase_orders
    WHERE status NOT IN ('CANCELLED','REJECTED')
    ORDER BY created_at DESC
    LIMIT GREATEST(1, LEAST(COALESCE(p_limit,50),200))
  LOOP
    v_suite := public.proc_uat_validate_po(v_po.id);
    FOR v_test IN SELECT value FROM jsonb_array_elements(v_suite->'tests')
    LOOP
      IF COALESCE((v_test->>'passed')::boolean, FALSE) THEN
        CONTINUE;
      END IF;

      v_key := format('PO:%s:%s', v_po.id, v_test->>'id');
      SELECT * INTO v_resolution
      FROM public.proc_exception_resolutions
      WHERE exception_key = v_key;

      v_status := COALESCE(v_resolution.status, 'OPEN');
      v_severity := CASE
        WHEN v_test->>'id' IN ('THREE_WAY_MATCH','RECONCILIATION','RELEASE_READINESS') THEN 'CRITICAL'
        WHEN v_test->>'id' IN ('GRN_POSTED','AP_INVOICE_PRESENT') THEN 'HIGH'
        ELSE 'MEDIUM'
      END;

      v_items := v_items || jsonb_build_array(jsonb_build_object(
        'exception_key', v_key,
        'source_type', 'PO',
        'source_id', v_po.id,
        'source_number', v_po.doc_number,
        'control_id', v_test->>'id',
        'severity', v_severity,
        'detail', v_test->>'detail',
        'status', v_status,
        'resolution_id', v_resolution.id,
        'resolution_notes', v_resolution.resolution_notes,
        'assigned_to', v_resolution.assigned_to,
        'resolved_by', v_resolution.resolved_by,
        'resolved_at', v_resolution.resolved_at
      ));
      v_count := v_count + 1;
    END LOOP;
  END LOOP;

  RETURN jsonb_build_object(
    'suite','PROCUREMENT_EXCEPTION_QUEUE',
    'exception_count',v_count,
    'exceptions',v_items,
    'generated_at',now()
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.proc_resolve_exception(
  p_exception_key TEXT,
  p_status TEXT DEFAULT 'RESOLVED',
  p_resolution_notes TEXT DEFAULT NULL,
  p_assigned_to UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_source_id UUID;
  v_source_type TEXT;
  v_source_number TEXT;
  v_control_id TEXT;
  v_resolution public.proc_exception_resolutions;
BEGIN
  IF NOT public.proc_exception_can_manage() THEN
    RAISE EXCEPTION 'You are not authorized to manage procurement exceptions';
  END IF;

  IF p_status NOT IN ('OPEN','IN_PROGRESS','RESOLVED','REOPENED') THEN
    RAISE EXCEPTION 'Invalid exception status: %', p_status;
  END IF;

  IF p_exception_key !~ '^PO:[0-9a-fA-F-]{36}:.+$' THEN
    RAISE EXCEPTION 'Invalid procurement exception key';
  END IF;

  v_source_id := split_part(p_exception_key, ':', 2)::uuid;
  v_source_type := 'PO';
  v_control_id := split_part(p_exception_key, ':', 3);

  SELECT doc_number INTO v_source_number
  FROM public.proc_purchase_orders WHERE id = v_source_id;
  IF v_source_number IS NULL THEN
    RAISE EXCEPTION 'Purchase order not found for exception';
  END IF;

  INSERT INTO public.proc_exception_resolutions (
    exception_key, source_type, source_id, source_number, control_id,
    status, resolution_notes, assigned_to, resolved_by, resolved_at, updated_at
  ) VALUES (
    p_exception_key, v_source_type, v_source_id, v_source_number, v_control_id,
    p_status, NULLIF(trim(p_resolution_notes), ''), p_assigned_to,
    CASE WHEN p_status = 'RESOLVED' THEN auth.uid() ELSE NULL END,
    CASE WHEN p_status = 'RESOLVED' THEN now() ELSE NULL END,
    now()
  )
  ON CONFLICT (exception_key) DO UPDATE SET
    status = EXCLUDED.status,
    resolution_notes = EXCLUDED.resolution_notes,
    assigned_to = EXCLUDED.assigned_to,
    resolved_by = CASE WHEN EXCLUDED.status = 'RESOLVED' THEN auth.uid() ELSE NULL END,
    resolved_at = CASE WHEN EXCLUDED.status = 'RESOLVED' THEN now() ELSE NULL END,
    updated_at = now()
  RETURNING * INTO v_resolution;

  RETURN jsonb_build_object(
    'success',true,
    'exception',to_jsonb(v_resolution),
    'warning','Resolution status records the operational disposition only; source transaction controls must still pass.'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.proc_reopen_exception(
  p_exception_key TEXT,
  p_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.proc_resolve_exception(p_exception_key, 'REOPENED', p_reason, NULL);
END;
$$;

GRANT EXECUTE ON FUNCTION public.proc_exception_queue(INTEGER) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.proc_resolve_exception(TEXT,TEXT,TEXT,UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.proc_reopen_exception(TEXT,TEXT) TO authenticated, service_role;
REVOKE INSERT, UPDATE, DELETE ON public.proc_exception_resolutions FROM authenticated;
