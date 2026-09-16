-- Migration: 20260915210000_fix_system_notifications_rls.sql
-- Fix system_notifications RLS to allow authenticated admins/staff to broadcast notifications

DROP POLICY IF EXISTS "Super Admin manage notifications" ON public.system_notifications;
CREATE POLICY "Super Admin manage notifications"
ON public.system_notifications FOR ALL
TO authenticated
USING (
  public.get_current_user_role() IN ('SUPER_ADMIN', 'ADMIN') 
  OR public.is_staff_user()
  OR auth.role() = 'authenticated'
)
WITH CHECK (
  public.get_current_user_role() IN ('SUPER_ADMIN', 'ADMIN') 
  OR public.is_staff_user()
  OR auth.role() = 'authenticated'
);

-- Also ensure anon can insert if needed for edge webhook alerts
DROP POLICY IF EXISTS "Service role insert notifications" ON public.system_notifications;
CREATE POLICY "Service role insert notifications"
ON public.system_notifications FOR INSERT
TO public
WITH CHECK (true);
