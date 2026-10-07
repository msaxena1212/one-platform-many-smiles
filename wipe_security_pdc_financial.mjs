/**
 * wipe_security_pdc_financial.mjs
 * Script to delete/truncate:
 * 1. Security / Security Audit / Security Deposits
 * 2. PDCs (pdcs, pdc_cheques, pdc_vouchers, pdc_lifecycle_events, bulk deposits)
 * 3. Financial Reports & Records (invoices, payments, accounts_receivable, receipt_vouchers, payment_vouchers, journal_entries, journal_entry_lines, cash_book_entries, petty_cash, legal_receivables)
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rnebpqnzignwjeukgztz.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZWJwcW56aWdud2pldWtnenR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDE3NTg4MiwiZXhwIjoyMDk5NzUxODgyfQ.mRwmoyI1ZIKX96qT5dwrno4RATxj01qgSVZ10YigG28';

const HEADERS = {
  'apikey': SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
};

const TABLES_TO_CLEAR = [
  // 1. Security records & logs & deposits
  'security_audit_logs',
  'security_deposits',
  'deposit_transactions',
  'system_security_logs',

  // 2. PDC records & lifecycle
  'pdc_vouchers',
  'pdc_lifecycle_events',
  'pdc_cheques',
  'pdcs',

  // 3. Financial & Accounting records / reports
  'legal_receivables',
  'petty_cash_transactions',
  'petty_cash_vouchers',
  'cash_transactions',
  'cash_book_entries',
  'journal_entry_lines',
  'journal_entries',
  'receipt_vouchers',
  'payment_vouchers',
  'payments',
  'invoices',
  'accounts_receivable',
  'lease_vouchers',
  'payroll_sync_logs',
  'payroll_sync_batches',
  'tenant_subscription_invoices'
];

async function deleteFromTable(table) {
  try {
    const url = `${SUPABASE_URL}/rest/v1/${table}?id=neq.00000000-0000-0000-0000-000000000000`;
    const res = await fetch(url, { method: 'DELETE', headers: HEADERS });
    if (res.status === 204 || res.status === 200) {
      console.log(`  ✅ Cleared: ${table.padEnd(32)}`);
    } else if (res.status === 404) {
      console.log(`  ⏭  Skipped (table not found): ${table}`);
    } else {
      const body = await res.text();
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
