const { Client } = require('pg');

async function getUnitsSchema() {
  const client = new Client({ connectionString: "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres" });
  await client.connect();

  const res = await client.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'units'
    ORDER BY column_name;
  `);

  console.log('Columns in public.units:');
  console.log(res.rows.map(r => r.column_name));
  
  await client.end();
}

getUnitsSchema().catch(console.error);
