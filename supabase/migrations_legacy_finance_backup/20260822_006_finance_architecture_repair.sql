BEGIN;

-- ============================================================
-- Finance Architecture Repair
--
-- Final posting architecture:
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
-- erp_vouchers / erp_journal_entries are NOT used
-- by the accounting posting engine.
-- ============================================================


-- ============================================================
-- 1. Remove the obsolete event -> ERP voucher relationship
-- ============================================================

ALTER TABLE public.fin_accounting_events
DROP CONSTRAINT IF EXISTS fk_fin_accounting_events_voucher;


-- ============================================================
-- 2. Ensure accounting event voucher_id is BIGINT
-- ============================================================

DO $$
BEGIN

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'fin_accounting_events'
          AND column_name = 'voucher_id'
          AND data_type = 'uuid'
    ) THEN

        IF EXISTS (
            SELECT 1
            FROM public.fin_accounting_events
            WHERE voucher_id IS NOT NULL
        ) THEN
            RAISE EXCEPTION
                'Cannot convert fin_accounting_events.voucher_id UUID to BIGINT because values already exist.';
        END IF;

        ALTER TABLE public.fin_accounting_events
        DROP COLUMN voucher_id;

        ALTER TABLE public.fin_accounting_events
        ADD COLUMN voucher_id BIGINT;

    END IF;

END
$$;


-- ============================================================
-- 3. Ensure event -> voucher relationship is correct
-- ============================================================

ALTER TABLE public.fin_accounting_events
ADD CONSTRAINT fk_fin_accounting_events_voucher
FOREIGN KEY (voucher_id)
REFERENCES public.fin_vouchers(id)
ON DELETE RESTRICT;


-- ============================================================
-- 4. Ensure voucher -> accounting event relationship exists
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
-- 5. One voucher per accounting event
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS
ux_fin_vouchers_accounting_event
ON public.fin_vouchers(accounting_event_id)
WHERE accounting_event_id IS NOT NULL;


-- ============================================================
-- 6. Ensure event line account_id is BIGINT
-- ============================================================

DO $$
BEGIN

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'fin_accounting_event_lines'
          AND column_name = 'account_id'
          AND data_type = 'uuid'
    ) THEN

        IF EXISTS (
            SELECT 1
            FROM public.fin_accounting_event_lines
            WHERE account_id IS NOT NULL
        ) THEN
            RAISE EXCEPTION
                'Cannot convert fin_accounting_event_lines.account_id UUID to BIGINT because values already exist.';
        END IF;

        ALTER TABLE public.fin_accounting_event_lines
        DROP COLUMN account_id;

        ALTER TABLE public.fin_accounting_event_lines
        ADD COLUMN account_id BIGINT;

    END IF;

END
$$;


-- ============================================================
-- 7. Ensure event line -> COA relationship
-- ============================================================

ALTER TABLE public.fin_accounting_event_lines
DROP CONSTRAINT IF EXISTS fk_fin_event_lines_account;


ALTER TABLE public.fin_accounting_event_lines
ADD CONSTRAINT fk_fin_event_lines_account
FOREIGN KEY (account_id)
REFERENCES public.fin_coa_accounts(id)
ON DELETE RESTRICT;


-- ============================================================
-- 8. Voucher line contextual fields
-- ============================================================

ALTER TABLE public.fin_voucher_lines
ADD COLUMN IF NOT EXISTS tenant_id BIGINT;

ALTER TABLE public.fin_voucher_lines
ADD COLUMN IF NOT EXISTS lease_id BIGINT;

ALTER TABLE public.fin_voucher_lines
ADD COLUMN IF NOT EXISTS property_id BIGINT;

ALTER TABLE public.fin_voucher_lines
ADD COLUMN IF NOT EXISTS unit_id BIGINT;

ALTER TABLE public.fin_voucher_lines
ADD COLUMN IF NOT EXISTS cost_center_id BIGINT;

ALTER TABLE public.fin_voucher_lines
ADD COLUMN IF NOT EXISTS customer_id BIGINT;

ALTER TABLE public.fin_voucher_lines
ADD COLUMN IF NOT EXISTS source_type TEXT;

ALTER TABLE public.fin_voucher_lines
ADD COLUMN IF NOT EXISTS source_id UUID;


-- ============================================================
-- 9. Voucher indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS
idx_fin_vouchers_accounting_event
ON public.fin_vouchers(accounting_event_id);


CREATE INDEX IF NOT EXISTS
idx_fin_vouchers_source
ON public.fin_vouchers(source_type, source_id);


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


-- ============================================================
-- 10. Voucher integrity
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