-- ============================================================================
-- FINANCE FOUNDATION
-- Migration: 20260821000000_finance_foundation.sql
-- Purpose:
--   Establish the core Finance / Accounting foundation:
--   - Chart of Accounts
--   - Journal Entries
--   - Journal Entry Lines
--   - Finance configuration
--   - Accounting periods
--   - Initial approved GL master accounts
--
-- IMPORTANT:
--   account_type values MUST be uppercase:
--   ASSET / LIABILITY / EQUITY / REVENUE / EXPENSE
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. CHART OF ACCOUNTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.fin_coa_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    account_code TEXT NOT NULL,
    account_name TEXT NOT NULL,
    account_type TEXT NOT NULL,

    parent_account_id UUID NULL,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fin_coa_accounts_account_code_key
        UNIQUE (account_code),

    CONSTRAINT fin_coa_accounts_account_type_chk
        CHECK (
            account_type = ANY (
                ARRAY[
                    'ASSET'::TEXT,
                    'LIABILITY'::TEXT,
                    'EQUITY'::TEXT,
                    'REVENUE'::TEXT,
                    'EXPENSE'::TEXT
                ]
            )
        ),

    CONSTRAINT fin_coa_accounts_parent_fk
        FOREIGN KEY (parent_account_id)
        REFERENCES public.fin_coa_accounts(id)
        ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_fin_coa_accounts_type
    ON public.fin_coa_accounts(account_type);

CREATE INDEX IF NOT EXISTS idx_fin_coa_accounts_active
    ON public.fin_coa_accounts(is_active);

CREATE INDEX IF NOT EXISTS idx_fin_coa_accounts_parent
    ON public.fin_coa_accounts(parent_account_id);


-- ============================================================================
-- 2. FINANCE JOURNAL ENTRIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.fin_journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    je_no TEXT NOT NULL,
    posting_date DATE NOT NULL DEFAULT CURRENT_DATE,

    reference TEXT,
    narration TEXT,

    source TEXT,

    status TEXT NOT NULL DEFAULT 'POSTED',

    total_debit NUMERIC(18,2) NOT NULL DEFAULT 0,
    total_credit NUMERIC(18,2) NOT NULL DEFAULT 0,

    property_id UUID,
    unit_id UUID,
    tenant_id UUID,

    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fin_journal_entries_je_no_key
        UNIQUE (je_no),

    CONSTRAINT fin_journal_entries_status_chk
        CHECK (
            status = ANY (
                ARRAY[
                    'DRAFT'::TEXT,
                    'POSTED'::TEXT,
                    'REVERSED'::TEXT,
                    'CANCELLED'::TEXT
                ]
            )
        ),

    CONSTRAINT fin_journal_entries_balance_chk
        CHECK (
            total_debit >= 0
            AND total_credit >= 0
        )
);

CREATE INDEX IF NOT EXISTS idx_fin_journal_entries_date
    ON public.fin_journal_entries(posting_date);

CREATE INDEX IF NOT EXISTS idx_fin_journal_entries_reference
    ON public.fin_journal_entries(reference);

CREATE INDEX IF NOT EXISTS idx_fin_journal_entries_source
    ON public.fin_journal_entries(source);

CREATE INDEX IF NOT EXISTS idx_fin_journal_entries_status
    ON public.fin_journal_entries(status);

CREATE INDEX IF NOT EXISTS idx_fin_journal_entries_property
    ON public.fin_journal_entries(property_id);

CREATE INDEX IF NOT EXISTS idx_fin_journal_entries_unit
    ON public.fin_journal_entries(unit_id);

CREATE INDEX IF NOT EXISTS idx_fin_journal_entries_tenant
    ON public.fin_journal_entries(tenant_id);


