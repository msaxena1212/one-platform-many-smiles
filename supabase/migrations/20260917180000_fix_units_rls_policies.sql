-- =============================================================================
-- Migration: 20260917180000_fix_units_rls_policies.sql
-- Description: Ensure Row Level Security (RLS) policies on public.units allow
--              inserts, updates, selects, and deletes for anon and authenticated users
--              during PMS operations and bulk Excel imports.
-- =============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'units') THEN
    ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing restrictive or misconfigured policies on units
DROP POLICY IF EXISTS "Public units are viewable by all" ON public.units;
DROP POLICY IF EXISTS "Authenticated users can manage units" ON public.units;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.units;
DROP POLICY IF EXISTS "Allow all operations for anon and authenticated" ON public.units;
DROP POLICY IF EXISTS "Staff can manage units" ON public.units;
DROP POLICY IF EXISTS "Anyone can insert units" ON public.units;
DROP POLICY IF EXISTS "Anyone can update units" ON public.units;
DROP POLICY IF EXISTS "Anyone can delete units" ON public.units;

-- Recreate clean permissive RLS policies for units
CREATE POLICY "Public units are viewable by all"
ON public.units FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow all operations for anon and authenticated"
ON public.units FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);
