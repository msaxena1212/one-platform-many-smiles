import fs from 'node:fs';

const migration = 'supabase/migrations/20260824050000_procurement_phase14_policy_doa.sql';
const service = 'src/lib/procurement/policy.ts';
const ui = 'src/components/procurement-module.tsx';
const approval = 'src/lib/procurement/approvals.ts';
const checks = [
  [fs.existsSync(migration), 'phase14 migration'],
  [fs.existsSync(service), 'policy service'],
  [fs.existsSync(ui), 'procurement UI'],
  [fs.existsSync(approval), 'approval service'],
  [fs.readFileSync(migration,'utf8').includes('procurement_policy_versions'), 'versioned policy table'],
  [fs.readFileSync(migration,'utf8').includes('procurement_policy_rules'), 'policy rules table'],
  [fs.readFileSync(migration,'utf8').includes('procurement_approval_delegations'), 'delegation table'],
  [fs.readFileSync(migration,'utf8').includes('proc_resolve_approval_policy'), 'approval policy resolver'],
  [fs.readFileSync(migration,'utf8').includes('trg_proc_po_approval_policy'), 'database approval enforcement'],
  [fs.readFileSync(migration,'utf8').includes('effective_from') && fs.readFileSync(migration,'utf8').includes('effective_to'), 'effective dating'],
  [fs.readFileSync(migration,'utf8').includes("enforcement_mode TEXT"), 'controlled enforcement mode'],
  [fs.readFileSync(ui,'utf8').includes('Policy & DoA'), 'policy UI'],
  [fs.readFileSync(ui,'utf8').includes('Create Draft Version'), 'policy version creation UI'],
  [fs.readFileSync(ui,'utf8').includes('Add Approval Rule'), 'approval rule UI'],
  [fs.readFileSync(ui,'utf8').includes('Create Delegation'), 'delegation UI'],
];
const failed = checks.filter(([ok])=>!ok);
if (failed.length) { console.error('PROCUREMENT_PHASE14_VALIDATION=FAILED'); failed.forEach(([,name])=>console.error(`missing=${name}`)); process.exit(1); }
console.log('PROCUREMENT_PHASE14_VALIDATION=PASSED');
console.log(`checks=${checks.length}`);
