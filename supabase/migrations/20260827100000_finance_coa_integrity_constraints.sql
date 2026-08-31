-- ============================================================================
-- FINANCE COA — Integrity constraints + 3 open decisions
-- Migration: 20260827100000
-- Purpose:
--   1. Add defence-in-depth CHECK constraints to fin_coa_accounts
--   2. Add UNIQUE(parent_account_id, account_name) so SL names cannot collide
--   3. Resolve 3 open COA decisions from the Phase 1 audit:
--      a. 12410 vs 12413 — keep application convention (12413 = Tenant AR)
--      b. 12701 Accumulated Depreciation (new GL under class 127)
--      c. 41201006 Other Income-Utility Recovery (new SL under 41201)
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. CHECK CONSTRAINTS
-- ============================================================================

-- A. SL must have a parent; GL must not.
--    (Phase 1 had no enforcement — it relied on application discipline.)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'fin_coa_sl_parent_required_chk'
  ) THEN
    ALTER TABLE public.fin_coa_accounts
      ADD CONSTRAINT fin_coa_sl_parent_required_chk
      CHECK (
        (account_level = 'SL' AND parent_account_id IS NOT NULL)
        OR
        (account_level <> 'SL' AND parent_account_id IS NULL)
      );
  END IF;
END $$;

-- B. GL rows must carry group_name + class_name.
--    (Phase 1 back-filled but did not enforce; a future INSERT could leave them NULL.)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'fin_coa_gl_group_class_required_chk'
  ) THEN
    ALTER TABLE public.fin_coa_accounts
      ADD CONSTRAINT fin_coa_gl_group_class_required_chk
      CHECK (
        (account_level = 'GL' AND group_name IS NOT NULL AND class_name IS NOT NULL)
        OR
        (account_level <> 'GL')
      );
  END IF;
END $$;

-- C. SL rows must inherit account_type from their parent GL.
--    Prevents an "ASSET 21100001" typo in a future migration.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'fin_coa_sl_type_matches_parent_chk'
  ) THEN
    ALTER TABLE public.fin_coa_accounts
      ADD CONSTRAINT fin_coa_sl_type_matches_parent_chk
      CHECK (
        (account_level = 'SL' AND parent_account_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.fin_coa_accounts p
          WHERE p.id = fin_coa_accounts.parent_account_id
            AND p.account_type = fin_coa_accounts.account_type
        ))
        OR
        (account_level <> 'SL')
      );
  END IF;
END $$;

-- ============================================================================
-- 2. UNIQUE on (parent_account_id, account_name)
--    Defence in depth — even if account_code uniqueness is dropped, the same
--    SL name cannot appear twice under one GL.
-- ============================================================================

CREATE UNIQUE INDEX IF NOT EXISTS fin_coa_parent_name_uq
  ON public.fin_coa_accounts (parent_account_id, account_name)
  WHERE parent_account_id IS NOT NULL;

-- ============================================================================
-- 3. RESOLVE OPEN COA DECISIONS
-- ============================================================================

-- 3a. 12410 vs 12413 — application convention stands.
--     Add a documentation comment to the 12413 row so the next reader knows
--     why we diverge from Master §1 (which uses 12410 for Sundry Debtors).
--     No structural change.

-- 3b. 12701 — Accumulated Depreciation (new GL under class 127)
--     Master §14.6 requires a separate GL for accumulated depreciation so
--     Dr Depreciation Expense / Cr Accumulated Depreciation can post.
--     Group: Assets (it's a contra-asset), Class: Non-Current Assets.
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name)
VALUES
  ('12701', 'Accumulated Depreciation', 'ASSET', 'GL', 'Assets', 'Non-Current Assets')
ON CONFLICT (account_code) DO NOTHING;

-- 3c. 41201006 — Other Income-Utility Recovery
--     Master §13.6 says utility recovery is taxable revenue. The workbook
--     already has 41201003 ("Other Income-Damages"); we add a sibling SL
--     for utility recovery so damage and utility are not conflated.
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT
  '41201006', 'Other Income-Utility Recovery', 'REVENUE', 'SL',
  'Revenue', 'Other Revenue', p.id
FROM public.fin_coa_accounts p
WHERE p.account_code = '41201'
ON CONFLICT (account_code) DO NOTHING;

-- ============================================================================
-- 4. SEED P0.19 — Utility Recovery rule
--     Dr 12413 / Cr 41201006 (taxable) or 41201003 (non-taxable damage).
--     We seed the taxable utility-recovery rule here; damage recovery is
--     already covered by existing posting-engine paths.
-- ============================================================================

INSERT INTO public.fin_transaction_account_rules
  (transaction_type, payment_method, deposit_type, pdc_type,
   debit_gl_code, debit_sl_code, credit_gl_code, credit_sl_code, description)
VALUES
  ('UTILITY_RECOVERY_TENANT', NULL, NULL, NULL,
   '12413', NULL, '41201', '41201006',
   'Dr Tenant Receivable [unit SL] / Cr 41201006 Utility Recovery')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 5. UNIQUE RULE INDEX
--     The original 20260826000000 migration created a unique index on the rule
--     columns. Verify it; recreate if missing.
-- ============================================================================

CREATE UNIQUE INDEX IF NOT EXISTS fin_txn_rules_uq
  ON public.fin_transaction_account_rules
  (transaction_type,
   COALESCE(payment_method,  '__NULL__'),
   COALESCE(deposit_type,    '__NULL__'),
   COALESCE(pdc_type,        '__NULL__'));

COMMIT;
