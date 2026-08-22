const { Client } = require('pg');
const { connectionString } = require('./database-config.cjs');

const client = new Client({ connectionString });

async function main() {
  await client.connect();

  console.log('');
  console.log('============================================================');
  console.log(' PDC / FINANCE REGISTER STRUCTURE AUDIT');
  console.log(' READ-ONLY - NO DATABASE CHANGES');
  console.log('============================================================');

  for (const table of ['pdcs', 'fin_pdc_register']) {

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
        con.conname AS constraint_name,
        CASE con.contype
          WHEN 'p' THEN 'PRIMARY KEY'
          WHEN 'f' THEN 'FOREIGN KEY'
          WHEN 'u' THEN 'UNIQUE'
          WHEN 'c' THEN 'CHECK'
          WHEN 'x' THEN 'EXCLUDE'
          ELSE con.contype::text
        END AS constraint_type,
        pg_get_constraintdef(con.oid) AS definition
      FROM pg_constraint con
      JOIN pg_class rel
        ON rel.oid = con.conrelid
      JOIN pg_namespace nsp
        ON nsp.oid = rel.relnamespace
      WHERE nsp.nspname = 'public'
        AND rel.relname = $1
      ORDER BY con.conname;
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
  console.log(' STRUCTURE AUDIT COMPLETED');
  console.log(' NO DATABASE CHANGES WERE MADE');
  console.log('============================================================');

  await client.end();
}

main().catch(async (error) => {
  console.error('');
  console.error('Structure audit failed.');
  console.error(error.message);

  try {
    await client.end();
  } catch {}

  process.exit(1);
});
