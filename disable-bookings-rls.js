import { Client } from 'pg';

async function migrate() {
  const connectionString = "postgresql://postgres.rvlnwpsijbzcqxutsgwy:IzkXrKVvcnf4pwpS@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres";
  const client = new Client({ connectionString });
  
  try {
    console.log("Connecting to Supabase...");
    await client.connect();

    console.log("Adding RLS policy for INSERT on bookings...");
    await client.query(`
      DROP POLICY IF EXISTS "Allow public inserts" ON public.bookings;
      CREATE POLICY "Allow public inserts" ON public.bookings FOR INSERT WITH CHECK (true);
    `);

    console.log("Policy updated!");
  } catch (error) {
    console.error("Error running migration:", error);
  } finally {
    await client.end();
  }
}

migrate();
