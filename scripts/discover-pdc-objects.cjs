const { Client } = require('pg');
const { connectionString } = require('./database-config.cjs');

const client = new Client({ connectionString });

async function main() {
  await client.connect();

  console.log('');
  console.log('============================================================');
  console.log(' PDC OBJECT DISCOVERY');
  console.log(' READ-ONLY - NO DATABASE CHANGES');
  console.log('============================================================');

  const objects = await client.query(`
    SELECT
      table_schema,
      table_name,
      table_type
    FROM information_schema.tables
    WHERE LOWER(table_name) LIKE '%pdc%'
       OR LOWER(table_name) LIKE '%cheque%'
       OR LOWER(table_name) LIKE '%check%'
    ORDER BY table_schema, table_name;
  `);

  console.log('');
  console.log('========== PDC / CHEQUE / CHECK TABLES ==========');
  console.table(objects.rows);

  const views = await client.query(`
    SELECT
      table_schema,
      table_name
    FROM information_schema.views
    WHERE LOWER(table_name) LIKE '%pdc%'
       OR LOWER(table_name) LIKE '%cheque%'
       OR LOWER(table_name) LIKE '%check%'
    ORDER BY table_schema, table_name;
  `);

  console.log('');
  console.log('========== PDC / CHEQUE / CHECK VIEWS ==========');
  console.table(views.rows);

  console.log('');
  console.log('========== COLUMNS CONTAINING PDC / CHEQUE / CHECK ==========');

  const columns = await client.query(`
    SELECT
      table_schema,
      table_name,
      column_name,
      data_type,
      udt_name
    FROM information_schema.columns
    WHERE LOWER(column_name) LIKE '%pdc%'
       OR LOWER(column_name) LIKE '%cheque%'
       OR LOWER(column_name) LIKE '%check%'
    ORDER BY table_schema, table_name, ordinal_position;
  `);

  console.table(columns.rows);

  console.log('');
  console.log('============================================================');
  console.log(' DISCOVERY COMPLETED');
  console.log(' NO DATABASE CHANGES WERE MADE');
  console.log('============================================================');

  await client.end();
}

main().catch(async (error) => {
  console.error('');
  console.error('Discovery failed.');
  console.error(error.message);

  try {
    await client.end();
  } catch {}

  process.exit(1);
});
