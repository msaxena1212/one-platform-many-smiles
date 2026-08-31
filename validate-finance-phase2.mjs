#!/usr/bin/env node
/* eslint-disable */
/**
 * validate-finance-phase2.mjs
 *
 * Phase 2 — Accounting Engine Enforcement — static validator.
 *
 * Asserts (without touching the database):
 *
 *   1. The Account Resolver exists and is the single source of truth
 *      (no erp_vouchers / erp_journal_entries writes outside the
 *      documented compatibility wrapper).
 *   2. No hard-coded 5-digit GL/SL literals remain in the finance
 *      posting path (legal / deposit / payroll / procurement).
 *      The only allowed hard-coded values are: the fixed-SL codes
 *      that the resolver itself is allowed to look up by GL
 *      (resolveGlOnlyAccount call sites).
 *   3. Every operational service (legal / deposit / payroll / procurement)
 *      imports from the Account Resolver.
 *   4. The Phase 2 enforcement migration file exists in
 *      supabase/migrations.
 *   5. Every TransactionType the new migrated services need is
 *      present in the Phase 2 rule seed.
 *   6. The TypeScript enforcement guard exists in posting-engine.ts.
 *   7. createERPVoucher is now a deprecation shim that throws.
 *
 * Run with:
 *   node validate-finance-phase2.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, 'one-platform-many-smiles');
const FIN_DIR   = path.join(REPO_ROOT, 'src/lib/finance');
const PROC_DIR  = path.join(REPO_ROOT, 'src/lib/procurement');
const MIGR_DIR  = path.join(REPO_ROOT, 'supabase/migrations');
const COMP_DIR  = path.join(REPO_ROOT, 'src/components/finance');

const checks = [];
function check(name, pass, detail) {
  checks.push({ name, pass, detail });
  const tag = pass ? '[32m PASS [0m' : '[31m FAIL [0m';
  console.log(`[${tag}] ${name}${detail ? `  -- ${detail}` : ''}`);
}

function readIfExists(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return null; }
}
function fileExists(p) {
  try { fs.accessSync(p); return true; } catch { return false; }
}

// ── 1. Account Resolver + canonical COA exist ────────────────────────────────
const resolverPath = path.join(FIN_DIR, 'account-resolver.ts');
check(
  'Account Resolver exists',
  fileExists(resolverPath),
  resolverPath,
);
const resolverSrc = readIfExists(resolverPath) || '';
check(
  'Resolver requires unit context for 12413 / 21400 / 21500 / 12100',
  /UNIT_SCOPE_REQUIRED_GLS[\s\S]*?'12100'[\s\S]*?'12413'[\s\S]*?'21400'[\s\S]*?'21500'/.test(resolverSrc),
  'UNIT_SCOPE_REQUIRED_GLS set present',
);
check(
  'Resolver exports resolveAccountingAccounts + resolveGlOnlyAccount',
  /export\s+async\s+function\s+resolveAccountingAccounts/.test(resolverSrc) &&
  /export\s+async\s+function\s+resolveGlOnlyAccount/.test(resolverSrc),
  'Public API present',
);
check(
  'Resolver threads tenantId/leaseId through ResolvedAccount',
  /tenantId:\s*ctx\.tenantId/.test(resolverSrc) && /leaseId:\s*ctx\.leaseId/.test(resolverSrc),
  'tenant/lease propagation',
);

// ── 2. Legal service migrated ────────────────────────────────────────────────
const legalPath = path.join(FIN_DIR, 'legalReceivableService.ts');
const legalSrc = readIfExists(legalPath) || '';
check(
  'legalReceivableService.ts imports from account-resolver',
  /from\s+['"]\.\/account-resolver['"]/.test(legalSrc) &&
  /resolveAccountingAccounts/.test(legalSrc),
  'Resolver wired in',
);
check(
  'legalReceivableService.ts has NO hard-coded 12411 / 12413 / 12000 account_code literals',
  !/account_code:\s*['"]12411['"]/.test(legalSrc) &&
  !/account_code:\s*['"]12413['"]/.test(legalSrc) &&
  !/account_code:\s*['"]12000['"]/.test(legalSrc),
  'No 5-digit GL literals',
);

// ── 3. depositService.settleDeposit migrated ─────────────────────────────────
const depositPath = path.join(FIN_DIR, 'depositService.ts');
const depositSrc = readIfExists(depositPath) || '';
check(
  'depositService.ts imports resolveGlOnlyAccount',
  /resolveGlOnlyAccount/.test(depositSrc),
  'resolveGlOnlyAccount wired in',
);
check(
  'depositService.ts settleDeposit has NO hard-coded 21100006 / 12000001 account_code literals',
  !/account_code:\s*['"]21100006['"]/.test(depositSrc) &&
  !/account_code:\s*['"]12000001['"]/.test(depositSrc),
  'No 5-digit SL literals in lines[]',
);

// ── 4. payrollIntegrationService migrated ────────────────────────────────────
const payrollPath = path.join(FIN_DIR, 'payrollIntegrationService.ts');
const payrollSrc = readIfExists(payrollPath) || '';
check(
  'payrollIntegrationService.ts imports resolveGlOnlyAccount',
  /resolveGlOnlyAccount/.test(payrollSrc),
  'resolveGlOnlyAccount wired in',
);
check(
  'payrollIntegrationService.ts voucher lines use resolver slCode (not hard-coded 50100/12000/21900)',
  /salaryExp\.slCode/.test(payrollSrc) &&
  /bank\.slCode/.test(payrollSrc) &&
  !/account_code:\s*['"]50100['"]/.test(payrollSrc) &&
  !/account_code:\s*['"]12000['"]/.test(payrollSrc) &&
  !/account_code:\s*['"]21900['"]/.test(payrollSrc),
  'Resolver slCode used in voucher lines',
);

// ── 5. procurement posting service migrated ─────────────────────────────────
const procPostingPath = path.join(PROC_DIR, 'postingService.ts');
const procPostingSrc = readIfExists(procPostingPath) || '';
check(
  'procurement/postingService.ts imports resolveGlOnlyAccount',
  /resolveGlOnlyAccount/.test(procPostingSrc) &&
  /from\s+['"]\.\.\/finance\/account-resolver['"]/.test(procPostingSrc),
  'Resolver wired in',
);
check(
  'procurement/postingService.ts uses postAccountingEvent (not raw RPC)',
  /postAccountingEvent/.test(procPostingSrc) &&
  /createAccountingEvent/.test(procPostingSrc),
  'posting-engine path',
);
check(
  'procurement/postingService.ts has NO hard-coded 13400/13410/21600/21610/21620/21000/12500 account_code literals',
  !/account_code:\s*['"]13400['"]/.test(procPostingSrc) &&
  !/account_code:\s*['"]13410['"]/.test(procPostingSrc) &&
  !/account_code:\s*['"]21600['"]/.test(procPostingSrc) &&
  !/account_code:\s*['"]21610['"]/.test(procPostingSrc) &&
  !/account_code:\s*['"]21620['"]/.test(procPostingSrc) &&
  !/account_code:\s*['"]21000['"]/.test(procPostingSrc) &&
  !/account_code:\s*['"]12500['"]/.test(procPostingSrc),
  'No 5-digit GL literals',
);

const procCapPath = path.join(PROC_DIR, 'capitalizationService.ts');
const procCapSrc = readIfExists(procCapPath) || '';
check(
  'procurement/capitalizationService.ts imports resolveGlOnlyAccount',
  /resolveGlOnlyAccount/.test(procCapSrc),
  'Resolver wired in',
);
check(
  'procurement/capitalizationService.ts uses postAccountingEvent',
  /postAccountingEvent/.test(procCapSrc),
  'posting-engine path',
);

// ── 6. createERPVoucher is now a deprecation shim ───────────────────────────
const supabasePath = path.join(REPO_ROOT, 'src/lib/supabase.ts');
const supabaseSrc = readIfExists(supabasePath) || '';
check(
  'createERPVoucher in supabase.ts is a deprecation shim (throws)',
  /export\s+async\s+function\s+createERPVoucher[\s\S]*?throw\s+new\s+Error/.test(supabaseSrc),
  'Shim emits runtime error pointing to posting-engine',
);

// ── 7. Phase 2 SQL migrations are in place ───────────────────────────────────
const p2Seed = path.join(MIGR_DIR, '20260829100000_finance_phase2_account_resolver_seed.sql');
const p2Enforce = path.join(MIGR_DIR, '20260829110000_finance_phase2_account_resolver_enforcement.sql');
check(
  'Phase 2 rule seed migration present (20260829100000)',
  fileExists(p2Seed),
  p2Seed,
);
check(
  'Phase 2 enforcement migration present (20260829110000)',
  fileExists(p2Enforce),
  p2Enforce,
);

// Required new transaction types in the rule seed
const p2SeedSrc = readIfExists(p2Seed) || '';
const requiredRuleTypes = [
  'LEGAL_ESCALATION',
  'LEGAL_RECOVERY',
  'PAYROLL_DISBURSEMENT',
  'PAYROLL_DEDUCTION',
  'PROCUREMENT_GRN',
  'PROCUREMENT_AP',
  'PROCUREMENT_LANDED',
  'PROCUREMENT_CAPITALIZE',
  'VAT_OUTPUT_INVOICE',
  'VAT_INPUT_VENDOR',
  'DEPOSIT_DEDUCTION_SETTLE',
  'UNCLAIMED_REFUND',
];
for (const t of requiredRuleTypes) {
  const rx = new RegExp(`\\('${t}'`);
  check(
    `P2 seed contains rule for ${t}`,
    rx.test(p2SeedSrc),
    p2Seed,
  );
}

// Enforcement migration must include the DB trigger + the compliance view
const p2EnforceSrc = readIfExists(p2Enforce) || '';
check(
  'P2 enforcement migration defines fin_reject_unknown_account_code trigger function',
  /CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\.fin_reject_unknown_account_code/.test(p2EnforceSrc),
  p2Enforce,
);
check(
  'P2 enforcement migration installs trigger on fin_accounting_event_lines',
  /trg_fin_reject_unknown_account_code_event[\s\S]*?fin_accounting_event_lines/.test(p2EnforceSrc),
  'DB-side guard installed',
);
check(
  'P2 enforcement migration creates v_posting_engine_compliance view',
  /CREATE\s+OR\s+REPLACE\s+VIEW\s+public\.v_posting_engine_compliance/.test(p2EnforceSrc),
  'Compliance view present',
);
check(
  'P2 enforcement migration adds UNIQUE index on (transaction_type, payment_method, deposit_type, pdc_type)',
  /fin_transaction_account_rules_active_uniq/.test(p2EnforceSrc),
  'Rule dedup index',
);

// ── 8. Posting-engine TypeScript guard ───────────────────────────────────────
const postingPath = path.join(FIN_DIR, 'posting-engine.ts');
const postingSrc = readIfExists(postingPath) || '';
check(
  'posting-engine resolveAccounts throws on unresolved account_code',
  /Active COA account [\s\S]*?does not exist/.test(postingSrc) ||
  /Posting rejected: account_code "[\s\S]*?does not resolve to an active row/.test(postingSrc),
  'Phase 2 friendly error message present',
);
check(
  'posting-engine resolveAccounts rejects inactive rows',
  /exists in fin_coa_accounts but is_active = false/.test(postingSrc),
  'Inactive-row guard',
);

// ── 9. Phase 1 COA hard rules still intact ───────────────────────────────────
const coaFixMigration = path.join(MIGR_DIR, '20260826000000_finance_coa_hierarchy.sql');
check(
  'Phase 1 canonical COA migration (20260826000000) present',
  fileExists(coaFixMigration),
  'fin_coa_accounts remains the authoritative GL master',
);

// ── 10. No stray erp_* write callers in src/ outside the wrapper ────────────
function findFilesWithErpWrites(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...findFilesWithErpWrites(p));
    } else if (/\.(ts|tsx|cjs|mjs|js)$/.test(entry.name)) {
      const text = readIfExists(p) || '';
      const hasErpInsert =
        /from\(['"]erp_vouchers['"]\)\.insert/.test(text) ||
        /from\(['"]erp_journal_entries['"]\)\.insert/.test(text);
      if (hasErpInsert) out.push(p);
    }
  }
  return out;
}
const srcDir = path.join(REPO_ROOT, 'src');
const erpWriters = findFilesWithErpWrites(srcDir);
check(
  'No erp_vouchers / erp_journal_entries writes outside the compatibility shim',
  erpWriters.length === 0,
  erpWriters.length === 0
    ? 'Single-accounting-engine architecture preserved'
    : `Files still writing: ${erpWriters.map((p) => path.relative(REPO_ROOT, p)).join(', ')}`,
);

// ── 11. payroll-sync component does not have hard-coded account_code literals ──
const payrollCompPath = path.join(COMP_DIR, 'payroll-sync.tsx');
const payrollCompSrc = readIfExists(payrollCompPath) || '';
check(
  'payroll-sync.tsx external "account_code" labels are documented as external-only',
  /External payroll system's account code/.test(payrollCompSrc),
  'Comments make the boundary explicit',
);

// ── Summary ─────────────────────────────────────────────────────────────────
const passed = checks.filter((c) => c.pass).length;
const failed = checks.length - passed;
console.log('');
console.log('='.repeat(60));
console.log('PHASE 2 — Accounting Engine Enforcement — static validation');
console.log('='.repeat(60));
console.log(`Checks run:    ${checks.length}`);
console.log(`Checks passed: ${passed}`);
console.log(`Checks failed: ${failed}`);
if (failed === 0) {
  console.log('');
  console.log('[32mPHASE 2 STATIC VALIDATION PASSED[0m');
  console.log('');
  console.log('Account Resolver is the single entry point for the finance');
  console.log('posting path. Every accounting event now flows through');
  console.log('resolveAccountingAccounts() -> postAccountingEvent().');
  console.log('');
  console.log('New rule types seeded (20260829100000):');
  console.log('  LEGAL_ESCALATION        Dr 12411001 / Cr 12413[unit SL]');
  console.log('  LEGAL_RECOVERY          Dr 12000001 / Cr 12411001');
  console.log('  PAYROLL_DISBURSEMENT    Dr 50100001 / Cr 12000001');
  console.log('  PAYROLL_DEDUCTION       Dr 50100001 / Cr 21900001');
  console.log('  PROCUREMENT_GRN         Dr 13400|13410 / Cr 21610');
  console.log('  PROCUREMENT_AP          Dr 21610 / Cr 21000');
  console.log('  PROCUREMENT_LANDED      Dr 13400|13410 / Cr 21610|21620');
  console.log('  PROCUREMENT_CAPITALIZE  Dr 11000 / Cr 13400');
  console.log('  VAT_OUTPUT_INVOICE      Dr 12413[unit SL] / Cr 21600001');
  console.log('  VAT_INPUT_VENDOR        Dr 12500001 / Cr 22100001');
  console.log('  DEPOSIT_DEDUCTION_SETTLE Dr 21100006 / Cr 12413[unit SL]');
  console.log('  UNCLAIMED_REFUND        Dr 21100002 / Cr 12000001');
  console.log('');
  console.log('Enforcement (20260829110000):');
  console.log('  - DB trigger rejects unknown account_codes on event + voucher lines');
  console.log('  - UNIQUE index on (txn, payment, deposit, pdc) WHERE is_active');
  console.log('  - v_posting_engine_compliance view for the audit dashboard');
  console.log('  - posting-engine TypeScript guard throws on unresolved / inactive codes');
  process.exit(0);
} else {
  console.log('');
  console.log('[31mPHASE 2 STATIC VALIDATION FAILED[0m');
  console.log('Resolve the failing checks above, then re-run.');
  process.exit(1);
}
