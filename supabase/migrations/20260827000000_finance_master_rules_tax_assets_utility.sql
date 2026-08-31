-- ============================================================================
-- MASTER FINANCE ENGINE EXPANSION — Migration 20260827000000
-- Purpose: Finish the canonical 26-transaction matrix coverage required by
--          the PMS Finance Logic Master (Parts 13–19):
--    1. Seed missing COA accounts for:
--       - VAT / Tax (12600 / 12600001 Input VAT, 21600 / 21600001 Output VAT)
--       - Fixed Assets (11000 / 11000001 PP&E, 11100 / 11100001 CWIP)
--       - Accumulated Depreciation (12700 / 12700001)
--       - Depreciation Expense (52100 / 52100001)
--       - Gain / Loss on Disposal (42200 / 42200001, 52200 / 52200001)
--       - Bank Dishonour Charges (51105 / 51105001)
--       - Dishonour Fee Recovery Income (41201007)
--       - Utility Recoveries (51300 Qatar Cool, 51301 Kahramaa, 41201003 already seeded)
--       - Trade Payables (22100 / 22100001) for AP asset purchase
--       - Qatar Cool / Kahramaa / Service Fee deposit SLs (21100003, 21100004, 21100005)
--    2. Seed transaction account rules for:
--       - ASSET_PURCHASE        (Dr 11000 PP&E / Cr 22100 Trade Payables)
--       - CWIP_PROJECT_INVOICE  (Dr 11100 CWIP / Cr 22100 Trade Payables)
--       - CWIP_CAPITALIZATION   (Dr 11000 PP&E / Cr 11100 CWIP)
--       - ASSET_DEPRECIATION    (Dr 52100 Depreciation / Cr 12700 Accum. Dep.)
--       - ASSET_DISPOSAL        (Dr 12000 Bank / Dr 12700 Accum. Dep. / Cr 11000 PP&E,
--                                plus P&L line 42200 Gain / 52200 Loss)
--       - DISHONOUR_CHARGE_COMPANY  (Dr 51105 / Cr 12000)
--       - DISHONOUR_CHARGE_TENANT   (Dr 12413 [unit SL] / Cr 41201007)
--       - CASH_BANK_DEPOSIT     (Dr 12000 Bank / Cr 12100 Cash)
--       - CHEQUE_RETURN_BANK_REVERSAL (Dr 12900 PDC In Hand / Cr 12000 Bank
--                                       + Dr 12413 / Cr 21400)
--       - UTILITY_ACCRUAL       (Dr 51300 Qatar Cool / Cr 21202 Qatar Cool Accrual)
--       - UTILITY_ACCRUAL_REVERSE (reverse of UTILITY_ACCRUAL)
--       - VAT_OUTPUT_INVOICE    (Dr 12413 [unit SL] / Cr 21600001 + 41100 Rev)
--       - VAT_INPUT_VENDOR      (Dr 12600001 / Cr 22100 Trade Payables)
--       - DEPOSIT_TO_REFUNDABLE variants for QATAR_COOL, KAHRAMAA, SERVICE_FEE
--       - DEPOSIT_DEDUCTION_SETTLE variants for QATAR_COOL, KAHRAMAA, SERVICE_FEE
--       - DEPOSIT_REFUND variants for QATAR_COOL, KAHRAMAA, SERVICE_FEE
--    3. All inserts are ON CONFLICT DO NOTHING so the migration is idempotent.
-- ============================================================================

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. COA expansion
-- ─────────────────────────────────────────────────────────────────────────────

-- 21600 / 21600001 — Output VAT Payable
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name)
VALUES ('21600', 'Tax Payable Control', 'LIABILITY', 'GL', 'Liabilities', 'Current Liabilities')
ON CONFLICT (account_code) DO NOTHING;

INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '21600001', 'Output VAT Payable', 'LIABILITY', 'SL', 'Liabilities', 'Current Liabilities', id
FROM public.fin_coa_accounts WHERE account_code = '21600'
ON CONFLICT (account_code) DO NOTHING;

-- 12600 / 12600001 — Input VAT Recoverable
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name)
VALUES ('12600', 'Tax Recoverable Control', 'ASSET', 'GL', 'Assets', 'Current Assets')
ON CONFLICT (account_code) DO NOTHING;

INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '12600001', 'Input VAT Recoverable', 'ASSET', 'SL', 'Assets', 'Current Assets', id
FROM public.fin_coa_accounts WHERE account_code = '12600'
ON CONFLICT (account_code) DO NOTHING;

-- 11000 / 11000001 — Fixed Assets (PP&E)
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name)
VALUES ('11000', 'Fixed Assets Control', 'ASSET', 'GL', 'Assets', 'Non-Current Assets')
ON CONFLICT (account_code) DO NOTHING;

INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '11000001', 'Property, Plant & Equipment', 'ASSET', 'SL', 'Assets', 'Non-Current Assets', id
FROM public.fin_coa_accounts WHERE account_code = '11000'
ON CONFLICT (account_code) DO NOTHING;

-- 11100 / 11100001 — Capital Work in Progress
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name)
VALUES ('11100', 'Capital Work in Progress Control', 'ASSET', 'GL', 'Assets', 'Non-Current Assets')
ON CONFLICT (account_code) DO NOTHING;

INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '11100001', 'CWIP - Property Projects', 'ASSET', 'SL', 'Assets', 'Non-Current Assets', id
FROM public.fin_coa_accounts WHERE account_code = '11100'
ON CONFLICT (account_code) DO NOTHING;

-- 12700 / 12700001 — Accumulated Depreciation (Contra-Asset)
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name)
VALUES ('12700', 'Accumulated Depreciation Control', 'ASSET', 'GL', 'Assets', 'Non-Current Assets')
ON CONFLICT (account_code) DO NOTHING;

INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '12700001', 'Accumulated Depreciation - Fixed Assets', 'ASSET', 'SL', 'Assets', 'Non-Current Assets', id
FROM public.fin_coa_accounts WHERE account_code = '12700'
ON CONFLICT (account_code) DO NOTHING;

-- 52100 / 52100001 — Depreciation Expense
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name)
VALUES ('52100', 'Depreciation Expense Control', 'EXPENSE', 'GL', 'Expenses', 'Indirect Expenses')
ON CONFLICT (account_code) DO NOTHING;

INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '52100001', 'Depreciation Expense', 'EXPENSE', 'SL', 'Expenses', 'Indirect Expenses', id
FROM public.fin_coa_accounts WHERE account_code = '52100'
ON CONFLICT (account_code) DO NOTHING;

-- 42200 / 42200001 — Gain on Disposal
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name)
VALUES ('42200', 'Gain on Disposal Control', 'REVENUE', 'GL', 'Revenue', 'Other Revenue')
ON CONFLICT (account_code) DO NOTHING;

INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '42200001', 'Gain on Fixed Asset Disposal', 'REVENUE', 'SL', 'Revenue', 'Other Revenue', id
FROM public.fin_coa_accounts WHERE account_code = '42200'
ON CONFLICT (account_code) DO NOTHING;

-- 52200 / 52200001 — Loss on Disposal
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name)
VALUES ('52200', 'Loss on Disposal Control', 'EXPENSE', 'GL', 'Expenses', 'Indirect Expenses')
ON CONFLICT (account_code) DO NOTHING;

INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '52200001', 'Loss on Fixed Asset Disposal', 'EXPENSE', 'SL', 'Expenses', 'Indirect Expenses', id
FROM public.fin_coa_accounts WHERE account_code = '52200'
ON CONFLICT (account_code) DO NOTHING;

-- 51105 / 51105001 — Bank Dishonour Charges Expense
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name)
VALUES ('51105', 'Bank Charges Control', 'EXPENSE', 'GL', 'Expenses', 'Indirect Expenses')
ON CONFLICT (account_code) DO NOTHING;

INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '51105001', 'Bank Dishonour & Cheque Return Charges', 'EXPENSE', 'SL', 'Expenses', 'Indirect Expenses', id
FROM public.fin_coa_accounts WHERE account_code = '51105'
ON CONFLICT (account_code) DO NOTHING;

-- 41201007 — Cheque Bounce / Dishonour Fee Recovery Income
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name)
VALUES ('41201007', 'Bank Dishonour Fee Recovery', 'REVENUE', 'SL', 'Revenue', 'Other Revenue')
ON CONFLICT (account_code) DO NOTHING;

