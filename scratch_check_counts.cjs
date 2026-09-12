const { Client } = require('pg');

// Tables to keep untouched:
// 1. fin_financial_years (Financial Year)
// 2. fin_regions (Region)
// 3. fin_cost_centers (Cost Center)
// 4. Budget Head & Type (if any specific budget master tables exist, or cost center budget configurations)
// 5. fin_posting_periods (Posting Period)
// 6. Chart Of Accounts: fin_coa_accounts, erp_chart_of_accounts
// 7. System / Configuration Masters & Metadata: modules, role_permissions, profiles, spatial_ref_sys, geography_columns, geometry_columns, mst_* (master dropdowns)

// Tables to TRUNCATE / WIPE FRESH:
const tablesToClear = [
  // Leasing & PMS operational
  "leases",
  "reservations",
  "bookings",
  "pdcs",
  "fin_pdc_register",
  "key_handovers",
  "inspection_reports",
  "collection_receipts",
  
  // Units & Properties
  "property_amenities",
  "property_images",
  "unit_amenities",
  "unit_rooms",
  "unit_coas",
  "units",
  "properties",

  // Customers & Vendors
  "customers",
  "fin_customers",
  "fin_vendors",

  // Assets & Maintenance
  "assets",
  "fixed_assets",
  "hrms_asset_allocations",
  "inventory_parts",
  "material_usage",

  // Financial vouchers & transactional postings
  "fin_voucher_lines",
  "fin_vouchers",
  "erp_vouchers",
  "erp_journal_entries",
  "fin_accounting_event_lines",
  "fin_accounting_events",
  "fin_payment_allocations",
  "fin_bank_reconciliations",
  "fin_legal_receivables",
  "fin_deposits",
  "fin_contracts",
  "fin_payroll_syncs",
  "fin_unit_sl_accounts",

  // Procurement transactions
  "proc_customs_clearances",
  "proc_gate_inwards",
  "proc_goods_receipts",
  "proc_grn_lines",
  "proc_imports",
  "proc_negotiations",
  "proc_purchase_order_lines",
  "proc_purchase_orders",
  "proc_purchase_request_lines",
  "proc_purchase_requests",
  "proc_rfx",
  "proc_rfx_lines",
  "proc_rfx_vendors",
  "proc_shipments",
  "proc_transports",
  "proc_vendor_quote_lines",
  "proc_vendor_quotes"
];

async function countAndClear() {
  const client = new Client({ connectionString: "postgresql://postgres.rnebpqnzignwjeukgztz:A6TeHnuvQfFqMHMZ@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres" });
  await client.connect();

  console.log("=== Checking current row counts before reset ===");
  for (const t of tablesToClear) {
    try {
      const res = await client.query(`SELECT count(*) FROM "${t}";`);
      console.log(`${t}: ${res.rows[0].count} rows`);
    } catch (e) {
      console.log(`${t}: error checking count (${e.message})`);
    }
  }

  await client.end();
}

countAndClear().catch(console.error);
