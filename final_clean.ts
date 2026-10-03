import { Client } from "pg";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL || "postgresql://postgres.rnebpqnzignwjeukgztz:A6TeHnuvQfFqMHMZ@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

// Demo UUIDs from demo-auth.ts
const DEMO_USER_IDS = [
  "00000000-0000-4000-8000-000000000001",
  "00000000-0000-4000-8000-000000000002",
  "00000000-0000-4000-8000-000000000003",
  "00000000-0000-4000-8000-000000000004",
  "00000000-0000-4000-8000-000000000005",
  "00000000-0000-4000-8000-000000000006",
  "00000000-0000-4000-8000-000000000007",
  "00000000-0000-4000-8000-000000000008",
  "00000000-0000-4000-8000-000000000009",
  "00000000-0000-4000-8000-000000000010",
  "00000000-0000-4000-8000-000000000011",
  "00000000-0000-4000-8000-000000000012",
];

async function finalClean() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log("=== CONNECTED TO POSTGRESQL DIRECTLY ===\n");

  try {
    // Step 1: Get all public tables
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    const allTables = tablesRes.rows.map((r: any) => r.table_name);
    console.log(`Found ${allTables.length} public tables.\n`);

    // Step 2: Truncate ALL tables except profiles (CASCADE handles dependencies)
    const skip = new Set(["profiles"]);
    console.log("=== TRUNCATING ALL NON-PROFILE TABLES ===");
    for (const table of allTables) {
      if (skip.has(table)) continue;
      try {
        await client.query(`TRUNCATE TABLE public."${table}" CASCADE;`);
        console.log(`✓ ${table}`);
      } catch (err: any) {
        console.log(`⚠️  ${table}: ${err.message}`);
      }
    }

    // Step 3: Clear profiles - keep ONLY demo users
    console.log("\n=== PURGING NON-DEMO PROFILES ===");
    const quotedIds = DEMO_USER_IDS.map(id => `'${id}'`).join(", ");
    const delRes = await client.query(`
      DELETE FROM public.profiles
      WHERE id NOT IN (${quotedIds});
    `);
    console.log(`✓ Deleted ${delRes.rowCount} non-demo profile rows.`);

    // Step 4: List remaining profiles
    const profRes = await client.query(`SELECT id, role, full_name FROM public.profiles ORDER BY full_name;`);
    console.log(`\n=== REMAINING PROFILES (${profRes.rowCount}) ===`);
    for (const p of profRes.rows) {
      console.log(`  [${p.role}] ${p.full_name} (${p.id})`);
    }

    // Step 5: Final row count verification
    console.log("\n=== FINAL ROW COUNTS ===");
    const checkTables = [
      "properties", "units", "leases", "customers", "reservations",
      "pdcs", "fin_pdc_register", "fin_vouchers", "assets",
      "employees", "profiles", "bookings", "fin_pdc_register",
      "erp_chart_of_accounts", "fin_cost_centers", "fin_bank_accounts",
      "hrms_payroll_payslips", "proc_purchase_orders",
    ];
    for (const t of checkTables) {
      try {
        const c = await client.query(`SELECT COUNT(*) FROM public."${t}"`);
        console.log(`  ${t}: ${c.rows[0].count} rows`);
      } catch { /* skip non-existent */ }
    }

    console.log("\n✅ ALL DONE — Database is clean except demo profiles.");
  } catch (err: any) {
    console.error("ERROR:", err.message);
    throw err;
  } finally {
    await client.end();
  }
}

finalClean().catch(console.error);