-- 22100 / 22100001 — Trade Payables (for asset purchase and CWIP invoice)
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name)
VALUES ('22100', 'Trade Payables Control', 'LIABILITY', 'GL', 'Liabilities', 'Current Liabilities')
ON CONFLICT (account_code) DO NOTHING;

INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '22100001', 'Trade Payables', 'LIABILITY', 'SL', 'Liabilities', 'Current Liabilities', id
FROM public.fin_coa_accounts WHERE account_code = '22100'
ON CONFLICT (account_code) DO NOTHING;

-- 51300 / 51300001 — Qatar Cool Expense
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name)
VALUES ('51300', 'Qatar Cool Expense Control', 'EXPENSE', 'GL', 'Expenses', 'Indirect Expenses')
ON CONFLICT (account_code) DO NOTHING;

INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '51300001', 'Qatar Cool Expense', 'EXPENSE', 'SL', 'Expenses', 'Indirect Expenses', id
FROM public.fin_coa_accounts WHERE account_code = '51300'
ON CONFLICT (account_code) DO NOTHING;

-- 51301 / 51301001 — Kahramaa Expense
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name)
VALUES ('51301', 'Kahramaa Expense Control', 'EXPENSE', 'GL', 'Expenses', 'Indirect Expenses')
ON CONFLICT (account_code) DO NOTHING;

INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '51301001', 'Kahramaa Expense', 'EXPENSE', 'SL', 'Expenses', 'Indirect Expenses', id
FROM public.fin_coa_accounts WHERE account_code = '51301'
ON CONFLICT (account_code) DO NOTHING;

-- 21202 / 21202001 — Qatar Cool Accrual (utility payable to provider)
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name)
VALUES ('21202', 'Utility Accruals Control', 'LIABILITY', 'GL', 'Liabilities', 'Current Liabilities')
ON CONFLICT (account_code) DO NOTHING;

INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '21202001', 'Qatar Cool Accrual', 'LIABILITY', 'SL', 'Liabilities', 'Current Liabilities', id
FROM public.fin_coa_accounts WHERE account_code = '21202'
ON CONFLICT (account_code) DO NOTHING;

INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '21202002', 'Kahramaa Accrual', 'LIABILITY', 'SL', 'Liabilities', 'Current Liabilities', id
FROM public.fin_coa_accounts WHERE account_code = '21202'
ON CONFLICT (account_code) DO NOTHING;

-- Multi-category tenant deposit SLs under GL 21100 (parented to 21100)
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '21100003', 'Qatar Cool Deposit - Tenant', 'LIABILITY', 'SL', 'Liabilities', 'Current Liabilities', id
FROM public.fin_coa_accounts WHERE account_code = '21100'
ON CONFLICT (account_code) DO NOTHING;

INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '21100004', 'Kahramaa Deposit - Tenant', 'LIABILITY', 'SL', 'Liabilities', 'Current Liabilities', id
FROM public.fin_coa_accounts WHERE account_code = '21100'
ON CONFLICT (account_code) DO NOTHING;

INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '21100005', 'Service Fee - Tenant', 'LIABILITY', 'SL', 'Liabilities', 'Current Liabilities', id
FROM public.fin_coa_accounts WHERE account_code = '21100'
ON CONFLICT (account_code) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Transaction Account Rules — Canonical 26-Transaction Matrix additions
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO public.fin_transaction_account_rules
  (transaction_type, payment_method, deposit_type, pdc_type,
   debit_gl_code, debit_sl_code, credit_gl_code, credit_sl_code, description)
VALUES

-- ── Fixed Assets & CWIP ────────────────────────────────────────────────────
('ASSET_PURCHASE',           NULL,    NULL,       NULL,
 '11000', '11000001', '22100', '22100001',
 'Dr 11000001 Fixed Assets / Cr 22100001 Trade Payables'),

('CWIP_PROJECT_INVOICE',     NULL,    NULL,       NULL,
 '11100', '11100001', '22100', '22100001',
 'Dr 11100001 CWIP - Projects / Cr 22100001 Trade Payables'),

