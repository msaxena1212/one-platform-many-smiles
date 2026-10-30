-- ============================================================================
-- OWNER ACCOUNTING, MANAGEMENT FEES & INTER-PROPERTY TRANSFERS — Migration 20260826040000
-- Purpose:
--   1. Seed Subledger accounts under 22001 (Owner Current / Payable), 12414 (Owner Receivable), 41101 (PM Fees)
--   2. Seed Subledger accounts for Inter-property clearing and owner remittances
--   3. Seed Transaction Rules for P521–P580 (Owner Remittance, PM Fee Recognition, Owner Expense Funding)
-- ============================================================================

BEGIN;

-- 1. Ensure Owner and Inter-Property SL Accounts exist in fin_coa_accounts
-- 22001001 – Owner Payable / Current Account
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '22001001', 'Owner Payable / Current Account', 'LIABILITY', 'SL', 'Liabilities', 'Non-Current Liabilities', id
FROM public.fin_coa_accounts WHERE account_code = '22001'
ON CONFLICT (account_code) DO NOTHING;

-- 12414001 – Owner Receivable / Working Capital Advance
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '12414001', 'Owner Receivable / Advance', 'ASSET', 'SL', 'Assets', 'Current Assets', id
FROM public.fin_coa_accounts WHERE account_code = '12414'
ON CONFLICT (account_code) DO NOTHING;

-- 22002001 – Inter-Property Clearing Account
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '22002001', 'Inter-Property Clearing', 'LIABILITY', 'SL', 'Liabilities', 'Non-Current Liabilities', id
FROM public.fin_coa_accounts WHERE account_code = '22002'
ON CONFLICT (account_code) DO NOTHING;

-- 2. Seed Transaction Account Rules for Owner & Management Fee Accounting (P521–P580)
INSERT INTO public.fin_transaction_account_rules
  (transaction_type, payment_method, deposit_type, pdc_type,
   debit_gl_code, debit_sl_code, credit_gl_code, credit_sl_code, description)
VALUES

-- P521 Property Management Fee Recognized: Dr 22001001 Owner Payable / Cr 41101001 PM Fee Revenue
('PM_FEE_RECOGNITION',       NULL,    NULL,       NULL,
 '22001', '22001001', '41101', '41101001',
 'Dr 22001001 Owner Payable / Cr 41101001 Property Management Fee Revenue'),

-- P522 Owner Remittance / Distribution: Dr 22001001 Owner Payable / Cr 12000001 Bank
('OWNER_REMITTANCE',         'BANK',  NULL,       NULL,
 '22001', '22001001', '12000', '12000001',
 'Dr 22001001 Owner Payable / Cr 12000001 Bank (Net Rental Remittance)'),

-- P523 Owner Funds Property Expense: Dr 51001001 Expense / Cr 22001001 Owner Payable
('OWNER_FUNDS_EXPENSE',      NULL,    NULL,       NULL,
 '51001', '51001001', '22001', '22001001',
 'Dr 51001001 Property Maintenance / Cr 22001001 Owner Payable'),

-- P524 Owner Advance Repayment: Dr 12000001 Bank / Cr 12414001 Owner Receivable
('OWNER_ADVANCE_REPAYMENT',  'BANK',  NULL,       NULL,
 '12000', '12000001', '12414', '12414001',
 'Dr 12000001 Bank / Cr 12414001 Owner Receivable (Repayment)'),

-- P525 Inter-Property Clearing Transfer: Dr 22002001 / Cr 12000001
('INTER_PROPERTY_TRANSFER',  'BANK',  NULL,       NULL,
 '22002', '22002001', '12000', '12000001',
 'Dr 22002001 Inter-Property Clearing / Cr 12000001 Bank')

ON CONFLICT DO NOTHING;

COMMIT;
