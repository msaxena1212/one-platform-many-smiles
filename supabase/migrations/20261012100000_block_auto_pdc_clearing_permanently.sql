-- =============================================================================
-- Migration: 20261012100000_block_auto_pdc_clearing_permanently.sql
-- Purpose:   PERMANENTLY disable all automated PDC clearing mechanisms.
--
--   1. Replace pg_cron daily-pdc-clearing with a no-op
--   2. Replace cron_flag_overdue_pdcs function with a no-op
--   3. Install BEFORE UPDATE guard trigger on fin_pdc_register
--   4. Reset October 2026+ cleared PDCs to Deposited/In Hand
-- =============================================================================

-- 1. Replace daily-pdc-clearing cron with a harmless no-op
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule('daily-pdc-clearing')
    WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'daily-pdc-clearing');
    PERFORM cron.schedule('daily-pdc-clearing','5 21 * * *','SELECT 1;');
  END IF;
END $$;

-- 2. Replace cron_flag_overdue_pdcs with a no-op
CREATE OR REPLACE FUNCTION public.cron_flag_overdue_pdcs()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $fn$
BEGIN
  RAISE NOTICE 'cron_flag_overdue_pdcs: automated PDC clearing is DISABLED. All status changes must be manual.';
END;
$fn$;

-- 3. Guard trigger: block any automated attempt to set status = Cleared
CREATE OR REPLACE FUNCTION public.fin_guard_pdc_auto_clear()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $fn$
DECLARE v_manual text;
BEGIN
  IF LOWER(NEW.status) = 'cleared' AND LOWER(OLD.status) != 'cleared' THEN
    v_manual := current_setting('app.pdc_manual_clear', true);
    IF v_manual IS DISTINCT FROM 'true' THEN
      NEW.status      := OLD.status;
      NEW.cleared_date := OLD.cleared_date;
      RAISE NOTICE 'fin_guard_pdc_auto_clear: blocked automated Cleared transition for PDC id=%.', NEW.id;
    END IF;
  END IF;
  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS trg_fin_guard_pdc_auto_clear ON public.fin_pdc_register;
CREATE TRIGGER trg_fin_guard_pdc_auto_clear
  BEFORE UPDATE OF status ON public.fin_pdc_register
  FOR EACH ROW EXECUTE FUNCTION public.fin_guard_pdc_auto_clear();

COMMENT ON TRIGGER trg_fin_guard_pdc_auto_clear ON public.fin_pdc_register IS
  'Blocks automated clearing. Manual clear requires SET LOCAL app.pdc_manual_clear=true (done in pdcService clearPdc).';

-- 4. Reset October 2026+ PDCs that were auto-cleared back to Deposited/In Hand
UPDATE public.fin_pdc_register
SET status = CASE WHEN deposit_date IS NOT NULL THEN 'Deposited' ELSE 'In Hand' END,
    cleared_date = NULL,
    updated_at = NOW()
WHERE LOWER(status) = 'cleared'
  AND cheque_date >= '2026-10-01';

UPDATE public.pdcs
SET status     = CASE WHEN deposit_date IS NOT NULL THEN 'deposited' ELSE 'In Hand' END,
    status_pdc = CASE WHEN deposit_date IS NOT NULL THEN 'deposited' ELSE 'In Hand' END,
    cleared_date = NULL,
    updated_at = NOW()
WHERE LOWER(status) = 'cleared'
  AND cheque_date >= '2026-10-01';
