const { Client } = require('pg');

async function checkUnitRooms() {
  const client = new Client({ connectionString: "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres" });
  await client.connect();

  const res = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='unit_rooms'`);
  console.log(`\nColumns in public.unit_rooms:`);
  console.log(res.rows.map(r => `${r.column_name} (${r.data_type})`));

  await client.end();
}

checkUnitRooms().catch(console.error);