-- ============================================================================
-- 3. FINANCE JOURNAL ENTRY LINES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.fin_journal_entry_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    journal_entry_id UUID NOT NULL,

    line_no INTEGER NOT NULL,

    account_id UUID,
    account_code TEXT,
    account_name TEXT,

    debit NUMERIC(18,2) NOT NULL DEFAULT 0,
    credit NUMERIC(18,2) NOT NULL DEFAULT 0,

    description TEXT,

    property_id UUID,
    unit_id UUID,
    tenant_id UUID,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fin_journal_entry_lines_je_fk
        FOREIGN KEY (journal_entry_id)
        REFERENCES public.fin_journal_entries(id)
        ON DELETE CASCADE,

    CONSTRAINT fin_journal_entry_lines_account_fk
        FOREIGN KEY (account_id)
        REFERENCES public.fin_coa_accounts(id)
        ON DELETE SET NULL,

    CONSTRAINT fin_journal_entry_lines_amount_chk
        CHECK (
            debit >= 0
            AND credit >= 0
            AND NOT (
                debit > 0
                AND credit > 0
            )
        ),

    CONSTRAINT fin_journal_entry_lines_line_no_chk
        CHECK (line_no > 0)
);

CREATE INDEX IF NOT EXISTS idx_fin_journal_lines_je
    ON public.fin_journal_entry_lines(journal_entry_id);

CREATE INDEX IF NOT EXISTS idx_fin_journal_lines_account
    ON public.fin_journal_entry_lines(account_id);

CREATE INDEX IF NOT EXISTS idx_fin_journal_lines_code
    ON public.fin_journal_entry_lines(account_code);

CREATE INDEX IF NOT EXISTS idx_fin_journal_lines_property
    ON public.fin_journal_entry_lines(property_id);

CREATE INDEX IF NOT EXISTS idx_fin_journal_lines_unit
    ON public.fin_journal_entry_lines(unit_id);

CREATE INDEX IF NOT EXISTS idx_fin_journal_lines_tenant
    ON public.fin_journal_entry_lines(tenant_id);


-- ============================================================================
-- 4. FINANCE ACCOUNTING PERIODS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.fin_accounting_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    period_name TEXT NOT NULL,

    start_date DATE NOT NULL,
    end_date DATE NOT NULL,

    status TEXT NOT NULL DEFAULT 'OPEN',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fin_accounting_periods_date_chk
        CHECK (end_date >= start_date),

    CONSTRAINT fin_accounting_periods_status_chk
        CHECK (
            status = ANY (
                ARRAY[
                    'OPEN'::TEXT,
                    'CLOSED'::TEXT,
                    'LOCKED'::TEXT
                ]
            )
        )
);

