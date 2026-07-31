import pg from 'pg';

const connectionString = "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

const client = new pg.Client({
  connectionString,
});

async function run() {
  await client.connect();
  console.log("Connected to Supabase Postgres.");

  try {
    // Notify PostgREST to reload the schema cache so the new table is exposed via the REST API
    await client.query("NOTIFY pgrst, 'reload schema';");
    console.log("Schema cache reloaded successfully.");
  } catch (e) {
    console.error("Error reloading schema cache:", e);
  } finally {
    await client.end();
  }
}

run();
