-- ============================================================
-- Finance Posting Final Alignment
-- ============================================================
--
-- Final architecture:
--
-- fin_accounting_events
--        ↓
-- fin_accounting_event_lines
--        ↓
-- fin_vouchers
--        ↓
-- fin_voucher_lines
--
-- The old erp_* posting tables are NOT used by the
-- accounting posting engine.
-- ============================================================


-- ============================================================
-- 1. Ensure fin_vouchers contains the accounting event link
-- ============================================================

ALTER TABLE public.fin_vouchers
ADD COLUMN IF NOT EXISTS accounting_event_id UUID;


-- ============================================================
-- 2. Add source information to the financial voucher
-- ============================================================

ALTER TABLE public.fin_vouchers
ADD COLUMN IF NOT EXISTS source_type TEXT;

ALTER TABLE public.fin_vouchers
ADD COLUMN IF NOT EXISTS source_id UUID;


-- ============================================================
-- 3. Add posting metadata
-- ============================================================

ALTER TABLE public.fin_vouchers
ADD COLUMN IF NOT EXISTS created_by UUID;


-- ============================================================
-- 4. Index accounting event relationship
-- ============================================================

CREATE INDEX IF NOT EXISTS
idx_fin_vouchers_accounting_event
ON public.fin_vouchers(accounting_event_id);


-- ============================================================
-- 5. Index source relationship
-- ============================================================

CREATE INDEX IF NOT EXISTS
idx_fin_vouchers_source
ON public.fin_vouchers(source_type, source_id);


-- ============================================================
-- 6. Add event → voucher relationship
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
-- 7. Add voucher → accounting event relationship
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
-- 8. Prevent duplicate voucher for the same accounting event
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS
ux_fin_vouchers_accounting_event
ON public.fin_vouchers(accounting_event_id)
WHERE accounting_event_id IS NOT NULL;


-- ============================================================
-- 9. Ensure voucher lines have the required accounting fields
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


-- ============================================================
-- 10. Index voucher lines
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