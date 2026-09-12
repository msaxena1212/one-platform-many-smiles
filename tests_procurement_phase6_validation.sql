-- Run after applying procurement migrations in a non-production test database.
-- The script is intentionally assertion-oriented and does not create business transactions.

DO $$
BEGIN
  IF to_regclass('public.proc_audit_log') IS NULL THEN RAISE EXCEPTION 'proc_audit_log is missing'; END IF;
  IF to_regprocedure('public.proc_reconcile_po(uuid)') IS NULL THEN RAISE EXCEPTION 'proc_reconcile_po is missing'; END IF;
  IF to_regprocedure('public.proc_get_audit_log(text,uuid,integer)') IS NULL THEN RAISE EXCEPTION 'proc_get_audit_log is missing'; END IF;
END $$;

SELECT 'procurement phase 6 validation schema OK' AS result;
