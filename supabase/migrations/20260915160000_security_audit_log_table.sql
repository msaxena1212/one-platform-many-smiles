-- =============================================================================
-- Migration: 20260915160000_security_audit_log_table.sql
-- Description: Persistent security audit log table for all platform events.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type    TEXT NOT NULL CHECK (event_type IN ('auth', 'access_denied', 'data_mutation', 'suspicious_activity', 'system')),
  severity      TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')) DEFAULT 'info',
  user_id       UUID,
  user_role     TEXT,
  resource      TEXT,
  action        TEXT,
  details       JSONB,
  ip_address    TEXT,
  user_agent    TEXT,
  timestamp     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast time-range queries and user-specific lookup
CREATE INDEX IF NOT EXISTS idx_security_audit_timestamp ON public.security_audit_logs (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_user_id   ON public.security_audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_event_type ON public.security_audit_logs (event_type);

-- Enable RLS
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only ADMIN and SUPER_ADMIN can read audit logs
DROP POLICY IF EXISTS "Admins can view security audit logs" ON public.security_audit_logs;
CREATE POLICY "Admins can view security audit logs"
ON public.security_audit_logs FOR SELECT
TO authenticated
USING (public.is_staff_user());

-- Authenticated users can insert (log events)
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.security_audit_logs;
CREATE POLICY "Authenticated users can insert audit logs"
ON public.security_audit_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- Anon can also insert (for pre-auth events like failed login attempts)
DROP POLICY IF EXISTS "Anon can insert audit logs" ON public.security_audit_logs;
CREATE POLICY "Anon can insert audit logs"
ON public.security_audit_logs FOR INSERT
TO anon
WITH CHECK (true);

-- Nobody can update or delete audit logs (immutable audit trail)
-- (No UPDATE or DELETE policies — default deny when RLS is on)
