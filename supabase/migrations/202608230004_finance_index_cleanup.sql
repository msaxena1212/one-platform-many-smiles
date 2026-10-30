BEGIN;

-- ============================================================
-- Finance Index Cleanup
-- ============================================================
--
-- Remove redundant indexes introduced during the finance
-- architecture alignment/repair migrations.
--
-- UUID architecture remains unchanged.
-- No business data is modified.
-- ============================================================


-- ============================================================
-- 1. Accounting Event Lines
-- ============================================================
--
-- Duplicate indexes on account_id:
--
--   idx_fin_event_lines_account
--   idx_fin_event_lines_account_id
--
-- Keep the explicitly named account_id index.
-- ============================================================

DROP INDEX IF EXISTS
public.idx_fin_event_lines_account;


-- ============================================================
-- 2. Accounting Events
-- ============================================================
--
-- ux_fin_accounting_events_voucher already indexes voucher_id
-- and enforces one voucher per event.
--
-- Therefore the non-unique index is redundant.
-- ============================================================

DROP INDEX IF EXISTS
public.idx_fin_accounting_events_voucher;


-- ============================================================
-- 3. Vouchers -> Accounting Event
-- ============================================================
--
-- fin_vouchers_accounting_event_id_key is the canonical
-- unique index generated from the UNIQUE constraint.
--
-- Remove redundant normal and partial unique indexes.
-- ============================================================

DROP INDEX IF EXISTS
public.idx_fin_vouchers_accounting_event;

DROP INDEX IF EXISTS
public.ux_fin_vouchers_accounting_event;


-- ============================================================
-- 4. Voucher Number
-- ============================================================
--
-- fin_vouchers_voucher_number_key already guarantees
-- voucher number uniqueness.
-- ============================================================

DROP INDEX IF EXISTS
public.ux_fin_vouchers_voucher_number;


COMMIT;