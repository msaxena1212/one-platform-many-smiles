const { Client } = require('pg');

const tablesToTruncate = [
  // 1. Procurement Transactions
  "proc_vendor_quotes",
  "proc_vendor_quote_lines",
  "proc_transports",
  "proc_shipments",
  "proc_rfx_vendors",
  "proc_rfx_lines",
  "proc_rfx",
  "proc_purchase_request_lines",
  "proc_purchase_requests",
  "proc_purchase_order_lines",
  "proc_purchase_orders",
  "proc_negotiations",
  "proc_imports",
  "proc_grn_lines",
  "proc_goods_receipts",
  "proc_gate_inwards",
  "proc_customs_clearances",

  // 2. Financial & Accounting Transactions
  "fin_payment_allocations",
  "fin_accounting_event_lines",
  "fin_accounting_events",
  "fin_bank_reconciliations",
  "fin_legal_receivables",
  "fin_deposits",
  "fin_contracts",
  "fin_payroll_syncs",
  "fin_unit_sl_accounts",
  "fin_voucher_lines",
  "fin_vouchers",
  "erp_vouchers",
  "erp_journal_entries",
  "collection_receipts",

  // 3. Asset & Maintenance Operational Data
  "hrms_asset_allocations",
  "material_usage",
  "inventory_parts",
  "fixed_assets",
  "assets",

  // 4. PMS & Leasing Transactions
  "inspection_reports",
  "key_handovers",
  "fin_pdc_register",
  "pdcs",
  "bookings",
  "reservations",
  "leases",

  // 5. Units & Properties & Amenities
  "unit_coas",
  "unit_amenities",
  "unit_rooms",
  "units",
  "property_amenities",
  "property_images",
  "properties",

  // 6. Customers & Vendors
  "fin_customers",
  "customers",
  "fin_vendors"
];

async function resetOperationalData() {
  const client = new Client({ connectionString: 'postgresql://postgres.rnebpqnzignwjeukgztz:A6TeHnuvQfFqMHMZ@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres' });
  await client.connect();

  console.log("Beginning TRUNCATE of all operational, leasing, property, asset, maintenance, customer and vendor data...");
  
  // Truncate with CASCADE to cleanly wipe all foreign keys without constraint violation
  for (const t of tablesToTruncate) {
    try {
      await client.query(`TRUNCATE TABLE "${t}" CASCADE;`);
      console.log(`✅ Truncated: ${t}`);
    } catch (e) {
      console.warn(`⚠️ Warning truncating ${t}: ${e.message}`);
    }
  }

  console.log("\nVerifying master data preservation:");
  const masterTables = ['fin_financial_years', 'fin_regions', 'fin_cost_centers', 'fin_posting_periods', 'fin_coa_accounts', 'erp_chart_of_accounts'];
  for (const mt of masterTables) {
    const res = await client.query(`SELECT count(*) FROM "${mt}";`);
    console.log(`🔒 Master intact: ${mt} = ${res.rows[0].count} rows`);
  }

  await client.end();
}

resetOperationalData().catch(console.error);
