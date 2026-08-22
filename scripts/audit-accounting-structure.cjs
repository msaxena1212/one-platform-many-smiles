const { Client } = require('pg');
const { connectionString } = require('./database-config.cjs');

const client = new Client({ connectionString });

const TABLES = [
  'erp_vouchers',
  'erp_journal_entries',
  'fin_accounting_events',
  'fin_accounting_event_lines'
];

async function main() {
  await client.connect();

  console.log('');
  console.log('============================================================');
  console.log(' ACCOUNTING / VOUCHER STRUCTURE AUDIT');
  console.log(' READ-ONLY - NO DATABASE CHANGES');
  console.log('============================================================');

  for (const table of TABLES) {
    console.log('');
    console.log('============================================================');
    console.log(` TABLE: ${table}`);
    console.log('============================================================');

    const columns = await client.query(`
      SELECT
        column_name,
        data_type,
        udt_name,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
      ORDER BY ordinal_position;
    `, [table]);

    console.table(columns.rows);

    console.log('');
    console.log('---------- CONSTRAINTS ----------');

    const constraints = await client.query(`
      SELECT
        tc.constraint_name,
        tc.constraint_type,
        pg_get_constraintdef(c.oid) AS definition
      FROM information_schema.table_constraints tc
      JOIN pg_constraint c
        ON c.conname = tc.constraint_name
       AND c.conrelid = (
         quote_ident(tc.table_schema) || '.' ||
         quote_ident(tc.table_name)
       )::regclass
      WHERE tc.table_schema = 'public'
        AND tc.table_name = $1
      ORDER BY tc.constraint_name;
    `, [table]);

    console.table(constraints.rows);

    console.log('');
    console.log('---------- INDEXES ----------');

    const indexes = await client.query(`
      SELECT
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename = $1
      ORDER BY indexname;
    `, [table]);

    console.table(indexes.rows);
  }

  console.log('');
  console.log('============================================================');
  console.log(' ACCOUNTING STRUCTURE AUDIT COMPLETED');
  console.log(' NO DATABASE CHANGES WERE MADE');
  console.log('============================================================');

  await client.end();
}

main().catch(async (error) => {
  console.error('');
  console.error('Audit failed.');
  console.error(error.message);

  try {
    await client.end();
  } catch {}

  process.exit(1);
});
