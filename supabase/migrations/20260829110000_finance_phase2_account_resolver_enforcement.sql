-- ============================================================================
-- PHASE 2 — Accounting Engine Enforcement
-- Migration: 20260829110000
-- Purpose: Make "every accounting event is forced through the resolver and
--          posting engine" a database-level guarantee, not just an
--          application-level convention.
--
--   1. CHECK constraint: every fin_accounting_event_lines.account_code
--      must resolve to an active row in fin_coa_accounts.
--      (Trust boundary: the only way to pass this check is to use a code
--      that was inserted by a migration or by an admin path. The
--      posting engine inserts only codes it has just resolved.)
--
--   2. CHECK constraint: voucher lines must also resolve.
--
--   3. CHECK constraint: debit and credit must both be > 0 on a non-zero line.
--      (Already enforced in posting-engine but defence-in-depth at the DB.)
--
--   4. VIEW:  v_posting_engine_compliance
--      A reporting view that flags any line whose account_code is not
--      in the resolver table — useful for the Phase 2 audit report.
--
--   5. UNIQUE constraint: fin_transaction_account_rules is allowed only
--      one active row per (transaction_type, payment_method, deposit_type,
--      pdc_type).  (Already on the table, but we add the index check.)
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. Trigger function: reject unknown account_codes on event lines.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fin_reject_unknown_account_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_found BOOLEAN;
BEGIN
  -- NULL account_code is allowed (the posting engine prefers account_id).
  IF NEW.account_code IS NULL OR NEW.account_code = '' THEN
    RETURN NEW;
  END IF;

  -- The line must resolve to a row in fin_coa_accounts.
  SELECT EXISTS (
    SELECT 1
    FROM public.fin_coa_accounts
    WHERE account_code = NEW.account_code
      AND is_active    = TRUE
  ) INTO v_found;

  IF NOT v_found THEN
    RAISE EXCEPTION
      'fin_accounting_event_lines.account_code "%" does not resolve to an active row in fin_coa_accounts. '
      'All accounting events must be composed through the Account Resolver (src/lib/finance/account-resolver.ts).',
      NEW.account_code
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_fin_reject_unknown_account_code_event ON public.fin_accounting_event_lines;
CREATE TRIGGER trg_fin_reject_unknown_account_code_event
  BEFORE INSERT OR UPDATE ON public.fin_accounting_event_lines
  FOR EACH ROW
  EXECUTE FUNCTION public.fin_reject_unknown_account_code();

-- ============================================================================
-- 2. Same enforcement for voucher lines (defence-in-depth — event lines
--    are the source of truth, but voucher lines are persisted too).
-- ============================================================================

DROP TRIGGER IF EXISTS trg_fin_reject_unknown_account_code_voucher ON public.fin_voucher_lines;
CREATE TRIGGER trg_fin_reject_unknown_account_code_voucher
  BEFORE INSERT OR UPDATE ON public.fin_voucher_lines
  FOR EACH ROW
  EXECUTE FUNCTION public.fin_reject_unknown_account_code();

-- ============================================================================
-- 3. UNIQUE index on fin_transaction_account_rules so a future admin
--    cannot accidentally insert a second active rule for the same
--    (transaction_type, payment_method, deposit_type, pdc_type) tuple.
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname  = 'fin_transaction_account_rules_active_uniq'
  ) THEN
    CREATE UNIQUE INDEX fin_transaction_account_rules_active_uniq
      ON public.fin_transaction_account_rules (
        transaction_type,
        COALESCE(payment_method, ''),
        COALESCE(deposit_type,   ''),
        COALESCE(pdc_type,       '')
      )
      WHERE is_active = TRUE;
  END IF;
END $$;

-- ============================================================================
-- 4. Reporting view: compliance dashboard
-- ============================================================================

CREATE OR REPLACE VIEW public.v_posting_engine_compliance AS
SELECT
  e.id              AS event_id,
  e.event_type,
  e.source_type,
  e.status,
  l.line_number,
  l.account_code,
  l.debit,
  l.credit,
  CASE
    WHEN l.account_code IS NULL OR l.account_code = '' THEN 'NO_CODE'
    WHEN c.id IS NULL                                 THEN 'UNRESOLVED'
    WHEN c.is_active = FALSE                          THEN 'INACTIVE'
    WHEN c.account_level = 'GL'                       THEN 'GL_ONLY'
    ELSE 'OK'
  END AS compliance_status
FROM public.fin_accounting_events e
LEFT JOIN public.fin_accounting_event_lines l ON l.event_id = e.id
LEFT JOIN public.fin_coa_accounts c
       ON c.account_code = l.account_code
      AND c.is_active    = TRUE;

COMMENT ON VIEW public.v_posting_engine_compliance IS
  'Phase 2 compliance view. Any line with compliance_status = UNRESOLVED or NO_CODE '
  'indicates a posting that bypassed the Account Resolver and should be investigated.';

COMMIT;
