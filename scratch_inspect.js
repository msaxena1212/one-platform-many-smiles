import { Client } from 'pg';

const connectionString = "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

async function checkMore() {
  const client = new Client({ connectionString });
  await client.connect();

  for (const tableName of ['mst_unit_codes', 'erp_chart_of_accounts', 'units']) {
    const cols = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name='${tableName}'`);
    console.log(`\nColumns for ${tableName}:`, cols.rows.map(c => `${c.column_name} (${c.data_type})`));
    const sample = await client.query(`SELECT * FROM public.${tableName} LIMIT 3`);
    console.log(`Sample data for ${tableName}:`, sample.rows);
  }

  await client.end();
}

checkMore().catch(console.error);
