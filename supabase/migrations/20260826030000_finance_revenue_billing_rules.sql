-- ============================================================================
-- REVENUE, BILLING, LATE FEES & REVENUE RECOGNITION — Migration 20260826030000
-- Purpose:
--   1. Seed Subledger accounts under 41100, 41201, 41301 (Operating, Other & Parking Revenue)
--   2. Seed Subledger accounts for Late Payment Penalties, Discounts/Waivers, Move-in/Move-out adjustments
--   3. Seed Transaction Rules for P461–P520 (Multi-Component Invoices, Credit Notes, Discounts, Late Fees)
-- ============================================================================

BEGIN;

-- 1. Ensure Revenue SL Accounts exist in fin_coa_accounts
-- 41100002 – Parking Fee Revenue
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '41100002', 'Parking Fee Revenue', 'REVENUE', 'SL', 'Revenue', 'Operating Revenue', id
FROM public.fin_coa_accounts WHERE account_code = '41100'
ON CONFLICT (account_code) DO NOTHING;

-- 41100003 – Service Charge Revenue (Tenant)
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '41100003', 'Service Charge Revenue', 'REVENUE', 'SL', 'Revenue', 'Operating Revenue', id
FROM public.fin_coa_accounts WHERE account_code = '41100'
ON CONFLICT (account_code) DO NOTHING;

-- 41201005 – Late Payment Fee Revenue
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '41201005', 'Late Payment Penalty Revenue', 'REVENUE', 'SL', 'Revenue', 'Other Revenue', id
FROM public.fin_coa_accounts WHERE account_code = '41201'
ON CONFLICT (account_code) DO NOTHING;

-- 41201006 – Lease Transfer / Admin Fee Revenue
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '41201006', 'Lease Transfer Admin Fee Revenue', 'REVENUE', 'SL', 'Revenue', 'Other Revenue', id
FROM public.fin_coa_accounts WHERE account_code = '41201'
ON CONFLICT (account_code) DO NOTHING;

-- 51101001 – Rent Discount / Rent Waiver Expense
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '51101001', 'Rent Discounts & Approved Waivers', 'EXPENSE', 'SL', 'Expenses', 'Indirect Expenses', id
FROM public.fin_coa_accounts WHERE account_code = '51101'
ON CONFLICT (account_code) DO NOTHING;

-- 2. Seed Transaction Account Rules for Revenue & Billing (P461–P520)
INSERT INTO public.fin_transaction_account_rules
  (transaction_type, payment_method, deposit_type, pdc_type,
   debit_gl_code, debit_sl_code, credit_gl_code, credit_sl_code, description)
VALUES

-- P461 Parking Charge: Dr 12413 [unit SL] / Cr 41100002 Parking Fee Revenue
('PARKING_CHARGE',            NULL,    NULL,       NULL,
 '12413', NULL,       '41100', '41100002',
 'Dr Tenant Receivable [unit SL] / Cr 41100002 Parking Fee Revenue'),

-- P462 Service Charge: Dr 12413 [unit SL] / Cr 41100003 Service Charge Revenue
('SERVICE_CHARGE',            NULL,    NULL,       NULL,
 '12413', NULL,       '41100', '41100003',
 'Dr Tenant Receivable [unit SL] / Cr 41100003 Service Charge Revenue'),

-- P463 Late Payment Penalty: Dr 12413 [unit SL] / Cr 41201005 Late Payment Penalty Revenue
('LATE_FEE_CHARGE',           NULL,    NULL,       NULL,
 '12413', NULL,       '41201', '41201005',
 'Dr Tenant Receivable [unit SL] / Cr 41201005 Late Payment Penalty Revenue'),

-- P464 Lease Transfer Admin Fee: Dr 12413 [unit SL] / Cr 41201006 Lease Transfer Admin Fee
('LEASE_TRANSFER_FEE',        NULL,    NULL,       NULL,
 '12413', NULL,       '41201', '41201006',
 'Dr Tenant Receivable [unit SL] / Cr 41201006 Lease Transfer Admin Fee Revenue'),

-- P465 Rent Discount / Approved Waiver: Dr 51101001 Discount Expense / Cr 12413 [unit SL]
('RENT_DISCOUNT_WAIVER',      NULL,    NULL,       NULL,
 '51101', '51101001', '12413', NULL,
 'Dr 51101001 Rent Discounts & Approved Waivers / Cr Tenant Receivable [unit SL]'),

-- P466 Tenant Credit Note (Revenue Adjustment): Dr 41100001 Rental Revenue / Cr 12413 [unit SL]
('TENANT_CREDIT_NOTE',        NULL,    NULL,       NULL,
 '41100', '41100001', '12413', NULL,
 'Dr 41100001 Rental Revenue / Cr Tenant Receivable [unit SL] (Credit Note)')

ON CONFLICT DO NOTHING;

COMMIT;
