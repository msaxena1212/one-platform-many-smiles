-- Truncate PDC tables to reset and re-upload PDC data cleanly
BEGIN;

TRUNCATE TABLE public.pdcs CASCADE;

DO \$\$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'fin_pdc_register') THEN
    EXECUTE 'TRUNCATE TABLE public.fin_pdc_register CASCADE;';
  END IF;
END \$\$;

COMMIT;
