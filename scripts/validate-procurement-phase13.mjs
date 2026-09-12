import fs from 'node:fs';

const migration = 'supabase/migrations/20260824040000_procurement_phase13_governance.sql';
const service = 'src/lib/procurement/governance.ts';
const ui = 'src/components/procurement-module.tsx';
const checks = [
  [fs.existsSync(migration), 'phase13 migration'],
  [fs.existsSync(service), 'governance service'],
  [fs.existsSync(ui), 'procurement UI'],
  [fs.readFileSync(migration,'utf8').includes('proc_governance_dashboard'), 'governance RPC'],
  [fs.readFileSync(migration,'utf8').includes('ACTORLESS_AUDIT'), 'audit identity policy'],
  [fs.readFileSync(migration,'utf8').includes('SOD_SAME_ACTOR'), 'segregation of duties policy'],
  [fs.readFileSync(migration,'utf8').includes('HIGH_VALUE_APPROVAL_REVIEW'), 'approval threshold policy'],
  [fs.readFileSync(migration,'utf8').includes('vendor_concentration'), 'vendor concentration reporting'],
  [fs.readFileSync(migration,'utf8').includes('OPEN_CRITICAL_EXCEPTION'), 'critical exception policy'],
  [fs.readFileSync(ui,'utf8').includes('Governance & Compliance'), 'governance UI'],
];
const failed = checks.filter(([ok])=>!ok);
if (failed.length) { console.error('PROCUREMENT_PHASE13_VALIDATION=FAILED'); failed.forEach(([,name])=>console.error(`missing=${name}`)); process.exit(1); }
console.log('PROCUREMENT_PHASE13_VALIDATION=PASSED');
console.log(`checks=${checks.length}`);
