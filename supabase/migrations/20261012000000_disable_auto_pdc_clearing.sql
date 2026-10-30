-- Migration: Disable automated PDC clearing cron & reset matured PDCs from October 2026 onwards to manual workflow
-- Context: Automatic daily clearing on cheque_date must be completely manual (Deposit -> Clear, Return, Re-deposit).

DO $$
BEGIN
  -- 1. Disable & remove daily-pdc-clearing from pg_cron if pg_cron extension exists
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule('daily-pdc-clearing')
    WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'daily-pdc-clearing');
  END IF;
END $$;

-- 2. Update System Configuration so default automation engine is disabled
UPDATE public.system_configurations
SET config_value = jsonb_set(
  COALESCE(config_value, '{}'::jsonb),
  '{pdcClearingEnabled}',
  'false'::jsonb
)
WHERE config_key = 'engine_automations';

-- 3. Reset any PDCs from October 1, 2026 onwards that were automatically set to 'Cleared'
-- If they have deposit_date set, revert to 'Deposited' so the cashier/finance officer can manually Clear them.
-- Otherwise revert to 'In Hand'.
UPDATE public.fin_pdc_register
SET status = CASE 
      WHEN deposit_date IS NOT NULL THEN 'Deposited' 
      ELSE 'In Hand' 
    END,
    cleared_date = NULL,
    updated_at = NOW()
WHERE status IN ('Cleared', 'cleared')
  AND cheque_date >= '2026-10-01';

UPDATE public.pdcs
SET status = CASE 
      WHEN deposit_date IS NOT NULL THEN 'deposited' 
      ELSE 'In Hand' 
    END,
    status_pdc = CASE 
      WHEN deposit_date IS NOT NULL THEN 'deposited' 
      ELSE 'In Hand' 
    END,
    cleared_date = NULL,
    updated_at = NOW()
WHERE LOWER(status) = 'cleared'
  AND cheque_date >= '2026-10-01';
