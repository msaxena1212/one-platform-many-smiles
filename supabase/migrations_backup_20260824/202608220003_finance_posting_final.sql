-- ============================================================
-- Finance Voucher Schema Alignment
-- ============================================================
--
-- Purpose:
-- Prepare the financial voucher layer for the accounting-event
-- posting engine.
--
-- FINAL POSTING ARCHITECTURE:
--
-- fin_accounting_events
--        ↓
-- fin_accounting_event_lines
--        ↓
-- fin_vouchers
--        ↓
-- fin_voucher_lines
--        ↓
-- fin_coa_accounts
--
-- This migration does NOT create the posting function.
-- It only aligns the voucher and voucher-line schema.
-- ============================================================

BEGIN;


-- ============================================================
-- 1. Voucher source metadata
-- ============================================================
--
-- These fields identify the business transaction that generated
-- the accounting voucher.
-- ============================================================

ALTER TABLE public.fin_vouchers
ADD COLUMN IF NOT EXISTS source_type TEXT;

ALTER TABLE public.fin_vouchers
ADD COLUMN IF NOT EXISTS source_id UUID;


-- ============================================================
-- 2. Voucher creation metadata
-- ============================================================

ALTER TABLE public.fin_vouchers
ADD COLUMN IF NOT EXISTS created_by UUID;


-- ============================================================
-- 3. Voucher indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS
idx_fin_vouchers_accounting_event
ON public.fin_vouchers(accounting_event_id);


CREATE INDEX IF NOT EXISTS
idx_fin_vouchers_source
ON public.fin_vouchers(source_type, source_id);


-- ============================================================
-- 4. Voucher line contextual fields
-- ============================================================
--
-- These fields preserve the business context of each posted
-- accounting line.
--
-- Example:
--
-- Rent Receivable
--     property_id
--     unit_id
--     lease_id
--     tenant_id
--     customer_id
--
-- This allows the General Ledger to be analysed by property,
-- unit, lease, tenant and customer.
-- ============================================================

ALTER TABLE public.fin_voucher_lines
ADD COLUMN IF NOT EXISTS tenant_id UUID;

ALTER TABLE public.fin_voucher_lines
ADD COLUMN IF NOT EXISTS lease_id UUID;

ALTER TABLE public.fin_voucher_lines
ADD COLUMN IF NOT EXISTS property_id UUID;

ALTER TABLE public.fin_voucher_lines
ADD COLUMN IF NOT EXISTS unit_id UUID;

ALTER TABLE public.fin_voucher_lines
ADD COLUMN IF NOT EXISTS cost_center_id UUID;

ALTER TABLE public.fin_voucher_lines
ADD COLUMN IF NOT EXISTS customer_id UUID;

-- ============================================================
-- 5. Voucher-line indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS
idx_fin_voucher_lines_voucher
ON public.fin_voucher_lines(voucher_id);


CREATE INDEX IF NOT EXISTS
idx_fin_voucher_lines_account
ON public.fin_voucher_lines(account_id);


CREATE INDEX IF NOT EXISTS
idx_fin_voucher_lines_property
ON public.fin_voucher_lines(property_id);


CREATE INDEX IF NOT EXISTS
idx_fin_voucher_lines_unit
ON public.fin_voucher_lines(unit_id);


CREATE INDEX IF NOT EXISTS
idx_fin_voucher_lines_tenant
ON public.fin_voucher_lines(tenant_id);


CREATE INDEX IF NOT EXISTS
idx_fin_voucher_lines_lease
ON public.fin_voucher_lines(lease_id);


CREATE INDEX IF NOT EXISTS
idx_fin_voucher_lines_customer
ON public.fin_voucher_lines(customer_id);


CREATE INDEX IF NOT EXISTS
idx_fin_voucher_lines_source
ON public.fin_voucher_lines(source_type, source_id);


-- ============================================================
-- 6. Voucher amount integrity
-- ============================================================

DO $$
BEGIN

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fin_vouchers_total_amount_positive'
    ) THEN

        ALTER TABLE public.fin_vouchers
        ADD CONSTRAINT fin_vouchers_total_amount_positive
        CHECK (total_amount >= 0);

    END IF;

END
$$;


COMMIT;