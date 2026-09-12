-- ============================================================================
-- FINANCE COA HIERARCHY — Migration 20260826000000
-- Purpose:
--   1. Add group_name / class_name / account_level to fin_coa_accounts
--   2. Back-fill existing GL rows with Group + Class from COA spec
--   3. Insert fixed SL accounts (12000001, 12900001/2, 21100001-6, etc.)
--   4. Create fin_unit_sl_accounts — dynamic per-unit SL mapping
--   5. Create fin_resolve_unit_sl() — auto-create unit SLs on demand
--   6. Create fin_transaction_account_rules — transaction→account mapping
--   7. Seed all P0 transaction rules
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. EXTEND fin_coa_accounts
-- ============================================================================

ALTER TABLE public.fin_coa_accounts
  ADD COLUMN IF NOT EXISTS group_name    TEXT,
  ADD COLUMN IF NOT EXISTS class_name    TEXT,
  ADD COLUMN IF NOT EXISTS account_level TEXT NOT NULL DEFAULT 'GL'
    CONSTRAINT fin_coa_accounts_level_chk
      CHECK (account_level IN ('GROUP','CLASS','GL','SL'));

CREATE INDEX IF NOT EXISTS idx_fin_coa_level
  ON public.fin_coa_accounts(account_level);

-- ============================================================================
-- 2. BACK-FILL GROUP / CLASS ON EXISTING GL ROWS
-- ============================================================================

-- Assets – Non-Current Assets
UPDATE public.fin_coa_accounts
  SET group_name = 'Assets', class_name = 'Non-Current Assets'
  WHERE account_code IN ('11000');

-- Assets – Current Assets
UPDATE public.fin_coa_accounts
  SET group_name = 'Assets', class_name = 'Current Assets'
  WHERE account_code IN (
    '12000','12100','12410','12411','12412','12413',
    '12500','12600','12700','12800','12900','13000'
  );

-- Liabilities – Current Liabilities
UPDATE public.fin_coa_accounts
  SET group_name = 'Liabilities', class_name = 'Current Liabilities'
  WHERE account_code IN ('21000','21100','21200','21400','21500','21600');

-- Liabilities – Non-Current Liabilities
UPDATE public.fin_coa_accounts
  SET group_name = 'Liabilities', class_name = 'Non-Current Liabilities'
  WHERE account_code IN (
    '22001','22002','22003','22004','22005','22100','22101',
    '221100','221200','221300','221400','221500','222400','222600'
  );

-- Equity
UPDATE public.fin_coa_accounts
  SET group_name = 'Equity', class_name = 'Equity'
  WHERE account_code IN ('31000','31100','31500','32000');

-- Revenue – Operating Revenue
UPDATE public.fin_coa_accounts
  SET group_name = 'Revenue', class_name = 'Operating Revenue'
  WHERE account_code IN ('41100','41101');

-- Revenue – Other Revenue
UPDATE public.fin_coa_accounts
  SET group_name = 'Revenue', class_name = 'Other Revenue'
  WHERE account_code IN ('41201','41301');

-- Expenses – Direct
UPDATE public.fin_coa_accounts
  SET group_name = 'Expenses', class_name = 'Direct Expenses'
  WHERE account_code IN ('51001','51002','51003','51004');

-- Expenses – Indirect
UPDATE public.fin_coa_accounts
  SET group_name = 'Expenses', class_name = 'Indirect Expenses'
  WHERE account_code IN ('51101','51102','51103','51104','51105','51106');

-- ============================================================================
-- 3. INSERT FIXED SL ACCOUNTS
-- ============================================================================

-- 12000001 – Bank
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '12000001','Bank','ASSET','SL','Assets','Current Assets', id
FROM public.fin_coa_accounts WHERE account_code = '12000'
ON CONFLICT (account_code) DO NOTHING;

-- 12900001 – PDC In Hand (Rent PDC)
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '12900001','PDC In Hand','ASSET','SL','Assets','Current Assets', id
FROM public.fin_coa_accounts WHERE account_code = '12900'
ON CONFLICT (account_code) DO NOTHING;

