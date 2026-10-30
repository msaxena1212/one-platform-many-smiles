-- ============================================================================
-- Migration: 20260904140000_storage_buckets_and_cron_automations.sql
-- Description: 
--  1. Sets up Supabase storage buckets ('tenancy-documents', 'invoices', 'receipts', 'asset-images', 'payment-proofs')
--     with Row-Level Security (RLS) policies for direct binary uploads and authorized reads.
--  2. Defines automated database functions & pg_cron schedules for:
--     - Daily overdue PDC flagging & notification logging
--     - Automatic 60-day lease renewal reminder notice generation
-- ============================================================================

-- ── 1. STORAGE BUCKETS CONFIGURATION ─────────────────────────────────────────

-- Insert storage buckets if not already present
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('tenancy-documents', 'tenancy-documents', false, 20971520, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']),
  ('invoices', 'invoices', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
  ('receipts', 'receipts', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
  ('payment-proofs', 'payment-proofs', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
  ('asset-images', 'asset-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Enable RLS on storage.objects (standard Supabase pattern)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Storage Policy: Authenticated users can upload tenant documents and invoices
CREATE POLICY "Allow authenticated uploads to tenancy storage"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id IN ('tenancy-documents', 'invoices', 'receipts', 'payment-proofs', 'asset-images')
);

-- Storage Policy: Authenticated users can view documents
CREATE POLICY "Allow authenticated read on tenancy storage"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id IN ('tenancy-documents', 'invoices', 'receipts', 'payment-proofs', 'asset-images')
);

-- Storage Policy: Public access to public assets
CREATE POLICY "Allow public read on asset-images"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'asset-images'
);

-- Storage Policy: Authenticated users can update/replace files in storage
CREATE POLICY "Allow authenticated updates to tenancy storage"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id IN ('tenancy-documents', 'invoices', 'receipts', 'payment-proofs', 'asset-images')
)
WITH CHECK (
  bucket_id IN ('tenancy-documents', 'invoices', 'receipts', 'payment-proofs', 'asset-images')
);

-- Storage Policy: Authenticated users can delete files
CREATE POLICY "Allow authenticated deletes on tenancy storage"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id IN ('tenancy-documents', 'invoices', 'receipts', 'payment-proofs', 'asset-images')
);


-- ── 2. AUTOMATED CRON JOB: OVERDUE PDC FLAGGING ──────────────────────────────

CREATE OR REPLACE FUNCTION public.cron_flag_overdue_pdcs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Mark non-deposited/undrawn PDCs past their maturity date as overdue or due_for_deposit
  UPDATE fin_pdcs
  SET 
    status = 'due_for_deposit',
    updated_at = NOW()
  WHERE 
    status IN ('in_hand', 'received', 'pending')
    AND maturity_date <= CURRENT_DATE;

  -- Flag bounced or past-grace period PDCs where grace has lapsed
  UPDATE fin_pdcs
  SET 
    status = 'overdue',
    updated_at = NOW()
  WHERE 
    status = 'due_for_deposit'
    AND maturity_date < (CURRENT_DATE - INTERVAL '7 days');
END;
$$;


-- ── 3. AUTOMATED CRON JOB: 60-DAY LEASE RENEWAL REMINDER NOTICES ─────────────

CREATE OR REPLACE FUNCTION public.cron_generate_lease_renewal_notices()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_lease RECORD;
BEGIN
  -- Loop through active leases expiring in the next 60 days that don't already have an open renewal record
  FOR v_lease IN 
    SELECT 
      l.id AS lease_id,
      l.customer_id,
      l.unit_id,
      l.end_date,
      l.rent_amount
    FROM pm_leases l
    WHERE 
      l.status IN ('active', 'fully_signed')
      AND l.end_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '60 days')
      AND NOT EXISTS (
        SELECT 1 FROM pm_lease_renewals r 
        WHERE r.lease_id = l.id
      )
  LOOP
    -- Auto-insert renewal notification record
    INSERT INTO pm_lease_renewals (
      lease_id,
      recipients,
      proposed_period,
      proposed_rent,
      revised_terms,
      last_confirmation_date,
      outstanding_obligations,
      status,
      created_at
    ) VALUES (
      v_lease.lease_id,
      'Tenant, Property Manager, Leasing Team',
      '12 Months',
      v_lease.rent_amount,
      'Standard renewal with unchanged terms',
      TO_CHAR(CURRENT_DATE + INTERVAL '14 days', 'YYYY-MM-DD'),
      'Clearance of pending utilities & PDCs',
      'awaiting_response',
      NOW()
    );
  END LOOP;
END;
$$;


-- ── 4. SCHEDULE PG_CRON JOBS (Runs Daily at 01:00 UTC and 02:00 UTC) ─────────

DO $$
BEGIN
  -- Check if pg_cron extension exists before scheduling
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- Unschedule previous instances if registered
    PERFORM cron.unschedule('daily-flag-overdue-pdcs');
    PERFORM cron.unschedule('daily-generate-lease-renewals');

    -- Daily at 01:00 AM: PDC Overdue Check
    PERFORM cron.schedule(
      'daily-flag-overdue-pdcs',
      '0 1 * * *',
      'SELECT public.cron_flag_overdue_pdcs()'
    );

    -- Daily at 02:00 AM: 60-Day Renewal Notices Generator
    PERFORM cron.schedule(
      'daily-generate-lease-renewals',
      '0 2 * * *',
      'SELECT public.cron_generate_lease_renewal_notices()'
    );
  END IF;
END $$;
