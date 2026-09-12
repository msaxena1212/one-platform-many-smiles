-- ============================================================================
-- ACCOUNTS PAYABLE & EXPENSE SUBLEDGERS — Migration 20260826020000
-- Purpose:
--   1. Seed Subledger accounts under 22100 (Accounts Payable) and 51000 range (Direct/Indirect Expenses)
--   2. Seed Vendor PDC, Advance, Maintenance, Security, Cleaning, AMC, and Utility Expense SLs
--   3. Seed Transaction Rules for P402–P430 (Vendor Invoices, Payments, Advances, Retention, Credit Notes)
-- ============================================================================

BEGIN;

-- 1. Ensure AP and Expense SL Accounts exist in fin_coa_accounts
-- 22100001 – Trade Payables / Vendor Control
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '22100001', 'Trade Payables - Vendors', 'LIABILITY', 'SL', 'Liabilities', 'Non-Current Liabilities', id
FROM public.fin_coa_accounts WHERE account_code = '22100'
ON CONFLICT (account_code) DO NOTHING;

-- 22100002 – Vendor Retention Payable
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '22100002', 'Vendor Retention Payable', 'LIABILITY', 'SL', 'Liabilities', 'Non-Current Liabilities', id
FROM public.fin_coa_accounts WHERE account_code = '22100'
ON CONFLICT (account_code) DO NOTHING;

-- 12411001 – Vendor Advances (Current Asset)
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '12411001', 'Vendor Advances / Prepayments', 'ASSET', 'SL', 'Assets', 'Current Assets', id
FROM public.fin_coa_accounts WHERE account_code = '12411'
ON CONFLICT (account_code) DO NOTHING;

-- 51001001 – Property Maintenance Expense
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '51001001', 'Property Maintenance & Repair', 'EXPENSE', 'SL', 'Expenses', 'Direct Expenses', id
FROM public.fin_coa_accounts WHERE account_code = '51001'
ON CONFLICT (account_code) DO NOTHING;

-- 51002001 – Security Services Expense
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '51002001', 'Security Services Expense', 'EXPENSE', 'SL', 'Expenses', 'Direct Expenses', id
FROM public.fin_coa_accounts WHERE account_code = '51002'
ON CONFLICT (account_code) DO NOTHING;

-- 51003001 – Cleaning & Janitorial Expense
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '51003001', 'Cleaning & Janitorial Expense', 'EXPENSE', 'SL', 'Expenses', 'Direct Expenses', id
FROM public.fin_coa_accounts WHERE account_code = '51003'
ON CONFLICT (account_code) DO NOTHING;

-- 51004001 – Annual Maintenance Contract (AMC) Expense
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '51004001', 'AMC & Facility Management', 'EXPENSE', 'SL', 'Expenses', 'Direct Expenses', id
FROM public.fin_coa_accounts WHERE account_code = '51004'
ON CONFLICT (account_code) DO NOTHING;

-- 2. Seed Transaction Account Rules for Accounts Payable (P402–P430)
INSERT INTO public.fin_transaction_account_rules
  (transaction_type, payment_method, deposit_type, pdc_type,
   debit_gl_code, debit_sl_code, credit_gl_code, credit_sl_code, description)
VALUES

-- P402 Vendor Invoice (Maintenance/Services): Dr Expense / Cr Trade Payables
('VENDOR_INVOICE',           NULL,    NULL,       NULL,
 '51001', '51001001', '22100', '22100001',
 'Dr 51001001 Property Maintenance / Cr 22100001 Trade Payables'),

-- P403 Vendor Payment (Bank): Dr Trade Payables / Cr Bank
('VENDOR_PAYMENT',           'BANK',  NULL,       NULL,
 '22100', '22100001', '12000', '12000001',
 'Dr 22100001 Trade Payables / Cr 12000001 Bank'),

-- P404 Vendor Payment (Cash): Dr Trade Payables / Cr Cash
('VENDOR_PAYMENT',           'CASH',  NULL,       NULL,
 '22100', '22100001', '12100', '12100001',
 'Dr 22100001 Trade Payables / Cr 12100001 Cash in Hand'),

-- P405 Vendor Advance / Prepayment (Bank): Dr Vendor Advance / Cr Bank
('VENDOR_ADVANCE',           'BANK',  NULL,       NULL,
 '12411', '12411001', '12000', '12000001',
 'Dr 12411001 Vendor Advance / Cr 12000001 Bank'),

-- P406 Vendor Advance Applied to Invoice: Dr Trade Payables / Cr Vendor Advance
('VENDOR_ADVANCE_APPLY',     NULL,    NULL,       NULL,
 '22100', '22100001', '12411', '12411001',
 'Dr 22100001 Trade Payables / Cr 12411001 Vendor Advance'),

-- P407 Vendor Credit Note: Dr Trade Payables / Cr Expense
('VENDOR_CREDIT_NOTE',       NULL,    NULL,       NULL,
 '22100', '22100001', '51001', '51001001',
 'Dr 22100001 Trade Payables / Cr 51001001 Property Maintenance (Credit Note)'),

-- P408 Vendor Retention Deducted from Invoice: Dr Expense / Cr Vendor Retention
('VENDOR_RETENTION',         NULL,    NULL,       NULL,
 '51001', '51001001', '22100', '22100002',
 'Dr 51001001 Property Maintenance / Cr 22100002 Vendor Retention Payable')

ON CONFLICT DO NOTHING;

COMMIT;