('CWIP_CAPITALIZATION',      NULL,    NULL,       NULL,
 '11000', '11000001', '11100', '11100001',
 'Dr 11000001 Fixed Assets / Cr 11100001 CWIP (Capitalization)'),

('ASSET_DEPRECIATION',       NULL,    NULL,       NULL,
 '52100', '52100001', '12700', '12700001',
 'Dr 52100001 Depreciation Expense / Cr 12700001 Accumulated Depreciation'),

-- ASSET_DISPOSAL: this rule seeds the GL header; the engine composes a 3-line voucher
-- (Dr Bank / Dr Accum Dep / Cr PPE) plus the P&L leg resolved at runtime from gain/loss.
-- We register two parallel rules (gain vs loss) keyed on a discriminator the engine sets.
('ASSET_DISPOSAL',           'BANK',  NULL,       NULL,
 '12000', '12000001', '11000', '11000001',
 'Dr 12000001 Bank + Dr 12700001 Accum Dep / Cr 11000001 PPE (Disposal)'),

('ASSET_DISPOSAL_GAIN',      NULL,    NULL,       NULL,
 '12000', '12000001', '42200', '42200001',
 'Dr 12000001 Bank / Cr 42200001 Gain on Disposal (Proceeds > NBV)'),

('ASSET_DISPOSAL_LOSS',      NULL,    NULL,       NULL,
 '52200', '52200001', '12000', '12000001',
 'Dr 52200001 Loss on Disposal / Cr 12000001 Bank (NBV > Proceeds)'),

-- ── Dishonour charges ──────────────────────────────────────────────────────
('DISHONOUR_CHARGE_COMPANY', 'BANK',  NULL,       NULL,
 '51105', '51105001', '12000', '12000001',
 'Dr 51105001 Bank Dishonour Expense / Cr 12000001 Bank (Company Borne)'),

('DISHONOUR_CHARGE_TENANT',  NULL,    NULL,       NULL,
 '12413', NULL,       '41201', '41201007',
 'Dr Tenant Receivable [unit SL] / Cr 41201007 Dishonour Fee Recovery Income'),

-- ── Cash / Bank transfers ─────────────────────────────────────────────────
('CASH_BANK_DEPOSIT',        NULL,    NULL,       NULL,
 '12000', '12000001', '12100', '12100001',
 'Dr 12000001 Bank / Cr 12100001 Cash in Hand (Cash Till Deposit)'),

-- ── PDC post-clearance dishonour (Bank clawback) ───────────────────────────
('CHEQUE_RETURN_BANK_REVERSAL', NULL, NULL,     'RENT_PDC',
 '12900', '12900001', '12000', '12000001',
 'Dr 12900001 PDC In Hand / Cr 12000001 Bank (Reversal Entry 1 — Instrument)'),

('CHEQUE_RETURN_BANK_REVERSAL', NULL, NULL,     'DEPOSIT_PDC',
 '12900', '12900002', '12000', '12000001',
 'Dr 12900002 Deposit-PDC In Hand / Cr 12000001 Bank (Reversal Entry 1 — Deposit Instrument)'),

-- Companion rule for the AR leg of the bounce (Dr AR / Cr 21400)
('CHEQUE_RETURN_AR_RECLASS', NULL,    NULL,       NULL,
 '12413', NULL,       '21400', NULL,
 'Dr Tenant Receivable [unit SL] / Cr PDC Received [unit SL] (Reversal Entry 2 — AR Leg)'),

-- ── VAT ────────────────────────────────────────────────────────────────────
('VAT_OUTPUT_INVOICE',       NULL,    NULL,       NULL,
 '12413', NULL,       '21600', '21600001',
 'Dr Tenant Receivable [unit SL] / Cr 21600001 Output VAT Payable (Tax Component)'),

('VAT_INPUT_VENDOR',         NULL,    NULL,       NULL,
 '12600', '12600001', '22100', '22100001',
 'Dr 12600001 Input VAT Recoverable / Cr 22100001 Trade Payables (Vendor Invoice Tax)'),

