-- ============================================================================
-- Migration 20260828000000_finance_pdc_post_clearance_reclass.sql
--
-- Purpose:
--   Harden the post-clearance PDC dishonour path so that the voucher line
--   resolves to:
--     Dr 12413 Tenant Receivable [unit SL]
--     Cr 12000 Bank
--   rather than the pre-clearance rule which credits 21400 PDC Received.
--
--   This is a purely additive migration. Existing rules remain in place so
--   pre-clearance dishonour still routes correctly. Inserts use ON CONFLICT
--   DO NOTHING so the file is idempotent.
-- ============================================================================

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Add CHEQUE_RETURN_AR_RECLASS variant with payment_method = 'BANK'
--    This rule is selected by the post-clearance bounce path so that the credit
--    resolves to the Bank (12000) instead of PDC Received (21400).
-- ─────────────────────────────────────────────────────────────────────────────

-- The unique constraint on fin_transaction_account_rules is typically
-- (transaction_type, payment_method, deposit_type, pdc_type). A row with
-- payment_method = 'BANK' is distinct from the existing
-- (NULL, NULL, NULL) wildcard row, so ON CONFLICT DO NOTHING is safe.
INSERT INTO public.fin_transaction_account_rules
  (transaction_type, payment_method, deposit_type, pdc_type,
   debit_gl_code, debit_sl_code, credit_gl_code, credit_sl_code, description)
VALUES
  ('CHEQUE_RETURN_AR_RECLASS', 'BANK',  NULL,       'RENT_PDC',
   '12413', NULL,       '12000', '12000001',
   'Dr Tenant Receivable [unit SL] / Cr 12000001 Bank (Post-Clearance Dishonour — Bank Clawback to AR)'),

  ('CHEQUE_RETURN_AR_RECLASS', 'BANK',  NULL,       'DEPOSIT_PDC',
   '12413', NULL,       '12000', '12000001',
   'Dr Tenant Receivable [unit SL] / Cr 12000001 Bank (Post-Clearance Dishonour — Deposit PDC Bank Clawback)')

ON CONFLICT DO NOTHING;

COMMIT;
