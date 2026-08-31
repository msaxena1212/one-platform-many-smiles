// smoke-test-pdc-rules-pg.mjs
// Direct-pg smoke test for the PDC lifecycle rules — bypasses PostgREST RLS
// (which anon cannot read fin_transaction_account_rules through). Confirms
// every rule the resolver needs is present in the live DB.
//
// Run with: node smoke-test-pdc-rules-pg.mjs

import pg from 'pg';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const envText = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8');
const env = Object.fromEntries(
  envText.split('\n').filter((l) => l.includes('=') && !l.trimStart().startsWith('#'))
    .map((l) => { const [k, ...rest] = l.split('='); return [k.trim(), rest.join('=').replace(/^"|"$/g, '').trim()]; })
);

const client = new pg.Client({ connectionString: env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await client.connect();

let pass = 0, fail = 0;
function assert(cond, msg) {
  if (cond) { console.log(`  PASS  ${msg}`); pass++; }
  else      { console.log(`  FAIL  ${msg}`); fail++; }
}

async function lookup(transactionType, pdcType) {
  const r = await client.query(
    `SELECT debit_gl_code, debit_sl_code, credit_gl_code, credit_sl_code
       FROM fin_transaction_account_rules
      WHERE transaction_type = $1
        AND pdc_type IS NOT DISTINCT FROM $2
        AND is_active = TRUE
      LIMIT 1`,
    [transactionType, pdcType],
  );
  return r.rows[0] || null;
}

console.log('PDC lifecycle rules — direct-pg smoke (no PostgREST, bypasses RLS)');
console.log('');

console.log('[1] PDC_COLLECTION (RENT_PDC)');
const r1 = await lookup('PDC_COLLECTION', 'RENT_PDC');
assert(!!r1, 'rule present');
if (r1) {
  assert(r1.debit_sl_code === '12900001', `debit_sl = 12900001 PDC In Hand  (got ${r1.debit_sl_code})`);
  assert(r1.credit_gl_code === '21400', `credit_gl = 21400 PDC Received  (got ${r1.credit_gl_code})`);
  assert(r1.credit_sl_code === null, `credit_sl is unit-SL (NULL on rule)  (got ${r1.credit_sl_code})`);
}

console.log('\n[2] PDC_COLLECTION (DEPOSIT_PDC)');
const r2 = await lookup('PDC_COLLECTION', 'DEPOSIT_PDC');
assert(!!r2, 'rule present');
if (r2) {
  assert(r2.debit_sl_code === '12900002', `debit_sl = 12900002 Deposit-PDC In Hand  (got ${r2.debit_sl_code})`);
  assert(r2.credit_gl_code === '21500', `credit_gl = 21500 Deposit  (got ${r2.credit_gl_code})`);
  assert(r2.credit_sl_code === null, `credit_sl is unit-SL (NULL on rule)  (got ${r2.credit_sl_code})`);
}

console.log('\n[3] PDC_DEPOSIT_BANK (RENT_PDC)');
const r3 = await lookup('PDC_DEPOSIT_BANK', 'RENT_PDC');
assert(!!r3, 'rule present');
if (r3) {
  assert(r3.debit_sl_code === '12000001', `debit_sl = 12000001 Bank  (got ${r3.debit_sl_code})`);
  assert(r3.credit_sl_code === '12900001', `credit_sl = 12900001 PDC In Hand  (got ${r3.credit_sl_code})`);
}

console.log('\n[4] PDC_DEPOSIT_AR (RENT_PDC) — unit-SL legs (no SL on rule)');
const r4 = await lookup('PDC_DEPOSIT_AR', 'RENT_PDC');
assert(!!r4, 'rule present');
if (r4) {
  assert(r4.debit_gl_code === '21400', `debit_gl = 21400 PDC Received  (got ${r4.debit_gl_code})`);
  assert(r4.credit_gl_code === '12413', `credit_gl = 12413 Tenant AR  (got ${r4.credit_gl_code})`);
}

console.log('\n[5] PDC_DEPOSIT_BANK (DEPOSIT_PDC) — Phase 3 backfill');
const r5 = await lookup('PDC_DEPOSIT_BANK', 'DEPOSIT_PDC');
assert(!!r5, 'rule present');
if (r5) {
  assert(r5.debit_sl_code === '12000001', `debit_sl = 12000001 Bank  (got ${r5.debit_sl_code})`);
  assert(r5.credit_sl_code === '12900002', `credit_sl = 12900002 Deposit-PDC In Hand  (got ${r5.credit_sl_code})`);
}

console.log('\n[6] PDC_DEPOSIT_AR (DEPOSIT_PDC) — Phase 3 backfill');
const r6 = await lookup('PDC_DEPOSIT_AR', 'DEPOSIT_PDC');
assert(!!r6, 'rule present');
if (r6) {
  assert(r6.debit_gl_code === '21500', `debit_gl = 21500 Deposit  (got ${r6.debit_gl_code})`);
  assert(r6.credit_gl_code === '12413', `credit_gl = 12413 Tenant AR  (got ${r6.credit_gl_code})`);
}

console.log('\n[7] PDC_RETURN (RENT_PDC)');
const r7 = await lookup('PDC_RETURN', 'RENT_PDC');
assert(!!r7, 'rule present');
if (r7) {
  assert(r7.debit_gl_code === '21400', `debit_gl = 21400 PDC Received  (got ${r7.debit_gl_code})`);
  assert(r7.credit_sl_code === '12900001', `credit_sl = 12900001 PDC In Hand  (got ${r7.credit_sl_code})`);
}

console.log('\n[8] PDC_CANCEL (RENT_PDC)');
const r8 = await lookup('PDC_CANCEL', 'RENT_PDC');
assert(!!r8, 'rule present');
if (r8) {
  assert(r8.debit_gl_code === '21400', `debit_gl = 21400 PDC Received  (got ${r8.debit_gl_code})`);
  assert(r8.credit_sl_code === '12900001', `credit_sl = 12900001 PDC In Hand  (got ${r8.credit_sl_code})`);
}

console.log('\n[9] PDC_RETURN (DEPOSIT_PDC) — Phase 3 backfill');
const r9 = await lookup('PDC_RETURN', 'DEPOSIT_PDC');
assert(!!r9, 'rule present');
if (r9) {
  assert(r9.debit_gl_code === '21500', `debit_gl = 21500 Deposit  (got ${r9.debit_gl_code})`);
  assert(r9.credit_sl_code === '12900002', `credit_sl = 12900002 Deposit-PDC In Hand  (got ${r9.credit_sl_code})`);
}

console.log('\n[10] PDC_CANCEL (DEPOSIT_PDC) — Phase 3 backfill');
const r10 = await lookup('PDC_CANCEL', 'DEPOSIT_PDC');
assert(!!r10, 'rule present');
if (r10) {
  assert(r10.debit_gl_code === '21500', `debit_gl = 21500 Deposit  (got ${r10.debit_gl_code})`);
  assert(r10.credit_sl_code === '12900002', `credit_sl = 12900002 Deposit-PDC In Hand  (got ${r10.credit_sl_code})`);
}

console.log(`\n${'─'.repeat(60)}`);
console.log(`PDC rules smoke (direct-pg): ${pass} pass / ${fail} fail of ${pass + fail} check(s)`);
console.log(`${'─'.repeat(60)}\n`);

await client.end();
process.exit(fail === 0 ? 0 : 1);
