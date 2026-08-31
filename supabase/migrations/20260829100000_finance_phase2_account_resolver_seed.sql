-- ============================================================================
-- PHASE 2 — Accounting Engine Enforcement — rule seed
-- Migration: 20260829100000
-- Purpose: Seed the rules the new resolver call sites need so the
--          enforcement migration (20260829110000) and the migrated
--          services (legalReceivableService, depositService, payroll,
--          procurement) can run without "No account rule matched".
--
--          Every rule is ON CONFLICT DO NOTHING — safe to re-apply.
--
-- New transaction types covered by this seed:
--   LEGAL_ESCALATION        — Dr 12411 / Cr 12413 [unit SL]
--   LEGAL_RECOVERY          — Dr 12000001 Bank / Cr 12411
--   PAYROLL_DISBURSEMENT    — Dr 50100 Salary Exp / Cr 12000001 Bank
--   PAYROLL_DEDUCTION       — Dr 50100 Salary Exp / Cr 21900 Payable
--   PROCUREMENT_GRN         — Dr 13400 CWIP | 13410 Goods in Transit
--                             Cr 21600 GR/IR Clearing
--   PROCUREMENT_AP          — Dr 21600 GR/IR / Cr 21000 AP
--                             (input tax 12500 is a separate VAT_INPUT_VENDOR rule)
--   PROCUREMENT_LANDED      — Dr 13400 CWIP | 13410 Goods in Transit
--                             Cr 21610 Freight Accrual | 21620 Customs Accrual
--   PROCUREMENT_CAPITALIZE  — Dr asset GL (config) / Cr 13400 CWIP
--   VAT_INPUT_VENDOR        — Dr 12500 Input VAT / Cr 22100001 Trade Payables
--   VAT_OUTPUT_INVOICE      — Dr 12413 [unit SL] / Cr 21600 Output VAT
--   DEPOSIT_DEDUCTION_SETTLE — Dr 21100 [fixed SL of deposit type] /
--                             Cr 12413 [unit SL]   (drain liability to AR)
--   UNCLAIMED_REFUND        — Dr 21100 [fixed SL] / Cr 12000 Bank
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. COA — make sure the COA rows referenced by the new rules exist.
--    (The Phase 1 + Phase 2 master seeds already created 11000/11100/12000/
--     12411/12413/21000/21100/21600/22100 and the SLs we need; this block
--     back-fills only the rows that are still missing in some environments.)
-- ============================================================================

INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level,
   group_name, class_name, parent_account_id)
SELECT '12411', 'Legal Receivable', 'ASSET', 'GL',
       'Assets', 'Current Assets', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.fin_coa_accounts WHERE account_code = '12411'
);

INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level,
   group_name, class_name, parent_account_id)
SELECT '21000', 'Trade Payables - Procurement', 'LIABILITY', 'GL',
       'Liabilities', 'Current Liabilities', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.fin_coa_accounts WHERE account_code = '21000'
);

INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level,
   group_name, class_name, parent_account_id)
SELECT '21000001', 'Trade Payables - Procurement', 'LIABILITY', 'SL',
       'Liabilities', 'Current Liabilities', id
FROM public.fin_coa_accounts
WHERE account_code = '21000'
  AND NOT EXISTS (
    SELECT 1 FROM public.fin_coa_accounts WHERE account_code = '21000001'
  );

-- 12411 fixed SL
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level,
   group_name, class_name, parent_account_id)
SELECT '12411001', 'Legal Receivable', 'ASSET', 'SL',
       'Assets', 'Current Assets', id
FROM public.fin_coa_accounts
WHERE account_code = '12411'
  AND NOT EXISTS (
    SELECT 1 FROM public.fin_coa_accounts WHERE account_code = '12411001'
  );

-- Procurement SLs
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level,
   group_name, class_name, parent_account_id)
SELECT '13400', 'Capital Work In Progress (CWIP)', 'ASSET', 'GL',
       'Assets', 'Non-Current Assets', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.fin_coa_accounts WHERE account_code = '13400'
);

INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level,
   group_name, class_name, parent_account_id)
SELECT '13400001', 'CWIP - Projects', 'ASSET', 'SL',
       'Assets', 'Non-Current Assets', id
