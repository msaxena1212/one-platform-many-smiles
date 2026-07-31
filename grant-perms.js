import pg from 'pg';
const connectionString = "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";
const client = new pg.Client({ connectionString });

async function run() {
  await client.connect();
  try {
    await client.query(`
      GRANT SELECT ON role_permissions TO anon, authenticated;
      -- Force schema cache reload via the internal function if available
      NOTIFY pgrst, 'reload schema';
    `);
    console.log("Grants applied and schema reloaded.");
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}
run();
