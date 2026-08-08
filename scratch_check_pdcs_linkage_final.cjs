const { Client } = require('pg');

async function checkPDCsLinkage() {
  const client = new Client({ connectionString: "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres" });
  await client.connect();

  const pdcCols = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name='pdcs'");
  console.log('Columns in public.pdcs:');
  console.log(pdcCols.rows.map(r => r.column_name));

  const sample = await client.query('SELECT * FROM public.pdcs LIMIT 1');
  console.log('Sample PDC:', sample.rows[0]);

  const unlinked = await client.query('SELECT COUNT(*) FROM public.pdcs WHERE property_code IS NULL OR unit_name IS NULL');
  console.log(`Unlinked PDCs (missing property_code or unit_name): ${unlinked.rows[0].count}`);

  await client.end();
}

checkPDCsLinkage().catch(console.error);