CREATE INDEX IF NOT EXISTS idx_fin_accounting_periods_dates
    ON public.fin_accounting_periods(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_fin_accounting_periods_status
    ON public.fin_accounting_periods(status);


-- ============================================================================
-- 5. FINANCE CONFIGURATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.fin_configuration (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    config_key TEXT NOT NULL,
    config_value TEXT,

    description TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fin_configuration_key_key
        UNIQUE (config_key)
);

CREATE INDEX IF NOT EXISTS idx_fin_configuration_active
    ON public.fin_configuration(is_active);


-- ============================================================================
-- 6. APPROVED MASTER GL ACCOUNTS
--
-- IMPORTANT:
--   account_type values are intentionally UPPERCASE because the production
--   database constraint fin_coa_accounts_account_type_chk requires:
--
--   ASSET
--   LIABILITY
--   EQUITY
--   REVENUE
--   EXPENSE
-- ============================================================================

INSERT INTO public.fin_coa_accounts
    (
        account_code,
        account_name,
        account_type
    )
VALUES

-- --------------------------------------------------------------------------
-- ASSETS
-- --------------------------------------------------------------------------

('11000', 'PPE Land Cost', 'ASSET'),
('12000', 'Bank', 'ASSET'),
('12100', 'Cash In Hand', 'ASSET'),
('12410', 'Sundry Debtors', 'ASSET'),
('12411', 'Legal Receivables', 'ASSET'),
('12412', 'Staff Current Account', 'ASSET'),
('12413', 'Tenant Receivables', 'ASSET'),
('12500', 'Prepaid Expenses', 'ASSET'),
('12600', 'Temp. Loan To Partners', 'ASSET'),
('12700', 'Inter Company Accounts', 'ASSET'),
('12800', 'Inventory', 'ASSET'),
('12900', 'PDC In Hand', 'ASSET'),
('13000', 'Related Parties Account', 'ASSET'),

-- --------------------------------------------------------------------------
-- LIABILITIES
-- --------------------------------------------------------------------------

('21000', 'Sundry Creditors', 'LIABILITY'),
('21100', 'Tenant- Refundable Deposit', 'LIABILITY'),
('21200', 'Tenant- Guarantee Cheque', 'LIABILITY'),
('21400', 'PDC Received-Leasing Customers', 'LIABILITY'),
('21500', 'Deposits - Leasing Customers', 'LIABILITY'),
('21600', 'Accruals', 'LIABILITY'),
('22001', 'Provision for Leave Salary', 'LIABILITY'),
('22002', 'Provision for End of Service', 'LIABILITY'),
('22003', 'Provision for Air Ticket', 'LIABILITY'),
('22004', 'Provision for Contingent Liabilities', 'LIABILITY'),
('22005', 'Other Provisions (Liability)', 'LIABILITY'),
('22100', 'Long Term from Related Parties', 'LIABILITY'),
('22101', 'Long Term Bank Loans', 'LIABILITY'),
('221100', 'PROVISION FOR LEAVE SALARY', 'LIABILITY'),
('221200', 'PROVISION FOR EOSB', 'LIABILITY'),
('221300', 'PROVISION FOR CONTIGENT LIABILITES', 'LIABILITY'),
('221400', 'OTHER PROVISIONS (LIABILITY)', 'LIABILITY'),
('221500', 'TRAVEL PROVISIONS', 'LIABILITY'),
('222400', 'LONG TERM FROM ASSOCIATES', 'LIABILITY'),
('222600', 'LONG TERM BANK LOANS', 'LIABILITY'),

-- --------------------------------------------------------------------------
-- EQUITY
-- --------------------------------------------------------------------------

('31000', 'Capital', 'EQUITY'),
('31100', 'Owners Current Account', 'EQUITY'),
('31500', 'Retained Earnings Account', 'EQUITY'),
('32000', 'Reserve', 'EQUITY'),

-- --------------------------------------------------------------------------
-- REVENUE
-- --------------------------------------------------------------------------

('41100', 'Rental Revenue', 'REVENUE'),
('41101', 'Property Management Fee', 'REVENUE'),
('41201', 'Other Income', 'REVENUE'),
('41301', 'Gain/Loss of Sale of Fixed Assets', 'REVENUE'),

-- --------------------------------------------------------------------------
-- EXPENSES
-- --------------------------------------------------------------------------

('51001', 'Labour Outsource', 'EXPENSE'),
('51002', 'Annual Maintenance Contract', 'EXPENSE'),
('51003', 'Utilities & Other Direct Exp', 'EXPENSE'),
('51004', 'Repairs & Maintenance', 'EXPENSE'),
('51101', 'Staff Cost', 'EXPENSE'),
('51102', 'General and Administrative Expenses', 'EXPENSE'),
('51103', 'Head office expenses', 'EXPENSE'),
('51104', 'Selling and Marketing Expenses', 'EXPENSE'),
('51105', 'Finance Cost', 'EXPENSE'),
('51106', 'Depreciation&Amortization', 'EXPENSE')

ON CONFLICT (account_code)
DO UPDATE SET
    account_name = EXCLUDED.account_name,
    account_type = EXCLUDED.account_type,
    updated_at = NOW();


-- ============================================================================
-- 7. DEFAULT ACCOUNTING PERIOD
-- ============================================================================

INSERT INTO public.fin_accounting_periods
(
    period_name,
    start_date,
    end_date,
    status
)
VALUES
(
    'FY 2026',
    '2026-01-01',
    '2026-12-31',
    'OPEN'
)
ON CONFLICT DO NOTHING;


-- ============================================================================
-- 8. DEFAULT FINANCE CONFIGURATION
-- ============================================================================

INSERT INTO public.fin_configuration
(
    config_key,
    config_value,
    description
)
VALUES
(
    'base_currency',
    'QAR',
    'Default accounting currency'
),
(
    'financial_year_start',
    '01-01',
    'Financial year start month and day'
),
(
    'default_bank_account',
    '12000',
    'Default bank operating account'
),
(
    'default_cash_account',
    '12100',
    'Default cash in hand account'
),
(
    'default_inventory_account',
    '12800',
    'Default inventory account'
),
(
    'default_pdc_account',
    '12900',
    'Default PDC in hand account'
),
(
    'default_tenant_receivable_account',
    '12413',
    'Default tenant receivable account'
),
(
    'default_pdc_liability_account',
    '21400',
    'Default PDC received liability account'
),
(
    'default_tenant_deposit_account',
    '21500',
    'Default tenant deposit liability account'
)
ON CONFLICT (config_key)
DO UPDATE SET
    config_value = EXCLUDED.config_value,
    description = EXCLUDED.description,
    updated_at = NOW();


-- ============================================================================
-- 9. UPDATED_AT TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fin_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


-- ============================================================================
-- 10. UPDATED_AT TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS trg_fin_coa_accounts_updated_at
ON public.fin_coa_accounts;

CREATE TRIGGER trg_fin_coa_accounts_updated_at
BEFORE UPDATE ON public.fin_coa_accounts
FOR EACH ROW
EXECUTE FUNCTION public.fin_set_updated_at();


DROP TRIGGER IF EXISTS trg_fin_journal_entries_updated_at
ON public.fin_journal_entries;

CREATE TRIGGER trg_fin_journal_entries_updated_at
BEFORE UPDATE ON public.fin_journal_entries
FOR EACH ROW
EXECUTE FUNCTION public.fin_set_updated_at();


DROP TRIGGER IF EXISTS trg_fin_accounting_periods_updated_at
ON public.fin_accounting_periods;

CREATE TRIGGER trg_fin_accounting_periods_updated_at
BEFORE UPDATE ON public.fin_accounting_periods
FOR EACH ROW
EXECUTE FUNCTION public.fin_set_updated_at();


DROP TRIGGER IF EXISTS trg_fin_configuration_updated_at
ON public.fin_configuration;

CREATE TRIGGER trg_fin_configuration_updated_at
BEFORE UPDATE ON public.fin_configuration
FOR EACH ROW
EXECUTE FUNCTION public.fin_set_updated_at();


-- ============================================================================
-- 11. JOURNAL ENTRY BALANCE VALIDATION
--
-- A posted journal entry must be balanced:
--
--       TOTAL DEBIT = TOTAL CREDIT
--
-- This constraint is implemented as a deferred trigger so that individual
-- journal lines can be inserted first and validated when the transaction
-- commits.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fin_validate_journal_entry_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_debit NUMERIC(18,2);
    v_credit NUMERIC(18,2);
    v_status TEXT;
BEGIN

    SELECT
        COALESCE(SUM(debit), 0),
        COALESCE(SUM(credit), 0)
    INTO
        v_debit,
        v_credit
    FROM public.fin_journal_entry_lines
    WHERE journal_entry_id = NEW.journal_entry_id;

    SELECT status
    INTO v_status
    FROM public.fin_journal_entries
    WHERE id = NEW.journal_entry_id;

    IF v_status = 'POSTED'
       AND ROUND(v_debit, 2) <> ROUND(v_credit, 2)
    THEN
        RAISE EXCEPTION
            'Journal Entry % is not balanced. Debit=% Credit=%',
            NEW.journal_entry_id,
            v_debit,
            v_credit;
    END IF;

    RETURN NEW;
END;
$$;


DROP TRIGGER IF EXISTS trg_fin_validate_journal_entry_balance
ON public.fin_journal_entry_lines;

CREATE CONSTRAINT TRIGGER trg_fin_validate_journal_entry_balance
AFTER INSERT OR UPDATE OR DELETE
ON public.fin_journal_entry_lines
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION public.fin_validate_journal_entry_balance();


-- ============================================================================
-- 12. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.fin_coa_accounts
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.fin_journal_entries
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.fin_journal_entry_lines
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.fin_accounting_periods
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.fin_configuration
ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 13. DEVELOPMENT / APPLICATION ACCESS POLICIES
--
-- These policies are intentionally permissive for the current application
-- architecture. They can be hardened later when application roles and
-- permission groups are fully enforced.
-- ============================================================================

DROP POLICY IF EXISTS fin_coa_accounts_select
ON public.fin_coa_accounts;

CREATE POLICY fin_coa_accounts_select
ON public.fin_coa_accounts
FOR SELECT
USING (TRUE);


DROP POLICY IF EXISTS fin_coa_accounts_insert
ON public.fin_coa_accounts;

CREATE POLICY fin_coa_accounts_insert
ON public.fin_coa_accounts
FOR INSERT
WITH CHECK (TRUE);


DROP POLICY IF EXISTS fin_coa_accounts_update
ON public.fin_coa_accounts;

CREATE POLICY fin_coa_accounts_update
ON public.fin_coa_accounts
FOR UPDATE
USING (TRUE)
WITH CHECK (TRUE);


DROP POLICY IF EXISTS fin_journal_entries_select
ON public.fin_journal_entries;

CREATE POLICY fin_journal_entries_select
ON public.fin_journal_entries
FOR SELECT
USING (TRUE);


DROP POLICY IF EXISTS fin_journal_entries_insert
ON public.fin_journal_entries;

CREATE POLICY fin_journal_entries_insert
ON public.fin_journal_entries
FOR INSERT
WITH CHECK (TRUE);


DROP POLICY IF EXISTS fin_journal_entries_update
ON public.fin_journal_entries;

CREATE POLICY fin_journal_entries_update
ON public.fin_journal_entries
FOR UPDATE
USING (TRUE)
WITH CHECK (TRUE);


DROP POLICY IF EXISTS fin_journal_entry_lines_select
ON public.fin_journal_entry_lines;

CREATE POLICY fin_journal_entry_lines_select
ON public.fin_journal_entry_lines
FOR SELECT
USING (TRUE);


DROP POLICY IF EXISTS fin_journal_entry_lines_insert
ON public.fin_journal_entry_lines;

CREATE POLICY fin_journal_entry_lines_insert
ON public.fin_journal_entry_lines
FOR INSERT
WITH CHECK (TRUE);


DROP POLICY IF EXISTS fin_journal_entry_lines_update
ON public.fin_journal_entry_lines;

CREATE POLICY fin_journal_entry_lines_update
ON public.fin_journal_entry_lines
FOR UPDATE
USING (TRUE)
WITH CHECK (TRUE);


DROP POLICY IF EXISTS fin_accounting_periods_select
ON public.fin_accounting_periods;

CREATE POLICY fin_accounting_periods_select
ON public.fin_accounting_periods
FOR SELECT
USING (TRUE);


DROP POLICY IF EXISTS fin_accounting_periods_insert
ON public.fin_accounting_periods;

CREATE POLICY fin_accounting_periods_insert
ON public.fin_accounting_periods
FOR INSERT
WITH CHECK (TRUE);


DROP POLICY IF EXISTS fin_accounting_periods_update
ON public.fin_accounting_periods;

CREATE POLICY fin_accounting_periods_update
ON public.fin_accounting_periods
FOR UPDATE
USING (TRUE)
WITH CHECK (TRUE);


DROP POLICY IF EXISTS fin_configuration_select
ON public.fin_configuration;

CREATE POLICY fin_configuration_select
ON public.fin_configuration
FOR SELECT
USING (TRUE);


DROP POLICY IF EXISTS fin_configuration_insert
ON public.fin_configuration;

CREATE POLICY fin_configuration_insert
ON public.fin_configuration
FOR INSERT
WITH CHECK (TRUE);


DROP POLICY IF EXISTS fin_configuration_update
ON public.fin_configuration;

CREATE POLICY fin_configuration_update
ON public.fin_configuration
FOR UPDATE
USING (TRUE)
WITH CHECK (TRUE);


COMMIT;

-- ============================================================================
-- END OF FINANCE FOUNDATION
-- ============================================================================