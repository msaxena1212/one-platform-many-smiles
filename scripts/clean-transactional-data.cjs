const { Client } = require('pg');
const { connectionString, ssl } = require('./database-config.cjs');

const client = new Client({ connectionString, ssl });

async function run() {
  await client.connect();
  console.log('Connected to database. Starting transactional data cleanup...');

  const transactionalTables = [
    // Accounting & Finance transactions
    'fin_voucher_lines',
    'fin_vouchers',
    'fin_accounting_event_lines',
    'fin_accounting_events',
    'erp_journal_entries',
    'erp_vouchers',
    'fin_payment_allocations',
    'fin_bank_reconciliations',
    'fin_deposits',
    'fin_legal_receivables',
    'fin_payroll_syncs',
    'fin_pdc_register',
    'collection_receipts',
    'pdcs',

    // Leasing, reservations, bookings & customers
    'key_handovers',
    'inspection_reports',
    'reviews',
    'reservations',
    'bookings',
    'leases',
    'customers',
    'fin_customers',

    // Procurement transactions
    'proc_grn_lines',
    'proc_goods_receipts',
    'proc_gate_inwards',
    'proc_purchase_order_lines',
    'proc_purchase_orders',
    'proc_purchase_request_lines',
    'proc_purchase_requests',
    'proc_shipments',
    'proc_vendor_quote_lines',
    'proc_vendor_quotes',
    'proc_rfx_lines',
    'proc_rfx_vendors',
    'proc_rfx',
    'proc_negotiations',
    'proc_customs_clearances',
    'proc_transports'
  ];

  for (const table of transactionalTables) {
    try {
      // Check if table exists
      const checkRes = await client.query(`
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = $1
      `, [table]);

      if (checkRes.rows.length > 0) {
        const delRes = await client.query(`TRUNCATE TABLE "${table}" CASCADE`);
        console.log(`[CLEANED] Truncated table: ${table}`);
      }
    } catch (err) {
      console.warn(`[WARN] Could not truncate ${table}: ${err.message}. Trying DELETE...`);
      try {
        await client.query(`DELETE FROM "${table}"`);
        console.log(`[CLEANED via DELETE] table: ${table}`);
      } catch (delErr) {
        console.error(`[ERROR] Failed to clean ${table}: ${delErr.message}`);
      }
    }
  }

  // Also reset any unit statuses that might have been occupied/reserved back to Available
  try {
    const unitUpdate = await client.query(`
      UPDATE units SET status = 'Available', lease_status = 'Vacant', current_tenant = NULL, contract_start_date = NULL, contract_end_date = NULL WHERE status IS NOT NULL
    `);
    console.log(`[RESET] Units reset to Available and Vacant (${unitUpdate.rowCount} rows)`);
  } catch (e) {
    console.warn(`[INFO] units status reset: ${e.message}`);
  }

  console.log('--- Cleanup Finished Successfully ---');
  await client.end();
}

run().catch(async (e) => {
  console.error('Cleanup failed:', e);
  try { await client.end(); } catch {}
  process.exit(1);
});
