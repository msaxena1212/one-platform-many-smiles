const { Client } = require('pg');
const { connectionString } = require('./database-config.cjs');

const client = new Client({ connectionString });

async function main() {
  await client.connect();

  console.log('');
  console.log('============================================================');
  console.log(' PDC SCHEMA AUDIT');
  console.log(' READ-ONLY - NO DATABASE CHANGES');
  console.log('============================================================');

  const tables = ['pdc_records', 'pdc_finance_register'];

  for (const table of tables) {
    console.log('');
    console.log(`========== ${table.toUpperCase()} ==========`);

    const result = await client.query(`
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

    if (result.rows.length === 0) {
      console.log(`Table not found: ${table}`);
    } else {
      console.table(result.rows);
    }
  }

  console.log('');
  console.log('============================================================');
  console.log(' SCHEMA AUDIT COMPLETED');
  console.log(' NO DATABASE CHANGES WERE MADE');
  console.log('============================================================');

  await client.end();
}

main().catch(async (error) => {
  console.error('');
  console.error('Schema audit failed.');
  console.error(error.message);

  try {
    await client.end();
  } catch {}

  process.exit(1);
});
