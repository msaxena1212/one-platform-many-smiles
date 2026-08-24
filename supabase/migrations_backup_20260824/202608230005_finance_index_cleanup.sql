BEGIN;

-- ============================================================
-- Finance Index Cleanup
-- Migration: 202608230005
--
-- Remove redundant indexes created by earlier finance repairs.
-- Keep the unique indexes that enforce accounting integrity.
-- ============================================================


-- ============================================================
-- 1. fin_accounting_events.voucher_id
--
-- ux_fin_accounting_events_voucher already indexes voucher_id
-- and enforces one voucher per accounting event relationship.
-- ============================================================

DROP INDEX IF EXISTS
public.idx_fin_accounting_events_voucher;


-- ============================================================
-- 2. fin_vouchers.accounting_event_id
--
-- Keep the unique constraint-backed index:
--
--   fin_vouchers_accounting_event_id_key
--
-- Remove redundant additional indexes.
-- ============================================================

DROP INDEX IF EXISTS
public.ux_fin_vouchers_accounting_event;

DROP INDEX IF EXISTS
public.idx_fin_vouchers_accounting_event;


COMMIT;