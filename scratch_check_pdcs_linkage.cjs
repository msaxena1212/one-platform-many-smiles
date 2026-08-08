const { Client } = require('pg');

async function checkPDCs() {
  const client = new Client({ connectionString: "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres" });
  await client.connect();

  const pdcCols = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name='pdcs'");
  console.log('Columns in public.pdcs:', pdcCols.rows.map(r => r.column_name));

  const total = await client.query('SELECT count(*) FROM public.pdcs');
  console.log('Total PDCs in DB:', total.rows[0].count);

  const sample = await client.query('SELECT * FROM public.pdcs LIMIT 5');
  console.log('Sample PDCs:', sample.rows);

  const withProp = await client.query("SELECT count(*) FROM public.pdcs WHERE property_id IS NOT NULL OR property_code IS NOT NULL");
  console.log('PDCs with Property Code/ID:', withProp.rows[0].count);

  const withUnit = await client.query("SELECT count(*) FROM public.pdcs WHERE unit_id IS NOT NULL OR unit_name IS NOT NULL");
  console.log('PDCs with Unit Name/ID:', withUnit.rows[0].count);

  await client.end();
}

checkPDCs().catch(console.error);
