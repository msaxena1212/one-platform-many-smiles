BEGIN;

-- ============================================================
-- Financial Receipt Immutability / Direct-Write Hardening
-- ============================================================
-- Financial receipts are audit evidence generated from POSTED
-- accounting events. They are not an accounting-entry input path.
--
-- Rules:
--   1. No application UPDATE/DELETE of issued receipts.
--   2. No application INSERT of receipts; only the SECURITY DEFINER
--      database generator may create them.
--   3. Receipt corrections happen through the accounting-event
--      reversal/adjustment lifecycle, which produces its own receipt.
--   4. Receipt reads remain available to authenticated users subject
--      to the application's existing access controls.
-- ============================================================

DROP TRIGGER IF EXISTS trg_fin_transaction_receipts_updated_at
  ON public.fin_transaction_receipts;

CREATE OR REPLACE FUNCTION public.fin_reject_transaction_receipt_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    RAISE EXCEPTION
      'Financial receipt % is immutable. Correct the underlying accounting transaction through reversal or adjustment.',
      OLD.receipt_no;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION
      'Financial receipt % is immutable and cannot be deleted.',
      OLD.receipt_no;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_fin_transaction_receipts_immutable
  ON public.fin_transaction_receipts;

CREATE TRIGGER trg_fin_transaction_receipts_immutable
BEFORE UPDATE OR DELETE
ON public.fin_transaction_receipts
FOR EACH ROW
EXECUTE FUNCTION public.fin_reject_transaction_receipt_mutation();

-- Block client-side creation/bypass. The receipt generator is SECURITY
-- DEFINER and therefore continues to insert the authoritative record.
REVOKE INSERT, UPDATE, DELETE
ON TABLE public.fin_transaction_receipts
FROM anon, authenticated;

GRANT SELECT
ON TABLE public.fin_transaction_receipts
TO authenticated;

COMMIT;
