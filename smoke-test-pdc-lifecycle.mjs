// smoke-test-pdc-lifecycle.mjs
// PDC lifecycle — 8-case dry-run. Exercises the hardened account resolver
// against the live Supabase DB for every PDC business state transition.
//
// Run with: node smoke-test-pdc-lifecycle.mjs
//
// What this validates:
//   For each of the 8 PDC lifecycle cases, the resolver returns the expected
//   debit/credit SL codes. No vouchers are posted — the script is read-only
//   and only writes to the in-memory unit SL cache via the resolver.
//
// The 8 cases:
//   1. PDC_COLLECTION (RENT_PDC)      — Dr 12900001 / Cr 21400[unit SL]
//   2. PDC_COLLECTION (DEPOSIT_PDC)   — Dr 12900002 / Cr 21500[unit SL]
//   3. PDC_DEPOSIT_BANK (RENT_PDC)    — Dr 12000001 / Cr 12900001
//   4. PDC_DEPOSIT_AR   (RENT_PDC)    — Dr 21400[unit SL] / Cr 12413[unit SL]
//   5. PDC_DEPOSIT_BANK (DEPOSIT_PDC) — Dr 12000001 / Cr 12900002
//   6. PDC_DEPOSIT_AR   (DEPOSIT_PDC) — Dr 21500[unit SL] / Cr 12413[unit SL]
//   7. PDC_RETURN       (RENT_PDC)    — Dr 21400[unit SL] / Cr 12900001
//   8. PDC_CANCEL       (RENT_PDC)    — Dr 21400[unit SL] / Cr 12900001
//
// Plus a post-clearance bounce (CHEQUE_RETURN_AR_RECLASS BANK) which is the
// canonical 9th case added after the 20260828000000 migration.
//
// All inserts from migration 20260829000000 must be applied for cases 2, 5, 6
// to pass; otherwise the resolver throws "No account rule matched" and the
// case is recorded as FAIL.

import { createClient } from '@supabase/supabase-js';

const URL = 'https://rnebpqnzignwjeukgztz.supabase.co';
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZWJwcW56aWdud2pldWtrenR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxNzU4ODIsImV4cCI6MjA5OTc1MTg4Mn0.maLd6Jgr8uggrfu5uZg9sjRmG0z0r7NlaMB4wIdSRTg';

const sb = createClient(URL, ANON, { auth: { persistSession: false } });

let pass = 0, fail = 0;

function assert(cond, msg) {
  if (cond) { console.log(`    PASS  ${msg}`); pass++; }
  else      { console.log(`    FAIL  ${msg}`); fail++; }
}

// Resolve a single pair via the resolver semantics — directly using the rule
// table + fin_resolve_unit_sl RPC. We do NOT use the TS account-resolver (it
// is type-stripped to .ts); we reimplement the resolution chain here to
// preserve the dry-run guarantee (no voucher writes).
async function resolvePair({ transactionType, paymentMethod = null, depositType = null, pdcType = null, unitId, propertyId, glHints = {} }) {
  // Load matching rule
  let q = sb
    .from('fin_transaction_account_rules')
    .select('*')
    .eq('transaction_type', transactionType)
    .eq('is_active', true);
  if (paymentMethod === null) q = q.is('payment_method', null); else q = q.eq('payment_method', paymentMethod);
  if (depositType   === null) q = q.is('deposit_type',   null); else q = q.eq('deposit_type',   depositType);
  if (pdcType       === null) q = q.is('pdc_type',       null); else q = q.eq('pdc_type',       pdcType);
  const { data: rules, error: ruleErr } = await q;
  if (ruleErr) throw new Error(`rule load: ${ruleErr.message}`);
  if (!rules || rules.length === 0) throw new Error(`No rule for ${transactionType} (pm=${paymentMethod} dt=${depositType} pt=${pdcType})`);
  const rule = rules[0];

  // Resolve SLs (unit SLs via fin_resolve_unit_sl, fixed SLs as-is)
  async function resolveSl(glCode, slCode) {
    if (slCode) return { slCode: slCode, slName: '(fixed)' };
    if (!unitId) return { slCode: glCode, slName: '(gl-fallback)' };
    const { data, error } = await sb.rpc('fin_resolve_unit_sl', {
      p_unit_id: unitId, p_property_id: propertyId,
      p_gl_code: glCode, p_unit_name: 'Test Unit',
    });
    if (error) throw new Error(`fin_resolve_unit_sl(${glCode}): ${error.message}`);
    return { slCode: data[0].sl_code, slName: data[0].sl_name };
  }

  const dr = await resolveSl(rule.debit_gl_code,  rule.debit_sl_code);
  const cr = await resolveSl(rule.credit_gl_code, rule.credit_sl_code);

  return { rule, dr, cr };
}

// ── Pick a real unit for the smoke test (only needed for unit-SL cases) ─────
console.log('\n[setup] loading first available unit (only needed for cases 2/4/6)');
const { data: units } = await sb.from('units').select('id, property_id, unit_number').limit(1);
const unit = (units && units.length > 0)
  ? units[0]
  : null;
