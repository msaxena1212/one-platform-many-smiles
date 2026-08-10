import { Client } from 'pg';

async function checkCols() {
  const connectionString = "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";
  const client = new Client({ connectionString });
  try {
    await client.connect();
    const res = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'units';
    `);
    console.log(res.rows.map(r => r.column_name).join(', '));
  } finally {
    await client.end();
  }
}
checkCols();
