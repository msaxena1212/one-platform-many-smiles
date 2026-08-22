const { Client } = require('pg');
const { connectionString } = require('./database-config.cjs');

const client = new Client({ connectionString });

const voucherNos = ['00708206', '01000025', '01000040'];

async function main() {
  await client.connect();

  console.log('');
  console.log('============================================================');
  console.log(' LEGACY VOUCHER REFERENCE AUDIT');
  console.log(' READ-ONLY - NO DATABASE CHANGES');
  console.log('============================================================');

  console.log('');
  console.log('========== VOUCHER DETAILS ==========');

  const vouchers = await client.query(`
    SELECT
      id,
      voucher_no,
      voucher_type,
      voucher_date,
      total_amount,
      notes,
      accounting_event_id,
      source_type,
      source_id,
      posting_status,
      reversal_of_voucher_id,
      created_by,
      created_at,
      updated_at
    FROM erp_vouchers
    WHERE voucher_no = ANY($1::text[])
    ORDER BY voucher_no;
  `, [voucherNos]);

  console.table(vouchers.rows);

  console.log('');
  console.log('========== POSSIBLE SOURCE REFERENCES ==========');

  for (const voucher of vouchers.rows) {
    console.log('');
    console.log(`Voucher ${voucher.voucher_no}`);

    const refs = await client.query(`
      SELECT
        table_schema,
        table_name,
        column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND column_name IN (
          'voucher_id',
          'voucher_no',
          'receipt_id',
          'receipt_no',
          'source_id',
          'accounting_event_id'
        )
      ORDER BY table_name, column_name;
    `);

    console.table(refs.rows);

    console.log('');
    console.log('Searching known finance tables...');

    const knownTables = [
      'collection_receipts',
      'fin_deposits',
      'fin_pdc_register',
      'fin_accounting_events',
      'erp_journal_entries'
    ];

    for (const table of knownTables) {
      try {
        const exists = await client.query(`
          SELECT EXISTS (
            SELECT 1
            FROM information_schema.tables
            WHERE table_schema = 'public'
              AND table_name = $1
          ) AS exists;
        `, [table]);

        if (!exists.rows[0].exists) {
          continue;
        }

        const columns = await client.query(`
          SELECT column_name
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = $1
            AND column_name IN (
              'voucher_id',
              'voucher_no',
              'receipt_no',
              'accounting_event_id',
              'source_id'
            )
          ORDER BY ordinal_position;
        `, [table]);

        if (columns.rows.length === 0) {
          continue;
        }

        console.log(`Table: ${table}`);
        console.table(columns.rows);

        for (const column of columns.rows) {
          const columnName = column.column_name;

          let value = null;

          if (columnName === 'voucher_id') {
            value = voucher.id;
          } else if (columnName === 'voucher_no') {
            value = voucher.voucher_no;
          } else if (columnName === 'receipt_no') {
            value = voucher.voucher_no;
          } else if (columnName === 'accounting_event_id') {
            value = voucher.accounting_event_id;
          } else if (columnName === 'source_id') {
            value = voucher.source_id;
          }

          if (value === null) {
            continue;
          }

          try {
            const match = await client.query(
              `SELECT COUNT(*)::int AS count
               FROM ${table}
               WHERE ${columnName}::text = $1::text`,
              [value]
            );

            if (match.rows[0].count > 0) {
              console.log(
                `REFERENCE FOUND: ${table}.${columnName} = ${value}`
              );
            }
          } catch {}
        }
      } catch {}
    }
  }

  await client.end();

  console.log('');
  console.log('============================================================');
  console.log(' REFERENCE AUDIT COMPLETED');
  console.log(' NO DATABASE CHANGES WERE MADE');
  console.log('============================================================');
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
