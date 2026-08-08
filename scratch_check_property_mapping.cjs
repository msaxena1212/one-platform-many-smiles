const { Client } = require('pg');

async function checkPropertyMapping() {
  const client = new Client({ connectionString: "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres" });
  await client.connect();

  const res = await client.query(`
    SELECT count(*) FROM public.units u
    LEFT JOIN public.properties p ON u.property_id = p.id
    WHERE p.id IS NULL
  `);
  console.log(`Units with missing or invalid property_id: ${res.rows[0].count}`);

  const validRes = await client.query(`
    SELECT count(*) FROM public.units u
    JOIN public.properties p ON u.property_id = p.id
  `);
  console.log(`Units with valid property_id: ${validRes.rows[0].count}`);

  await client.end();
}

checkPropertyMapping().catch(console.error);
