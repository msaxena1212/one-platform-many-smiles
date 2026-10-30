import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const files = [
  'supabase/migrations/20260824080000_procurement_phase17_approval_intelligence.sql',
  'src/lib/procurement/approvalIntelligence.ts',
  'src/components/procurement-module.tsx',
];
const checks = [];
for (const file of files) checks.push([`exists:${file}`, fs.existsSync(path.join(root,file))]);
const sql = fs.readFileSync(path.join(root, files[0]), 'utf8');
const ts = fs.readFileSync(path.join(root, files[1]), 'utf8');
const ui = fs.readFileSync(path.join(root, files[2]), 'utf8');
const requiredSql = [
  'proc_approval_intelligence_dashboard','sla_compliance_percent','rejection_rate_percent',
  'escalation_rate_percent','delegation_utilization_percent','workload_by_role','bottlenecks',
  'high_value_requests','monthly_trends','health_score'
];
for (const x of requiredSql) checks.push([`sql:${x}`, sql.includes(x)]);
for (const x of ['getProcurementApprovalIntelligence','ProcurementApprovalIntelligence']) checks.push([`ts:${x}`, ts.includes(x)]);
for (const x of ['Approval Intelligence','Approval Intelligence & SLA Health','SLA Compliance','Bottlenecks','Workload by Role','High-Value Approvals']) checks.push([`ui:${x}`, ui.includes(x)]);
const failed = checks.filter(([,ok])=>!ok);
console.log(`PROCUREMENT_PHASE17_VALIDATION=${failed.length ? 'FAILED' : 'PASSED'}`);
console.log(`checks=${checks.length}`);
for (const [name,ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
if (failed.length) process.exit(1);
