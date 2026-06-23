import { Client } from 'pg';

async function migrate() {
  const connectionString = "postgresql://postgres.rvlnwpsijbzcqxutsgwy:IzkXrKVvcnf4pwpS@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres";
  const client = new Client({ connectionString });
  
  try {
    console.log("Connecting to Supabase...");
    await client.connect();

    console.log("Creating Finance tables...");

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.gl_accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(50) UNIQUE NOT NULL,
        name_en VARCHAR(255) NOT NULL,
        name_ar VARCHAR(255),
        type VARCHAR(50) NOT NULL CHECK (type IN ('asset', 'liability', 'equity', 'income', 'expense')),
        parent_id UUID REFERENCES public.gl_accounts(id),
        currency VARCHAR(3) DEFAULT 'SAR',
        is_postable BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS public.cost_centers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        parent_id UUID REFERENCES public.cost_centers(id),
        dimension VARCHAR(50) NOT NULL CHECK (dimension IN ('property', 'unit', 'owner', 'department', 'project')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS public.journal_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        je_no VARCHAR(50) UNIQUE NOT NULL,
        posting_date DATE NOT NULL,
        period VARCHAR(20) NOT NULL,
        source_module VARCHAR(50) NOT NULL,
        source_id VARCHAR(255),
        narration TEXT,
        status VARCHAR(50) NOT NULL CHECK (status IN ('draft', 'posted', 'reversed')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS public.journal_lines (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        je_id UUID NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
        line_no INTEGER NOT NULL,
        account_id UUID NOT NULL REFERENCES public.gl_accounts(id),
        debit NUMERIC(18,4) DEFAULT 0,
        credit NUMERIC(18,4) DEFAULT 0,
        cost_center_id UUID REFERENCES public.cost_centers(id),
        property_id UUID REFERENCES public.properties(id),
        unit_id UUID,
        owner_id UUID,
        currency VARCHAR(3) DEFAULT 'SAR',
        fx_rate NUMERIC(10,4) DEFAULT 1,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS public.invoices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID,
        lease_id UUID,
        type VARCHAR(50) NOT NULL CHECK (type IN ('rent', 'maintenance', 'service', 'deposit_deduction', 'community')),
        lines JSONB NOT NULL DEFAULT '[]',
        total NUMERIC(18,4) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'draft',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS public.receipts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID,
        payment_mode VARCHAR(50) NOT NULL CHECK (payment_mode IN ('cash', 'bank', 'cheque', 'sadad', 'mada', 'apple_pay', 'stc_pay', 'card', 'bank_transfer')),
        amount NUMERIC(18,4) NOT NULL,
        currency VARCHAR(3) DEFAULT 'SAR',
        ref VARCHAR(255),
        received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        allocations JSONB DEFAULT '[]',
        status VARCHAR(50) NOT NULL DEFAULT 'completed',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS public.bank_accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        bank VARCHAR(255) NOT NULL,
        account_no VARCHAR(255) NOT NULL,
        currency VARCHAR(3) DEFAULT 'SAR',
        gl_account_id UUID REFERENCES public.gl_accounts(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS public.owner_payables (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        owner_id UUID NOT NULL,
        period VARCHAR(20) NOT NULL,
        gross NUMERIC(18,4) NOT NULL,
        expenses NUMERIC(18,4) NOT NULL,
        net NUMERIC(18,4) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        paid_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS public.posting_rules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_code VARCHAR(100) UNIQUE NOT NULL,
        version INTEGER DEFAULT 1,
        active BOOLEAN DEFAULT true,
        rule_json JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Enable RLS and public access for MVP
      ALTER TABLE public.gl_accounts ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.cost_centers ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.journal_lines ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.owner_payables ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.posting_rules ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Allow public access" ON public.gl_accounts;
      CREATE POLICY "Allow public access" ON public.gl_accounts FOR ALL USING (true);
      
      DROP POLICY IF EXISTS "Allow public access" ON public.cost_centers;
      CREATE POLICY "Allow public access" ON public.cost_centers FOR ALL USING (true);
      
      DROP POLICY IF EXISTS "Allow public access" ON public.journal_entries;
      CREATE POLICY "Allow public access" ON public.journal_entries FOR ALL USING (true);
      
      DROP POLICY IF EXISTS "Allow public access" ON public.journal_lines;
      CREATE POLICY "Allow public access" ON public.journal_lines FOR ALL USING (true);
      
      DROP POLICY IF EXISTS "Allow public access" ON public.invoices;
      CREATE POLICY "Allow public access" ON public.invoices FOR ALL USING (true);
      
      DROP POLICY IF EXISTS "Allow public access" ON public.receipts;
      CREATE POLICY "Allow public access" ON public.receipts FOR ALL USING (true);
      
      DROP POLICY IF EXISTS "Allow public access" ON public.bank_accounts;
      CREATE POLICY "Allow public access" ON public.bank_accounts FOR ALL USING (true);
      
      DROP POLICY IF EXISTS "Allow public access" ON public.owner_payables;
      CREATE POLICY "Allow public access" ON public.owner_payables FOR ALL USING (true);
      
      DROP POLICY IF EXISTS "Allow public access" ON public.posting_rules;
      CREATE POLICY "Allow public access" ON public.posting_rules FOR ALL USING (true);
    `);

    console.log("Seeding standard Chart of Accounts...");

    await client.query(`
      INSERT INTO public.gl_accounts (code, name_en, type) VALUES
        ('1000', 'Cash & Cash Equivalents', 'asset'),
        ('1010', 'Operating Bank Account', 'asset'),
        ('1100', 'Accounts Receivable (Tenants)', 'asset'),
        ('1150', 'PDC Control Account', 'asset'),
        ('1200', 'Prepaid Expenses', 'asset'),
        
        ('2000', 'Accounts Payable (Vendors)', 'liability'),
        ('2100', 'Security Deposits Liability', 'liability'),
        ('2200', 'Unearned Revenue', 'liability'),
        ('2300', 'Owner Payables', 'liability'),
        
        ('3000', 'Owner Equity', 'equity'),
        ('3100', 'Retained Earnings', 'equity'),
        
        ('4000', 'Rental Income', 'income'),
        ('4100', 'Community Services Income', 'income'),
        ('4200', 'Late Fees & Penalties', 'income'),
        
        ('5000', 'Property Maintenance Expense', 'expense'),
        ('5100', 'Utilities Expense', 'expense'),
        ('5200', 'Depreciation Expense', 'expense'),
        ('5300', 'Management Fees', 'expense'),
        ('5400', 'Bank Charges', 'expense')
      ON CONFLICT (code) DO NOTHING;
    `);

    console.log("Finance migration successful!");
  } catch (error) {
    console.error("Error running finance migration:", error);
  } finally {
    await client.end();
  }
}

migrate();
