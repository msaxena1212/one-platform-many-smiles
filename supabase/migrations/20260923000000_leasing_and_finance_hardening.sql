-- Migration: 20260923000000_leasing_and_finance_hardening.sql
-- Comprehensive fixes for Leasing, Finance, Customer Validation, Document Compliance, and Asset Assignments

-- 1. Hardening Customer Identity Constraints (Unique conditional indices)
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_qatar_id_unique 
ON public.customers (qatar_id) 
WHERE qatar_id IS NOT NULL AND trim(qatar_id) <> '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_passport_number_unique 
ON public.customers (passport_number) 
WHERE passport_number IS NOT NULL AND trim(passport_number) <> '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_cr_unique 
ON public.customers (commercial_registration) 
WHERE commercial_registration IS NOT NULL AND trim(commercial_registration) <> '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_email_unique 
ON public.customers (email_address) 
WHERE email_address IS NOT NULL AND trim(email_address) <> '';

-- 2. Server-side RPC for Duplicate Customer Verification
CREATE OR REPLACE FUNCTION public.check_customer_duplicate(
  p_qatar_id text DEFAULT NULL,
  p_passport_number text DEFAULT NULL,
  p_cr_number text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_mobile text DEFAULT NULL,
  p_exclude_id uuid DEFAULT NULL
)
RETURNS TABLE (
  is_duplicate boolean,
  match_field text,
  matched_customer_id uuid,
  matched_customer_name text
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rec record;
BEGIN
  -- Check Qatar ID
  IF p_qatar_id IS NOT NULL AND trim(p_qatar_id) <> '' THEN
    SELECT id, full_name INTO v_rec FROM public.customers 
    WHERE trim(lower(qatar_id)) = trim(lower(p_qatar_id))
      AND (p_exclude_id IS NULL OR id <> p_exclude_id)
    LIMIT 1;
    IF FOUND THEN
      RETURN QUERY SELECT true, 'Qatar ID'::text, v_rec.id, v_rec.full_name;
      RETURN;
    END IF;
  END IF;

  -- Check Passport
  IF p_passport_number IS NOT NULL AND trim(p_passport_number) <> '' THEN
    SELECT id, full_name INTO v_rec FROM public.customers 
    WHERE trim(lower(passport_number)) = trim(lower(p_passport_number))
      AND (p_exclude_id IS NULL OR id <> p_exclude_id)
    LIMIT 1;
    IF FOUND THEN
      RETURN QUERY SELECT true, 'Passport Number'::text, v_rec.id, v_rec.full_name;
      RETURN;
    END IF;
  END IF;

  -- Check CR
  IF p_cr_number IS NOT NULL AND trim(p_cr_number) <> '' THEN
    SELECT id, full_name INTO v_rec FROM public.customers 
    WHERE trim(lower(commercial_registration)) = trim(lower(p_cr_number))
      AND (p_exclude_id IS NULL OR id <> p_exclude_id)
    LIMIT 1;
    IF FOUND THEN
      RETURN QUERY SELECT true, 'Commercial Registration (CR)'::text, v_rec.id, v_rec.full_name;
      RETURN;
    END IF;
  END IF;

  -- Check Email
  IF p_email IS NOT NULL AND trim(p_email) <> '' THEN
    SELECT id, full_name INTO v_rec FROM public.customers 
    WHERE trim(lower(email_address)) = trim(lower(p_email))
      AND (p_exclude_id IS NULL OR id <> p_exclude_id)
    LIMIT 1;
    IF FOUND THEN
      RETURN QUERY SELECT true, 'Email Address'::text, v_rec.id, v_rec.full_name;
      RETURN;
    END IF;
  END IF;

  RETURN QUERY SELECT false, NULL::text, NULL::uuid, NULL::text;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_customer_duplicate TO authenticated, anon;

-- 3. Formal Asset-Lease Linkage Table (asset_assignments)
CREATE TABLE IF NOT EXISTS public.asset_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES public.assets(id) ON DELETE CASCADE,
  lease_id uuid REFERENCES public.leases(id) ON DELETE CASCADE,
  unit_id uuid REFERENCES public.units(id) ON DELETE SET NULL,
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  assigned_date date NOT NULL DEFAULT CURRENT_DATE,
  return_date date,
  condition_on_handover text DEFAULT 'Good',
  condition_on_return text,
  handover_notes text,
  return_notes text,
  status text NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'returned', 'damaged', 'lost', 'maintenance')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.asset_assignments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'asset_assignments' AND policyname = 'Allow authenticated users full access to asset_assignments'
  ) THEN
    CREATE POLICY "Allow authenticated users full access to asset_assignments" 
    ON public.asset_assignments 
    FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);
  END IF;
END $$;

GRANT ALL ON public.asset_assignments TO authenticated, anon;

-- 4. Manual Voucher Approval Workflow Fields on fin_vouchers
ALTER TABLE IF EXISTS public.fin_vouchers
  ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'posted' CHECK (approval_status IN ('draft', 'pending_approval', 'posted', 'rejected')),
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS reviewed_by uuid,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS origin_module text DEFAULT 'finance';

-- 5. Revenue Recognition Month-End Closing Ledger / Log
CREATE TABLE IF NOT EXISTS public.revenue_recognition_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  closing_month text NOT NULL, -- e.g. '2026-09'
  run_at timestamptz NOT NULL DEFAULT now(),
  run_by uuid,
  total_leases_processed integer NOT NULL DEFAULT 0,
  total_revenue_recognized numeric(14,2) NOT NULL DEFAULT 0,
  journal_voucher_id uuid,
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('draft', 'completed', 'failed')),
  details jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.revenue_recognition_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'revenue_recognition_logs' AND policyname = 'Allow authenticated users full access to revenue_recognition_logs'
  ) THEN
    CREATE POLICY "Allow authenticated users full access to revenue_recognition_logs" 
    ON public.revenue_recognition_logs 
    FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);
  END IF;
END $$;

GRANT ALL ON public.revenue_recognition_logs TO authenticated, anon;