FROM public.fin_coa_accounts
WHERE account_code = '13400'
  AND NOT EXISTS (
    SELECT 1 FROM public.fin_coa_accounts WHERE account_code = '13400001'
  );

INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level,
   group_name, class_name, parent_account_id)
SELECT '13410', 'Goods In Transit', 'ASSET', 'GL',
       'Assets', 'Current Assets', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.fin_coa_accounts WHERE account_code = '13410'
);

INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level,
   group_name, class_name, parent_account_id)
SELECT '13410001', 'Goods In Transit', 'ASSET', 'SL',
       'Assets', 'Current Assets', id
FROM public.fin_coa_accounts
WHERE account_code = '13410'
  AND NOT EXISTS (
    SELECT 1 FROM public.fin_coa_accounts WHERE account_code = '13410001'
  );

INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level,
   group_name, class_name, parent_account_id)
SELECT '12500', 'Input VAT', 'ASSET', 'GL',
       'Assets', 'Current Assets', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.fin_coa_accounts WHERE account_code = '12500'
);

INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level,
   group_name, class_name, parent_account_id)
SELECT '12500001', 'Input VAT', 'ASSET', 'SL',
       'Assets', 'Current Assets', id
FROM public.fin_coa_accounts
WHERE account_code = '12500'
  AND NOT EXISTS (
    SELECT 1 FROM public.fin_coa_accounts WHERE account_code = '12500001'
  );

INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level,
   group_name, class_name, parent_account_id)
SELECT '21600', 'Output VAT', 'LIABILITY', 'GL',
       'Liabilities', 'Current Liabilities', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.fin_coa_accounts WHERE account_code = '21600'
);

INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level,
   group_name, class_name, parent_account_id)
SELECT '21600001', 'Output VAT', 'LIABILITY', 'SL',
       'Liabilities', 'Current Liabilities', id
FROM public.fin_coa_accounts
WHERE account_code = '21600'
  AND NOT EXISTS (
    SELECT 1 FROM public.fin_coa_accounts WHERE account_code = '21600001'
  );

INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level,
   group_name, class_name, parent_account_id)
SELECT '21610', 'GR/IR Clearing', 'LIABILITY', 'GL',
       'Liabilities', 'Current Liabilities', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.fin_coa_accounts WHERE account_code = '21610'
);

INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level,
   group_name, class_name, parent_account_id)
SELECT '21610001', 'GR/IR Clearing', 'LIABILITY', 'SL',
       'Liabilities', 'Current Liabilities', id
FROM public.fin_coa_accounts
WHERE account_code = '21610'
  AND NOT EXISTS (
    SELECT 1 FROM public.fin_coa_accounts WHERE account_code = '21610001'
  );

INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level,
   group_name, class_name, parent_account_id)
SELECT '21620', 'Customs Duty Accrual', 'LIABILITY', 'GL',
       'Liabilities', 'Current Liabilities', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.fin_coa_accounts WHERE account_code = '21620'
);

INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level,
   group_name, class_name, parent_account_id)
SELECT '21620001', 'Customs Duty Accrual', 'LIABILITY', 'SL',
       'Liabilities', 'Current Liabilities', id
FROM public.fin_coa_accounts
WHERE account_code = '21620'
  AND NOT EXISTS (
    SELECT 1 FROM public.fin_coa_accounts WHERE account_code = '21620001'
  );

-- Payroll SLs
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level,
   group_name, class_name, parent_account_id)
SELECT '50100', 'Salary Expense', 'EXPENSE', 'GL',
       'Expenses', 'Operating Expenses', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.fin_coa_accounts WHERE account_code = '50100'
);

INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level,
   group_name, class_name, parent_account_id)
SELECT '50100001', 'Salary Expense', 'EXPENSE', 'SL',
       'Expenses', 'Operating Expenses', id
FROM public.fin_coa_accounts
WHERE account_code = '50100'
  AND NOT EXISTS (
    SELECT 1 FROM public.fin_coa_accounts WHERE account_code = '50100001'
  );

INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level,
   group_name, class_name, parent_account_id)
SELECT '21900', 'Payroll Liabilities', 'LIABILITY', 'GL',
       'Liabilities', 'Current Liabilities', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.fin_coa_accounts WHERE account_code = '21900'
);

INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level,
   group_name, class_name, parent_account_id)
