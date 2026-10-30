-- Finance hardening: cash collection rules for refundable ancillary deposits.
-- These belong to the existing Finance Master/account-rule architecture; no
-- new module or ledger is introduced.
BEGIN;

INSERT INTO public.fin_transaction_account_rules
  (transaction_type, payment_method, deposit_type, pdc_type,
   debit_gl_code, debit_sl_code, credit_gl_code, credit_sl_code, description, is_active)
VALUES
 ('SECURITY_DEPOSIT_RECEIPT','CASH','QATAR_COOL',NULL,'12100',NULL,'21100','21100003','Dr Cash / Cr Qatar Cool Deposit',TRUE),
 ('SECURITY_DEPOSIT_RECEIPT','CASH','KAHRAMAA',NULL,'12100',NULL,'21100','21100004','Dr Cash / Cr Kahramaa Deposit',TRUE),
 ('SECURITY_DEPOSIT_RECEIPT','CASH','SERVICE_FEE',NULL,'12100',NULL,'21100','21100005','Dr Cash / Cr Service Fee Deposit',TRUE),
 ('SECURITY_DEPOSIT_RECEIPT','CASH','RESERVATION',NULL,'12100',NULL,'21100','21100001','Dr Cash / Cr Reservation Advance',TRUE)
ON CONFLICT DO NOTHING;

COMMIT;
