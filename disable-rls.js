import { Client } from 'pg';

async function fixRLS() {
  // Correct project DB from .env.local
  const connectionString = "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";
  const client = new Client({ connectionString });
  
  try {
    console.log("Connecting to Supabase project rnebpqnzignwjeukgztz...");
    await client.connect();

    console.log("Dropping old restrictive INSERT policy...");
    await client.query(`DROP POLICY IF EXISTS "Hosts can insert their properties" ON public.properties;`);

    console.log("Dropping any existing open insert policy...");
    await client.query(`DROP POLICY IF EXISTS "Allow public inserts" ON public.properties;`);
    await client.query(`DROP POLICY IF EXISTS "Authenticated users can insert properties" ON public.properties;`);

    console.log("Creating open INSERT policy (allow all)...");
    await client.query(`CREATE POLICY "Allow public inserts" ON public.properties FOR INSERT WITH CHECK (true);`);

    console.log("✅ Policy updated! Properties can now be inserted by any user.");
  } catch (error) {
    console.error("❌ Error running migration:", error);
  } finally {
    await client.end();
  }
}

fixRLS();
