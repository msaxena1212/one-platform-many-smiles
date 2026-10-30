-- =============================================================================
-- Migration: 20260923000001_security_audit_hardening.sql
-- Description: Hardening the security_audit_logs table to be write-only.
-- Prevents audit trail tampering by ensuring no one (except service_role) can 
-- update or delete logs.
-- =============================================================================

-- 1. Enable RLS on the table
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. Drop all existing policies to start clean
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.security_audit_logs;
DROP POLICY IF EXISTS "Staff can view logs" ON public.security_audit_logs;
DROP POLICY IF EXISTS "Staff can manage logs" ON public.security_audit_logs;

-- 3. CREATE WRITE-ONLY POLICY
-- Authenticated users can INSERT logs, but they cannot UPDATE or DELETE them.
CREATE POLICY "Users can insert audit logs"
ON public.security_audit_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 4. CREATE READ POLICY
-- Only SUPER_ADMIN can view the security audit logs.
CREATE POLICY "Only Super Admins can view security logs"
ON public.security_audit_logs
FOR SELECT
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'SUPER_ADMIN'
);

-- 5. EXPLICITLY DENY UPDATE AND DELETE
-- While RLS defaults to deny, we ensure no policies allow update/delete for any user.
-- (No policy created for UPDATE or DELETE means they are forbidden by default)

-- 6. ADD INDEX FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_timestamp ON public.security_audit_logs (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_user_id ON public.security_audit_logs (user_id);
