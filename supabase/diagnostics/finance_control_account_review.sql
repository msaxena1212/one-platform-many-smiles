-- READ-ONLY review queries. Not a migration: nothing here changes data.
-- Purpose: find PDC postings made before the unit-SL fix that landed on the GL control
-- accounts (12413 / 12900 / 21400), or on 41100 Rental Revenue instead of Tenant Receivables.
-- Run in the Supabase SQL Editor, review with Finance, then post any reclass through the
-- normal Journal Voucher screen (so it goes through the posting engine and period checks).

-- 1. Net balance sitting on each control account (posted via accounting events)
SELECT l.account_code,
       COUNT(*)                       AS lines,
       SUM(l.debit)                   AS total_debit,
       SUM(l.credit)                  AS total_credit,
       SUM(l.debit) - SUM(l.credit)   AS net_debit_balance
FROM public.fin_accounting_event_lines l
WHERE l.account_code IN ('12413', '12900', '21400')
GROUP BY l.account_code
ORDER BY l.account_code;

-- 2. The individual lines, with their event, for review
SELECT e.posting_date, e.reference_number, e.description, e.status,
       l.account_code, l.account_name, l.debit, l.credit, e.unit_id
FROM public.fin_accounting_event_lines l
JOIN public.fin_accounting_events e ON e.id = l.event_id
WHERE l.account_code IN ('12413', '12900', '21400')
ORDER BY e.posting_date, e.reference_number;

-- 3. PDC replacement receipts (cash / bank transfer) that credited Rental Revenue 41100
SELECT e.posting_date, e.reference_number, e.description, e.status,
       l.account_code, l.account_name, l.debit, l.credit, e.unit_id
FROM public.fin_accounting_event_lines l
JOIN public.fin_accounting_events e ON e.id = l.event_id
WHERE l.account_code LIKE '41100%'
  AND l.credit > 0
  AND (e.description ILIKE '%in place of PDC%'
       OR e.reference_number ILIKE 'CSH-REC-%'
       OR e.reference_number ILIKE 'TRF-REC-%'
       OR e.reference_number ILIKE 'VCH-CSH-%'
       OR e.reference_number ILIKE 'VCH-TRF-%')
ORDER BY e.posting_date, e.reference_number;

-- Suggested reclass shapes (post via Journal Voucher after review, per unit where known):
--   Tenant receivable on control:  Dr 12413001 / Cr 12413   (or the reverse, matching the net)
--   PDC in hand on control:        Dr 12900001 / Cr 12900   (or the reverse)
--   Customer PDC liability:        Dr 21400001 / Cr 21400   (or the reverse)
--   PDC replacement booked as revenue:  Dr 41100001 / Cr 12413001 for the amount found in query 3
