import { Client } from 'pg';

async function migrate() {
  const connectionString = "postgresql://postgres.rvlnwpsijbzcqxutsgwy:IzkXrKVvcnf4pwpS@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres";
  const client = new Client({ connectionString });
  
  try {
    console.log("Connecting to Supabase...");
    await client.connect();

    console.log("Adding room_details column...");
    await client.query(`
      ALTER TABLE public.properties
      ADD COLUMN IF NOT EXISTS room_details JSONB DEFAULT '{}'::jsonb;
    `);

    console.log("Migration successful!");
  } catch (error) {
    console.error("Error running migration:", error);
  } finally {
    await client.end();
  }
}

migrate();
