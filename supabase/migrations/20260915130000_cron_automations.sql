-- =============================================================================
-- Migration: 20260915130000_cron_automations.sql
-- Description: Cron automations via pg_cron extension.
-- All schedules are in UTC, calibrated to Qatar Standard Time (AST = UTC+3).
-- Qatar has NO Daylight Saving Time.
--
-- Schedule mapping:
--   00:05 AST (daily PDC check)       → 21:05 UTC  →  '5 21 * * *'
--   00:30 AST (monthly depreciation)  → 21:30 UTC  →  '30 21 * * *'
--     (Qatar 1st-of-month guard is enforced inside run_monthly_asset_depreciation())
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

-- ── Helper: monthly depreciation with Qatar 1st-of-month guard ───────────────
-- Isolated into a named function to avoid nested dollar-quoting inside pg_cron.
CREATE OR REPLACE FUNCTION public.run_monthly_asset_depreciation()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
BEGIN
  -- Only execute when it is currently the 1st day of the month in Qatar time
  IF EXTRACT(DAY FROM (NOW() AT TIME ZONE 'Asia/Qatar')) != 1 THEN
    RETURN;
  END IF;

  UPDATE public.fixed_assets
  SET accumulated_depreciation = COALESCE(accumulated_depreciation, 0) +
        GREATEST(0, LEAST(
          COALESCE(net_book_value, purchase_cost) - COALESCE(salvage_value, 0),
          ROUND(((COALESCE(purchase_cost, 0) - COALESCE(salvage_value, 0)) /
                 (GREATEST(COALESCE(useful_life_years, 5), 1) * 12))::numeric, 2)
        )),
      net_book_value = GREATEST(
          COALESCE(salvage_value, 0),
          COALESCE(purchase_cost, 0) - (
            COALESCE(accumulated_depreciation, 0) +
            ROUND(((COALESCE(purchase_cost, 0) - COALESCE(salvage_value, 0)) /
                   (GREATEST(COALESCE(useful_life_years, 5), 1) * 12))::numeric, 2)
          )
      ),
      last_depreciation_date = (NOW() AT TIME ZONE 'Asia/Qatar')::date,
      updated_at = NOW()
  WHERE status IN ('in_service', 'In Service', 'active', 'Active')
    AND COALESCE(net_book_value, purchase_cost) > COALESCE(salvage_value, 0);
END;
$fn$;

-- ── Register pg_cron jobs ─────────────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN

    -- 1. Daily PDC Status Check & Clearing
    --    21:05 UTC = 00:05 AST (Qatar midnight)
    PERFORM cron.unschedule('daily-pdc-clearing')
    WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'daily-pdc-clearing');

    PERFORM cron.schedule(
      'daily-pdc-clearing',
      '5 21 * * *',
      $cron$
        UPDATE public.fin_pdc_register
        SET status = 'Cleared',
            cleared_date = (NOW() AT TIME ZONE 'Asia/Qatar')::date,
            updated_at = NOW()
        WHERE status IN ('Deposited', 'deposited')
          AND cheque_date <= (NOW() AT TIME ZONE 'Asia/Qatar')::date;
      $cron$
    );

    -- 2. Monthly Fixed Asset Depreciation
    --    21:30 UTC = 00:30 AST (Qatar midnight) — fires nightly, Qatar day guard inside function
    PERFORM cron.unschedule('monthly-asset-depreciation')
    WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'monthly-asset-depreciation');

    PERFORM cron.schedule(
      'monthly-asset-depreciation',
      '30 21 * * *',
      $cron$
        SELECT public.run_monthly_asset_depreciation();
      $cron$
    );

  END IF;
END $$;
