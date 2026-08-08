const { Client } = require('pg');

async function checkUnitCodes() {
  const client = new Client({ connectionString: "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres" });
  await client.connect();

  const res = await client.query('SELECT unit_code FROM public.units LIMIT 20');
  console.log('Sample unit codes from DB:');
  console.log(res.rows.map(r => r.unit_code));

  await client.end();
}

checkUnitCodes().catch(console.error);
