-- Correct the deposit date of PDC f9773c03-95fb-44bc-8642-dff034d46d72 (MS80-16, Ms. Pavani Thottimpudi, QAR 4,000)
-- Posted as 2026-11-02 (bank deposit slip date), actual date is 2026-10-04.
-- Run in the Supabase SQL editor. Check STEP 1, then run STEP 2.

-- STEP 1: preview (expect 1 voucher, 1+ pdc rows)
SELECT id, voucher_number, voucher_date, amount, description
FROM public.fin_vouchers
WHERE voucher_number = 'VCH-DEP-f9773c03-95fb-44bc-8642-dff034d46d72';

SELECT id, status, deposit_date FROM public.pdcs
WHERE id::text = 'f9773c03-95fb-44bc-8642-dff034d46d72';

-- STEP 2: correct the dates (no amounts or accounts change)
BEGIN;

UPDATE public.fin_vouchers
SET voucher_date = DATE '2026-10-04'
WHERE voucher_number = 'VCH-DEP-f9773c03-95fb-44bc-8642-dff034d46d72';

UPDATE public.pdcs
SET deposit_date = DATE '2026-10-04'
WHERE id::text = 'f9773c03-95fb-44bc-8642-dff034d46d72';

COMMIT;
