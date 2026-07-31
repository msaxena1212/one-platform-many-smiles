import pg from 'pg';
const connectionString = "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";
const client = new pg.Client({ connectionString });

async function run() {
  await client.connect();
  try {
    await client.query(`
      ALTER TABLE role_permissions ALTER COLUMN tenant_id TYPE text;
      NOTIFY pgrst, 'reload schema';
    `);
    console.log("Altered tenant_id to text and reloaded schema.");
  } catch (e) {
    console.error("Error altering column:", e);
  } finally {
    await client.end();
  }
}
run();
