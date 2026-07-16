import { Client } from 'pg';

async function runMigrate() {
  const connectionString = "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";
  const client = new Client({ connectionString });
  try {
    await client.connect();
    await client.query("ALTER TABLE public.fixed_assets ADD COLUMN IF NOT EXISTS barcode TEXT;");
    console.log("Added barcode column to fixed_assets");
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

runMigrate();
