import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const migration = path.join(root, 'supabase/migrations/20260824090000_procurement_phase18_risk_intelligence.sql');
const service = path.join(root, 'src/lib/procurement/riskIntelligence.ts');
const component = path.join(root, 'src/components/procurement-module.tsx');
const required = [
  [migration, 'proc_approval_risk_intelligence'],
  [migration, 'APPROVAL_BYPASS'],
  [migration, 'SOD_SUBMITTER_APPROVER'],
  [migration, 'REPEATED_REJECTION'],
  [migration, 'SLA_BREACH'],
  [migration, 'HIGH_VALUE_EXPOSURE'],
  [migration, 'role_hotspots'],
  [migration, 'vendor_concentration'],
  [service, 'getProcurementRiskIntelligence'],
  [component, 'risk-intelligence'],
  [component, 'Risk Intelligence'],
  [component, 'getProcurementRiskIntelligence'],
  [path.join(root, 'package.json'), 'procurement:validate:phase18'],
];
let checks = 0;
for (const [file, token] of required) {
  if (!fs.existsSync(file)) throw new Error(`Missing file: ${file}`);
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(token)) throw new Error(`Missing token ${token} in ${file}`);
  checks++;
}
const sql = fs.readFileSync(migration, 'utf8');
if ((sql.match(/CREATE OR REPLACE FUNCTION/g) || []).length < 1) throw new Error('Risk RPC missing');
checks++;
console.log(`PROCUREMENT_PHASE18_VALIDATION=PASSED checks=${checks}`);
