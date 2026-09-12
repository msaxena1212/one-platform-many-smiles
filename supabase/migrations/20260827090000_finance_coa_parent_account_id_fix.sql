-- ============================================================================
-- FINANCE COA — parent_account_id column fix-up
-- Migration: 20260827090000
-- Purpose:
--   Migration 20260826000000_finance_coa_hierarchy.sql references
--   fin_coa_accounts.parent_account_id but never declares the column.
--   The legacy table has only parent_id. This migration:
--     1. Adds parent_account_id (UUID, self-FK)
--     2. Back-fills from parent_id for any pre-existing rows
--     3. Indexes it
-- Idempotent (IF NOT EXISTS, ON CONFLICT-safe back-fill).
-- ============================================================================

BEGIN;

ALTER TABLE public.fin_coa_accounts
  ADD COLUMN IF NOT EXISTS parent_account_id UUID
    REFERENCES public.fin_coa_accounts(id) ON DELETE SET NULL;

UPDATE public.fin_coa_accounts child
   SET parent_account_id = parent.id
  FROM public.fin_coa_accounts parent
 WHERE child.parent_id = parent.id
   AND child.parent_account_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_fin_coa_parent
  ON public.fin_coa_accounts(parent_account_id);

COMMIT;
