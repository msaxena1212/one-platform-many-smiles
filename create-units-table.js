import { Client } from 'pg';

async function migrate() {
  const connectionString = "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";
  const client = new Client({ connectionString });

  try {
    console.log('Connecting to Supabase...');
    await client.connect();

    console.log('Creating units table...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.units (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
        unit_ref TEXT NOT NULL,
        room_type TEXT,
        bedrooms INTEGER,
        bathrooms NUMERIC,
        area TEXT,
        price NUMERIC,
        status TEXT DEFAULT 'AVAILABLE',
        municipality_details JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    
    console.log('Table units created successfully.');
  } catch (error) {
    console.error('Error creating units table:', error);
  } finally {
    await client.end();
  }
}

migrate();
