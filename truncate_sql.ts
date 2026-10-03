import { Client } from "pg";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL || "postgresql://postgres.rnebpqnzignwjeukgztz:A6TeHnuvQfFqMHMZ@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

const DEMO_USER_IDS = [
  "00000000-0000-4000-8000-000000000001", // HOST
  "00000000-0000-4000-8000-000000000002", // PROP_MGR
  "00000000-0000-4000-8000-000000000003", // ADMIN
  "00000000-0000-4000-8000-000000000004", // SUPER_ADMIN
  "00000000-0000-4000-8000-000000000005", // LEASING
  "00000000-0000-4000-8000-000000000006", // FINANCE
  "00000000-0000-4000-8000-000000000007", // CASHIER
  "00000000-0000-4000-8000-000000000008", // MAINTENANCE
  "00000000-0000-4000-8000-000000000009", // SALES
  "00000000-0000-4000-8000-000000000010", // GUEST
  "00000000-0000-4000-8000-000000000011", // TENANT
  "00000000-0000-4000-8000-000000000012", // OWNER
];

async function truncateDirectSQL() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log("=== CONNECTED TO POSTGRESQL DIRECTLY ===");

  try {
    // 1. Get all public table names
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);

    const allTables = tablesRes.rows.map(r => r.table_name);
    console.log(`Discovered ${allTables.length} tables in public schema.`);

    // 2. Tables to TRUNCATE (all tables except profiles and system settings if any)
    const tablesToTruncate = allTables.filter(t => t !== "profiles" && t !== "schema_migrations");

    console.log("Truncating tables in cascade mode...");
    for (const table of tablesToTruncate) {
      try {
        await client.query(`TRUNCATE TABLE public."${table}" CASCADE;`);
        console.log(`✓ Truncated: ${table}`);
      } catch (err: any) {
        console.log(`⚠️ Note on ${table}: ${err.message}`);
      }
    }

    // 3. Purge non-demo profiles from profiles table
    console.log("\nPurging non-demo profiles from public.profiles...");
    const quotedIds = DEMO_USER_IDS.map(id => `'${id}'`).join(", ");
    const delProfiles = await client.query(`
      DELETE FROM public.profiles 
      WHERE id NOT IN (${quotedIds});
    `);
    console.log(`✓ Deleted ${delProfiles.rowCount} non-demo profiles.`);

    // 4. Ensure standard demo profiles are present
    console.log("Ensuring demo profiles exist...");
    const demoRecords = [
      ["00000000-0000-4000-8000-000000000001", "HOST", "Demo Host"],
      ["00000000-0000-4000-8000-000000000002", "PROP_MGR", "Demo Property Manager"],
      ["00000000-0000-4000-8000-000000000003", "ADMIN", "Demo Admin"],
      ["00000000-0000-4000-8000-000000000004", "SUPER_ADMIN", "Demo Super Admin"],
      ["00000000-0000-4000-8000-000000000005", "LEASING", "Demo Leasing Officer"],
      ["00000000-0000-4000-8000-000000000006", "FINANCE", "Demo Finance Officer"],
      ["00000000-0000-4000-8000-000000000007", "CASHIER", "Demo Cashier"],
      ["00000000-0000-4000-8000-000000000008", "MAINTENANCE", "Demo Maintenance Officer"],
      ["00000000-0000-4000-8000-000000000009", "SALES", "Demo Sales User"],
      ["00000000-0000-4000-8000-000000000010", "GUEST", "Demo Guest"],
      ["00000000-0000-4000-8000-000000000011", "TENANT", "Demo Tenant"],
      ["00000000-0000-4000-8000-000000000012", "OWNER", "Demo Owner"],
    ];

    for (const [id, role, name] of demoRecords) {
      await client.query(`
        INSERT INTO public.profiles (id, role, full_name)
        VALUES ($1, $2, $3)
        ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, full_name = EXCLUDED.full_name;
      `, [id, role, name]);
    }
    console.log("✓ All 12 Demo Profiles confirmed in public.profiles.");

    // 5. Verification
    console.log("\n=== POST-TRUNCATE ROW COUNTS ===");
    for (const table of allTables) {
      const c = await client.query(`SELECT COUNT(*) FROM public."${table}"`);
      console.log(` - ${table}: ${c.rows[0].count} rows`);
    }

    console.log("\n✅ TRUNCATION COMPLETED SUCCESSFULLY!");
  } catch (err: any) {
    console.error("FATAL ERROR during truncate:", err.message);
  } finally {
    await client.end();
  }
}

truncateDirectSQL().catch(console.error);
