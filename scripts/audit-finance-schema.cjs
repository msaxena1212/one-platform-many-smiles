const { Client } = require('pg');
const { connectionString } = require('./database-config.cjs');

const client = new Client({
  connectionString
});

const tables = [
  'erp_chart_of_accounts',
  'erp_vouchers',
  'erp_journal_entries',
  'collection_receipts',
  'pdcs',
  'fin_pdc_register',
  'fin_deposits',
  'fin_posting_periods'
];

async function main() {
  await client.connect();

  console.log('');
  console.log('==============================================');
  console.log(' PRODUCTION FINANCE SCHEMA AUDIT');
  console.log('==============================================');

  for (const table of tables) {
    console.log('');
    console.log(`========== ${table} ==========`);

    const columns = await client.query(`
      SELECT
        ordinal_position,
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
        AND tc.table_name = $1
      ORDER BY tc.constraint_name, kcu.ordinal_position;
    `, [table]);

    console.log('');
    console.log('Constraints:');
    console.table(constraints.rows);

    const indexes = await client.query(`
      SELECT
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename = $1
      ORDER BY indexname;
    `, [table]);

    console.log('');
    console.log('Indexes:');
    console.table(indexes.rows);
  }

  console.log('');
  console.log('==============================================');
  console.log(' AUDIT COMPLETED');
  console.log(' NO DATABASE CHANGES WERE MADE');
  console.log('==============================================');

  await client.end();
}

main().catch(async (error) => {
  console.error('');
  console.error('Finance schema audit failed.');
  console.error(error);

  try {
    await client.end();
  } catch {}

  process.exit(1);
});
