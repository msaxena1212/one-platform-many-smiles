/**
 * wipe_security_pdc_financial_exact.mjs
 * Truncates / Deletes:
 * 1. Security & audit logs
 * 2. PDCs & PDC registers
 * 3. Financial accounting events, vouchers, receipts, and deposits
 */

const SUPABASE_URL = 'https://rnebpqnzignwjeukgztz.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZWJwcW56aWdud2pldWtnenR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDE3NTg4MiwiZXhwIjoyMDk5NzUxODgyfQ.mRwmoyI1ZIKX96qT5dwrno4RATxj01qgSVZ10YigG28';

const HEADERS = {
  'apikey': SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
};

const TABLES_TO_CLEAR = [
  // Child financial lines first
  'fin_accounting_event_lines',
  'fin_voucher_lines',
  'fin_transaction_receipts',
  'fin_accounting_events',
  'fin_vouchers',
  'fin_pdc_register',
  'fin_deposits',
  'fin_legal_receivables',
  'fin_payroll_syncs',
  
  // Legacy / extra finance & PDC tables
  'pdcs',
  'tenant_subscription_invoices',
  'security_audit_logs',
  'erp_journal_entries',
  'erp_vouchers'
];

async function deleteFromTable(table) {
  try {
    // Delete all records (where id is not null / uuid not nil)
    const url = `${SUPABASE_URL}/rest/v1/${table}?id=neq.00000000-0000-0000-0000-000000000000`;
    const res = await fetch(url, { method: 'DELETE', headers: HEADERS });
    if (res.status === 204 || res.status === 200) {
      console.log(`  ✅ Cleared: ${table.padEnd(32)}`);
    } else if (res.status === 404) {
      console.log(`  ⏭  Skipped (table not found): ${table}`);
    } else {
      const body = await res.text();
      // If id is bigint or int, try with gt.0
      if (body.includes('invalid input syntax for type uuid') || body.includes('22P02')) {
        const intUrl = `${SUPABASE_URL}/rest/v1/${table}?id=gte.0`;
        const intRes = await fetch(intUrl, { method: 'DELETE', headers: HEADERS });
        if (intRes.status === 204 || intRes.status === 200) {
          console.log(`  ✅ Cleared (int id): ${table.padEnd(23)}`);
          return;
        }
      }
      if (body.includes('does not exist') || body.includes('42P01') || body.includes('Could not find')) {
        console.log(`  ⏭  Skipped (does not exist): ${table}`);
      } else {
        console.log(`  ⚠  ${table}: HTTP ${res.status} - ${body.slice(0, 100)}`);
      }
    }
  } catch (e) {
    console.log(`  ❌ ${table}: ${e.message}`);
  }
}

async function run() {
  console.log('====================================================');
  console.log(' Deleting Security, PDCs, and Financial Report Data ');
  console.log('====================================================\n');

  for (const table of TABLES_TO_CLEAR) {
    await deleteFromTable(table);
  }

  console.log('\n✅ Cleanup complete!');
}

run().catch(console.error);
