-- Finance receipt release-gate validation.
-- Expected result for every query below: 0 rows.

-- 1. Every POSTED accounting event has exactly one receipt.
SELECT ae.id AS accounting_event_id
FROM public.fin_accounting_events ae
LEFT JOIN public.fin_transaction_receipts r
  ON r.accounting_event_id = ae.id
WHERE ae.status = 'POSTED'
GROUP BY ae.id
HAVING COUNT(r.id) <> 1;

-- 2. No receipt exists without a POSTED accounting event.
SELECT r.id AS receipt_id, r.receipt_no, r.accounting_event_id
FROM public.fin_transaction_receipts r
LEFT JOIN public.fin_accounting_events ae
  ON ae.id = r.accounting_event_id
WHERE ae.id IS NULL
   OR ae.status <> 'POSTED';

-- 3. Receipt voucher, when present, matches the accounting event voucher.
SELECT r.id AS receipt_id, r.receipt_no, r.accounting_event_id
FROM public.fin_transaction_receipts r
JOIN public.fin_accounting_events ae
  ON ae.id = r.accounting_event_id
WHERE r.voucher_id IS DISTINCT FROM ae.voucher_id;

-- 4. Every receipt has a non-empty immutable payload.
SELECT r.id AS receipt_id, r.receipt_no
FROM public.fin_transaction_receipts r
WHERE r.receipt_payload IS NULL
   OR r.receipt_payload = '{}'::jsonb;

-- 5. Receipt numbers and acknowledgement numbers are unique.
SELECT receipt_no, COUNT(*) AS duplicate_count
FROM public.fin_transaction_receipts
GROUP BY receipt_no
HAVING COUNT(*) > 1;

SELECT acknowledgement_no, COUNT(*) AS duplicate_count
FROM public.fin_transaction_receipts
GROUP BY acknowledgement_no
HAVING COUNT(*) > 1;
