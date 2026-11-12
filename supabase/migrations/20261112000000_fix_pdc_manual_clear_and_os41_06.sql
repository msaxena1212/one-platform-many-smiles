-- ============================================================================
-- Migration: 20261112000000_fix_pdc_manual_clear_and_os41_06.sql
-- Purpose:
--   1. Provide a transactional RPC `public.fin_manual_pdc_status_update` that
--      sets `SET LOCAL app.pdc_manual_clear = 'true'` inside the same Postgres
--      transaction before updating `public.fin_pdc_register`, so manual clears
--      initiated from the UI succeed even when `trg_fin_guard_pdc_auto_clear`
--      is enabled (whereas calling PostgREST `rpc/set_config` and `.update()` in
--      separate HTTP requests runs in separate transactions and fails/reverts).
--   2. Idempotently reconcile the OS41-06 Cheque #1000014..1000025 (QAR 4,300)
--      duplicate unlinked batch in `fin_pdc_register`, sync Cheque #1000014 to
--      `Cleared` where `VCH-CLR-1000014` already posted, and backfill missing
--      `public.pdcs` rows for OS41-06 if absent.
-- ============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.fin_manual_pdc_status_update(
  p_pdc_id bigint,
  p_status text,
  p_deposit_date date DEFAULT NULL,
  p_cleared_date date DEFAULT NULL,
  p_returned_date date DEFAULT NULL,
  p_bank_id bigint DEFAULT NULL
)
RETURNS public.fin_pdc_register
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_row public.fin_pdc_register;
  v_normalized_status text;
BEGIN
  IF auth.role() NOT IN ('authenticated', 'service_role') THEN
    RAISE EXCEPTION 'Authentication required to update PDC register';
  END IF;

  IF auth.role() = 'authenticated' AND NOT public.is_staff_user() THEN
    RAISE EXCEPTION 'Staff privileges required to update PDC register';
  END IF;

  v_normalized_status := CASE lower(trim(coalesce(p_status, '')))
    WHEN 'in hand'     THEN 'In Hand'
    WHEN 'deposited'   THEN 'Deposited'
    WHEN 'cleared'     THEN 'Cleared'
    WHEN 'returned'    THEN 'Returned'
    WHEN 'bounced'     THEN 'Bounced'
    WHEN 'dishonoured' THEN 'Dishonoured'
    WHEN 'replaced'    THEN 'Replaced'
    WHEN 'cancelled'   THEN 'Cancelled'
    ELSE NULL
  END;

  IF v_normalized_status IS NULL THEN
    RAISE EXCEPTION 'Invalid PDC status: %', p_status;
  END IF;

  -- Set local transaction flag in the same transaction as the UPDATE so
  -- trg_fin_guard_pdc_auto_clear permits intentional manual clearing.
  IF v_normalized_status = 'Cleared' THEN
    PERFORM set_config('app.pdc_manual_clear', 'true', true);
  END IF;

  UPDATE public.fin_pdc_register
  SET
    status        = v_normalized_status,
    deposit_date  = COALESCE(p_deposit_date, deposit_date),
    cleared_date  = COALESCE(p_cleared_date, cleared_date),
    returned_date = COALESCE(p_returned_date, returned_date),
    bank_id       = COALESCE(p_bank_id, bank_id)
  WHERE id = p_pdc_id
  RETURNING * INTO v_row;

  IF v_row.id IS NULL THEN
    RAISE EXCEPTION 'PDC register row % not found or not accessible', p_pdc_id;
  END IF;

  RETURN v_row;
END;
$$;

REVOKE ALL ON FUNCTION public.fin_manual_pdc_status_update(bigint, text, date, date, date, bigint) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fin_manual_pdc_status_update(bigint, text, date, date, date, bigint) FROM anon;
GRANT EXECUTE ON FUNCTION public.fin_manual_pdc_status_update(bigint, text, date, date, date, bigint) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fin_manual_pdc_status_update(bigint, text, date, date, date, bigint) TO service_role;