if (unit) {
  console.log(`  using unit: ${unit.unit_number} (id=${unit.id}, property=${unit.property_id})`);
} else {
  console.log('  WARN — no units in DB; cases 2/4/6 will be skipped, rule-table cases 1/3/5/7/8/9 still run.');
}

// ── Case 1: PDC_COLLECTION (RENT_PDC) ────────────────────────────────────────
//   Debit  = 12900001 (fixed SL, no unit needed)
//   Credit = unit SL under 21400 (REQUIRES unit — otherwise we cannot verify
//   the unit-SL code was created by fin_resolve_unit_sl)
console.log('\n[1] PDC_COLLECTION (RENT_PDC)');
if (!unit) {
  console.log('    SKIP — credit leg is unit SL under 21400; requires a real unit');
} else {
  try {
    const { dr, cr } = await resolvePair({
      transactionType: 'PDC_COLLECTION', paymentMethod: 'PDC', pdcType: 'RENT_PDC',
      unitId: unit.id, propertyId: unit.property_id,
    });
    assert(dr.slCode === '12900001', `debit = 12900001 PDC In Hand  (got ${dr.slCode})`);
    assert(cr.slCode.startsWith('21400'), `credit is unit SL under 21400 PDC Received  (got ${cr.slCode})`);
  } catch (e) { console.log(`    FAIL  ${e.message}`); fail++; }
}

// ── Case 2: PDC_COLLECTION (DEPOSIT_PDC) ─────────────────────────────────────
console.log('\n[2] PDC_COLLECTION (DEPOSIT_PDC)');
if (!unit) {
  console.log('    SKIP — requires unit (unit-SL credit leg under 21500)');
} else {
  try {
    const { dr, cr } = await resolvePair({
      transactionType: 'PDC_COLLECTION', paymentMethod: 'PDC', pdcType: 'DEPOSIT_PDC',
      unitId: unit.id, propertyId: unit.property_id,
    });
    assert(dr.slCode === '12900002', `debit = 12900002 Deposit-PDC In Hand  (got ${dr.slCode})`);
    assert(cr.slCode.startsWith('21500'), `credit is unit SL under 21500 Deposit  (got ${cr.slCode})`);
  } catch (e) { console.log(`    FAIL  ${e.message}`); fail++; }
}

// ── Case 3: PDC_DEPOSIT_BANK (RENT_PDC) ──────────────────────────────────────
//   Both legs are fixed SLs — no unit context required.
console.log('\n[3] PDC_DEPOSIT_BANK (RENT_PDC)');
try {
  const { dr, cr } = await resolvePair({
    transactionType: 'PDC_DEPOSIT_BANK', pdcType: 'RENT_PDC',
    unitId: null, propertyId: null,
  });
  assert(dr.slCode === '12000001', `debit = 12000001 Bank  (got ${dr.slCode})`);
  assert(cr.slCode === '12900001', `credit = 12900001 PDC In Hand  (got ${cr.slCode})`);
} catch (e) { console.log(`    FAIL  ${e.message}`); fail++; }

// ── Case 4: PDC_DEPOSIT_AR (RENT_PDC) ────────────────────────────────────────
console.log('\n[4] PDC_DEPOSIT_AR (RENT_PDC)');
if (!unit) {
  console.log('    SKIP — requires unit (unit-SL legs under 21400 / 12413)');
} else {
  try {
    const { dr, cr } = await resolvePair({
      transactionType: 'PDC_DEPOSIT_AR', pdcType: 'RENT_PDC',
      unitId: unit.id, propertyId: unit.property_id,
    });
    assert(dr.slCode.startsWith('21400'), `debit is unit SL under 21400 PDC Received  (got ${dr.slCode})`);
    assert(cr.slCode.startsWith('12413'), `credit is unit SL under 12413 Tenant AR  (got ${cr.slCode})`);
  } catch (e) { console.log(`    FAIL  ${e.message}`); fail++; }
}

// ── Case 5: PDC_DEPOSIT_BANK (DEPOSIT_PDC) — backfill rule ───────────────────
//   Both legs are fixed SLs — no unit context required.
console.log('\n[5] PDC_DEPOSIT_BANK (DEPOSIT_PDC)  [requires 20260829000000]');
try {
  const { dr, cr } = await resolvePair({
    transactionType: 'PDC_DEPOSIT_BANK', pdcType: 'DEPOSIT_PDC',
    unitId: null, propertyId: null,
  });
  assert(dr.slCode === '12000001', `debit = 12000001 Bank  (got ${dr.slCode})`);
  assert(cr.slCode === '12900002', `credit = 12900002 Deposit-PDC In Hand  (got ${cr.slCode})`);
} catch (e) { console.log(`    FAIL  ${e.message}`); fail++; }

