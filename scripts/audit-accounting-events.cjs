const { Client } = require('pg');
const { connectionString } = require('./database-config.cjs');

const client = new Client({ connectionString });

async function main() {
  await client.connect();

  console.log('========== FIN_ACCOUNTING_EVENTS ==========');

  const result = await client.query(`
    SELECT
      column_name,
      data_type,
      udt_name,
      is_nullable,
      column_default
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'fin_accounting_events'
    ORDER BY ordinal_position;
  `);

  console.table(result.rows);

  console.log('');
  console.log('========== CONSTRAINTS ==========');

  const constraints = await client.query(`
    SELECT
      tc.constraint_name,
      tc.constraint_type,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints tc
    LEFT JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    LEFT JOIN information_schema.constraint_column_usage ccu
      ON tc.constraint_name = ccu.constraint_name
      AND tc.table_schema = ccu.table_schema
    WHERE tc.table_schema = 'public'
      AND tc.table_name = 'fin_accounting_events'
    ORDER BY tc.constraint_name;
  `);

  console.table(constraints.rows);

  await client.end();

  console.log('');
  console.log('Accounting event audit completed.');
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
