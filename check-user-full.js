import pg from 'pg';
const connectionString = "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";
const client = new pg.Client({ connectionString });

async function checkUser() {
  await client.connect();
  try {
    const res = await client.query("SELECT * FROM auth.users WHERE email = 'emp1@zyno.com'");
    console.log(res.rows[0]);
  } finally {
    await client.end();
  }
}
checkUser();