-- 12900002 – Deposit-PDC In Hand (Security/Guarantee PDC)
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '12900002','Deposit-PDC In Hand','ASSET','SL','Assets','Current Assets', id
FROM public.fin_coa_accounts WHERE account_code = '12900'
ON CONFLICT (account_code) DO NOTHING;

-- 21200001 – Guarantee Cheque Received
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '21200001','Guarantee Cheque Received','LIABILITY','SL','Liabilities','Current Liabilities', id
FROM public.fin_coa_accounts WHERE account_code = '21200'
ON CONFLICT (account_code) DO NOTHING;

-- 41100001 – Rental Revenue
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '41100001','Rental Revenue','REVENUE','SL','Revenue','Operating Revenue', id
FROM public.fin_coa_accounts WHERE account_code = '41100'
ON CONFLICT (account_code) DO NOTHING;

-- 41101001 – Property Management Fee
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '41101001','Property Management Fee','REVENUE','SL','Revenue','Operating Revenue', id
FROM public.fin_coa_accounts WHERE account_code = '41101'
ON CONFLICT (account_code) DO NOTHING;

-- 21100001 – Reservation Advance
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '21100001','Reservation Advance','LIABILITY','SL','Liabilities','Current Liabilities', id
FROM public.fin_coa_accounts WHERE account_code = '21100'
ON CONFLICT (account_code) DO NOTHING;

-- 21100002 – Unclaimed Liability-Deposit
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '21100002','Unclaimed Liability-Deposit','LIABILITY','SL','Liabilities','Current Liabilities', id
FROM public.fin_coa_accounts WHERE account_code = '21100'
ON CONFLICT (account_code) DO NOTHING;

-- 21100003 – Qatar Cool Deposit - Tenant
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '21100003','Qatar Cool Deposit - Tenant','LIABILITY','SL','Liabilities','Current Liabilities', id
FROM public.fin_coa_accounts WHERE account_code = '21100'
ON CONFLICT (account_code) DO NOTHING;

-- 21100004 – Kahramaa Deposit - Tenant
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '21100004','Kahramaa Deposit - Tenant','LIABILITY','SL','Liabilities','Current Liabilities', id
FROM public.fin_coa_accounts WHERE account_code = '21100'
ON CONFLICT (account_code) DO NOTHING;

-- 21100005 – Service Fee - Tenant
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '21100005','Service Fee - Tenant','LIABILITY','SL','Liabilities','Current Liabilities', id
FROM public.fin_coa_accounts WHERE account_code = '21100'
ON CONFLICT (account_code) DO NOTHING;

