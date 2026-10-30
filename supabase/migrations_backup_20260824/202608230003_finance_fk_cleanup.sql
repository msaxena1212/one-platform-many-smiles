BEGIN;

-- ============================================================
-- Finance FK Cleanup
-- Migration: 202608230003
--
-- Purpose:
--   Remove the duplicate fin_vouchers ->
--   fin_accounting_events foreign key.
--
-- Final relationship:
--
--   fin_vouchers.accounting_event_id
--           ↓
--   fin_accounting_events.id
--
-- Only one FK should enforce this relationship.
-- ============================================================


-- ============================================================
-- 1. Remove duplicate FK
-- ============================================================

ALTER TABLE public.fin_vouchers
DROP CONSTRAINT IF EXISTS fin_vouchers_accounting_event_id_fkey;


-- ============================================================
-- 2. Ensure canonical FK exists
-- ============================================================

DO $$
BEGIN

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_fin_vouchers_accounting_event'
          AND conrelid = 'public.fin_vouchers'::regclass
    ) THEN

        ALTER TABLE public.fin_vouchers
        ADD CONSTRAINT fk_fin_vouchers_accounting_event
        FOREIGN KEY (accounting_event_id)
        REFERENCES public.fin_accounting_events(id)
        ON DELETE RESTRICT;

    END IF;

END
$$;


COMMIT;