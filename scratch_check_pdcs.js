import { Client } from 'pg';

const connectionString = "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

async function checkPDCs() {
  const client = new Client({ connectionString });
  await client.connect();

  const count = await client.query(`SELECT COUNT(*) FROM public.pdcs`);
  console.log('Total PDCs in DB:', count.rows[0].count);

  const sample = await client.query(`SELECT * FROM public.pdcs LIMIT 5`);
  console.log('Sample PDCs:', sample.rows);

  await client.end();
}

checkPDCs().catch(console.error);