-- ── Utility accruals & true-ups ────────────────────────────────────────────
-- Company pays Qatar Cool / Kahramaa, then re-bills tenants via 41201003.
-- Accrual leg: Dr utility expense / Cr utility accrual (provider liability).
('UTILITY_ACCRUAL',          NULL,    'QATAR_COOL', NULL,
 '51300', '51300001', '21202', '21202001',
 'Dr 51300001 Qatar Cool Expense / Cr 21202001 Qatar Cool Accrual (Accrual)'),

('UTILITY_ACCRUAL',          NULL,    'KAHRAMAA',   NULL,
 '51301', '51301001', '21202', '21202002',
 'Dr 51301001 Kahramaa Expense / Cr 21202002 Kahramaa Accrual (Accrual)'),

-- Accrual reversal (when provider invoice differs from accrual)
('UTILITY_ACCRUAL_REVERSE',  NULL,    'QATAR_COOL', NULL,
 '21202', '21202001', '51300', '51300001',
 'Dr 21202001 Qatar Cool Accrual / Cr 51300001 Qatar Cool Expense (Reverse)'),

('UTILITY_ACCRUAL_REVERSE',  NULL,    'KAHRAMAA',   NULL,
 '21202', '21202002', '51301', '51301001',
 'Dr 21202002 Kahramaa Accrual / Cr 51301001 Kahramaa Expense (Reverse)'),

-- Tenant re-bill: Dr 12413 [unit SL] / Cr 41201003 Utility Recovery Income
('UTILITY_RECOVERY_TENANT',  NULL,    NULL,       NULL,
 '12413', NULL,       '41201', '41201003',
 'Dr Tenant Receivable [unit SL] / Cr 41201003 Utility Recovery Income'),

-- ── Multi-category deposit deductions / refunds / moves-to-refundable ─────
-- Source-account driven: rules are depositType-specific so each maps to the
-- correct GL 21100 SL (21100003 Qatar Cool, 21100004 Kahramaa, 21100005 Service Fee).

('DEPOSIT_TO_REFUNDABLE',    NULL,    'QATAR_COOL', NULL,
 '21100', '21100003', '21100', '21100006',
 'Dr 21100003 Qatar Cool Deposit / Cr 21100006 Refundable Deposit'),

('DEPOSIT_TO_REFUNDABLE',    NULL,    'KAHRAMAA',   NULL,
 '21100', '21100004', '21100', '21100006',
 'Dr 21100004 Kahramaa Deposit / Cr 21100006 Refundable Deposit'),

('DEPOSIT_TO_REFUNDABLE',    NULL,    'SERVICE_FEE',NULL,
 '21100', '21100005', '21100', '21100006',
 'Dr 21100005 Service Fee Deposit / Cr 21100006 Refundable Deposit'),

('DEPOSIT_DEDUCTION_SETTLE', NULL,    'QATAR_COOL', NULL,
 '21100', '21100003', '12413', NULL,
 'Dr 21100003 Qatar Cool Deposit / Cr Tenant Receivable [unit SL] (Deduction)'),

('DEPOSIT_DEDUCTION_SETTLE', NULL,    'KAHRAMAA',   NULL,
 '21100', '21100004', '12413', NULL,
 'Dr 21100004 Kahramaa Deposit / Cr Tenant Receivable [unit SL] (Deduction)'),

('DEPOSIT_DEDUCTION_SETTLE', NULL,    'SERVICE_FEE',NULL,
 '21100', '21100005', '12413', NULL,
 'Dr 21100005 Service Fee Deposit / Cr Tenant Receivable [unit SL] (Deduction)'),

-- Refund the multi-category buckets back to the tenant on settlement
('DEPOSIT_REFUND',           'BANK',  'QATAR_COOL', NULL,
 '21100', '21100003', '12000', '12000001',
 'Dr 21100003 Qatar Cool Deposit / Cr 12000001 Bank (Refund)'),

('DEPOSIT_REFUND',           'BANK',  'KAHRAMAA',   NULL,
 '21100', '21100004', '12000', '12000001',
 'Dr 21100004 Kahramaa Deposit / Cr 12000001 Bank (Refund)'),

('DEPOSIT_REFUND',           'BANK',  'SERVICE_FEE',NULL,
 '21100', '21100005', '12000', '12000001',
 'Dr 21100005 Service Fee Deposit / Cr 12000001 Bank (Refund)')

ON CONFLICT DO NOTHING;

COMMIT;