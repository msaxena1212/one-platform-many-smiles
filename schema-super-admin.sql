-- 1. Update the role constraint on the profiles table
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('GUEST', 'HOST', 'ADMIN', 'SUPER_ADMIN', 'SALES', 'OWNER'));

-- 2. Create a helper function to easily check for super admin status
-- We use SECURITY DEFINER so it can access the profiles table without infinite recursion in RLS
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
  );
$$;

-- 3. Apply Super Admin bypass policies to all tables with RLS
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'profiles', 'properties', 'bookings', 
    'customers', 'reservations', 'leases', 'key_handovers', 'inspection_reports',
    'maintenance_tickets', 'gl_accounts', 'cost_centers', 'journal_entries',
    'journal_lines', 'invoices', 'receipts', 'bank_accounts', 'owner_payables', 'posting_rules'
  ];
BEGIN
  FOREACH t IN ARRAY tables
  LOOP
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = t) THEN
      EXECUTE format('DROP POLICY IF EXISTS "Super Admins can do everything" ON public.%I', t);
      EXECUTE format('CREATE POLICY "Super Admins can do everything" ON public.%I FOR ALL USING (public.is_super_admin())', t);
    END IF;
  END LOOP;
END
$$;
