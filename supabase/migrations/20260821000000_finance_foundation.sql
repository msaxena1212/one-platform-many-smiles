BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Authoritative UUID-based Finance foundation.
-- Operational/subledger tables feed the central accounting-event/posting engine.

CREATE TABLE IF NOT EXISTS public.fin_coa_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_code TEXT NOT NULL UNIQUE,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL,
  parent_id UUID REFERENCES public.fin_coa_accounts(id) ON DELETE RESTRICT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.fin_vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_number TEXT NOT NULL UNIQUE,
  voucher_date DATE NOT NULL,
  voucher_type TEXT NOT NULL,
  reference_no TEXT,
  description TEXT,
  total_amount NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  status TEXT NOT NULL DEFAULT 'Draft',
  posted_by UUID,
  posted_at TIMESTAMPTZ,
  accounting_event_id UUID,
  source_type TEXT,
  source_id UUID,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.fin_voucher_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id UUID NOT NULL REFERENCES public.fin_vouchers(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.fin_coa_accounts(id) ON DELETE RESTRICT,
  cost_center_id UUID,
  property_id UUID,
  unit_id UUID,
  tenant_id UUID,
  vendor_id UUID,
  lease_id UUID,
  customer_id UUID,
  debit_amount NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (debit_amount >= 0),
  credit_amount NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (credit_amount >= 0),
  description TEXT,
  source_type TEXT,
  source_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fin_voucher_line_one_side CHECK (NOT (debit_amount > 0 AND credit_amount > 0)),
  CONSTRAINT fin_voucher_line_nonzero CHECK (debit_amount > 0 OR credit_amount > 0)
);

CREATE TABLE IF NOT EXISTS public.fin_pdc_register (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cheque_number TEXT NOT NULL,
  bank_id UUID,
  cheque_date DATE NOT NULL,
  amount NUMERIC(18,2) NOT NULL CHECK (amount > 0),
  tenant_id UUID,
  property_id UUID,
  unit_id UUID,
  lease_id UUID,
  status TEXT NOT NULL DEFAULT 'Received',
  deposit_date DATE,
  cleared_date DATE,
  returned_date DATE,
  original_pdc_id UUID REFERENCES public.fin_pdc_register(id) ON DELETE SET NULL,
  accounting_event_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.fin_legal_receivables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  property_id UUID,
  unit_id UUID,
  lease_id UUID,
  original_amount NUMERIC(18,2) NOT NULL CHECK (original_amount >= 0),
  outstanding_balance NUMERIC(18,2) NOT NULL CHECK (outstanding_balance >= 0),
  escalation_date DATE NOT NULL,
  reason TEXT,
  legal_case_id TEXT,
  status TEXT NOT NULL DEFAULT 'Escalated',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.fin_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deposit_type TEXT NOT NULL,
  coa_account_code TEXT NOT NULL,
  amount NUMERIC(18,2) NOT NULL CHECK (amount > 0),
  tenant_id UUID NOT NULL,
  property_id UUID,
  unit_id UUID,
  lease_id UUID,
  status TEXT NOT NULL DEFAULT 'Active',
  receipt_ref TEXT,
  accounting_event_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.fin_payroll_syncs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_run_id TEXT NOT NULL UNIQUE,
  period TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  total_amount NUMERIC(18,2),
  error_details TEXT,
  accounting_event_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Supporting finance masters used by the existing Finance services/UI.
CREATE TABLE IF NOT EXISTS public.fin_financial_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Upcoming',
  CHECK (end_date >= start_date)
);

CREATE TABLE IF NOT EXISTS public.fin_regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  currency TEXT,
  country TEXT,
  status TEXT NOT NULL DEFAULT 'Active'
);

CREATE TABLE IF NOT EXISTS public.fin_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  tax_number TEXT,
  status TEXT NOT NULL DEFAULT 'Active'
);

CREATE TABLE IF NOT EXISTS public.fin_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  credit_limit NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (credit_limit >= 0)
);

CREATE TABLE IF NOT EXISTS public.fin_cost_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  manager TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS public.fin_posting_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_name TEXT NOT NULL UNIQUE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  status TEXT NOT NULL DEFAULT 'Open'
);

CREATE TABLE IF NOT EXISTS public.fin_banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  swift_code TEXT
);

