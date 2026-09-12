const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf-8');
let url = '', key = '';
envFile.split('\n').forEach(line => {
  if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim().replace(/"/g, '');
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim().replace(/"/g, '');
});

const supabase = createClient(url, key);

const SQL = `
-- fin_pdc_register
CREATE TABLE IF NOT EXISTS public.fin_pdc_register (
  id                bigserial PRIMARY KEY,
  cheque_number     text        NOT NULL,
  bank_id           bigint,
  cheque_date       date        NOT NULL,
  amount            numeric(18,4) NOT NULL DEFAULT 0,
  tenant_id         bigint,
  property_id       bigint,
  unit_id           bigint,
  status            text        NOT NULL DEFAULT 'In Hand',
  deposit_date      date,
  cleared_date      date,
  returned_date     date,
  original_pdc_id   bigint,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- fin_deposits (Security Deposits & Guarantees)
CREATE TABLE IF NOT EXISTS public.fin_deposits (
  id                bigserial PRIMARY KEY,
  deposit_type      text        NOT NULL,
  coa_account_code  text        NOT NULL,
  amount            numeric(18,4) NOT NULL DEFAULT 0,
  tenant_id         bigint      NOT NULL,
  property_id       bigint,
  unit_id           bigint,
  lease_id          bigint,
  status            text        NOT NULL DEFAULT 'Held',
  receipt_ref       text,
  deduction_amount  numeric(18,4) NOT NULL DEFAULT 0,
  refund_amount     numeric(18,4) NOT NULL DEFAULT 0,
  settled_at        timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- fin_legal_receivables
CREATE TABLE IF NOT EXISTS public.fin_legal_receivables (
  id                  bigserial PRIMARY KEY,
  tenant_id           bigint      NOT NULL,
  property_id         bigint,
  unit_id             bigint,
  lease_id            bigint,
  original_amount     numeric(18,4) NOT NULL DEFAULT 0,
  outstanding_balance numeric(18,4) NOT NULL DEFAULT 0,
  escalation_date     date        NOT NULL,
  reason              text,
  legal_case_id       text,
  status              text        NOT NULL DEFAULT 'Active',
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- fin_payroll_syncs
CREATE TABLE IF NOT EXISTS public.fin_payroll_syncs (
  id              bigserial PRIMARY KEY,
  payroll_run_id  text        NOT NULL,
  period          text        NOT NULL,
  status          text        NOT NULL DEFAULT 'Pending',
  total_amount    numeric(18,4),
  error_details   text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS but allow anon reads for now (dev mode)
ALTER TABLE public.fin_pdc_register       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fin_deposits           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fin_legal_receivables  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fin_payroll_syncs      ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "allow_all_fin_pdc_register"      ON public.fin_pdc_register      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "allow_all_fin_deposits"          ON public.fin_deposits           FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "allow_all_fin_legal_receivables" ON public.fin_legal_receivables  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "allow_all_fin_payroll_syncs"     ON public.fin_payroll_syncs      FOR ALL USING (true) WITH CHECK (true);
`;

async function run() {
  console.log('Creating missing finance tables...');
  const { error } = await supabase.rpc('exec_sql', { sql: SQL }).catch(() => ({ error: { message: 'RPC not available' } }));
  if (error) {
    console.log('RPC exec_sql not available, trying individual checks...');
    // Try creating each table by doing a select (will fail with table not found if missing)
    const tables = ['fin_pdc_register', 'fin_deposits', 'fin_legal_receivables', 'fin_payroll_syncs'];
    for (const t of tables) {
      const { error: e } = await supabase.from(t).select('id').limit(1);
      if (e) console.log(`Table ${t}: ${e.message}`);
      else console.log(`Table ${t}: EXISTS OK`);
    }
    console.log('\nPlease run this SQL in your Supabase SQL Editor:');
    console.log(SQL);
  } else {
    console.log('Tables created successfully!');
  }
}

run();
