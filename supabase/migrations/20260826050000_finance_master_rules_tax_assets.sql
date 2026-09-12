-- ============================================================================
-- MASTER FINANCE ENGINE EXPANSION — Migration 20260826050000
-- Purpose:
--   1. Seed COA accounts for Tax/VAT, Fixed Assets, Depreciation, CWIP, Disposals, Dishonour fees, Bank Cash transfers
--   2. Seed transaction account rules for:
--      - VAT & Tax on Invoices and Vendor Bills
--      - Fixed Asset Acquisition, CWIP Capitalization, Depreciation & Disposal
--      - Cheque Return (Deposited / Bank Reversal): Dr 12900 / Cr 12000 AND Dr 12413 / Cr 21400
--      - Cash in place of Cheque: Dr 12100 / Cr 12413, Dr 21400 / Cr 12900, Dr 12000 / Cr 12100
--      - Bank Dishonour Charges (Absorbed vs Tenant Recoverable)
--      - Utility Accruals & True-ups
-- ============================================================================

BEGIN;

-- 1. Ensure Tax, Asset, CWIP, and Dishonour GL & SL Accounts exist in fin_coa_accounts

-- 21600 / 21600001 – Output Tax Payable (Current Liability)
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name)
VALUES ('21600', 'Tax Payable Control', 'LIABILITY', 'GL', 'Liabilities', 'Current Liabilities')
ON CONFLICT (account_code) DO NOTHING;

INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '21600001', 'Output VAT Payable', 'LIABILITY', 'SL', 'Liabilities', 'Current Liabilities', id
FROM public.fin_coa_accounts WHERE account_code = '21600'
ON CONFLICT (account_code) DO NOTHING;

-- 12600 / 12600001 – Input Tax Recoverable (Current Asset)
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name)
VALUES ('12600', 'Tax Recoverable Control', 'ASSET', 'GL', 'Assets', 'Current Assets')
ON CONFLICT (account_code) DO NOTHING;

INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '12600001', 'Input VAT Recoverable', 'ASSET', 'SL', 'Assets', 'Current Assets', id
FROM public.fin_coa_accounts WHERE account_code = '12600'
ON CONFLICT (account_code) DO NOTHING;

-- 11000 / 11000001 – Fixed Assets / Property Plant & Equipment (Non-Current Asset)
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name)
VALUES ('11000', 'Fixed Assets Control', 'ASSET', 'GL', 'Assets', 'Non-Current Assets')
ON CONFLICT (account_code) DO NOTHING;

INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '11000001', 'Property, Plant & Equipment', 'ASSET', 'SL', 'Assets', 'Non-Current Assets', id
FROM public.fin_coa_accounts WHERE account_code = '11000'
ON CONFLICT (account_code) DO NOTHING;

-- 11100 / 11100001 – Capital Work in Progress (CWIP)
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name)
VALUES ('11100', 'Capital Work in Progress Control', 'ASSET', 'GL', 'Assets', 'Non-Current Assets')
ON CONFLICT (account_code) DO NOTHING;

INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '11100001', 'CWIP - Property Projects', 'ASSET', 'SL', 'Assets', 'Non-Current Assets', id
FROM public.fin_coa_accounts WHERE account_code = '11100'
ON CONFLICT (account_code) DO NOTHING;

-- 12700 / 12700001 – Accumulated Depreciation (Contra-Asset)
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name)
VALUES ('12700', 'Accumulated Depreciation Control', 'ASSET', 'GL', 'Assets', 'Non-Current Assets')
ON CONFLICT (account_code) DO NOTHING;

INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '12700001', 'Accumulated Depreciation - Fixed Assets', 'ASSET', 'SL', 'Assets', 'Non-Current Assets', id
FROM public.fin_coa_accounts WHERE account_code = '12700'
ON CONFLICT (account_code) DO NOTHING;

-- 52100 / 52100001 – Depreciation Expense
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name)
VALUES ('52100', 'Depreciation Expense Control', 'EXPENSE', 'GL', 'Expenses', 'Indirect Expenses')
ON CONFLICT (account_code) DO NOTHING;

INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '52100001', 'Depreciation Expense', 'EXPENSE', 'SL', 'Expenses', 'Indirect Expenses', id
FROM public.fin_coa_accounts WHERE account_code = '52100'
ON CONFLICT (account_code) DO NOTHING;

