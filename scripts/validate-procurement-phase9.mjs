import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const migrationDir = path.join(root, 'supabase', 'migrations');
const procurementDir = path.join(root, 'src', 'lib', 'procurement');
const errors = [];
const files = fs.readdirSync(migrationDir).filter(f => f.endsWith('.sql')).sort();
const allSql = files.map(f => fs.readFileSync(path.join(migrationDir, f), 'utf8')).join('\n');

const required = [
  '20260823140000_procurement_core.sql',
  '20260823200000_procurement_phase4_hardening.sql',
  '20260823210000_procurement_phase5_orchestration.sql',
  '20260823220000_procurement_phase6_reconciliation_audit.sql',
  '20260823230000_procurement_phase7_release_hardening.sql',
  '20260824000000_procurement_phase8_operational_controls.sql',
  '20260824010000_procurement_phase9_uat_automation.sql',
];

for (const file of required) if (!files.includes(file)) errors.push(`Missing migration: ${file}`);
for (const fn of ['proc_uat_validate_po', 'proc_uat_dashboard']) {
  if (!new RegExp(`CREATE OR REPLACE FUNCTION public\\.${fn}\\b`, 'i').test(allSql)) errors.push(`Missing UAT RPC: ${fn}`);
}

const source = fs.readdirSync(procurementDir).filter(f => /\.(ts|tsx)$/.test(f)).map(f => fs.readFileSync(path.join(procurementDir, f), 'utf8')).join('\n');
for (const rpc of ['proc_uat_validate_po', 'proc_uat_dashboard']) {
  if (source.includes(`rpc('${rpc}'`) && !allSql.includes(`FUNCTION public.${rpc}`)) errors.push(`Frontend calls undeclared RPC: ${rpc}`);
}

const p8 = files.indexOf('20260824000000_procurement_phase8_operational_controls.sql');
const p9 = files.indexOf('20260824010000_procurement_phase9_uat_automation.sql');
if (p8 < 0 || p9 <= p8) errors.push('Phase 9 migration is not ordered after Phase 8.');
if (!fs.existsSync(path.join(procurementDir, 'uat.ts'))) errors.push('Missing frontend UAT service: src/lib/procurement/uat.ts');

if (errors.length) {
  console.error('PROCUREMENT_PHASE9_VALIDATION=FAILED');
  errors.forEach(e => console.error(`- ${e}`));
  process.exit(1);
}

console.log('PROCUREMENT_PHASE9_VALIDATION=PASSED');
console.log('uat_rpcs_checked=2');
console.log('frontend_uat_service=present');
console.log('migration_order=valid');
