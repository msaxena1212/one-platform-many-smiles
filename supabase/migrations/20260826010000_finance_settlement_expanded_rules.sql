-- ============================================================================
-- FINANCE EXPANDED RULES & SETTLEMENT ENGINE — Migration 20260826010000
-- Purpose:
--   1. Seed additional COA accounts for Damage Recovery, Penalty Income, Utility Recovery, Unclaimed Liability
--   2. Seed expanded transaction rules for:
--      - DAMAGE_CHARGE (12413 Dr / 41201 Cr)
--      - PENALTY_CHARGE (12413 Dr / 41201 Cr)
--      - UTILITY_CHARGE (12413 Dr / 51003 or 41201 Cr)
--      - DEPOSIT_TO_UNCLAIMED (21100006 Dr / 21100002 Cr)
--      - UNCLAIMED_REFUND (21100002 Dr / 12000001 Cr)
--      - RESERVATION_APPLY_RENT (21100001 Dr / 12413 Cr)
--      - RESERVATION_FORFEIT (21100001 Dr / 41201 Cr)
--      - DEPOSIT_DEDUCTION_SETTLE (21100006 Dr / 12413 Cr)
--      - GUARANTEE_CHEQUE_RETURN (21200001 Dr / 12900002 Cr)
--      - RENT_INVOICE_REVERSAL (41100001 Dr / 12413 Cr)
-- ============================================================================

BEGIN;

-- 1. Ensure any missing GL/SL accounts are inserted into fin_coa_accounts
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '41201001', 'Damage Recovery Income', 'REVENUE', 'SL', 'Revenue', 'Other Revenue', id
FROM public.fin_coa_accounts WHERE account_code = '41201'
ON CONFLICT (account_code) DO NOTHING;

INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '41201002', 'Early Termination Penalty Income', 'REVENUE', 'SL', 'Revenue', 'Other Revenue', id
FROM public.fin_coa_accounts WHERE account_code = '41201'
ON CONFLICT (account_code) DO NOTHING;

INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '41201003', 'Utility Recovery Income', 'REVENUE', 'SL', 'Revenue', 'Other Revenue', id
FROM public.fin_coa_accounts WHERE account_code = '41201'
ON CONFLICT (account_code) DO NOTHING;

INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '41201004', 'Forfeited Reservation Revenue', 'REVENUE', 'SL', 'Revenue', 'Other Revenue', id
FROM public.fin_coa_accounts WHERE account_code = '41201'
ON CONFLICT (account_code) DO NOTHING;

-- 2. Seed Expanded Transaction Rules
INSERT INTO public.fin_transaction_account_rules
  (transaction_type, payment_method, deposit_type, pdc_type,
   debit_gl_code, debit_sl_code, credit_gl_code, credit_sl_code, description)
VALUES

-- Damage Recognition: Dr 12413 [unit SL] / Cr 41201001 Damage Recovery Income
('DAMAGE_CHARGE',            NULL,    NULL,       NULL,
 '12413', NULL,       '41201', '41201001',
 'Dr Tenant Receivable [unit SL] / Cr 41201001 Damage Recovery Income'),

-- Early Termination Penalty Charge: Dr 12413 [unit SL] / Cr 41201002 Penalty Income
('PENALTY_CHARGE',           NULL,    NULL,       NULL,
 '12413', NULL,       '41201', '41201002',
 'Dr Tenant Receivable [unit SL] / Cr 41201002 Early Termination Penalty Income'),

-- Utility Charge: Dr 12413 [unit SL] / Cr 41201003 Utility Recovery Income
('UTILITY_CHARGE',           NULL,    NULL,       NULL,
 '12413', NULL,       '41201', '41201003',
 'Dr Tenant Receivable [unit SL] / Cr 41201003 Utility Recovery Income'),

-- Deposit Deduction Settle: Dr 21100006 Refundable Deposit / Cr 12413 [unit SL]
('DEPOSIT_DEDUCTION_SETTLE', NULL,    'SECURITY', NULL,
 '21100', '21100006', '12413', NULL,
 'Dr 21100006 Refundable Security Deposit / Cr Tenant Receivable [unit SL]'),

-- Transfer Refundable Deposit to Unclaimed: Dr 21100006 / Cr 21100002
('DEPOSIT_TO_UNCLAIMED',     NULL,    'SECURITY', NULL,
 '21100', '21100006', '21100', '21100002',
 'Dr 21100006 Refundable Deposit / Cr 21100002 Unclaimed Liability-Deposit'),

-- Unclaimed Deposit Refund: Dr 21100002 / Cr 12000001 Bank
('UNCLAIMED_REFUND',         'BANK',  NULL,       NULL,
 '21100', '21100002', '12000', '12000001',
 'Dr 21100002 Unclaimed Liability-Deposit / Cr 12000001 Bank'),

-- Reservation Advance Applied to Rent: Dr 21100001 / Cr 12413 [unit SL]
('RESERVATION_APPLY_RENT',   NULL,    'RESERVATION', NULL,
 '21100', '21100001', '12413', NULL,
 'Dr 21100001 Reservation Advance / Cr Tenant Receivable [unit SL]'),

-- Reservation Advance Forfeited: Dr 21100001 / Cr 41201004 Forfeiture Revenue
('RESERVATION_FORFEIT',      NULL,    'RESERVATION', NULL,
 '21100', '21100001', '41201', '41201004',
 'Dr 21100001 Reservation Advance / Cr 41201004 Forfeited Reservation Revenue'),

-- Guarantee Cheque Return: Dr 21200001 / Cr 12900002
('GUARANTEE_CHEQUE_RETURN',  NULL,    'GUARANTEE', NULL,
 '21200', '21200001', '12900', '12900002',
 'Dr 21200001 Guarantee Cheque Received / Cr 12900002 Deposit-PDC In Hand'),

-- Rent Invoice Cancellation/Reversal: Dr 41100001 / Cr 12413 [unit SL]
('RENT_INVOICE_REVERSAL',    NULL,    NULL,       NULL,
 '41100', '41100001', '12413', NULL,
 'Dr 41100001 Rental Revenue / Cr Tenant Receivable [unit SL] (Future Rent Cancel)')

ON CONFLICT DO NOTHING;

COMMIT;
