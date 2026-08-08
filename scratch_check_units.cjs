const { Client } = require('pg');

async function checkUnits() {
  const client = new Client({ connectionString: "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres" });
  await client.connect();

  const cols = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name='units'");
  console.log('Columns in public.units:', cols.rows.map(r => r.column_name));

  const sample = await client.query('SELECT * FROM public.units LIMIT 3');
  console.log('Sample unit rows:', sample.rows);

  await client.end();
}

checkUnits().catch(console.error);