CREATE TABLE IF NOT EXISTS public.fin_bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_id UUID REFERENCES public.fin_banks(id) ON DELETE SET NULL,
  account_number TEXT NOT NULL UNIQUE,
  account_title TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'QAR',
  opening_balance NUMERIC(18,2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.fin_bank_reconciliations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_number TEXT NOT NULL,
  statement_date DATE NOT NULL,
  statement_balance NUMERIC(18,2) NOT NULL DEFAULT 0,
  book_balance NUMERIC(18,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Open'
);

CREATE TABLE IF NOT EXISTS public.fin_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  party_name TEXT NOT NULL,
  type TEXT NOT NULL,
  total_value NUMERIC(18,2) NOT NULL DEFAULT 0,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'Draft'
);

CREATE INDEX IF NOT EXISTS idx_fin_voucher_lines_voucher ON public.fin_voucher_lines(voucher_id);
CREATE INDEX IF NOT EXISTS idx_fin_voucher_lines_account ON public.fin_voucher_lines(account_id);
CREATE INDEX IF NOT EXISTS idx_fin_pdc_cheque ON public.fin_pdc_register(cheque_number);
CREATE INDEX IF NOT EXISTS idx_fin_pdc_status ON public.fin_pdc_register(status);
CREATE INDEX IF NOT EXISTS idx_fin_deposits_tenant ON public.fin_deposits(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fin_legal_receivables_tenant ON public.fin_legal_receivables(tenant_id);

-- Approved master GLs used by the Finance posting engine.
INSERT INTO public.fin_coa_accounts (account_code, account_name, account_type)
VALUES
('11000','PPE Land Cost','Asset'),
('12000','Bank','Asset'),
('12100','Cash In Hand','Asset'),
('12410','Sundry Debtors','Asset'),
('12411','Legal Receivables','Asset'),
('12412','Staff Current Account','Asset'),
('12413','Tenant Receivables','Asset'),
('12500','Prepaid Expenses','Asset'),
('12600','Temp. Loan To Partners','Asset'),
('12700','Inter Company Accounts','Asset'),
('12800','Inventory','Asset'),
('12900','PDC In Hand','Asset'),
('13000','Related Parties Account','Asset'),
('21000','Sundry Creditors','Liability'),
('21100','Tenant- Refundable Deposit','Liability'),
('21200','Tenant- Guarantee Cheque','Liability'),
('21400','PDC Received-Leasing Customers','Liability'),
('21500','Deposits - Leasing Customers','Liability'),
('21600','Accruals','Liability'),
('22001','Provision for Leave Salary','Liability'),
('22002','Provision for End of Service','Liability'),
('22003','Provision for Air Ticket','Liability'),
('22004','Provision for Contingent Liabilities','Liability'),
('22005','Other Provisions (Liability)','Liability'),
('22100','Long Term from Related Parties','Liability'),
('22101','Long Term Bank Loans','Liability'),
('221100','PROVISION FOR LEAVE SALARY','Liability'),
('221200','PROVISION FOR EOSB','Liability'),
('221300','PROVISION FOR CONTIGENT LIABILITES','Liability'),
('221400','OTHER PROVISIONS (LIABILITY)','Liability'),
('221500','TRAVEL PROVISIONS','Liability'),
('222400','LONG TERM FROM ASSOCIATES','Liability'),
('222600','LONG TERM BANK LOANS','Liability'),
('31000','Capital','Equity'),
('31100','Owners Current Account','Equity'),
('31500','Retained Earnings Account','Equity'),
('32000','Reserve','Equity'),
('41100','Rental Revenue','Revenue'),
('41101','Property Management Fee','Revenue'),
('41201','Other Income','Revenue'),
('41301','Gain/Loss of Sale of Fixed Assets','Revenue'),
('51001','Labour Outsource','Expense'),
('51002','Annual Maintenance Contract','Expense'),
('51003','Utilities & Other Direct Exp','Expense'),
('51004','Repairs & Maintenance','Expense'),
('51101','Staff Cost','Expense'),
('51102','General and Administrative Expenses','Expense'),
('51103','Head office expenses','Expense'),
('51104','Selling and Marketing Expenses','Expense'),
('51105','Finance Cost','Expense'),
('51106','Depreciation&Amortization','Expense')
ON CONFLICT (account_code) DO NOTHING;

COMMIT;
