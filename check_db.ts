import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Read .env.local manually
const envPath = path.join(process.cwd(), ".env.local");
const envContent = fs.readFileSync(envPath, "utf8");
const env: Record<string, string> = {};
envContent.split("\n").forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || "";
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    env[match[1]] = value;
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL || "https://rnebpqnzignwjeukgztz.supabase.co";
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  console.log("=== Checking Supabase Tables ===");
  const tables = [
    "properties", "units", "leases", "customers", "reservations", 
    "pdcs", "fin_pdc_register", "fin_vouchers", "fin_journal_entries",
    "key_handovers", "inspection_reports", "documents", "tickets", 
    "maintenance_requests", "assets", "profiles", "employees",
    "hrms_employees", "notifications", "system_configs", "excel_import_batches"
  ];

  for (const table of tables) {
    try {
      const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
      if (error) {
        // ignore
      } else {
        console.log(`Table ${table}: ${count} rows`);
      }
    } catch (e: any) {
      console.log(`Table ${table}: exception - ${e.message}`);
    }
  }

  console.log("\n=== Checking profiles / demo users ===");
  const { data: profiles, error: pErr } = await supabase.from("profiles").select("id, role, full_name, email");
  if (profiles) {
    console.log(`Profiles (${profiles.length}):`);
    profiles.forEach(p => console.log(` - [${p.role}] ${p.full_name} (${(p as any).email || p.id})`));
  } else {
    console.log("Profiles error:", pErr);
  }
}

main().catch(console.error);
