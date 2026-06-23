import { Client } from 'pg';

async function migrate() {
  const connectionString = "postgresql://postgres.rvlnwpsijbzcqxutsgwy:IzkXrKVvcnf4pwpS@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres";
  const client = new Client({ connectionString });
  
  try {
    console.log("Connecting to Supabase...");
    await client.connect();

    console.log("Adding state and zip_code columns...");
    await client.query(`
      ALTER TABLE public.properties
      ADD COLUMN IF NOT EXISTS state VARCHAR(255),
      ADD COLUMN IF NOT EXISTS zip_code VARCHAR(50);
    `);

    console.log("Migration successful!");
  } catch (error) {
    console.error("Error running migration:", error);
  } finally {
    await client.end();
  }
}

migrate();
