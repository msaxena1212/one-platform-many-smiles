// verify-phase2b-trigger.mjs
// Live-DB check that Phase 2b enforcement actually landed:
//   1. fin_reject_unknown_account_code() function exists
//   2. trg_fin_reject_unknown_account_code_event trigger exists on fin_accounting_event_lines
//   3. v_posting_engine_compliance view exists and returns rows
//   4. fin_transaction_account_rules_active_uniq index exists
//   5. Phase 3 DEPOSIT_PDC rules are seeded (20260829000000)
//
// Uses service role key from .env.local. NEVER print the key. NEVER echo it.
//
// Run with: node verify-phase2b-trigger.mjs

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Load .env.local — keep secret out of process.env that we ever echo.
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

const URL = env.VITE_SUPABASE_URL;
const SR  = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !SR) {
  console.error('FATAL — .env.local missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const sb = createClient(URL, SR, { auth: { persistSession: false } });

let pass = 0, fail = 0;
function check(name, cond, detail) {
  const tag = cond ? 'PASS' : 'FAIL';
  console.log(`[${tag}] ${name}${detail ? `  -- ${detail}` : ''}`);
  cond ? pass++ : fail++;
}

async function main() {
  // ── 1. Function exists ───────────────────────────────────────────────────────
  const { data: fn, error: fnErr } = await sb
    .from('information_schema.routines')
    .select('routine_schema, routine_name')
    .eq('routine_schema', 'public')
    .eq('routine_name', 'fin_reject_unknown_account_code')
    .limit(5);
  check(
    'fin_reject_unknown_account_code() function exists in public schema',
    !fnErr && Array.isArray(fn) && fn.length > 0,
    fnErr ? fnErr.message : `${fn?.length ?? 0} row(s)`,
  );

  // ── 2. Trigger installed on fin_accounting_event_lines ──────────────────────
  const { data: tg, error: tgErr } = await sb
    .from('information_schema.triggers')
    .select('trigger_name, event_object_schema, event_object_table, action_timing, event_manipulation')
    .eq('trigger_name', 'trg_fin_reject_unknown_account_code_event')
    .limit(5);
  check(
    'trg_fin_reject_unknown_account_code_event exists',
    !tgErr && Array.isArray(tg) && tg.length > 0,
    tgErr ? tgErr.message : (tg?.length ?? 0) + ' row(s)',
  );
  if (tg && tg.length > 0) {
    const row = tg[0];
    check(
      'trigger is on fin_accounting_event_lines',
      row.event_object_schema === 'public' && row.event_object_table === 'fin_accounting_event_lines',
      `${row.event_object_schema}.${row.event_object_table} ${row.action_timing} ${row.event_manipulation}`,
    );
  }

  // ── 3. Compliance view exists and is queryable ──────────────────────────────
  const { data: view, error: viewErr } = await sb
    .from('information_schema.views')
    .select('table_schema, table_name')
    .eq('table_schema', 'public')
    .eq('table_name', 'v_posting_engine_compliance')
    .limit(5);
  check(
    'v_posting_engine_compliance view exists',
    !viewErr && Array.isArray(view) && view.length > 0,
    viewErr ? viewErr.message : `${view?.length ?? 0} row(s)`,
  );
  const { data: rows, error: selErr } = await sb
    .from('v_posting_engine_compliance')
    .select('*')
    .limit(1);
  check(
    'v_posting_engine_compliance is queryable (returns rows or empty)',
    !selErr && Array.isArray(rows),
    selErr ? selErr.message : `${rows?.length ?? 0} row(s) returned`,
  );

  // ── 4. UNIQUE index on (txn, payment, deposit, pdc) WHERE is_active ─────────
  const { data: idx, error: idxErr } = await sb
    .from('pg_indexes')
    .select('schemaname, tablename, indexname, indexdef')
    .eq('schemaname', 'public')
    .eq('indexname', 'fin_transaction_account_rules_active_uniq')
    .limit(5);
  check(
    'fin_transaction_account_rules_active_uniq index exists',
    !idxErr && Array.isArray(idx) && idx.length > 0,
    idxErr ? idxErr.message : (idx?.length ?? 0) + ' row(s)',
  );

  // ── 5. Phase 3 DEPOSIT_PDC rule backfill landed ────────────────────────────
  const { data: rules, error: ruleErr } = await sb
    .from('fin_transaction_account_rules')
    .select('transaction_type, pdc_type')
    .eq('pdc_type', 'DEPOSIT_PDC')
    .eq('is_active', true);
  const ruleTypes = Array.isArray(rules) ? [...new Set(rules.map((r) => r.transaction_type))] : [];
  const expectedTypes = ['PDC_DEPOSIT_BANK', 'PDC_DEPOSIT_AR', 'PDC_RETURN', 'PDC_CANCEL'];
  for (const t of expectedTypes) {
    check(
      `PDC rule ${t} (DEPOSIT_PDC) seeded`,
      ruleTypes.includes(t),
      `seen DEPOSIT_PDC rules: [${ruleTypes.join(', ')}]`,
    );
  }

  // ── Summary ─────────────────────────────────────────────────────────────────
  console.log('');
  console.log('─'.repeat(60));
  console.log(`Phase 2b + Phase 3 live verification: ${pass} pass / ${fail} fail`);
  console.log('─'.repeat(60));
  process.exit(fail === 0 ? 0 : 1);
}

main().catch((e) => { console.error('FATAL', e); process.exit(1); });
