-- ============================================================================
-- FINANCE — fin_resolve_gl_sl() — canonical hierarchy lookup
-- Migration: 20260830000000
--
-- Purpose:
--   Returns the FULL canonical hierarchy (group → class → GL → SL) for any
--   COA account row by id, walking parent_account_id upwards. This is the
--   single source of truth the application-side Account Resolver consults
--   before persisting any accounting line, satisfying the Finance Master
--   requirement that every line carries the complete hierarchy.
--
--   Returns one row with all six tiers populated for any active row in
--   fin_coa_accounts. For non-SL rows, the SL columns mirror the row itself
--   (so callers can treat any account_id uniformly).
--
-- Idempotent (CREATE OR REPLACE).
-- ============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.fin_resolve_gl_sl(
  p_account_id UUID
)
RETURNS TABLE (
  coa_account_id  UUID,
  group_name      TEXT,
  class_name      TEXT,
  gl_code         TEXT,
  gl_name         TEXT,
  sl_code         TEXT,
  sl_name         TEXT,
  account_level   TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row    public.fin_coa_accounts%ROWTYPE;
  v_parent public.fin_coa_accounts%ROWTYPE;
BEGIN
  -- 1. Load the target row
  SELECT *
    INTO v_row
    FROM public.fin_coa_accounts
   WHERE id = p_account_id
     AND is_active = TRUE;

  IF NOT FOUND THEN
    RAISE EXCEPTION
      'fin_resolve_gl_sl: account % not found or inactive.', p_account_id;
  END IF;

  -- 2. Walk up to the GL (or the row itself if it IS the GL)
  IF v_row.account_level = 'SL' THEN
    SELECT *
      INTO v_parent
      FROM public.fin_coa_accounts
     WHERE id = v_row.parent_account_id
       AND is_active = TRUE;

    IF NOT FOUND THEN
      RAISE EXCEPTION
        'fin_resolve_gl_sl: SL % (%) has no active parent GL (parent_account_id=%).',
        v_row.account_code, v_row.account_name, v_row.parent_account_id;
    END IF;

    IF v_parent.account_level <> 'GL' THEN
      RAISE EXCEPTION
        'fin_resolve_gl_sl: SL % parent % is not a GL (level=%).',
        v_row.account_code, v_parent.account_code, v_parent.account_level;
    END IF;
  ELSE
    -- GL or higher: the row IS the GL
    v_parent := v_row;
  END IF;

  -- 3. Return the canonical six-tier hierarchy
  RETURN QUERY
  SELECT
    v_row.id,                          -- coa_account_id (the leaf, i.e. SL or GL if no SL)
    v_parent.group_name,               -- group_name (from the GL)
    v_parent.class_name,               -- class_name (from the GL)
    v_parent.account_code,             -- gl_code
    v_parent.account_name,             -- gl_name
    CASE
      WHEN v_row.account_level = 'SL' THEN v_row.account_code
      ELSE v_parent.account_code
    END                                AS sl_code,
    CASE
      WHEN v_row.account_level = 'SL' THEN v_row.account_name
      ELSE v_parent.account_name
    END                                AS sl_name,
    v_row.account_level                AS account_level;
END;
$$;

COMMENT ON FUNCTION public.fin_resolve_gl_sl(UUID) IS
  'Returns the full canonical hierarchy (group/class/GL/SL) for any COA account id. '
  'Walks parent_account_id to guarantee the GL tier is always populated. '
  'Used by the Account Resolver for hierarchy validation before posting.';

COMMIT;
