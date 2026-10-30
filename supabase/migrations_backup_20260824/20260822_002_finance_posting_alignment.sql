-- ============================================================
-- Finance Posting Alignment
-- Align the new accounting-event engine with the existing
-- BIGINT-based finance voucher and COA architecture.
-- ============================================================

BEGIN;

-- ============================================================
-- 1. fin_accounting_events.voucher_id
--
-- Existing:
--     UUID
--
-- Existing fin_vouchers.id:
--     BIGINT
--
-- Therefore voucher_id must be BIGINT.
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

        -- This migration assumes the new accounting-event
        -- layer has not yet accumulated production voucher IDs.
        IF EXISTS (
            SELECT 1
            FROM public.fin_accounting_events
            WHERE voucher_id IS NOT NULL
        ) THEN
            RAISE EXCEPTION
                'Cannot convert fin_accounting_events.voucher_id from UUID to BIGINT because existing values are present.';
        END IF;

        ALTER TABLE public.fin_accounting_events
            DROP COLUMN voucher_id;

        ALTER TABLE public.fin_accounting_events
            ADD COLUMN voucher_id BIGINT;
    END IF;
END
$$;


-- ============================================================
-- 2. Add proper relationship from event -> voucher
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_fin_accounting_events_voucher'
    ) THEN

        ALTER TABLE public.fin_accounting_events
            ADD CONSTRAINT fk_fin_accounting_events_voucher
            FOREIGN KEY (voucher_id)
            REFERENCES public.fin_vouchers(id)
            ON DELETE RESTRICT;

    END IF;
END
$$;


-- ============================================================
-- 3. Ensure one accounting event can have only one voucher
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS
ux_fin_accounting_events_voucher
ON public.fin_accounting_events(voucher_id)
WHERE voucher_id IS NOT NULL;


-- ============================================================
-- 4. Add accounting_event_id to fin_vouchers
-- ============================================================

ALTER TABLE public.fin_vouchers
    ADD COLUMN IF NOT EXISTS accounting_event_id UUID;


-- ============================================================
-- 5. Link voucher back to source accounting event
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_fin_vouchers_accounting_event'
    ) THEN

        ALTER TABLE public.fin_vouchers
            ADD CONSTRAINT fk_fin_vouchers_accounting_event
            FOREIGN KEY (accounting_event_id)
            REFERENCES public.fin_accounting_events(id)
            ON DELETE RESTRICT;

    END IF;
END
$$;


-- ============================================================
-- 6. One voucher per accounting event
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS
ux_fin_vouchers_accounting_event
ON public.fin_vouchers(accounting_event_id)
WHERE accounting_event_id IS NOT NULL;


-- ============================================================
-- 7. Align accounting event line account_id
--
-- fin_coa_accounts.id is BIGINT.
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
                'Cannot convert fin_accounting_event_lines.account_id from UUID to BIGINT because existing values are present.';
        END IF;

        ALTER TABLE public.fin_accounting_event_lines
            DROP COLUMN account_id;

        ALTER TABLE public.fin_accounting_event_lines
            ADD COLUMN account_id BIGINT;
    END IF;
END
$$;


-- ============================================================
-- 8. Add FK from accounting event lines -> COA
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_fin_event_lines_account'
    ) THEN

        ALTER TABLE public.fin_accounting_event_lines
            ADD CONSTRAINT fk_fin_event_lines_account
            FOREIGN KEY (account_id)
            REFERENCES public.fin_coa_accounts(id)
            ON DELETE RESTRICT;

    END IF;
END
$$;


-- ============================================================
-- 9. Update indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS
idx_fin_event_lines_account_id
ON public.fin_accounting_event_lines(account_id);


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