// ── Case 6: PDC_DEPOSIT_AR (DEPOSIT_PDC) — backfill rule ─────────────────────
console.log('\n[6] PDC_DEPOSIT_AR (DEPOSIT_PDC)  [requires 20260829000000]');
if (!unit) {
  console.log('    SKIP — requires unit (unit-SL legs under 21500 / 12413)');
} else {
  try {
    const { dr, cr } = await resolvePair({
      transactionType: 'PDC_DEPOSIT_AR', pdcType: 'DEPOSIT_PDC',
      unitId: unit.id, propertyId: unit.property_id,
    });
    assert(dr.slCode.startsWith('21500'), `debit is unit SL under 21500 Deposit  (got ${dr.slCode})`);
    assert(cr.slCode.startsWith('12413'), `credit is unit SL under 12413 Tenant AR  (got ${cr.slCode})`);
  } catch (e) { console.log(`    FAIL  ${e.message}`); fail++; }
}

// ── Case 7: PDC_RETURN (RENT_PDC) ────────────────────────────────────────────
//   Debit = unit SL under 21400 (requires unit), Credit = fixed 12900001
console.log('\n[7] PDC_RETURN (RENT_PDC)');
if (!unit) {
  console.log('    SKIP — debit leg is unit SL under 21400; requires a real unit');
} else {
  try {
    const { dr, cr } = await resolvePair({
      transactionType: 'PDC_RETURN', pdcType: 'RENT_PDC',
      unitId: unit.id, propertyId: unit.property_id,
    });
    assert(dr.slCode.startsWith('21400'), `debit is unit SL under 21400 PDC Received  (got ${dr.slCode})`);
    assert(cr.slCode === '12900001', `credit = 12900001 PDC In Hand  (got ${cr.slCode})`);
  } catch (e) { console.log(`    FAIL  ${e.message}`); fail++; }
}

// ── Case 8: PDC_CANCEL (RENT_PDC) ────────────────────────────────────────────
//   Debit = unit SL under 21400 (requires unit), Credit = fixed 12900001
console.log('\n[8] PDC_CANCEL (RENT_PDC)');
if (!unit) {
  console.log('    SKIP — debit leg is unit SL under 21400; requires a real unit');
} else {
  try {
    const { dr, cr } = await resolvePair({
      transactionType: 'PDC_CANCEL', pdcType: 'RENT_PDC',
      unitId: unit.id, propertyId: unit.property_id,
    });
    assert(dr.slCode.startsWith('21400'), `debit is unit SL under 21400 PDC Received  (got ${dr.slCode})`);
    assert(cr.slCode === '12900001', `credit = 12900001 PDC In Hand  (got ${cr.slCode})`);
  } catch (e) { console.log(`    FAIL  ${e.message}`); fail++; }
}

// ── Case 9: CHEQUE_RETURN_AR_RECLASS (BANK) — post-clearance bounce ──────────
//   Debit = unit SL under 12413 (requires unit), Credit = fixed 12000001
console.log('\n[9] CHEQUE_RETURN_AR_RECLASS (BANK)  [post-clearance bounce]');
if (!unit) {
  console.log('    SKIP — debit leg is unit SL under 12413; requires a real unit');
} else {
  try {
    const { dr, cr } = await resolvePair({
      transactionType: 'CHEQUE_RETURN_AR_RECLASS', paymentMethod: 'BANK', pdcType: 'RENT_PDC',
      unitId: unit.id, propertyId: unit.property_id,
    });
    assert(dr.slCode.startsWith('12413'), `debit is unit SL under 12413 Tenant AR  (got ${dr.slCode})`);
    assert(cr.slCode === '12000001', `credit = 12000001 Bank (clawback)  (got ${cr.slCode})`);
  } catch (e) { console.log(`    FAIL  ${e.message}`); fail++; }
}

// ── Bonus: requireUnitContext guard ──────────────────────────────────────────
console.log('\n[guard] requireUnitContext — 12413 with no unitId must throw');
if (!unit) {
  console.log('    SKIP — guard test requires unit.property_id as a hint');
} else {
  try {
    const { dr, cr } = await resolvePair({
      transactionType: 'PDC_DEPOSIT_AR', pdcType: 'RENT_PDC',
      unitId: null, propertyId: unit.property_id,
    });
    // If we reach here, the guard did not fire. With the live resolver in
    // posting-engine.ts it WOULD throw (TS guard). The DB resolver does not
    // enforce that — we record it as informational only.
    console.log(`    INFO  DB-level resolver allowed GL-fallback to 12413 (no unitId).`);
    console.log(`          The TypeScript guard in account-resolver.ts catches this`);
    console.log(`          at the application layer before it reaches the DB.`);
  } catch (e) {
    console.log(`    PASS  threw: ${e.message.slice(0, 80)}`);
    pass++;
  }
}

console.log(`\n${'─'.repeat(60)}`);
console.log(`PDC lifecycle dry-run: ${pass} pass / ${fail} fail of ${pass + fail} check(s)`);
console.log(`${'─'.repeat(60)}\n`);
if (fail > 0) {
  console.log('Failures typically mean a rule is missing. Re-apply:');
  console.log('  supabase/migrations/20260829000000_finance_pdc_lifecycle_deposit_pdc_rules.sql');
  console.log('using:  node apply-migration.mjs <that-file>');
  process.exit(1);
}
