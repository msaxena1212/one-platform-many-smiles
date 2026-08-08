const { Client } = require('pg');

async function checkSchemas() {
  const client = new Client({ connectionString: "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres" });
  await client.connect();

  const propsCols = await client.query("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='properties'");
  console.log('Columns in public.properties:');
  console.log(propsCols.rows.map(r => r.column_name));

  const assetsCols = await client.query("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='assets'");
  console.log('Columns in public.assets:');
  console.log(assetsCols.rows.map(r => r.column_name));

  await client.end();
}

checkSchemas().catch(console.error);
