const { Client } = require('pg');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf-8');
let dbUrl = '';
envFile.split('\n').forEach(line => {
  if (line.startsWith('DATABASE_URL=')) dbUrl = line.split('=')[1].trim().replace(/"/g, '');
});

const client = new Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

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

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'fin_pdc_register' AND policyname = 'allow_all_fin_pdc_register') THEN
    CREATE POLICY allow_all_fin_pdc_register      ON public.fin_pdc_register      FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'fin_deposits' AND policyname = 'allow_all_fin_deposits') THEN
    CREATE POLICY allow_all_fin_deposits          ON public.fin_deposits           FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'fin_legal_receivables' AND policyname = 'allow_all_fin_legal_receivables') THEN
    CREATE POLICY allow_all_fin_legal_receivables ON public.fin_legal_receivables  FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'fin_payroll_syncs' AND policyname = 'allow_all_fin_payroll_syncs') THEN
    CREATE POLICY allow_all_fin_payroll_syncs     ON public.fin_payroll_syncs      FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
`;

async function run() {
  try {
    await client.connect();
    console.log('Connected to DB');
    await client.query(SQL);
    console.log('Tables created successfully!');
  } catch (err) {
    console.error('Error creating tables:', err);
  } finally {
    await client.end();
  }
}

run();
