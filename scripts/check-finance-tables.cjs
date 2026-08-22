const { Client } = require('pg');
const { connectionString } = require('./database-config.cjs');

const client = new Client({
  connectionString
});

async function main() {
  console.log('Connecting to database...');

  await client.connect();

  console.log('Database connection successful.');

  const result = await client.query(`
    SELECT
      table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN (
        'erp_chart_of_accounts',
        'erp_vouchers',
        'erp_journal_entries',
        'collection_receipts',
        'pdcs',
        'fin_pdc_register',
        'fin_deposits',
        'fin_posting_periods'
      )
    ORDER BY table_name;
  `);

  console.log('');
  console.log('Existing Finance tables:');

  console.table(result.rows);

  await client.end();

  console.log('');
  console.log('Finance schema check completed successfully.');
}

main().catch(async (error) => {
  console.error('');
  console.error('Schema check failed.');
  console.error(error.message);

  try {
    await client.end();
  } catch {}

  process.exit(1);
});
