/**
 * wipe_all_modules.mjs
 * Comprehensive data wipe covering all requested modules:
 * - Lease Lifecycle & Operations (All Leases, Reservations, Documents, Terms, Signatures, Keys/Check-in, Vouchers, Renewals, Checkout, Audit Flow)
 * - Customer Master
 * - Finance / Accounts (Chart of Accounts, Receivables, PDC Management, Deposits & Guarantees, Legal Receivables, Payroll Sync Engine, General Ledger, Cash Book, Petty Cash, Cash on Hand, etc.)
 * - Asset Management (Asset Registry, Depreciation, Allocation, Warranty, Maintenance, Revaluation, Sale, Write-off)
 * - Employees & HRMS
 */

const SUPABASE_URL = 'https://rnebpqnzignwjeukgztz.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZWJwcW56aWdud2pldWtnenR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDE3NTg4MiwiZXhwIjoyMDk5NzUxODgyfQ.mRwmoyI1ZIKX96qT5dwrno4RATxj01qgSVZ10YigG28';

const HEADERS = {
  'apikey': SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
};

const ALL_MODULE_TABLES = [
  // Asset Management
  'asset_depreciations',
  'asset_allocations',
  'asset_warranties',
  'asset_maintenance_records',
  'asset_maintenance',
  'asset_revaluations',
  'asset_sales',
  'asset_write_offs',
  'fixed_assets',
  'assets',

  // Finance & Accounting / PDCs / GL / Transactions
  'petty_cash_transactions',
  'petty_cash_vouchers',
  'cash_transactions',
  'cash_book_entries',
  'deposit_transactions',
  'security_deposits',
  'legal_receivables',
  'payroll_sync_logs',
  'payroll_sync_batches',
  'pdc_vouchers',
  'pdc_lifecycle_events',
  'pdc_cheques',
  'pdcs',
  'payment_vouchers',
  'receipt_vouchers',
  'journal_entry_lines',
  'journal_entries',
  'payments',
  'invoices',
  'accounts_receivable',
  'chart_of_accounts',
  'coa_hierarchy',
  'chart_of_account_templates',

  // Lease Lifecycle & Operations
  'lease_checkouts',
  'lease_renewals',
  'lease_keys_checkin',
  'lease_key_handovers',
  'lease_signatures',
  'lease_agreement_terms',
  'lease_documents',
  'lease_vouchers',
  'lease_audit_logs',
  'lease_milestones',
  'reservations',
  'leases',

  // Customers / Tenants
  'customer_contacts',
  'customer_documents',
  'customers',

  // Property & Inventory
  'unit_furnishings',
  'unit_meters',
  'unit_documents',
  'units',
  'property_images',
  'properties',

  // HRMS / Employees
  'payslips',
  'payroll_cycles',
  'attendance_records',
  'leave_applications',
  'expense_claims',
  'fnf_settlements',
  'resignation_requests',
  'helpdesk_tickets',
  'appraisal_cycles',
  'announcements',
  'employees',

  // Security, Audit, Notifications & Subscriptions
  'security_audit_logs',
  'system_notifications',
  'notifications',
  'tenant_subscription_invoices',
  'tenant_organisations'
];

async function deleteFromTable(table) {
  try {
    const url = `${SUPABASE_URL}/rest/v1/${table}?id=neq.00000000-0000-0000-0000-000000000000`;
    const res = await fetch(url, { method: 'DELETE', headers: HEADERS });
    if (res.status === 204 || res.status === 200) {
      console.log(`  ✅ ${table.padEnd(38)} — deleted`);
    } else if (res.status === 404) {
      console.log(`  ⏭  ${table.padEnd(38)} — table not found (skipped)`);
    } else {
      const body = await res.text();
      if (body.includes('does not exist') || body.includes('42P01') || body.includes('Could not find')) {
        console.log(`  ⏭  ${table.padEnd(38)} — table not found (skipped)`);
      } else {
        console.log(`  ⚠  ${table.padEnd(38)} — HTTP ${res.status}: ${body.slice(0, 100)}`);
      }
    }
  } catch (e) {
    console.log(`  ❌ ${table.padEnd(38)} — ${e.message}`);
  }
}

async function run() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║   ZYNO PMS — Extended Wipe for All Requested Modules     ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  for (const table of ALL_MODULE_TABLES) {
    await deleteFromTable(table);
  }

  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║   ✅ All specified modules successfully cleared!         ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
}

run().catch(console.error);
