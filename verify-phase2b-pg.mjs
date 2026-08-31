// verify-phase2b-pg.mjs
// Direct postgres inspection — bypasses PostgREST, can see pg_catalog.
//
// Verifies Phase 2b and Phase 3 actually applied to the live DB by querying
// information_schema and pg_catalog directly via the pooler connection.
//
// NEVER print connection strings or the service role key.

import pg from 'pg';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const envText = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8');
const env = Object.fromEntries(
  envText
    .split('\n')
    .filter((l) => l.includes('=') && !l.trimStart().startsWith('#'))
    .map((l) => {
      const [k, ...rest] = l.split('=');
      return [k.trim(), rest.join('=').replace(/^"|"$/g, '').trim()];
    })
);

const POOLER_URL = env.DATABASE_URL;
if (!POOLER_URL) {
  console.error('FATAL — .env.local missing DATABASE_URL');
  process.exit(1);
}

const client = new pg.Client({ connectionString: POOLER_URL, ssl: { rejectUnauthorized: false } });

let pass = 0, fail = 0;
function check(name, cond, detail) {
  const tag = cond ? 'PASS' : 'FAIL';
  console.log(`[${tag}] ${name}${detail ? `  -- ${detail}` : ''}`);
  cond ? pass++ : fail++;
}

async function main() {
  await client.connect();

  // ── 1. fin_reject_unknown_account_code() exists in public ─────────────────
  const fnRes = await client.query(
    `SELECT proname, pronamespace::regnamespace AS schema
       FROM pg_proc p
       JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public' AND p.proname = 'fin_reject_unknown_account_code'`,
  );
  check(
    'fin_reject_unknown_account_code() function exists in public',
    fnRes.rows.length > 0,
    `${fnRes.rows.length} row(s)`,
  );

  // ── 2. Trigger trg_fin_reject_unknown_account_code_event on fin_accounting_event_lines ──
  const tgRes = await client.query(
    `SELECT tgname, tgrelid::regclass AS tbl,
            (tgtype & 2 = 2) AS is_before,
            (tgtype & 4 = 4) AS is_insert,
            pg_get_triggerdef(oid) AS def
       FROM pg_trigger
      WHERE tgname = 'trg_fin_reject_unknown_account_code_event'
        AND NOT tgisinternal`,
  );
  check(
    'trg_fin_reject_unknown_account_code_event exists',
    tgRes.rows.length > 0,
    `${tgRes.rows.length} row(s)`,
  );
  if (tgRes.rows.length > 0) {
    const row = tgRes.rows[0];
    check(
      'trigger is on fin_accounting_event_lines',
      String(row.tbl).endsWith('fin_accounting_event_lines'),
      `attached to ${row.tbl} (BEFORE=${row.is_before} INSERT=${row.is_insert})`,
    );
  }

  // ── 3. v_posting_engine_compliance view exists ────────────────────────────
  const viewRes = await client.query(
    `SELECT table_schema, table_name
       FROM information_schema.views
      WHERE table_schema = 'public' AND table_name = 'v_posting_engine_compliance'`,
  );
  check(
    'v_posting_engine_compliance view exists',
    viewRes.rows.length > 0,
    `${viewRes.rows.length} row(s)`,
  );
  if (viewRes.rows.length > 0) {
    const rowCount = await client.query(`SELECT COUNT(*)::int AS n FROM v_posting_engine_compliance`);
    check(
      'v_posting_engine_compliance is queryable',
      true,
      `${rowCount.rows[0].n} row(s) visible`,
    );
  }

  // ── 4. fin_transaction_account_rules_active_uniq index exists ────────────
  const idxRes = await client.query(
    `SELECT indexname, indexdef
       FROM pg_indexes
      WHERE schemaname = 'public' AND indexname = 'fin_transaction_account_rules_active_uniq'`,
  );
  check(
    'fin_transaction_account_rules_active_uniq index exists',
    idxRes.rows.length > 0,
    idxRes.rows.length > 0 ? idxRes.rows[0].indexdef : 'not found',
  );

  // ── 5. Phase 3 DEPOSIT_PDC rule backfill ──────────────────────────────────
  const ruleRes = await client.query(
    `SELECT transaction_type, pdc_type
       FROM fin_transaction_account_rules
      WHERE pdc_type = 'DEPOSIT_PDC' AND is_active = true
      ORDER BY transaction_type`,
  );
  const seenTypes = new Set(ruleRes.rows.map((r) => r.transaction_type));
  const expected = ['PDC_DEPOSIT_BANK', 'PDC_DEPOSIT_AR', 'PDC_RETURN', 'PDC_CANCEL'];
  console.log(`  info — DEPOSIT_PDC active rules in DB: [${[...seenTypes].join(', ')}]`);
  for (const t of expected) {
    check(
      `PDC rule ${t} (DEPOSIT_PDC) seeded (Phase 3 migration 20260829000000)`,
      seenTypes.has(t),
    );
  }

  // ── 6. Also verify v_posting_engine_compliance can detect a violation ─────
  // Count of UNRESOLVED + INACTIVE rows in event lines should be 0 after
  // Phase 2b. (GL_ONLY is informational — many valid postings use a 5-digit
  // GL without a sub-ledger; NO_CODE only appears for DRAFT test events
  // created by the negative-test harness with no lines.)
  if (viewRes.rows.length > 0) {
    const badRes = await client.query(`
      SELECT
        COUNT(*) FILTER (WHERE compliance_status = 'UNRESOLVED')::int AS unresolved,
        COUNT(*) FILTER (WHERE compliance_status = 'INACTIVE')::int  AS inactive,
        COUNT(*) FILTER (WHERE compliance_status = 'NO_CODE')::int  AS no_code,
        COUNT(*) FILTER (WHERE compliance_status = 'GL_ONLY')::int  AS gl_only,
        COUNT(*)::int                                              AS total
        FROM v_posting_engine_compliance
    `);
    const r = badRes.rows[0];
    const bad = (r.unresolved ?? 0) + (r.inactive ?? 0);
    check(
      'v_posting_engine_compliance reports 0 unresolved/inactive lines',
      bad === 0,
      `total=${r.total} unresolved=${r.unresolved} inactive=${r.inactive} no_code=${r.no_code} gl_only=${r.gl_only}`,
    );
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('');
  console.log('─'.repeat(60));
  console.log(`Phase 2b + Phase 3 (direct pg) verification: ${pass} pass / ${fail} fail`);
  console.log('─'.repeat(60));

  await client.end();
  process.exit(fail === 0 ? 0 : 1);
}

main().catch(async (e) => {
  console.error('FATAL', e.message);
  try { await client.end(); } catch {}
  process.exit(1);
});
