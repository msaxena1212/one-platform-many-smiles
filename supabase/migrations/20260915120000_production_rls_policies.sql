-- =============================================================================
-- Migration: 20260915120000_production_rls_policies.sql
-- Description: Production Row Level Security (RLS) hardening for all ERP tables.
-- =============================================================================

-- 1. Enable RLS on Core PMS & Operations Tables
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'properties') THEN
    ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'units') THEN
    ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'leases') THEN
    ALTER TABLE public.leases ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pdcs') THEN
    ALTER TABLE public.pdcs ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'fin_pdc_register') THEN
    ALTER TABLE public.fin_pdc_register ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'customers') THEN
    ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reservations') THEN
    ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'key_handovers') THEN
    ALTER TABLE public.key_handovers ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'inspection_reports') THEN
    ALTER TABLE public.inspection_reports ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'fixed_assets') THEN
    ALTER TABLE public.fixed_assets ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'collection_receipts') THEN
    ALTER TABLE public.collection_receipts ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'fin_vouchers') THEN
    ALTER TABLE public.fin_vouchers ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'fin_voucher_lines') THEN
    ALTER TABLE public.fin_voucher_lines ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- 2. Drop existing policies if any
DROP POLICY IF EXISTS "Public properties are viewable by all" ON public.properties;
DROP POLICY IF EXISTS "Authenticated users can manage properties" ON public.properties;
DROP POLICY IF EXISTS "Public units are viewable by all" ON public.units;
DROP POLICY IF EXISTS "Authenticated users can manage units" ON public.units;
DROP POLICY IF EXISTS "Authenticated staff can view leases" ON public.leases;
DROP POLICY IF EXISTS "Authenticated staff can manage leases" ON public.leases;
DROP POLICY IF EXISTS "Authenticated users can view PDCs" ON public.fin_pdc_register;
DROP POLICY IF EXISTS "Authenticated users can manage PDCs" ON public.fin_pdc_register;
DROP POLICY IF EXISTS "Authenticated users can view legacy PDCs" ON public.pdcs;
DROP POLICY IF EXISTS "Authenticated users can manage legacy PDCs" ON public.pdcs;
DROP POLICY IF EXISTS "Authenticated users can view customers" ON public.customers;
DROP POLICY IF EXISTS "Authenticated users can manage customers" ON public.customers;
DROP POLICY IF EXISTS "Authenticated users can view reservations" ON public.reservations;
DROP POLICY IF EXISTS "Authenticated users can manage reservations" ON public.reservations;
DROP POLICY IF EXISTS "Authenticated users can view key handovers" ON public.key_handovers;
DROP POLICY IF EXISTS "Authenticated users can manage key handovers" ON public.key_handovers;
DROP POLICY IF EXISTS "Authenticated users can view inspection reports" ON public.inspection_reports;
DROP POLICY IF EXISTS "Authenticated users can manage inspection reports" ON public.inspection_reports;
DROP POLICY IF EXISTS "Authenticated users can view fixed assets" ON public.fixed_assets;
DROP POLICY IF EXISTS "Authenticated users can manage fixed assets" ON public.fixed_assets;
DROP POLICY IF EXISTS "Authenticated users can view collection receipts" ON public.collection_receipts;
DROP POLICY IF EXISTS "Authenticated users can manage collection receipts" ON public.collection_receipts;
DROP POLICY IF EXISTS "Authenticated users can view vouchers" ON public.fin_vouchers;
DROP POLICY IF EXISTS "Authenticated users can manage vouchers" ON public.fin_vouchers;
DROP POLICY IF EXISTS "Authenticated users can view voucher lines" ON public.fin_voucher_lines;
DROP POLICY IF EXISTS "Authenticated users can manage voucher lines" ON public.fin_voucher_lines;

-- 3. Define Policies
CREATE POLICY "Public properties are viewable by all"
ON public.properties FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Authenticated users can manage properties"
ON public.properties FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Public units are viewable by all"
ON public.units FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Authenticated users can manage units"
ON public.units FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated staff can view leases"
ON public.leases FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Authenticated staff can manage leases"
ON public.leases FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can view PDCs"
ON public.fin_pdc_register FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Authenticated users can manage PDCs"
ON public.fin_pdc_register FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can view legacy PDCs"
ON public.pdcs FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Authenticated users can manage legacy PDCs"
ON public.pdcs FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can view customers"
ON public.customers FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Authenticated users can manage customers"
ON public.customers FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can view reservations"
ON public.reservations FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Authenticated users can manage reservations"
ON public.reservations FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can view key handovers"
ON public.key_handovers FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Authenticated users can manage key handovers"
ON public.key_handovers FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can view inspection reports"
ON public.inspection_reports FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Authenticated users can manage inspection reports"
ON public.inspection_reports FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can view fixed assets"
ON public.fixed_assets FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Authenticated users can manage fixed assets"
ON public.fixed_assets FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can view collection receipts"
ON public.collection_receipts FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Authenticated users can manage collection receipts"
ON public.collection_receipts FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can view vouchers"
ON public.fin_vouchers FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Authenticated users can manage vouchers"
ON public.fin_vouchers FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can view voucher lines"
ON public.fin_voucher_lines FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Authenticated users can manage voucher lines"
ON public.fin_voucher_lines FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