-- 42200 / 42200001 – Gain on Asset Disposal
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name)
VALUES ('42200', 'Gain on Disposal Control', 'REVENUE', 'GL', 'Revenue', 'Other Revenue')
ON CONFLICT (account_code) DO NOTHING;

INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '42200001', 'Gain on Fixed Asset Disposal', 'REVENUE', 'SL', 'Revenue', 'Other Revenue', id
FROM public.fin_coa_accounts WHERE account_code = '42200'
ON CONFLICT (account_code) DO NOTHING;

-- 52200 / 52200001 – Loss on Asset Disposal
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name)
VALUES ('52200', 'Loss on Disposal Control', 'EXPENSE', 'GL', 'Expenses', 'Indirect Expenses')
ON CONFLICT (account_code) DO NOTHING;

INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '52200001', 'Loss on Fixed Asset Disposal', 'EXPENSE', 'SL', 'Expenses', 'Indirect Expenses', id
FROM public.fin_coa_accounts WHERE account_code = '52200'
ON CONFLICT (account_code) DO NOTHING;

-- 51105 / 51105001 – Bank Dishonour Charges Expense
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name)
VALUES ('51105', 'Bank Charges Control', 'EXPENSE', 'GL', 'Expenses', 'Indirect Expenses')
ON CONFLICT (account_code) DO NOTHING;

INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '51105001', 'Bank Dishonour & Cheque Return Charges', 'EXPENSE', 'SL', 'Expenses', 'Indirect Expenses', id
FROM public.fin_coa_accounts WHERE account_code = '51105'
ON CONFLICT (account_code) DO NOTHING;

-- 41201007 – Cheque Bounce / Dishonour Recovery Income (from tenant)
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name)
VALUES ('41201007', 'Bank Dishonour Fee Recovery', 'REVENUE', 'SL', 'Revenue', 'Other Revenue')
ON CONFLICT (account_code) DO NOTHING;

-- 2. Seed Transaction Account Rules

INSERT INTO public.fin_transaction_account_rules
  (transaction_type, payment_method, deposit_type, pdc_type,
   debit_gl_code, debit_sl_code, credit_gl_code, credit_sl_code, description)
VALUES

-- Fixed Asset Purchase via AP: Dr 11000001 / Cr 22100001
('ASSET_PURCHASE',           NULL,    NULL,       NULL,
 '11000', '11000001', '22100', '22100001',
 'Dr 11000001 Fixed Assets / Cr 22100001 Trade Payables'),

-- CWIP Project Invoice: Dr 11100001 / Cr 22100001
('CWIP_PROJECT_INVOICE',     NULL,    NULL,       NULL,
 '11100', '11100001', '22100', '22100001',
 'Dr 11100001 CWIP - Projects / Cr 22100001 Trade Payables'),

-- CWIP Capitalization: Dr 11000001 / Cr 11100001
('CWIP_CAPITALIZATION',      NULL,    NULL,       NULL,
 '11000', '11000001', '11100', '11100001',
 'Dr 11000001 Fixed Assets / Cr 11100001 CWIP (Capitalization)'),

-- Monthly Depreciation: Dr 52100001 / Cr 12700001
('ASSET_DEPRECIATION',       NULL,    NULL,       NULL,
 '52100', '52100001', '12700', '12700001',
 'Dr 52100001 Depreciation Expense / Cr 12700001 Accumulated Depreciation'),

-- Bank Dishonour Fee (Company Absorbed): Dr 51105001 / Cr 12000001
('DISHONOUR_CHARGE_COMPANY', 'BANK',  NULL,       NULL,
 '51105', '51105001', '12000', '12000001',
 'Dr 51105001 Bank Dishonour Expense / Cr 12000001 Bank'),

-- Bank Dishonour Fee (Tenant Recoverable): Dr 12413 [unit SL] / Cr 41201007
('DISHONOUR_CHARGE_TENANT',  NULL,    NULL,       NULL,
 '12413', NULL,       '41201', '41201007',
 'Dr Tenant Receivable [unit SL] / Cr 41201007 Dishonour Fee Recovery Income'),

-- Cash Till Deposit into Bank: Dr 12000001 Bank / Cr 12100001 Cash in Hand
('CASH_BANK_DEPOSIT',        NULL,    NULL,       NULL,
 '12000', '12000001', '12100', '12100001',
 'Dr 12000001 Bank / Cr 12100001 Cash in Hand (Cash Till Deposit)')

ON CONFLICT DO NOTHING;

COMMIT;
