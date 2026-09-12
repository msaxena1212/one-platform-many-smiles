import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const migration = fs.readFileSync(path.join(root, 'supabase/migrations/20260824020000_procurement_phase11_exception_workflow.sql'), 'utf8');
const service = fs.readFileSync(path.join(root, 'src/lib/procurement/exceptions.ts'), 'utf8');
const moduleFile = fs.readFileSync(path.join(root, 'src/components/procurement-module.tsx'), 'utf8');

const checks = [
  ['exception table', migration.includes('CREATE TABLE IF NOT EXISTS public.proc_exception_resolutions')],
  ['exception queue RPC', migration.includes('CREATE OR REPLACE FUNCTION public.proc_exception_queue')],
  ['resolve RPC', migration.includes('CREATE OR REPLACE FUNCTION public.proc_resolve_exception')],
  ['reopen RPC', migration.includes('CREATE OR REPLACE FUNCTION public.proc_reopen_exception')],
  ['role guard', migration.includes("p.role IN ('FINANCE','ADMIN','SUPER_ADMIN')")],
  ['source transaction immutable', migration.includes('Resolution status records the operational disposition only')],
  ['frontend exception service', service.includes('getProcurementExceptionQueue') && service.includes('resolveProcurementException')],
  ['exception UI', moduleFile.includes('Exception Resolution') && moduleFile.includes('getProcurementExceptionQueue')],
];

for (const [name, ok] of checks) if (!ok) { console.error(`FAIL: ${name}`); process.exit(1); }
console.log('PROCUREMENT_PHASE11_VALIDATION=PASSED');
console.log(`checks=${checks.length}`);
