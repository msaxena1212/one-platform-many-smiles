import { Client } from 'pg';

async function migrate() {
  const connectionString = "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";
  const client = new Client({ connectionString });

  try {
    console.log('Connecting to Supabase...');
    await client.connect();

    console.log('Applying fixed_assets schema changes...');

    await client.query(`
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
    `);
    console.log('Table fixed_assets created/verified successfully.');
  } catch (error) {
    console.error('Error running migration:', error);
  } finally {
    await client.end();
  }
}

migrate();