SELECT '21900001', 'Payroll Liabilities', 'LIABILITY', 'SL',
       'Liabilities', 'Current Liabilities', id
FROM public.fin_coa_accounts
WHERE account_code = '21900'
  AND NOT EXISTS (
    SELECT 1 FROM public.fin_coa_accounts WHERE account_code = '21900001'
  );

-- ============================================================================
-- 2. TRANSACTION RULES — new types called by the migrated services
-- ============================================================================

INSERT INTO public.fin_transaction_account_rules
  (transaction_type, payment_method, deposit_type, pdc_type,
   debit_gl_code, debit_sl_code, credit_gl_code, credit_sl_code, description)
VALUES
-- ── Legal Receivables ──────────────────────────────────────────────────────
('LEGAL_ESCALATION',          NULL,    NULL,       NULL,
 '12411', '12411001', '12413', NULL,
 'Dr 12411001 Legal Receivable / Cr 12413 [unit SL] Tenant AR'),

('LEGAL_RECOVERY',            'BANK',  NULL,       NULL,
 '12000', '12000001', '12411', '12411001',
 'Dr 12000001 Bank / Cr 12411001 Legal Receivable'),

-- ── Payroll ────────────────────────────────────────────────────────────────
('PAYROLL_DISBURSEMENT',      'BANK',  NULL,       NULL,
 '50100', '50100001', '12000', '12000001',
 'Dr 50100001 Salary Expense / Cr 12000001 Bank'),

('PAYROLL_DEDUCTION',         'BANK',  NULL,       NULL,
 '50100', '50100001', '21900', '21900001',
 'Dr 50100001 Salary Expense / Cr 21900001 Payroll Liabilities (Net Pay after deductions)'),

-- ── Procurement ────────────────────────────────────────────────────────────
-- For PROCUREMENT_GRN the resolver only returns the GL pair; the engine
-- composes the per-line split (CAPEX -> 13400, Inventory -> 13410) by
-- reading the GRN lines.
('PROCUREMENT_GRN',           NULL,    NULL,       NULL,
 '13400', '13400001', '21610', '21610001',
 'Dr 13400 CWIP / Goods In Transit / Cr 21610 GR/IR Clearing'),

('PROCUREMENT_AP',            NULL,    NULL,       NULL,
 '21610', '21610001', '21000', '21000001',
 'Dr 21610 GR/IR Clearing / Cr 21000 Trade Payables - Procurement'),

('PROCUREMENT_LANDED',        NULL,    NULL,       NULL,
 '13400', '13400001', '21620', '21620001',
 'Dr 13400 CWIP / 13410 Goods In Transit / Cr 21620 Customs Duty Accrual / 21610 Freight Accrual'),

('PROCUREMENT_CAPITALIZE',    NULL,    NULL,       NULL,
 '11000', '11000001', '13400', '13400001',
 'Dr 11000 Fixed Asset (config) / Cr 13400 CWIP on capitalization'),

-- ── VAT (resolver-only; debit side is unit AR, credit side is output VAT) ─
('VAT_OUTPUT_INVOICE',        NULL,    NULL,       NULL,
 '12413', NULL,       '21600', '21600001',
 'Dr 12413 [unit SL] / Cr 21600001 Output VAT (informational)'),

('VAT_INPUT_VENDOR',          NULL,    NULL,       NULL,
 '12500', '12500001', '22100', '22100001',
 'Dr 12500001 Input VAT / Cr 22100001 Trade Payables - Vendors'),

-- ── Deposit deduction & unclaimed refund ───────────────────────────────────
('DEPOSIT_DEDUCTION_SETTLE',  'BANK',  'SECURITY', NULL,
 '21100', '21100006', '12413', NULL,
 'Dr 21100006 Refundable Security Deposit / Cr 12413 [unit SL] Tenant AR'),

('UNCLAIMED_REFUND',          'BANK',  NULL,       NULL,
 '21100', '21100002', '12000', '12000001',
 'Dr 21100002 Unclaimed Liability-Deposit / Cr 12000001 Bank (reclass to unclaimed + pay)')
ON CONFLICT (
  transaction_type,
  COALESCE(payment_method, '__NULL__'),
  COALESCE(deposit_type,   '__NULL__'),
  COALESCE(pdc_type,       '__NULL__')
)
DO NOTHING;

COMMIT;
