import { Client } from "pg";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL || "postgresql://postgres.rnebpqnzignwjeukgztz:A6TeHnuvQfFqMHMZ@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

async function listAllTables() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log("Public tables in PostgreSQL:");
    for (const r of res.rows) {
      const countRes = await client.query(`SELECT COUNT(*) FROM public."${r.table_name}"`);
      console.log(` - ${r.table_name}: ${countRes.rows[0].count} rows`);
    }

    const profilesRes = await client.query(`SELECT id, role, full_name FROM public.profiles`);
    console.log("\nProfiles in DB:", profilesRes.rows);

  } catch (err: any) {
    console.error("Error inspecting database:", err.message);
  } finally {
    await client.end();
  }
}

listAllTables().catch(console.error);
