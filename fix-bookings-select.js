import { Client } from 'pg';

async function migrate() {
  const connectionString = "postgresql://postgres.rvlnwpsijbzcqxutsgwy:IzkXrKVvcnf4pwpS@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres";
  const client = new Client({ connectionString });
  
  try {
    console.log("Connecting to Supabase...");
    await client.connect();

    console.log("Adding RLS policy for SELECT on bookings...");
    await client.query(`
      DROP POLICY IF EXISTS "Allow public selects" ON public.bookings;
      CREATE POLICY "Allow public selects" ON public.bookings FOR SELECT USING (true);
      
      -- Let's also do UPDATE just in case
      DROP POLICY IF EXISTS "Allow public updates" ON public.bookings;
      CREATE POLICY "Allow public updates" ON public.bookings FOR UPDATE USING (true);
    `);

    console.log("Policy updated!");
  } catch (error) {
    console.error("Error running migration:", error);
  } finally {
    await client.end();
  }
}

migrate();