-- ────────────────────────────────────────────────────────────────────────────
-- Idempotent one-time reconciliation for OS41-06 (1000014..1000025, QAR 4,300)
-- ────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_cbq_bank_account_id bigint;
  v_has_os41_06_clear boolean := false;
  v_rec record;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM public.fin_vouchers
    WHERE voucher_number = 'VCH-CLR-1000014'
      AND total_amount = 4300
      AND description ILIKE '%OS41-06%'
  ) INTO v_has_os41_06_clear;

  IF NOT v_has_os41_06_clear THEN
    RETURN;
  END IF;

  SELECT id
  INTO v_cbq_bank_account_id
  FROM public.fin_bank_accounts
  WHERE account_title ILIKE '%CBQ%'
     OR account_number = '4060692533001'
  ORDER BY id
  LIMIT 1;

  PERFORM set_config('app.pdc_manual_clear', 'true', true);

  -- Remove exact duplicate unlinked rows created for the same OS41-06 1000014..1000025 batch,
  -- keeping the earliest row per (cheque_number, cheque_date, amount).
  DELETE FROM public.fin_pdc_register r
  WHERE r.amount = 4300
    AND r.cheque_number BETWEEN '1000014' AND '1000025'
    AND r.cheque_date BETWEEN DATE '2026-10-01' AND DATE '2027-09-01'
    AND r.tenant_id IS NULL
    AND r.property_id IS NULL
    AND r.unit_id IS NULL
    AND r.original_pdc_id IS NULL
    AND lower(r.status) = 'in hand'
    AND EXISTS (
      SELECT 1
      FROM public.fin_vouchers v
      WHERE v.voucher_number = 'VCH-PDC-REC-' || r.cheque_number
        AND v.total_amount = 4300
        AND v.description ILIKE '%OS41-06%'
    )
    AND EXISTS (
      SELECT 1
      FROM public.fin_pdc_register keep_r
      WHERE keep_r.cheque_number = r.cheque_number
        AND keep_r.cheque_date = r.cheque_date
        AND keep_r.amount = r.amount
        AND keep_r.tenant_id IS NULL
        AND keep_r.property_id IS NULL
        AND keep_r.unit_id IS NULL
        AND keep_r.original_pdc_id IS NULL
        AND keep_r.id < r.id
    );

  -- Update bank_id on remaining OS41-06 CBQ cheques if missing
  IF v_cbq_bank_account_id IS NOT NULL THEN
    UPDATE public.fin_pdc_register r
    SET bank_id = v_cbq_bank_account_id
    WHERE r.amount = 4300
      AND r.cheque_number BETWEEN '1000014' AND '1000025'
      AND r.cheque_date BETWEEN DATE '2026-10-01' AND DATE '2027-09-01'
      AND r.bank_id IS NULL
      AND EXISTS (
        SELECT 1
        FROM public.fin_vouchers v
        WHERE v.voucher_number = 'VCH-PDC-REC-' || r.cheque_number
          AND v.total_amount = 4300
          AND v.description ILIKE '%OS41-06%'
      );
  END IF;

  -- Mark Cheque #1000014 (01-10-2026, QAR 4,300) as Cleared
  UPDATE public.fin_pdc_register r
  SET
    status       = 'Cleared',
    deposit_date = COALESCE(r.deposit_date, DATE '2026-10-01'),
    cleared_date = COALESCE(r.cleared_date, DATE '2026-11-11'),
    bank_id      = COALESCE(r.bank_id, v_cbq_bank_account_id)
  WHERE r.cheque_number = '1000014'
    AND r.cheque_date = DATE '2026-10-01'
    AND r.amount = 4300
    AND lower(r.status) IN ('in hand', 'deposited');

  -- Backfill missing public.pdcs rows for OS41-06 (1000014..1000025) if absent
  FOR v_rec IN
    SELECT DISTINCT ON (r.cheque_number, r.cheque_date)
      r.cheque_number,
      r.cheque_date,
      r.amount,
      r.status,
      r.deposit_date
    FROM public.fin_pdc_register r
    WHERE r.amount = 4300
      AND r.cheque_number BETWEEN '1000014' AND '1000025'
      AND r.cheque_date BETWEEN DATE '2026-10-01' AND DATE '2027-09-01'
      AND EXISTS (
        SELECT 1
        FROM public.fin_vouchers v
        WHERE v.voucher_number = 'VCH-PDC-REC-' || r.cheque_number
          AND v.total_amount = 4300
          AND v.description ILIKE '%OS41-06%'
      )
    ORDER BY r.cheque_number, r.cheque_date, r.id ASC
  LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM public.pdcs p
      WHERE p.unit_name = 'OS41-06'
        AND p.cheque_number = v_rec.cheque_number
    ) THEN
      INSERT INTO public.pdcs (
        cheque_number,
        bank,
        deposit_date,
        amount,
        status,
        maturity_date,
        unit_name,
        property_code,
        tenant_name,
        status_pdc
      )
      VALUES (
        v_rec.cheque_number,
        'Commercial Bank of Qatar (CBQ)',
        CASE WHEN lower(v_rec.status) IN ('deposited', 'cleared') THEN COALESCE(v_rec.deposit_date, v_rec.cheque_date) ELSE NULL END,
        v_rec.amount,
        CASE WHEN lower(v_rec.status) = 'cleared' THEN 'cleared' WHEN lower(v_rec.status) = 'deposited' THEN 'deposited' ELSE 'In Hand' END,
        v_rec.cheque_date,
        'OS41-06',
        'OS41',
        'Mr. Anupam Gupta Ashok K Gupta',
        CASE WHEN lower(v_rec.status) = 'cleared' THEN 'cleared' WHEN lower(v_rec.status) = 'deposited' THEN 'deposited' ELSE 'In Hand' END
      );
    END IF;
  END LOOP;
END $$;

COMMIT;
