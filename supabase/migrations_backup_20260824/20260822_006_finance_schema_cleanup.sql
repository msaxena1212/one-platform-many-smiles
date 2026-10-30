BEGIN;

-- ============================================================
-- Finance Schema Cleanup
-- ============================================================


-- ============================================================
-- 1. Add missing voucher metadata
-- ============================================================

ALTER TABLE public.fin_vouchers
ADD COLUMN IF NOT EXISTS source_type TEXT;

ALTER TABLE public.fin_vouchers
ADD COLUMN IF NOT EXISTS source_id UUID;

ALTER TABLE public.fin_vouchers
ADD COLUMN IF NOT EXISTS created_by UUID;


-- ============================================================
-- 2. Remove redundant voucher indexes
-- ============================================================

DROP INDEX IF EXISTS
public.ux_fin_vouchers_accounting_event;

DROP INDEX IF EXISTS
public.ux_fin_vouchers_voucher_number;


-- ============================================================
-- 3. Ensure accounting event uniqueness
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS
ux_fin_vouchers_accounting_event
ON public.fin_vouchers(accounting_event_id)
WHERE accounting_event_id IS NOT NULL;


-- ============================================================
-- 4. Ensure voucher number uniqueness
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS
ux_fin_vouchers_voucher_number
ON public.fin_vouchers(voucher_number);


-- ============================================================
-- 5. Voucher indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS
idx_fin_vouchers_source
ON public.fin_vouchers(source_type, source_id);

CREATE INDEX IF NOT EXISTS
idx_fin_vouchers_accounting_event
ON public.fin_vouchers(accounting_event_id);


COMMIT;