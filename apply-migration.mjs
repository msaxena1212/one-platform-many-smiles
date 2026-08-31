// apply-migration.mjs
// Local helper — applies a SQL migration file to the live Supabase project.
// Anon keys cannot run DDL via PostgREST, so this script offers two paths:
//
//   (A) Direct DB connection — paste the project's Postgres connection string
//       (Settings → Database → Connection string → "Direct connection").
//       Requires the optional `pg` dep. Splits the file on `;\n` boundaries
//       and runs each statement inside one transaction, rolling back the
//       entire file on the first failure.
//
//   (B) Paste-ready output — if (A) is declined or `pg` is not installed,
//       the script prints every statement as a single block you can paste
//       into the Supabase SQL editor. Nothing is sent over the network.
//
// The script never persists the connection string or service key to disk.
// It is intentionally written so that re-running it is safe (idempotent
// migrations should use ON CONFLICT DO NOTHING).
//
// Usage:
//   node apply-migration.mjs <path-to-sql-file>
//   node apply-migration.mjs supabase/migrations/20260827100000_*.sql

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout, exit } from 'node:process';

// ── Argument validation ──────────────────────────────────────────────────────
const args = process.argv.slice(2);
const sqlArg = args.find((a) => !a.startsWith('--') && !a.startsWith('-'));
if (!sqlArg) {
  console.error('Usage: node apply-migration.mjs [--url=<conn> | --url-file=<path> | --print] <path-to-sql-file>');
  exit(1);
}
const sqlPath = resolve(sqlArg);
const runAsBatch = args.includes('--batch');

let sql;
try { sql = readFileSync(sqlPath, 'utf8'); }
catch (err) { console.error(`Cannot read ${sqlPath}: ${err.message}`); exit(1); }

console.log(`\nTarget SQL: ${sqlPath}`);
console.log(`Size:       ${sql.length} bytes`);

// ── Statement split ──────────────────────────────────────────────────────────
// Migrations in this repo separate statements with `;\n`, but `$$ ... $$`
// dollar-quoted blocks (CREATE FUNCTION bodies, DO blocks) contain `;` chars
// we must NOT split on. Walk the file once: track whether we're inside a
// `$$ ... $$` run; only split at `;\n` when outside. Drop blocks that are
// only comments or whitespace.
function splitStatements(src) {
  const out = [];
  let buf = '';
  let inDollar = false;
  let i = 0;
  while (i < src.length) {
    // Detect `$$` toggle.
    if (src[i] === '$' && src[i + 1] === '$') {
      inDollar = !inDollar;
      buf += '$$';
      i += 2;
      continue;
    }
    if (!inDollar && src[i] === ';' && (src[i + 1] === '\n' || src[i + 1] === '\r' || src[i + 1] === ' ' || src[i + 1] === undefined)) {
      buf += ';';
      const trimmed = buf.trim();
      if (trimmed.length > 0 && !trimmed.split('\n').every(l => /^\s*(--|$)/.test(l))) {
        out.push(trimmed);
      }
      buf = '';
      // skip following newline
      if (src[i + 1] === '\n') i += 2;
      else if (src[i + 1] === '\r' && src[i + 2] === '\n') i += 3;
      else i += 1;
      continue;
    }
    buf += src[i];
    i += 1;
  }
  const tail = buf.trim();
  if (tail.length > 0 && !tail.split('\n').every(l => /^\s*(--|$)/.test(l))) {
    out.push(tail.endsWith(';') ? tail : tail + ';');
  }
  return out;
}

const statements = splitStatements(sql);

console.log(`Statements: ${statements.length}\n`);

// ── Choose path ──────────────────────────────────────────────────────────────
// Non-interactive flags: --url=<conn-string>, --url-file=<path>, or --print
// skip the prompts. SUPABASE_DIRECT_URL env var is also accepted.
const argvMode = args.find((a) => a === '--print' || a === '-p') ? 'B' : null;
const argvUrlArg = args.find((a) => a.startsWith('--url='));
const argvUrlFileArg = args.find((a) => a.startsWith('--url-file='));
const argvUrl = argvUrlArg ? argvUrlArg.slice('--url='.length) : null;
let argvUrlFromFile = null;
if (argvUrlFileArg) {
  try {
    argvUrlFromFile = readFileSync(argvUrlFileArg.slice('--url-file='.length), 'utf8').trim();
  } catch (err) {
    console.error(`Cannot read --url-file path: ${err.message}`);
    exit(1);
  }
}

let mode = argvMode;
let connStr = argvUrl || argvUrlFromFile || process.env.SUPABASE_DIRECT_URL || null;

// If a URL is supplied (via flag, file, or env) and no mode is forced, default to A.
if (!mode && connStr) mode = 'A';

if (!mode) {
  const rl = createInterface({ input: stdin, output: stdout });
  mode = (await rl.question(
    'Apply via (A) direct DB connection string, or (B) print paste-ready block? [A/B]: ',
  )).trim().toUpperCase();
  rl.close();
}

if (mode === 'B') {
  console.log('\n────────────────────────────────────────────────────────────────');
  console.log('-- Paste the block below into the Supabase SQL editor --');
  console.log('────────────────────────────────────────────────────────────────');
  console.log(sql);
  console.log('────────────────────────────────────────────────────────────────');
  console.log(`\nDone. ${statements.length} statement(s) printed. Nothing was sent.`);
  exit(0);
}

if (mode !== 'A') {
  console.log('Aborted.');
  exit(1);
}

// ── Path A: direct DB connection ─────────────────────────────────────────────
let pg;
try { pg = await import('pg'); }
catch {
  console.error('\nThe `pg` package is not installed in this workspace.');
  console.error('Install it with:  npm install --no-save pg');
  console.error('Then re-run this script. Or re-run with B for the SQL-editor path.');
  exit(1);
}

if (!connStr) {
  const rl2 = createInterface({ input: stdin, output: stdout });
  connStr = (await rl2.question(
    '\nPaste the DIRECT connection string (Settings → Database → Connection string):\n> ',
  )).trim();
  rl2.close();
}
if (!connStr) { console.log('Aborted.'); exit(1); }

const client = new pg.Client({ connectionString: connStr, ssl: { rejectUnauthorized: false } });
try {
  await client.connect();
} catch (err) {
  console.error(`\nCould not connect: ${err.message}`);
  console.error('Confirm you pasted the *direct* connection string (port 5432),');
  console.error('not the pooler (port 6543). The pooler does not accept DDL.');
  exit(1);
}

console.log(`\nConnected. Applying ${statements.length} statement(s) in a single transaction…\n`);

try {
  await client.query('BEGIN');
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const preview = stmt.replace(/\s+/g, ' ').slice(0, 70);
    process.stdout.write(`  [${i + 1}/${statements.length}] ${preview}${stmt.length > 70 ? '…' : ''}  `);
    try {
      await client.query(stmt);
      console.log('  PASS');
    } catch (err) {
      console.log(`  FAIL  ${err.message}`);
      throw err; // rolls back
    }
  }
  await client.query('COMMIT');
  console.log(`\n✓ All ${statements.length} statement(s) applied successfully.`);
} catch (err) {
  try { await client.query('ROLLBACK'); } catch {}
  console.error('\n× Transaction rolled back. Re-run the file once the error is fixed.');
  exit(1);
} finally {
  await client.end();
}
