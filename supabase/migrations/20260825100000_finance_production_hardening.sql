BEGIN;

-- Production guardrails. Draft vouchers may be created by controlled workflows,
-- but a Posted voucher must always belong to a posted Accounting Event.
CREATE OR REPLACE FUNCTION public.fin_guard_posted_voucher()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  event_status TEXT;
BEGIN
  IF UPPER(COALESCE(NEW.status, '')) = 'POSTED' THEN
    IF NEW.accounting_event_id IS NULL THEN
      RAISE EXCEPTION 'Posted voucher % requires accounting_event_id.', NEW.voucher_number;
    END IF;

    SELECT status::text INTO event_status
    FROM public.fin_accounting_events
    WHERE id = NEW.accounting_event_id;

    IF event_status IS DISTINCT FROM 'POSTED' THEN
      RAISE EXCEPTION 'Posted voucher % requires a POSTED accounting event.', NEW.voucher_number;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_fin_guard_posted_voucher ON public.fin_vouchers;
CREATE TRIGGER trg_fin_guard_posted_voucher
BEFORE INSERT OR UPDATE ON public.fin_vouchers
FOR EACH ROW EXECUTE FUNCTION public.fin_guard_posted_voucher();

CREATE OR REPLACE FUNCTION public.fin_guard_voucher_line_parent()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  voucher_status TEXT;
BEGIN
  SELECT UPPER(status) INTO voucher_status
  FROM public.fin_vouchers
  WHERE id = NEW.voucher_id;

  IF voucher_status = 'POSTED' THEN
    IF NOT EXISTS (
      SELECT 1
      FROM public.fin_accounting_events ae
      JOIN public.fin_vouchers v ON v.accounting_event_id = ae.id
      WHERE v.id = NEW.voucher_id
        AND ae.status = 'POSTED'
    ) THEN
      RAISE EXCEPTION 'Voucher line cannot bypass a posted accounting event.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_fin_guard_voucher_line_parent ON public.fin_voucher_lines;
CREATE TRIGGER trg_fin_guard_voucher_line_parent
BEFORE INSERT OR UPDATE ON public.fin_voucher_lines
FOR EACH ROW EXECUTE FUNCTION public.fin_guard_voucher_line_parent();

COMMIT;
