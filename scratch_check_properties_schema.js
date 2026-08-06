import { Client } from 'pg';

const connectionString = process.env.DATABASE_URL || "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

async function checkPropertiesSchema() {
  const client = new Client({ connectionString });
  await client.connect();

  const cols = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name='properties'`);
  console.log('Columns for properties table:', cols.rows.map(c => `${c.column_name} (${c.data_type})`));

  const sample = await client.query(`SELECT id, title, total_units, max_guests FROM public.properties LIMIT 5`).catch(() => null);
  if (sample) {
    console.log('Sample properties:', sample.rows);
  }

  await client.end();
}

checkPropertiesSchema().catch(console.error);
