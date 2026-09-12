BEGIN;

-- ============================================================
-- Finance Posting Alignment
-- Migration: 202608220002
--
-- Purpose:
--   Align accounting-event relationships with the ACTUAL
--   UUID-based finance schema.
--
-- IMPORTANT:
--   fin_vouchers.id = UUID
--   fin_coa_accounts.id = UUID
--   fin_accounting_events.voucher_id = UUID
--   fin_accounting_event_lines.account_id = UUID
--
--   This migration does NOT convert UUID identifiers to BIGINT.
-- ============================================================


-- ============================================================
-- 1. Validate identifier types before adding relationships
-- ============================================================

DO $$
DECLARE
    v_type TEXT;
BEGIN
    SELECT data_type INTO v_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'fin_vouchers'
      AND column_name = 'id';

    IF v_type IS DISTINCT FROM 'uuid' THEN
        RAISE EXCEPTION
            'fin_vouchers.id must be UUID, but is %.',
            COALESCE(v_type, 'missing');
    END IF;

    SELECT data_type INTO v_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'fin_coa_accounts'
      AND column_name = 'id';

    IF v_type IS DISTINCT FROM 'uuid' THEN
        RAISE EXCEPTION
            'fin_coa_accounts.id must be UUID, but is %.',
            COALESCE(v_type, 'missing');
    END IF;

    SELECT data_type INTO v_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'fin_accounting_events'
      AND column_name = 'voucher_id';

    IF v_type IS DISTINCT FROM 'uuid' THEN
        RAISE EXCEPTION
            'fin_accounting_events.voucher_id must be UUID, but is %.',
            COALESCE(v_type, 'missing');
    END IF;

    SELECT data_type INTO v_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'fin_accounting_event_lines'
      AND column_name = 'account_id';

    IF v_type IS DISTINCT FROM 'uuid' THEN
        RAISE EXCEPTION
            'fin_accounting_event_lines.account_id must be UUID, but is %.',
            COALESCE(v_type, 'missing');
    END IF;
END
$$;


-- ============================================================
-- 2. Event -> financial voucher relationship
-- ============================================================

ALTER TABLE public.fin_accounting_events
DROP CONSTRAINT IF EXISTS fk_fin_accounting_events_voucher;

ALTER TABLE public.fin_accounting_events
ADD CONSTRAINT fk_fin_accounting_events_voucher
FOREIGN KEY (voucher_id)
REFERENCES public.fin_vouchers(id)
ON DELETE RESTRICT;


-- ============================================================
-- 3. One voucher per accounting event
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS
ux_fin_accounting_events_voucher
ON public.fin_accounting_events(voucher_id)
WHERE voucher_id IS NOT NULL;


-- ============================================================
-- 4. Voucher -> accounting event relationship
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
-- 5. One financial voucher per accounting event
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS
ux_fin_vouchers_accounting_event
ON public.fin_vouchers(accounting_event_id)
WHERE accounting_event_id IS NOT NULL;


-- ============================================================
-- 6. Accounting event line -> COA relationship
-- ============================================================

ALTER TABLE public.fin_accounting_event_lines
DROP CONSTRAINT IF EXISTS fk_fin_event_lines_account;

ALTER TABLE public.fin_accounting_event_lines
ADD CONSTRAINT fk_fin_event_lines_account
FOREIGN KEY (account_id)
REFERENCES public.fin_coa_accounts(id)
ON DELETE RESTRICT;


-- ============================================================
-- 7. Supporting indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS
idx_fin_event_lines_account_id
ON public.fin_accounting_event_lines(account_id);

CREATE INDEX IF NOT EXISTS
idx_fin_vouchers_accounting_event
ON public.fin_vouchers(accounting_event_id);


-- ============================================================
-- 8. Voucher integrity
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
