import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const migrationDir = path.join(root, 'supabase', 'migrations');
const procurementDir = path.join(root, 'src', 'lib', 'procurement');

const requiredMigrations = [
  '20260823140000_procurement_core.sql',
  '20260823200000_procurement_phase4_hardening.sql',
  '20260823210000_procurement_phase5_orchestration.sql',
  '20260823220000_procurement_phase6_reconciliation_audit.sql',
  '20260823230000_procurement_phase7_release_hardening.sql',
  '20260824000000_procurement_phase8_operational_controls.sql',
];

const requiredTables = [
  'proc_purchase_requests', 'proc_rfx', 'proc_vendor_quotes', 'proc_purchase_orders',
  'proc_shipments', 'proc_gate_inwards', 'proc_goods_receipts', 'proc_grn_lines',
  'proc_landed_costs', 'proc_landed_cost_allocations', 'proc_payable_invoices',
  'proc_payable_invoice_lines', 'proc_purchases', 'proc_purchase_lines',
  'proc_three_way_matches', 'proc_audit_log'
];

const requiredRpcs = [
  'proc_run_three_way_match', 'proc_allocate_landed_cost', 'proc_validate_lifecycle',
  'proc_finalize_purchase', 'proc_reconcile_po', 'proc_release_readiness',
  'proc_schema_smoke_check', 'proc_operational_health'
];

const errors = [];
const files = fs.readdirSync(migrationDir).filter(f => f.endsWith('.sql')).sort();

for (const migration of requiredMigrations) {
  if (!files.includes(migration)) errors.push(`Missing migration: ${migration}`);
}

const migrationText = files
  .map(f => fs.readFileSync(path.join(migrationDir, f), 'utf8'))
  .join('\n');

for (const table of requiredTables) {
  const tablePattern = new RegExp(`CREATE TABLE IF NOT EXISTS public\\.${table}\\b`, 'i');
  const tablePatternAny = new RegExp(`CREATE TABLE public\\.${table}\\b`, 'i');
  if (!tablePattern.test(migrationText) && !tablePatternAny.test(migrationText)) {
    errors.push(`Missing table declaration: ${table}`);
  }
}

for (const rpc of requiredRpcs) {
  const rpcPattern = new RegExp(`CREATE OR REPLACE FUNCTION public\\.${rpc}\\b`, 'i');
  if (!rpcPattern.test(migrationText)) errors.push(`Missing RPC declaration: ${rpc}`);
}

const procurementFiles = fs.readdirSync(procurementDir).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
const procurementText = procurementFiles
  .map(f => fs.readFileSync(path.join(procurementDir, f), 'utf8'))
  .join('\n');
const calledRpcs = [...procurementText.matchAll(/rpc\(['"]([^'"]+)['"]/g)].map(m => m[1]);
for (const rpc of [...new Set(calledRpcs)]) {
  const rpcPattern = new RegExp(`CREATE OR REPLACE FUNCTION public\\.${rpc}\\b`, 'i');
  if (!rpcPattern.test(migrationText)) errors.push(`Frontend calls undeclared RPC: ${rpc}`);
}

// Guard against accidental duplicate phase migrations.
const phaseNames = files.filter(f => /procurement_phase[4-9]/i.test(f));
if (new Set(phaseNames).size !== phaseNames.length) errors.push('Duplicate Procurement phase migration filename detected.');

// Ensure the release-hardening migration is lexically after the earlier phases.
const phaseOrder = requiredMigrations.map(f => files.indexOf(f));
for (let i = 1; i < phaseOrder.length; i++) {
  if (phaseOrder[i] <= phaseOrder[i - 1]) errors.push(`Migration order is invalid around ${requiredMigrations[i]}.`);
}

if (errors.length) {
  console.error('PROCUREMENT_PHASE8_VALIDATION=FAILED');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('PROCUREMENT_PHASE8_VALIDATION=PASSED');
console.log(`migrations_checked=${requiredMigrations.length}`);
console.log(`tables_checked=${requiredTables.length}`);
console.log(`rpcs_checked=${requiredRpcs.length}`);
console.log(`frontend_rpc_calls_checked=${new Set(calledRpcs).size}`);
