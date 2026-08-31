-- ============================================================================
-- Migration 20260829000000_finance_pdc_lifecycle_deposit_pdc_rules.sql
--
-- Purpose:
--   Backfill the four PDC lifecycle rule types that exist for RENT_PDC but
--   not for DEPOSIT_PDC:
--
--     PDC_DEPOSIT_BANK     (Dr 12000001 Bank / Cr 12900002 Deposit-PDC In Hand)
--     PDC_DEPOSIT_AR       (Dr 21500[unit SL] / Cr 12413[unit SL])
--     PDC_RETURN           (Dr 21500[unit SL] / Cr 12900002)
--     PDC_CANCEL           (Dr 21500[unit SL] / Cr 12900002)
--
--   The pdcService.ts posting path threads `pdcType` (RENT_PDC or DEPOSIT_PDC)
--   into every resolveAccountingAccounts() call. With only the RENT_PDC rule
--   variants seeded, any DEPOSIT_PDC lifecycle action (deposit / return /
--   cancel) throws "No account rule matched". This migration closes that gap.
--
--   All inserts use ON CONFLICT DO NOTHING so the file is idempotent and
--   safe to re-run.
-- ============================================================================

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- PDC_DEPOSIT_BANK — DEPOSIT_PDC variant
--   Entry A: Dr 12000001 Bank / Cr 12900002 Deposit-PDC In Hand
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO public.fin_transaction_account_rules
  (transaction_type, payment_method, deposit_type, pdc_type,
   debit_gl_code, debit_sl_code, credit_gl_code, credit_sl_code, description)
VALUES
  ('PDC_DEPOSIT_BANK', NULL, NULL, 'DEPOSIT_PDC',
   '12000', '12000001', '12900', '12900002',
   'Dr 12000001 Bank / Cr 12900002 Deposit-PDC In Hand (Deposit-PDC instrument deposited)'),

-- ─────────────────────────────────────────────────────────────────────────────
-- PDC_DEPOSIT_AR — DEPOSIT_PDC variant
--   Entry B: Dr 21500[unit SL] Deposit / Cr 12413[unit SL] Tenant Receivable
--   Note: this is a deposit PDC, not a rent PDC, so the customer-credit leg
--   is the DEPOSIT GL 21500 (not 21400). The AR leg is unchanged.
-- ─────────────────────────────────────────────────────────────────────────────
  ('PDC_DEPOSIT_AR', NULL, NULL, 'DEPOSIT_PDC',
   '21500', NULL, '12413', NULL,
   'Dr Deposit [unit SL] / Cr Tenant Receivable [unit SL] (Deposit-PDC clears AR)'),

-- ─────────────────────────────────────────────────────────────────────────────
-- PDC_RETURN — DEPOSIT_PDC variant
--   Dr 21500[unit SL] Deposit / Cr 12900002 Deposit-PDC In Hand
--   Used when a deposit PDC is returned to the tenant unpresented.
-- ─────────────────────────────────────────────────────────────────────────────
  ('PDC_RETURN', NULL, NULL, 'DEPOSIT_PDC',
   '21500', NULL, '12900', '12900002',
   'Dr Deposit [unit SL] / Cr 12900002 Deposit-PDC In Hand (Deposit-PDC Return)'),

-- ─────────────────────────────────────────────────────────────────────────────
-- PDC_CANCEL — DEPOSIT_PDC variant
--   Dr 21500[unit SL] Deposit / Cr 12900002 Deposit-PDC In Hand
--   Cancellation journal is identical to return for an un-deposited PDC.
-- ─────────────────────────────────────────────────────────────────────────────
  ('PDC_CANCEL', NULL, NULL, 'DEPOSIT_PDC',
   '21500', NULL, '12900', '12900002',
   'Dr Deposit [unit SL] / Cr 12900002 Deposit-PDC In Hand (Deposit-PDC Cancel)')

ON CONFLICT (
  transaction_type,
  COALESCE(payment_method, '__NULL__'),
  COALESCE(deposit_type,   '__NULL__'),
  COALESCE(pdc_type,       '__NULL__')
)
DO NOTHING;

COMMIT;
