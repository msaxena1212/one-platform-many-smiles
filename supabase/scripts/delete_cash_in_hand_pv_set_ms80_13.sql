-- One-off cleanup: remove the 3 erroneous settlement Payment Vouchers that debited
-- Cash In Hand (12100001) for MS80-13 (3 x QAR 3,800 = 11,400).
-- Run in the Supabase SQL editor. STEP 1 first and check it returns exactly 3 vouchers.

-- STEP 1: preview
SELECT v.id, v.voucher_number, v.voucher_type, v.amount, v.description, v.status
FROM public.fin_vouchers v
WHERE v.voucher_number IN ('PV-SET-970199', 'PV-SET-973725', 'PV-SET-073390');

-- STEP 2: delete (child rows first), all-or-nothing
BEGIN;

-- 1. Delete lines belonging to the 3 duplicate settlement vouchers
DELETE FROM public.fin_voucher_lines 
WHERE voucher_id IN (
  SELECT id FROM public.fin_vouchers 
  WHERE voucher_number IN ('PV-SET-970199', 'PV-SET-973725', 'PV-SET-073390')
);

-- 2. Delete the vouchers themselves
DELETE FROM public.fin_vouchers 
WHERE voucher_number IN ('PV-SET-970199', 'PV-SET-973725', 'PV-SET-073390');

COMMIT;

