-- One-off cleanup: remove the 3 erroneous settlement Payment Vouchers that debited
-- Cash In Hand (12100001) for MS80-13 (3 x QAR 3,800 = 11,400).
-- Run in the Supabase SQL editor. STEP 1 first and check it returns exactly 3 vouchers.

-- STEP 1: preview
SELECT v.id, v.voucher_number, v.voucher_type, v.amount, v.description, v.status
FROM public.fin_vouchers v
WHERE v.voucher_number IN ('PV-SET-970199', 'PV-SET-973725', 'PV-SET-073390');

-- STEP 2: delete (child rows first), all-or-nothing
BEGIN;

CREATE TEMP TABLE _del_ids ON COMMIT DROP AS
  SELECT id FROM public.fin_vouchers
  WHERE voucher_number IN ('PV-SET-970199', 'PV-SET-973725', 'PV-SET-073390');

DO $$ BEGIN
  IF (SELECT count(*) FROM _del_ids) > 3 THEN
    RAISE EXCEPTION 'Expected at most 3 vouchers, aborting';
  END IF;
END $$;

DELETE FROM public.fin_voucher_lines WHERE voucher_id IN (SELECT id FROM _del_ids);
-- Linked accounting events / receipts, if any (ignore if the tables don't reference these vouchers)
DELETE FROM public.fin_transaction_receipts WHERE voucher_id IN (SELECT id FROM _del_ids);
DELETE FROM public.fin_accounting_events    WHERE voucher_id IN (SELECT id FROM _del_ids);
DELETE FROM public.fin_vouchers             WHERE id        IN (SELECT id FROM _del_ids);

COMMIT;

