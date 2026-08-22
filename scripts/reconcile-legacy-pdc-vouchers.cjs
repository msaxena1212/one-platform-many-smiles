const { Client } = require('pg');
const { connectionString } = require('./database-config.cjs');

const client = new Client({ connectionString });

async function main() {
  await client.connect();

  console.log('');
  console.log('============================================================');
  console.log(' LEGACY PDC ? VOUCHER RECONCILIATION');
  console.log(' READ-ONLY - NO DATABASE CHANGES');
  console.log('============================================================');

  const vouchers = await client.query(`
    SELECT
      id,
      voucher_no,
      voucher_type,
      voucher_date,
      total_amount,
      notes,
      posting_status,
      created_at
    FROM erp_vouchers
    WHERE voucher_no IN ('00708206', '01000025', '01000040')
    ORDER BY voucher_no;
  `);

  console.log('');
  console.log('========== LEGACY VOUCHERS ==========');
  console.table(vouchers.rows);

  for (const voucher of vouchers.rows) {
    console.log('');
    console.log('------------------------------------------------------------');
    console.log(\`Voucher: \${voucher.voucher_no}\`);
    console.log(\`Amount: \${voucher.total_amount}\`);
    console.log(\`Notes: \${voucher.notes}\`);

    console.log('');
    console.log('========== PDC MATCHES BY CHEQUE NUMBER ==========');

    const pdc = await client.query(`
      SELECT *
      FROM pdc_records
      WHERE cheque_number = $1
         OR cheque_no = $1
         OR check_number = $1
         OR check_no = $1
      LIMIT 20;
    `, [voucher.voucher_no]);

    console.table(pdc.rows);

    console.log('');
    console.log('========== PDC FINANCE REGISTER ==========');

    const register = await client.query(`
      SELECT *
      FROM pdc_finance_register
      WHERE cheque_number = $1
         OR cheque_no = $1
         OR check_number = $1
         OR check_no = $1
      LIMIT 20;
    `, [voucher.voucher_no]);

    console.table(register.rows);
  }

  console.log('');
  console.log('============================================================');
  console.log(' RECONCILIATION COMPLETED');
  console.log(' NO DATABASE CHANGES WERE MADE');
  console.log('============================================================');

  await client.end();
}

main().catch(async (error) => {
  console.error('');
  console.error('Reconciliation failed.');
  console.error(error.message);

  try {
    await client.end();
  } catch {}

  process.exit(1);
});
