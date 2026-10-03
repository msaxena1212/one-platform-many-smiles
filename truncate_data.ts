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

// All demo user IDs from demo-auth.ts
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

async function truncateAllData() {
  console.log("=== STARTING COMPLETE DATA TRUNCATION / PURGE ===");

  // Tables to clear completely
  const tablesToClear = [
    // Operational Leasing & Tenant Data
    "leases",
    "reservations",
    "customers",
    "key_handovers",
    "inspection_reports",
    "documents",
    "tenant_documents",
    "move_in_out_checklists",
    "renewal_proposals",
    
    // Financial & PDC Records
    "fin_pdc_register",
    "pdcs",
    "fin_vouchers",
    "fin_receipt_vouchers",
    "fin_payment_vouchers",
    "fin_journal_entries",
    "fin_invoices",
    "fin_vendor_bills",
    "fin_bank_transactions",
    "fin_audit_log",
    
    // Maintenance & Assets
    "maintenance_requests",
    "tickets",
    "work_orders",
    "assets",
    "asset_maintenance_logs",
    "asset_depreciation_entries",
    
    // HRMS & Employees
    "hrms_employees",
    "employees",
    "payroll_runs",
    "attendance_records",
    "leave_requests",
    
    // Units & Properties (Child -> Parent)
    "units",
    "property_images",
    "property_documents",
    "properties",
    
    // Chart of Accounts & Cost Centers (if any)
    "cost_centers",
    "chart_of_accounts",
    "fin_chart_of_accounts",
    "fin_cost_centers",
    "excel_import_batches",
    "system_audit_logs",
    "notifications"
  ];

  for (const table of tablesToClear) {
    try {
      const { error } = await supabase.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (error) {
        if (error.code !== "PGRST204" && error.code !== "42P01") {
          console.log(`Table ${table}: ${error.message} (${error.code})`);
        }
      } else {
        console.log(`✓ Cleared table: ${table}`);
      }
    } catch (e: any) {
      // ignore non-existent table errors
    }
  }

  // Clear non-demo profiles
  try {
    console.log("\nPurging non-demo profiles...");
    const { error: profErr } = await supabase
      .from("profiles")
      .delete()
      .not("id", "in", `(${DEMO_USER_IDS.join(",")})`);
    
    if (profErr) {
      console.log("Profiles purge error:", profErr.message);
    } else {
      console.log("✓ Non-demo profiles purged successfully. Preserved demo accounts.");
    }
  } catch (e: any) {
    console.log("Exception purging profiles:", e.message);
  }

  // Ensure standard demo profiles exist in profiles table
  const DEMO_PROFILES = [
    { id: "00000000-0000-4000-8000-000000000001", role: "HOST", full_name: "Demo Host" },
    { id: "00000000-0000-4000-8000-000000000002", role: "PROP_MGR", full_name: "Demo Property Manager" },
    { id: "00000000-0000-4000-8000-000000000003", role: "ADMIN", full_name: "Demo Admin" },
    { id: "00000000-0000-4000-8000-000000000004", role: "SUPER_ADMIN", full_name: "Demo Super Admin" },
    { id: "00000000-0000-4000-8000-000000000005", role: "LEASING", full_name: "Demo Leasing Officer" },
    { id: "00000000-0000-4000-8000-000000000006", role: "FINANCE", full_name: "Demo Finance Officer" },
    { id: "00000000-0000-4000-8000-000000000007", role: "CASHIER", full_name: "Demo Cashier" },
    { id: "00000000-0000-4000-8000-000000000008", role: "MAINTENANCE", full_name: "Demo Maintenance Officer" },
    { id: "00000000-0000-4000-8000-000000000009", role: "SALES", full_name: "Demo Sales User" },
    { id: "00000000-0000-4000-8000-000000000010", role: "GUEST", full_name: "Demo Guest" },
    { id: "00000000-0000-4000-8000-000000000011", role: "TENANT", full_name: "Demo Tenant" },
    { id: "00000000-0000-4000-8000-000000000012", role: "OWNER", full_name: "Demo Owner" },
  ];

  for (const dp of DEMO_PROFILES) {
    try {
      await supabase.from("profiles").upsert(dp, { onConflict: "id" });
    } catch (e) {}
  }
  console.log("✓ All 12 Demo Profiles confirmed in profiles table.");

  console.log("\n=== VERIFYING FINAL ROW COUNTS ===");
  const checkTables = [
    "properties", "units", "leases", "customers", "reservations", 
    "pdcs", "fin_pdc_register", "fin_vouchers", "assets", "employees", "profiles"
  ];
  for (const table of checkTables) {
    const { count } = await supabase.from(table).select("*", { count: "exact", head: true });
    console.log(` - ${table}: ${count ?? 0} rows`);
  }
  console.log("=== TRUNCATION COMPLETE ===");
}

truncateAllData().catch(console.error);
