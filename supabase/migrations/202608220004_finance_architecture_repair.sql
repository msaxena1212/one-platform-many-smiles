BEGIN;

-- ============================================================
-- Finance Architecture Repair
-- Migration: 202608220004
--
-- Purpose:
--   Align the finance schema with the final UUID-based
--   accounting architecture.
--
-- FINAL POSTING ARCHITECTURE
--
--   fin_accounting_events
--            |
--            v
--   fin_accounting_event_lines
--            |
--            v
--   fin_vouchers
--            |
--            v
--   fin_voucher_lines
--            |
--            v
--   fin_coa_accounts
--
-- IMPORTANT:
--
--   All finance entity identifiers use UUID.
--
--   No UUID -> BIGINT conversion is performed.
--
--   The atomic posting function belongs exclusively to:
--
--   202608220005_atomic_post_accounting_event.sql
--
--   The old erp_vouchers / erp_journal_entries tables are
--   NOT part of the new posting engine.
-- ============================================================


-- ============================================================
-- 1. Ensure event -> financial voucher relationship
-- ============================================================

ALTER TABLE public.fin_accounting_events
DROP CONSTRAINT IF EXISTS fk_fin_accounting_events_voucher;


ALTER TABLE public.fin_accounting_events
ADD CONSTRAINT fk_fin_accounting_events_voucher
FOREIGN KEY (voucher_id)
REFERENCES public.fin_vouchers(id)
ON DELETE RESTRICT;


-- ============================================================
-- 2. Ensure voucher -> accounting event relationship
-- ============================================================

ALTER TABLE public.fin_vouchers
ADD COLUMN IF NOT EXISTS accounting_event_id UUID;


ALTER TABLE public.fin_vouchers
DROP CONSTRAINT IF EXISTS fk_fin_vouchers_accounting_event;


ALTER TABLE public.fin_vouchers
ADD CONSTRAINT fk_fin_vouchers_accounting_event
FOREIGN KEY (accounting_event_id)
REFERENCES public.fin_accounting_events(id)
ON DELETE RESTRICT;


-- ============================================================
-- 3. One voucher per accounting event
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS
ux_fin_vouchers_accounting_event
ON public.fin_vouchers(accounting_event_id)
WHERE accounting_event_id IS NOT NULL;


-- ============================================================
-- 4. Ensure accounting line -> COA relationship
-- ============================================================

ALTER TABLE public.fin_accounting_event_lines
DROP CONSTRAINT IF EXISTS fk_fin_event_lines_account;


ALTER TABLE public.fin_accounting_event_lines
ADD CONSTRAINT fk_fin_event_lines_account
FOREIGN KEY (account_id)
REFERENCES public.fin_coa_accounts(id)
ON DELETE RESTRICT;


-- ============================================================
-- 5. Supporting indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS
idx_fin_event_lines_account_id
ON public.fin_accounting_event_lines(account_id);


CREATE INDEX IF NOT EXISTS
idx_fin_vouchers_accounting_event
ON public.fin_vouchers(accounting_event_id);


CREATE INDEX IF NOT EXISTS
idx_fin_vouchers_source
ON public.fin_vouchers(source_type, source_id);


-- ============================================================
-- 6. Ensure voucher metadata
-- ============================================================

ALTER TABLE public.fin_vouchers
ADD COLUMN IF NOT EXISTS source_type TEXT;


ALTER TABLE public.fin_vouchers
ADD COLUMN IF NOT EXISTS source_id UUID;


ALTER TABLE public.fin_vouchers
ADD COLUMN IF NOT EXISTS created_by UUID;


-- ============================================================
-- 7. Voucher line contextual fields
--
-- All entity IDs use UUID.
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
ADD COLUMN IF NOT EXISTS customer_id UUID;


ALTER TABLE public.fin_voucher_lines
ADD COLUMN IF NOT EXISTS cost_center_id UUID;


ALTER TABLE public.fin_voucher_lines
ADD COLUMN IF NOT EXISTS source_type TEXT;


ALTER TABLE public.fin_voucher_lines
ADD COLUMN IF NOT EXISTS source_id UUID;


-- ============================================================
-- 8. Voucher line indexes
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
-- 9. Voucher amount integrity
-- ============================================================

DO $$
BEGIN

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fin_vouchers_total_amount_positive'
          AND conrelid = 'public.fin_vouchers'::regclass
    ) THEN

        ALTER TABLE public.fin_vouchers
        ADD CONSTRAINT fin_vouchers_total_amount_positive
        CHECK (total_amount >= 0);

    END IF;

END
$$;


COMMIT;