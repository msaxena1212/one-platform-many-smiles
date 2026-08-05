import { Client } from 'pg';

const connectionString = "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

async function migrate() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('=== Migrating Extended Finance Tables ===\n');

    await client.query(`
      -- Financial Years
      CREATE TABLE IF NOT EXISTS public.fin_financial_years (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status TEXT NOT NULL DEFAULT 'Active'
      );

      -- Regions
      CREATE TABLE IF NOT EXISTS public.fin_regions (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        currency TEXT DEFAULT 'QAR'
      );

      -- Vendors
      CREATE TABLE IF NOT EXISTS public.fin_vendors (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        contact_person TEXT,
        email TEXT,
        phone TEXT,
        tax_number TEXT,
        status TEXT DEFAULT 'Active'
      );

      -- Customers (Finance view master)
      CREATE TABLE IF NOT EXISTS public.fin_customers (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        type TEXT DEFAULT 'Individual',
        email TEXT,
        phone TEXT,
        credit_limit NUMERIC DEFAULT 0
      );

      -- Cost Centers
      CREATE TABLE IF NOT EXISTS public.fin_cost_centers (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        manager TEXT
      );

      -- Posting Periods
      CREATE TABLE IF NOT EXISTS public.fin_posting_periods (
        id SERIAL PRIMARY KEY,
        period_name TEXT NOT NULL UNIQUE, -- e.g. 2026-01
        year TEXT NOT NULL,
        month INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'Open' -- Open, Closed
      );

      -- Banks
      CREATE TABLE IF NOT EXISTS public.fin_banks (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        swift_code TEXT
      );

      -- Bank Accounts
      CREATE TABLE IF NOT EXISTS public.fin_bank_accounts (
        id SERIAL PRIMARY KEY,
        bank_id INTEGER REFERENCES public.fin_banks(id) ON DELETE CASCADE,
        account_number TEXT NOT NULL UNIQUE,
        account_title TEXT NOT NULL,
        currency TEXT DEFAULT 'QAR',
        opening_balance NUMERIC DEFAULT 0
      );

      -- Bank Clearances / Reconciliations
      CREATE TABLE IF NOT EXISTS public.fin_bank_reconciliations (
        id SERIAL PRIMARY KEY,
        account_number TEXT NOT NULL,
        statement_date DATE NOT NULL,
        statement_balance NUMERIC DEFAULT 0,
        book_balance NUMERIC DEFAULT 0,
        status TEXT DEFAULT 'Pending'
      );

      -- Contracts (Expense & Revenue)
      CREATE TABLE IF NOT EXISTS public.fin_contracts (
        id SERIAL PRIMARY KEY,
        contract_number TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        party_name TEXT NOT NULL,
        type TEXT NOT NULL, -- Expense or Revenue
        total_value NUMERIC NOT NULL DEFAULT 0,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status TEXT DEFAULT 'Active'
      );

      -- RLS
      ALTER TABLE public.fin_financial_years ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.fin_regions ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.fin_vendors ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.fin_customers ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.fin_cost_centers ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.fin_posting_periods ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.fin_banks ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.fin_bank_accounts ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.fin_bank_reconciliations ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.fin_contracts ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "public_all" ON public.fin_financial_years; CREATE POLICY "public_all" ON public.fin_financial_years FOR ALL USING (true) WITH CHECK (true);
      DROP POLICY IF EXISTS "public_all" ON public.fin_regions; CREATE POLICY "public_all" ON public.fin_regions FOR ALL USING (true) WITH CHECK (true);
      DROP POLICY IF EXISTS "public_all" ON public.fin_vendors; CREATE POLICY "public_all" ON public.fin_vendors FOR ALL USING (true) WITH CHECK (true);
      DROP POLICY IF EXISTS "public_all" ON public.fin_customers; CREATE POLICY "public_all" ON public.fin_customers FOR ALL USING (true) WITH CHECK (true);
      DROP POLICY IF EXISTS "public_all" ON public.fin_cost_centers; CREATE POLICY "public_all" ON public.fin_cost_centers FOR ALL USING (true) WITH CHECK (true);
      DROP POLICY IF EXISTS "public_all" ON public.fin_posting_periods; CREATE POLICY "public_all" ON public.fin_posting_periods FOR ALL USING (true) WITH CHECK (true);
      DROP POLICY IF EXISTS "public_all" ON public.fin_banks; CREATE POLICY "public_all" ON public.fin_banks FOR ALL USING (true) WITH CHECK (true);
      DROP POLICY IF EXISTS "public_all" ON public.fin_bank_accounts; CREATE POLICY "public_all" ON public.fin_bank_accounts FOR ALL USING (true) WITH CHECK (true);
      DROP POLICY IF EXISTS "public_all" ON public.fin_bank_reconciliations; CREATE POLICY "public_all" ON public.fin_bank_reconciliations FOR ALL USING (true) WITH CHECK (true);
      DROP POLICY IF EXISTS "public_all" ON public.fin_contracts; CREATE POLICY "public_all" ON public.fin_contracts FOR ALL USING (true) WITH CHECK (true);
    `);

    console.log('✓ All extended finance tables created.');

    // Seed sample data
    await client.query(`
      INSERT INTO public.fin_financial_years (name, start_date, end_date, status)
      VALUES ('FY 2026', '2026-01-01', '2026-12-31', 'Active'), ('FY 2025', '2025-01-01', '2025-12-31', 'Closed')
      ON CONFLICT (name) DO NOTHING;

      INSERT INTO public.fin_regions (code, name, currency)
      VALUES ('DOH', 'Doha Main Region', 'QAR'), ('ALW', 'Al Wakra', 'QAR'), ('RAY', 'Al Rayyan', 'QAR')
      ON CONFLICT (code) DO NOTHING;

      INSERT INTO public.fin_vendors (code, name, contact_person, email, phone, tax_number)
      VALUES ('VEND-001', 'Qatar Maintenance Co.', 'Ahmed Al-Kuwari', 'ahmed@qatarmain.com', '+974 5511 2233', 'TRN-998811'),
             ('VEND-002', 'Gulf Facility Services', 'Salem Hassan', 'salem@gulfac.com', '+974 6622 3344', 'TRN-887722')
      ON CONFLICT (code) DO NOTHING;

      INSERT INTO public.fin_cost_centers (code, name, manager)
      VALUES ('CC-100', 'Building Maintenance HQ', 'Jithin Abdul Latheef'), ('CC-200', 'Leasing & Admin Operations', 'Rashid Al-Mansoori')
      ON CONFLICT (code) DO NOTHING;

      INSERT INTO public.fin_posting_periods (period_name, year, month, status)
      VALUES ('2026-01', '2026', 1, 'Closed'), ('2026-02', '2026', 2, 'Open'), ('2026-03', '2026', 3, 'Open')
      ON CONFLICT (period_name) DO NOTHING;

      INSERT INTO public.fin_banks (code, name, swift_code)
      VALUES ('QNB', 'Qatar National Bank', 'QNBAQAQA'), ('CBQ', 'Commercial Bank of Qatar', 'CBQAQAQA')
      ON CONFLICT (code) DO NOTHING;

      INSERT INTO public.fin_bank_accounts (bank_id, account_number, account_title, currency, opening_balance)
      VALUES (1, 'QNB-0001-9988-01', 'Main Operational Account', 'QAR', 1250000),
             (2, 'CBQ-0002-3344-02', 'Escrow Security Account', 'QAR', 450000)
      ON CONFLICT (account_number) DO NOTHING;

      INSERT INTO public.fin_contracts (contract_number, title, party_name, type, total_value, start_date, end_date, status)
      VALUES ('CNT-EXP-001', 'HVAC Annual Maintenance', 'Qatar Maintenance Co.', 'Expense', 120000, '2026-01-01', '2026-12-31', 'Active'),
             ('CNT-REV-001', 'Commercial Property Lease', 'M/S Al Ameen Real Estate', 'Revenue', 660000, '2026-01-01', '2027-01-01', 'Active')
      ON CONFLICT (contract_number) DO NOTHING;
    `);

    console.log('✓ Sample data seeded successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

migrate();
