import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const required = [
  "src/lib/procurement/uat.ts",
  "src/components/procurement-module.tsx",
  "src/routes/finance.procurement.tsx",
  "supabase/migrations/20260824010000_procurement_phase9_uat_automation.sql",
];
for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) throw new Error(`Missing ${file}`);
}
const moduleText = fs.readFileSync(path.join(root, "src/components/procurement-module.tsx"), "utf8");
const uatText = fs.readFileSync(path.join(root, "src/lib/procurement/uat.ts"), "utf8");
for (const token of ["Command Center", "getProcurementUatDashboard", "validateProcurementUat", "Run E2E UAT"]) {
  if (!moduleText.includes(token)) throw new Error(`Missing UI token: ${token}`);
}
for (const token of ["ProcurementUatDashboard", "proc_uat_dashboard", "proc_uat_validate_po"]) {
  if (!uatText.includes(token)) throw new Error(`Missing UAT service token: ${token}`);
}
console.log("PROCUREMENT_PHASE10_VALIDATION=PASSED");
console.log("command_center=present");
console.log("uat_dashboard=present");
console.log("uat_detail_validation=present");