-- 21100006 – Refundable Security Deposit - Tenant
INSERT INTO public.fin_coa_accounts
  (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
SELECT '21100006','Refundable Security Deposit - Tenant','LIABILITY','SL','Liabilities','Current Liabilities', id
FROM public.fin_coa_accounts WHERE account_code = '21100'
ON CONFLICT (account_code) DO NOTHING;

-- ============================================================================
-- 4. UNIT-SPECIFIC SL MAPPING TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.fin_unit_sl_accounts (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id         UUID        NOT NULL,
  property_id     UUID        NOT NULL,
  gl_code         TEXT        NOT NULL,
  sl_code         TEXT        NOT NULL,
  sl_name         TEXT        NOT NULL,
  coa_account_id  UUID        REFERENCES public.fin_coa_accounts(id) ON DELETE SET NULL,
  is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Each unit can have exactly one SL per GL code
  CONSTRAINT fin_unit_sl_unit_gl_uq  UNIQUE (unit_id, gl_code),
  -- SL codes must be globally unique (no two units share an SL)
  CONSTRAINT fin_unit_sl_code_uq     UNIQUE (sl_code)
);

CREATE INDEX IF NOT EXISTS idx_fin_unit_sl_unit     ON public.fin_unit_sl_accounts(unit_id);
CREATE INDEX IF NOT EXISTS idx_fin_unit_sl_property ON public.fin_unit_sl_accounts(property_id);
CREATE INDEX IF NOT EXISTS idx_fin_unit_sl_gl       ON public.fin_unit_sl_accounts(gl_code);

-- ============================================================================
-- 5. SEQUENCE FOR UNIT SL SUFFIX
-- ============================================================================

CREATE SEQUENCE IF NOT EXISTS public.fin_unit_sl_seq
  START 1 INCREMENT 1 NO CYCLE;

-- ============================================================================
-- 6. FUNCTION: fin_resolve_unit_sl
--
-- Resolves or auto-creates a unit-specific SL account.
-- Called by the TypeScript account resolver for GL codes that require
-- per-unit sub-ledgers: 12100, 12413, 21400, 21500.
--
-- Resolution order:
--   1. Return existing mapping if found.
--   2. Generate next sequence suffix → sl_code = gl_code + zero-padded seq.
--   3. Insert COA account row for the new SL.
--   4. Insert mapping row in fin_unit_sl_accounts.
--   5. Return final row (handles concurrent inserts gracefully).
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fin_resolve_unit_sl(
  p_unit_id     UUID,
  p_property_id UUID,
  p_gl_code     TEXT,
  p_unit_name   TEXT DEFAULT NULL
)
RETURNS TABLE (
  sl_code         TEXT,
  sl_name         TEXT,
  coa_account_id  UUID
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_sl_code   TEXT;
  v_sl_name   TEXT;
  v_seq       BIGINT;
  v_coa_id    UUID;
BEGIN
  -- 1. Return existing mapping
  SELECT usl.sl_code, usl.sl_name, usl.coa_account_id
  INTO   v_sl_code, v_sl_name, v_coa_id
  FROM   public.fin_unit_sl_accounts usl
  WHERE  usl.unit_id  = p_unit_id
    AND  usl.gl_code  = p_gl_code
    AND  usl.is_active = TRUE;

  IF FOUND THEN
    RETURN QUERY SELECT v_sl_code, v_sl_name, v_coa_id;
    RETURN;
  END IF;

  -- 2. Generate new SL code
  v_seq     := nextval('public.fin_unit_sl_seq');
  v_sl_code := p_gl_code || LPAD(v_seq::TEXT, 3, '0');

  v_sl_name := CASE p_gl_code
    WHEN '12100' THEN 'Cash - '               || COALESCE(p_unit_name, 'Unit')
    WHEN '12413' THEN 'Tenant Receivable - '  || COALESCE(p_unit_name, 'Unit')
    WHEN '21400' THEN 'PDC Received - '       || COALESCE(p_unit_name, 'Unit')
    WHEN '21500' THEN 'Deposit - '            || COALESCE(p_unit_name, 'Unit')
    ELSE               p_gl_code || ' - '     || COALESCE(p_unit_name, 'Unit')
  END;

  -- 3. Insert COA account for this SL (inherits type/group/class from parent GL)
  INSERT INTO public.fin_coa_accounts
    (account_code, account_name, account_type, account_level, group_name, class_name, parent_account_id)
  SELECT
    v_sl_code,
    v_sl_name,
    fa.account_type,
    'SL',
    fa.group_name,
    fa.class_name,
    fa.id
  FROM public.fin_coa_accounts fa
  WHERE fa.account_code = p_gl_code
  ON CONFLICT (account_code) DO NOTHING
  RETURNING id INTO v_coa_id;

  -- Fetch id if insert was a no-op (concurrent creation)
  IF v_coa_id IS NULL THEN
    SELECT id INTO v_coa_id
    FROM   public.fin_coa_accounts
    WHERE  account_code = v_sl_code;
  END IF;

  -- 4. Insert unit SL mapping
  INSERT INTO public.fin_unit_sl_accounts
    (unit_id, property_id, gl_code, sl_code, sl_name, coa_account_id)
  VALUES
    (p_unit_id, p_property_id, p_gl_code, v_sl_code, v_sl_name, v_coa_id)
  ON CONFLICT (unit_id, gl_code) DO NOTHING;

  -- 5. Re-fetch final row (handles race condition on concurrent insert)
  SELECT usl.sl_code, usl.sl_name, usl.coa_account_id
  INTO   v_sl_code, v_sl_name, v_coa_id
  FROM   public.fin_unit_sl_accounts usl
  WHERE  usl.unit_id = p_unit_id AND usl.gl_code = p_gl_code;

  RETURN QUERY SELECT v_sl_code, v_sl_name, v_coa_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.fin_resolve_unit_sl(UUID, UUID, TEXT, TEXT) TO anon, authenticated, service_role;

-- ============================================================================
-- 7. TRANSACTION → ACCOUNT RULES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.fin_transaction_account_rules (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_type TEXT        NOT NULL,
  payment_method   TEXT,       -- NULL = any payment method
  deposit_type     TEXT,       -- NULL = any deposit type
  pdc_type         TEXT,       -- NULL = any PDC type
  debit_gl_code    TEXT        NOT NULL,
  debit_sl_code    TEXT,       -- NULL = resolve from unit SL mapping
  credit_gl_code   TEXT        NOT NULL,
  credit_sl_code   TEXT,       -- NULL = resolve from unit SL mapping
  description      TEXT,
  is_active        BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique rule per combination (treating NULLs as distinct values)
CREATE UNIQUE INDEX IF NOT EXISTS fin_txn_rules_uq
  ON public.fin_transaction_account_rules
  (transaction_type,
   COALESCE(payment_method,  '__NULL__'),
   COALESCE(deposit_type,    '__NULL__'),
   COALESCE(pdc_type,        '__NULL__'));

-- ============================================================================
-- 8. SEED P0 TRANSACTION ACCOUNT RULES
--
-- Debit SL / Credit SL:
--   Fixed value = use that code directly
--   NULL         = resolve unit-specific SL at runtime via fin_unit_sl_accounts
-- ============================================================================

INSERT INTO public.fin_transaction_account_rules
  (transaction_type, payment_method, deposit_type, pdc_type,
   debit_gl_code, debit_sl_code, credit_gl_code, credit_sl_code, description)
VALUES

-- P0.1  Rent Invoice
-- Dr Tenant Receivable (unit SL) / Cr Rental Revenue
('RENT_INVOICE',             NULL,    NULL,       NULL,
 '12413', NULL,       '41100', '41100001',
 'Dr Tenant Receivable [unit SL] / Cr 41100001 Rental Revenue'),

-- P0.2  Cash Rent Receipt
-- Dr Cash (unit SL) / Cr Tenant Receivable (unit SL)
('RENT_RECEIPT',             'CASH',  NULL,       NULL,
 '12100', NULL,       '12413', NULL,
 'Dr Cash [unit SL] / Cr Tenant Receivable [unit SL]'),

-- P0.3  Bank Rent Receipt
-- Dr 12000001 Bank / Cr Tenant Receivable (unit SL)
('RENT_RECEIPT',             'BANK',  NULL,       NULL,
 '12000', '12000001', '12413', NULL,
 'Dr 12000001 Bank / Cr Tenant Receivable [unit SL]'),

-- P0.4  Security Deposit Receipt – Cash
-- Dr Cash (unit SL) / Cr Deposits Leasing Customers (unit SL)
('SECURITY_DEPOSIT_RECEIPT', 'CASH',  'SECURITY', NULL,
 '12100', NULL,       '21500', NULL,
 'Dr Cash [unit SL] / Cr Deposit [unit SL]'),

-- P0.5  Security Deposit Receipt – Bank
-- Dr 12000001 Bank / Cr Deposits Leasing Customers (unit SL)
('SECURITY_DEPOSIT_RECEIPT', 'BANK',  'SECURITY', NULL,
 '12000', '12000001', '21500', NULL,
 'Dr 12000001 Bank / Cr Deposit [unit SL]'),

-- P0.6  Security Deposit Receipt – PDC
-- Dr 12900002 Deposit-PDC In Hand / Cr Deposits Leasing Customers (unit SL)
('SECURITY_DEPOSIT_RECEIPT', 'PDC',   'SECURITY', 'DEPOSIT_PDC',
 '12900', '12900002', '21500', NULL,
 'Dr 12900002 Deposit-PDC In Hand / Cr Deposit [unit SL]'),

-- P0.7  Rent PDC Collection
-- Dr 12900001 PDC In Hand / Cr PDC Received Leasing Customers (unit SL)
('PDC_COLLECTION',           'PDC',   NULL,       'RENT_PDC',
 '12900', '12900001', '21400', NULL,
 'Dr 12900001 PDC In Hand / Cr PDC Received [unit SL]'),

-- P0.7b Deposit PDC Collection (guarantee / utility PDCs)
-- Dr 12900002 Deposit-PDC In Hand / Cr Deposits Leasing Customers (unit SL)
('PDC_COLLECTION',           'PDC',   NULL,       'DEPOSIT_PDC',
 '12900', '12900002', '21500', NULL,
 'Dr 12900002 Deposit-PDC In Hand / Cr Deposit [unit SL]'),

-- P0.8  PDC Return (unpresented / held cheque returned to tenant)
-- Dr PDC Received (unit SL) / Cr 12900001 PDC In Hand
('PDC_RETURN',               NULL,    NULL,       'RENT_PDC',
 '21400', NULL,       '12900', '12900001',
 'Dr PDC Received [unit SL] / Cr 12900001 PDC In Hand'),

-- P0.9a PDC Deposit to Bank — Entry A (physical instrument)
-- Dr 12000001 Bank / Cr 12900001 PDC In Hand
('PDC_DEPOSIT_BANK',         NULL,    NULL,       'RENT_PDC',
 '12000', '12000001', '12900', '12900001',
 'Dr 12000001 Bank / Cr 12900001 PDC In Hand'),

-- P0.9b PDC Deposit to Bank — Entry B (settle AR)
-- Dr PDC Received (unit SL) / Cr Tenant Receivable (unit SL)
('PDC_DEPOSIT_AR',           NULL,    NULL,       'RENT_PDC',
 '21400', NULL,       '12413', NULL,
 'Dr PDC Received [unit SL] / Cr Tenant Receivable [unit SL]'),

-- P0.11 Deposit Transfer to Refundable (21500 → 21100006)
-- Dr Deposit (unit SL) / Cr 21100006 Refundable Security Deposit
('DEPOSIT_TO_REFUNDABLE',    NULL,    'SECURITY', NULL,
 '21500', NULL,       '21100', '21100006',
 'Dr Deposit [unit SL] / Cr 21100006 Refundable Security Deposit'),

-- P0.12 Deposit Refund via Bank
-- Dr 21100006 Refundable Security Deposit / Cr 12000001 Bank
('DEPOSIT_REFUND',           'BANK',  NULL,       NULL,
 '21100', '21100006', '12000', '12000001',
 'Dr 21100006 Refundable Deposit / Cr 12000001 Bank'),

-- P0.13 Guarantee Cheque
-- Dr 12900002 Deposit-PDC In Hand / Cr 21200001 Guarantee Cheque Received
('GUARANTEE_CHEQUE',         NULL,    'GUARANTEE', NULL,
 '12900', '12900002', '21200', '21200001',
 'Dr 12900002 Deposit-PDC In Hand / Cr 21200001 Guarantee Cheque'),

-- P0.14 PDC Cancel (pre-deposit return — identical effect to PDC_RETURN)
-- Dr PDC Received (unit SL) / Cr 12900001 PDC In Hand
('PDC_CANCEL',               NULL,    NULL,       'RENT_PDC',
 '21400', NULL,       '12900', '12900001',
 'Dr PDC Received [unit SL] / Cr 12900001 PDC In Hand (Cancel)'),

-- P0.15 Qatar Cool Deposit receipt – Bank
('SECURITY_DEPOSIT_RECEIPT', 'BANK',  'QATAR_COOL', NULL,
 '12000', '12000001', '21100', '21100003',
 'Dr Bank / Cr 21100003 Qatar Cool Deposit'),

-- P0.16 Kahramaa Deposit receipt – Bank
('SECURITY_DEPOSIT_RECEIPT', 'BANK',  'KAHRAMAA', NULL,
 '12000', '12000001', '21100', '21100004',
 'Dr Bank / Cr 21100004 Kahramaa Deposit'),

-- P0.17 Service Fee Deposit receipt – Bank
('SECURITY_DEPOSIT_RECEIPT', 'BANK',  'SERVICE_FEE', NULL,
 '12000', '12000001', '21100', '21100005',
 'Dr Bank / Cr 21100005 Service Fee Deposit'),

-- P0.18 Reservation Advance receipt – Bank
('SECURITY_DEPOSIT_RECEIPT', 'BANK',  'RESERVATION', NULL,
 '12000', '12000001', '21100', '21100001',
 'Dr Bank / Cr 21100001 Reservation Advance')

ON CONFLICT DO NOTHING;

COMMIT;
