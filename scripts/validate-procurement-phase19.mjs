import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'supabase/migrations/20260824100000_procurement_phase19_anomaly_detection.sql',
  'src/lib/procurement/anomalyIntelligence.ts',
  'src/components/procurement-module.tsx',
];
const checks = [];
for (const f of required) checks.push([`exists:${f}`, fs.existsSync(path.join(root, f))]);
const sql = fs.readFileSync(path.join(root, required[0]), 'utf8');
for (const token of ['procurement_anomaly_intelligence','DUPLICATE_PO','PRICE_VARIANCE','SPLIT_PO','UNUSUAL_PO_AMOUNT','AFTER_HOURS_APPROVAL','VENDOR_FREQUENCY','anomaly_score','methodology']) checks.push([`sql:${token}`, sql.includes(token)]);
const ui = fs.readFileSync(path.join(root, required[2]), 'utf8');
for (const token of ['anomalyIntelligence','Anomaly Intelligence','Refresh Anomaly Intelligence','split_po','price_variance']) checks.push([`ui:${token}`, ui.includes(token)]);
const failed = checks.filter(([, ok]) => !ok);
console.log(`PROCUREMENT_PHASE19_VALIDATION=${failed.length ? 'FAILED' : 'PASSED'}`);
console.log(`checks=${checks.length}`);
for (const [name, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
if (failed.length) process.exit(1);
