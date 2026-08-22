const { Client } = require('pg');
const { connectionString } = require('./database-config.cjs');

const client = new Client({ connectionString });

async function main() {
  await client.connect();

  console.log('');
  console.log('============================================================');
  console.log(' VOUCHER / JOURNAL DIAGNOSTIC');
  console.log(' READ-ONLY - NO DATABASE CHANGES');
  console.log('============================================================');

  const result = await client.query(`
    SELECT
      v.id AS voucher_id,
      v.voucher_no,
      v.voucher_type,
      v.voucher_date,
      v.total_amount,
      v.accounting_event_id,
      v.source_type,
      v.source_id,
      v.posting_status,
      v.reversal_of_voucher_id,

      COUNT(j.id) AS journal_line_count,
      COALESCE(SUM(j.debit), 0) AS journal_debit,
      COALESCE(SUM(j.credit), 0) AS journal_credit

    FROM erp_vouchers v

    LEFT JOIN erp_journal_entries j
      ON j.voucher_id = v.id

    GROUP BY
      v.id,
      v.voucher_no,
      v.voucher_type,
      v.voucher_date,
      v.total_amount,
      v.accounting_event_id,
      v.source_type,
      v.source_id,
      v.posting_status,
      v.reversal_of_voucher_id

    HAVING
      v.total_amount <> 0
      AND (
        COALESCE(SUM(j.debit), 0) = 0
        AND COALESCE(SUM(j.credit), 0) = 0
      )

    ORDER BY v.voucher_date, v.voucher_no;
  `);

  console.log('');
  console.log('========== PROBLEM VOUCHERS ==========');
  console.table(result.rows);

  for (const voucher of result.rows) {
    console.log('');
    console.log('------------------------------------------------------------');
    console.log(`Voucher: ${voucher.voucher_no}`);
    console.log(`Type: ${voucher.voucher_type}`);
    console.log(`Amount: ${voucher.total_amount}`);
    console.log(`Accounting Event: ${voucher.accounting_event_id}`);
    console.log(`Source: ${voucher.source_type} / ${voucher.source_id}`);
    console.log(`Posting Status: ${voucher.posting_status}`);

    const lines = await client.query(`
      SELECT
        j.id,
        j.account_id,
        j.account_name,
        j.debit,
        j.credit,
        j.accounting_event_id,
        j.line_number,
        j.description,
        j.lease_id,
        j.property_id,
        j.unit_id,
        j.customer_id
      FROM erp_journal_entries j
      WHERE j.voucher_id = $1
      ORDER BY j.line_number NULLS LAST, j.created_at;
    `, [voucher.voucher_id]);

    console.log('');
    console.log('Journal Lines:');
    console.table(lines.rows);
  }

  await client.end();

  console.log('');
  console.log('============================================================');
  console.log(' DIAGNOSTIC COMPLETED');
  console.log(' NO DATABASE CHANGES WERE MADE');
  console.log('============================================================');
}

main().catch(async (error) => {
  console.error('');
  console.error('Diagnostic failed.');
  console.error(error.message);

  try {
    await client.end();
  } catch {}

  process.exit(1);
});
