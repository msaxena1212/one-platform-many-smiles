import { Client } from 'pg';
const connectionString = "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";
async function run() {
  const pgClient = new Client({ connectionString });
  await pgClient.connect();
  const res = await pgClient.query("SELECT count(*) FROM auth.users");
  console.log("auth.users count:", res.rows[0].count);
  const empRes = await pgClient.query("SELECT count(*) FROM public.employees");
  console.log("public.employees count:", empRes.rows[0].count);
  await pgClient.end();
}
run();
