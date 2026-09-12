import fs from 'node:fs';

const migration = 'supabase/migrations/20260824030000_procurement_phase12_analytics.sql';
const service = 'src/lib/procurement/analytics.ts';
const ui = 'src/components/procurement-module.tsx';
const checks = [
  [fs.existsSync(migration), 'phase12 migration'],
  [fs.existsSync(service), 'analytics service'],
  [fs.existsSync(ui), 'procurement UI'],
  [fs.readFileSync(migration,'utf8').includes('proc_analytics_dashboard'), 'analytics RPC'],
  [fs.readFileSync(migration,'utf8').includes('spend_by_month'), 'spend trend'],
  [fs.readFileSync(migration,'utf8').includes('vendor_performance'), 'vendor performance'],
  [fs.readFileSync(migration,'utf8').includes('overdue_purchase_orders'), 'SLA overdue POs'],
  [fs.readFileSync(migration,'utf8').includes('open_exceptions'), 'exception aging'],
  [fs.readFileSync(ui,'utf8').includes('Management Analytics'), 'analytics UI'],
];
const failed = checks.filter(([ok])=>!ok);
if (failed.length) { console.error('PROCUREMENT_PHASE12_VALIDATION=FAILED'); failed.forEach(([,name])=>console.error(`missing=${name}`)); process.exit(1); }
console.log('PROCUREMENT_PHASE12_VALIDATION=PASSED');
console.log(`checks=${checks.length}`);
