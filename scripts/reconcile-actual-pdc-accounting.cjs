const { Client } = require('pg');
const { connectionString } = require('./database-config.cjs');

const client = new Client({ connectionString });

const CHEQUES = ['00708206', '01000025', '01000040'];

async function main() {
  await client.connect();

  console.log('');
  console.log('============================================================');
  console.log(' ACTUAL PDC ? VOUCHER ? ACCOUNTING RECONCILIATION');
  console.log(' READ-ONLY - NO DATABASE CHANGES');
  console.log('============================================================');

  for (const cheque of CHEQUES) {
    console.log('');
    console.log('============================================================');
    console.log(` CHEQUE: ${cheque}`);
    console.log('============================================================');

    console.log('');
    console.log('========== PDCS ==========');

    const pdcs = await client.query(`
      SELECT
        id,
        lease_id,
        cheque_number,
        bank,
        deposit_date,
        amount,
        status,
        maturity_date,
        collection_date,
        bank_branch,
        unit_name,
        property_code,
        tenant_name,
        rent_from_date,
        rent_to_date,
        sl_no,
        status_pdc,
        created_at
      FROM pdcs
      WHERE cheque_number = $1
      ORDER BY created_at;
    `, [cheque]);

    console.table(pdcs.rows);

    console.log('');
    console.log('========== FIN_PDC_REGISTER ==========');

    const register = await client.query(`
      SELECT
        id,
        cheque_number,
        bank_id,
        cheque_date,
        amount,
        tenant_id,
        property_id,
        unit_id,
        status,
        deposit_date,
        cleared_date,
        returned_date,
        original_pdc_id,
        created_at
      FROM fin_pdc_register
      WHERE cheque_number = $1
      ORDER BY created_at;
    `, [cheque]);

    console.table(register.rows);

    console.log('');
    console.log('========== ERP VOUCHERS ==========');

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
        created_at,
        updated_at
      FROM erp_vouchers
      WHERE voucher_no = $1
         OR notes ILIKE '%' || $1 || '%'
      ORDER BY created_at;
    `, [cheque]);

    console.table(vouchers.rows);

    for (const voucher of vouchers.rows) {
      console.log('');
      console.log(`---------- JOURNAL ENTRIES FOR VOUCHER ${voucher.voucher_no} ----------`);

      const journals = await client.query(`
        SELECT
          id,
          voucher_id,
          accounting_event_id,
          account_id,
          account_name,
          debit,
          credit,
          line_number,
          description,
          lease_id,
          property_id,
          unit_id,
          customer_id,
          created_at
        FROM erp_journal_entries
        WHERE voucher_id = $1
        ORDER BY line_number NULLS LAST, created_at;
      `, [voucher.id]);

      console.table(journals.rows);
    }

    console.log('');
    console.log('========== ACCOUNTING EVENTS BY CHEQUE ==========');

    const events = await client.query(`
      SELECT
        e.id,
        e.event_type,
        e.status,
        e.event_date,
        e.posting_date,
        e.source_type,
        e.source_id,
        e.reference_number,
        e.description,
        e.idempotency_key,
        e.reversal_of_event_id,
        e.reversed_by_event_id,
        e.voucher_id,
        e.tenant_id,
        e.lease_id,
        e.property_id,
        e.unit_id,
        e.customer_id,
        e.total_debit,
        e.total_credit,
        e.created_at,
        e.posted_at,
        e.reversed_at
      FROM fin_accounting_events e
      WHERE e.reference_number = $1
         OR e.description ILIKE '%' || $1 || '%'
         OR e.metadata::text ILIKE '%' || $1 || '%'
      ORDER BY e.created_at;
    `, [cheque]);

    console.table(events.rows);

    for (const event of events.rows) {
      console.log('');
      console.log(`---------- ACCOUNTING EVENT LINES ${event.id} ----------`);

      const lines = await client.query(`
        SELECT
          *
        FROM fin_accounting_event_lines
        WHERE accounting_event_id = $1
        ORDER BY line_number;
      `, [event.id]);

      console.table(lines.rows);
    }
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
