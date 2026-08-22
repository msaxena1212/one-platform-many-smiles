const { Client } = require('pg');
const { connectionString } = require('./database-config.cjs');

const client = new Client({ connectionString });

async function main() {
  await client.connect();

  console.log('');
  console.log('==============================================');
  console.log(' ACCOUNTING EVENT TYPE / STATUS AUDIT');
  console.log('==============================================');

  const enums = await client.query(`
    SELECT
      t.typname AS enum_name,
      e.enumsortorder,
      e.enumlabel AS enum_value
    FROM pg_type t
    JOIN pg_enum e
      ON t.oid = e.enumtypid
    WHERE t.typname IN (
      'fin_accounting_event_type',
      'fin_accounting_event_status'
    )
    ORDER BY t.typname, e.enumsortorder;
  `);

  console.log('');
  console.log('========== ENUM VALUES ==========');
  console.table(enums.rows);

  console.log('');
  console.log('========== TABLE CHECK CONSTRAINTS ==========');

  const checks = await client.query(`
    SELECT
      con.conname AS constraint_name,
      pg_get_constraintdef(con.oid) AS definition
    FROM pg_constraint con
    JOIN pg_class rel
      ON rel.oid = con.conrelid
    JOIN pg_namespace nsp
      ON nsp.oid = rel.relnamespace
    WHERE nsp.nspname = 'public'
      AND rel.relname = 'fin_accounting_events'
      AND con.contype = 'c'
    ORDER BY con.conname;
  `);

  console.table(checks.rows);

  console.log('');
  console.log('========== INDEXES ==========');

  const indexes = await client.query(`
    SELECT
      indexname,
      indexdef
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'fin_accounting_events'
    ORDER BY indexname;
  `);

  console.table(indexes.rows);

  await client.end();

  console.log('');
  console.log('==============================================');
  console.log(' AUDIT COMPLETED');
  console.log(' NO DATABASE CHANGES WERE MADE');
  console.log('==============================================');
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
