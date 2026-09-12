import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'supabase/migrations/20260824110000_procurement_phase20_supplier_performance.sql',
  'src/lib/procurement/supplierPerformance.ts',
  'src/components/procurement-module.tsx',
];
const checks = [];
for (const f of required) checks.push([`exists:${f}`, fs.existsSync(path.join(root, f))]);
const sql = fs.readFileSync(path.join(root, required[0]), 'utf8');
for (const token of ['procurement_supplier_performance','PROCUREMENT_SUPPLIER_PERFORMANCE','OTIF','quality_acceptance_rate','award_rate','concentration_flag','performance_score','methodology']) checks.push([`sql:${token}`, sql.includes(token)]);
const service = fs.readFileSync(path.join(root, required[1]), 'utf8');
for (const token of ['getProcurementSupplierPerformance','ProcurementSupplierPerformance','concentrationThreshold']) checks.push([`service:${token}`, service.includes(token)]);
const ui = fs.readFileSync(path.join(root, required[2]), 'utf8');
for (const token of ['supplier-performance','Supplier Performance','getProcurementSupplierPerformance','Refresh Supplier Performance','performance_score']) checks.push([`ui:${token}`, ui.includes(token)]);
const failed = checks.filter(([, ok]) => !ok);
console.log(`PROCUREMENT_PHASE20_VALIDATION=${failed.length ? 'FAILED' : 'PASSED'}`);
console.log(`checks=${checks.length}`);
for (const [name, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
if (failed.length) process.exit(1);
