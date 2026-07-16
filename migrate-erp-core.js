import { Client } from 'pg';

async function migrate() {
  const connectionString = "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";
  const client = new Client({ connectionString });

  try {
    console.log('Connecting to Supabase...');
    await client.connect();

    console.log('Applying ERP core schema changes...');

    // Add enum values for room_type if needed
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_type t
          JOIN pg_enum e ON t.oid = e.enumtypid
          WHERE t.typname = 'room_type' AND e.enumlabel = 'FLAT'
        ) THEN
          ALTER TYPE room_type ADD VALUE 'FLAT';
        END IF;
        IF NOT EXISTS (
          SELECT 1 FROM pg_type t
          JOIN pg_enum e ON t.oid = e.enumtypid
          WHERE t.typname = 'room_type' AND e.enumlabel = 'SHOP'
        ) THEN
          ALTER TYPE room_type ADD VALUE 'SHOP';
        END IF;
        IF NOT EXISTS (
          SELECT 1 FROM pg_type t
          JOIN pg_enum e ON t.oid = e.enumtypid
          WHERE t.typname = 'room_type' AND e.enumlabel = 'COMPOUND'
        ) THEN
          ALTER TYPE room_type ADD VALUE 'COMPOUND';
        END IF;
      EXCEPTION WHEN undefined_object THEN
        -- enum type doesn't exist; skip
        NULL;
      END$$;
    `);

    // Add property/unit extended fields
    await client.query(`
      ALTER TABLE IF EXISTS public.properties
      ADD COLUMN IF NOT EXISTS kahramaa_number TEXT;
    `);

    await client.query(`
      ALTER TABLE IF EXISTS public.units
      ADD COLUMN IF NOT EXISTS municipality_details JSONB DEFAULT '{}'::jsonb;
    `);

    // Leases
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.leases (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        unit_id UUID,
        tenant_id UUID,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        security_deposit NUMERIC(12,2),
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    // Rent schedules
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.rent_schedules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        lease_id UUID,
        due_date DATE NOT NULL,
        amount NUMERIC(12,2) NOT NULL,
        status TEXT DEFAULT 'PENDING',
        paid_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    // Post-dated cheques (PDCs)
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.pdcs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        lease_id UUID,
        cheque_number TEXT,
        bank TEXT,
        deposit_date DATE,
        amount NUMERIC(12,2),
        status TEXT DEFAULT 'ISSUED',
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    // Finance & Accounting
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.gl_accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        account_code TEXT UNIQUE,
        name TEXT NOT NULL,
        account_type TEXT,
        cost_center TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.accounts_receivable (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        invoice_number TEXT UNIQUE,
        tenant_id UUID,
        lease_id UUID,
        amount NUMERIC(12,2) NOT NULL,
        status TEXT DEFAULT 'OPEN',
        due_date DATE,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.provisions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT,
        amount NUMERIC(12,2),
        period DATE,
        gl_account_id UUID,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.owner_revenue_shares (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        property_id UUID,
        owner_id UUID,
        percentage NUMERIC(5,2),
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    // Fixed assets & handovers
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.fixed_assets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT,
        serial_number TEXT,
        purchase_date DATE,
        purchase_value NUMERIC(12,2),
        depreciation_rate NUMERIC(5,2),
        current_value NUMERIC(12,2),
        location TEXT,
        status TEXT DEFAULT 'IN_SERVICE',
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.asset_handovers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        asset_id UUID,
        handed_to UUID,
        condition_notes TEXT,
        handover_type TEXT,
        handover_date TIMESTAMPTZ DEFAULT now(),
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    // Approval workflows
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.approval_matrices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT,
        description TEXT,
        rules JSONB,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.approval_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        matrix_id UUID,
        target_table TEXT,
        target_id UUID,
        requested_by UUID,
        status TEXT DEFAULT 'PENDING',
        meta JSONB,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.approval_steps (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        request_id UUID,
        step_order INTEGER,
        approver_id UUID,
        status TEXT DEFAULT 'PENDING',
        decision_at TIMESTAMPTZ,
        comment TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    // Inventory & material usage
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.inventory_parts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sku TEXT UNIQUE,
        name TEXT,
        quantity INTEGER DEFAULT 0,
        unit_cost NUMERIC(12,2),
        location TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.material_usage (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ticket_id UUID,
        part_id UUID,
        quantity INTEGER,
        cost NUMERIC(12,2),
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.escalation_rules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT,
        threshold_amount NUMERIC(12,2),
        matrix_id UUID,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    console.log('ERP core schema applied successfully.');
  } catch (error) {
    console.error('Error running ERP core migration:', error);
  } finally {
    await client.end();
  }
}

migrate();
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rvlnwpsijbzcqxutsgwy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2bG53cHNpamJ6Y3F4dXRzZ3d5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMjEwNjMsImV4cCI6MjA5NzY5NzA2M30.gL_b8YOgRrM9DC5zm7-iert2O16AEQV8WFmyeG1Ek94';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function migrate() {
  console.log('=== Starting ERP Core Migration ===\n');

  const queries = [
    // 1. LEASING & CONTRACTS
    `
      CREATE TABLE IF NOT EXISTS leases (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
        unit_ref TEXT,
        tenant_id UUID,
        tenant_name TEXT,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        monthly_rent NUMERIC(18,4) NOT NULL,
        security_deposit NUMERIC(18,4) NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','expiring','terminated','closed')),
        host_id UUID,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `,
    `
      CREATE TABLE IF NOT EXISTS rent_schedules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        lease_id UUID REFERENCES leases(id) ON DELETE CASCADE,
        due_date DATE NOT NULL,
        amount NUMERIC(18,4) NOT NULL,
        status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid','partially_paid','paid','overdue')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `,
    `
      CREATE TABLE IF NOT EXISTS pdcs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        lease_id UUID REFERENCES leases(id) ON DELETE CASCADE,
        cheque_number TEXT NOT NULL,
        bank_name TEXT NOT NULL,
        amount NUMERIC(18,4) NOT NULL,
        deposit_date DATE NOT NULL,
        status TEXT NOT NULL DEFAULT 'held' CHECK (status IN ('held','deposited','cleared','bounced','returned')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `,

    // 2. FINANCE (Extended)
    `
      CREATE TABLE IF NOT EXISTS ar_ledgers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID,
        lease_id UUID REFERENCES leases(id) ON DELETE SET NULL,
        reference TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('invoice','receipt','credit_note','debit_note')),
        date DATE NOT NULL,
        amount NUMERIC(18,4) NOT NULL,
        balance NUMERIC(18,4) NOT NULL,
        status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','partial','closed')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `,

    // 3. FIXED ASSETS
    `
      CREATE TABLE IF NOT EXISTS public.fixed_assets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        property_id UUID,
        unit_ref TEXT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        barcode TEXT,
        purchase_date DATE,
        purchase_value NUMERIC(10,2),
        current_value NUMERIC(10,2),
        depreciation_rate NUMERIC(5,2),
        status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'disposed')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `,
    `
      CREATE TABLE IF NOT EXISTS asset_handovers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        asset_id UUID REFERENCES fixed_assets(id) ON DELETE CASCADE,
        lease_id UUID REFERENCES leases(id) ON DELETE SET NULL,
        type TEXT NOT NULL CHECK (type IN ('move_in','move_out','inspection')),
        condition TEXT NOT NULL,
        notes TEXT,
        date TIMESTAMPTZ NOT NULL DEFAULT now(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `,

    // 4. APPROVAL WORKFLOWS
    `
      CREATE TABLE IF NOT EXISTS approval_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        target_record_id UUID NOT NULL,
        target_table TEXT NOT NULL,
        requested_by TEXT NOT NULL,
        amount NUMERIC(18,4),
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `,

    // 5. MAINTENANCE (Extended)
    `
      CREATE TABLE IF NOT EXISTS inventory_parts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        sku TEXT,
        quantity_on_hand INTEGER NOT NULL DEFAULT 0,
        unit_cost NUMERIC(18,4) NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `,
    `
      CREATE TABLE IF NOT EXISTS material_usage (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ticket_id UUID REFERENCES maintenance_tickets(id) ON DELETE CASCADE,
        part_id UUID REFERENCES inventory_parts(id) ON DELETE SET NULL,
        quantity INTEGER NOT NULL,
        total_cost NUMERIC(18,4) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `
  ];

  for (const sql of queries) {
    const { error } = await supabase.rpc('exec_sql', { sql });
    if (error) {
      console.log('Error executing SQL (might already exist or RPC missing):', error.message);
      // Since exec_sql might not be available, we will print the schema instructions
    } else {
      console.log('✓ Successfully executed migration chunk');
    }
  }

  console.log('\nMigration script finished. If RPC failed, please run the SQL manually in Supabase.');
}

migrate().catch(console.error);
