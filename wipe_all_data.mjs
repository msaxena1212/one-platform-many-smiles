/**
 * wipe_all_data.mjs
 * Wipes ALL platform data from Supabase using the REST API + service_role key.
 * No WebSocket dependency — pure HTTPS fetch calls.
 */

const SUPABASE_URL = 'https://rnebpqnzignwjeukgztz.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZWJwcW56aWdud2pldWtnenR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDE3NTg4MiwiZXhwIjoyMDk5NzUxODgyfQ.mRwmoyI1ZIKX96qT5dwrno4RATxj01qgSVZ10YigG28';

const HEADERS = {
  'apikey': SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
};

// ── Tables in child → parent order (respects FK constraints) ─────────────────
const DATA_TABLES = [
  'journal_entry_lines',
  'journal_entries',
  'payments',
  'pdc_cheques',
  'lease_documents',
  'lease_renewals',
  'leases',
  'reservations',
  'unit_documents',
  'units',
  'property_images',
  'properties',
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
  'maintenance_tickets',
  'work_orders',
  'inventory_items',
  'vendor_jobs',
  'security_deposits',
  'deposit_transactions',
  'tenant_subscription_invoices',
  'tenant_organisations',
  'security_audit_logs',
  'notifications',
  'system_notifications',
];

async function deleteFromTable(table) {
  try {
    // DELETE all rows: we use neq on a dummy field to trigger a full delete
    // Supabase REST requires a filter for DELETE — we use id=neq.00000...
    const url = `${SUPABASE_URL}/rest/v1/${table}?id=neq.00000000-0000-0000-0000-000000000000`;
    const res = await fetch(url, { method: 'DELETE', headers: HEADERS });

    if (res.status === 204 || res.status === 200) {
      console.log(`  ✅ ${table.padEnd(42)} — deleted`);
    } else if (res.status === 404) {
      console.log(`  ⏭  ${table.padEnd(42)} — table not found`);
    } else {
      const body = await res.text();
      // Ignore "does not exist" errors gracefully
      if (body.includes('does not exist') || body.includes('42P01')) {
        console.log(`  ⏭  ${table.padEnd(42)} — table not found`);
      } else {
        console.log(`  ⚠  ${table.padEnd(42)} — HTTP ${res.status}: ${body.slice(0, 120)}`);
      }
    }
  } catch (e) {
    console.log(`  ❌ ${table.padEnd(42)} — ${e.message}`);
  }
}

async function wipeProfiles() {
  console.log('\n─── Wiping non-SUPER_ADMIN profiles ───────────────────────');
  try {
    const url = `${SUPABASE_URL}/rest/v1/profiles?role=neq.SUPER_ADMIN`;
    const res = await fetch(url, { method: 'DELETE', headers: HEADERS });
    if (res.status === 204 || res.status === 200) {
      console.log('  ✅ profiles (non-SUPER_ADMIN)                 — deleted');
    } else {
      const body = await res.text();
      console.log(`  ⚠  profiles — ${body.slice(0, 120)}`);
    }
  } catch (e) {
    console.log('  ❌ profiles —', e.message);
  }
}

async function listAuthUsers() {
  const url = `${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=1000`;
  const res = await fetch(url, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    }
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`listUsers HTTP ${res.status}: ${body}`);
  }
  const data = await res.json();
  return data.users || [];
}

async function deleteAuthUser(userId, email) {
  const url = `${SUPABASE_URL}/auth/v1/admin/users/${userId}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    }
  });
  if (res.status === 200 || res.status === 204) {
    console.log(`  🗑  Deleted  ${email}`);
    return true;
  } else {
    const body = await res.text();
    console.log(`  ⚠  Failed   ${email}: ${body.slice(0, 100)}`);
    return false;
  }
}

async function wipeAuthUsers() {
  console.log('\n─── Deleting demo auth users ───────────────────────────────');
  try {
    const users = await listAuthUsers();
    console.log(`  Found ${users.length} auth user(s)\n`);

    let kept = 0;
    let deleted = 0;

    for (const user of users) {
      const role = user.user_metadata?.role || user.app_metadata?.role || '';
      const email = user.email || '';

      // Keep SUPER_ADMIN
      if (role === 'SUPER_ADMIN' || email.toLowerCase().includes('superadmin') || email.toLowerCase().includes('super.admin')) {
        console.log(`  🔒 Keeping  ${email.padEnd(45)} [SUPER_ADMIN]`);
        kept++;
        continue;
      }

      const ok = await deleteAuthUser(user.id, email);
      if (ok) deleted++;
    }

    console.log(`\n  Result: ${deleted} user(s) deleted, ${kept} super admin(s) retained.`);
  } catch (e) {
    console.log('  ❌ Auth wipe error:', e.message);
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║   ZYNO PMS — Full Platform Data Wipe (Supabase)    ║');
  console.log('╚════════════════════════════════════════════════════╝\n');
  console.log('  Project:', SUPABASE_URL);
  console.log('  Auth:   Service Role (RLS bypassed)\n');

  console.log('─── Truncating data tables ─────────────────────────────────');
  for (const table of DATA_TABLES) {
    await deleteFromTable(table);
  }

  await wipeProfiles();
  await wipeAuthUsers();

  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║  ✅ Platform reset complete!                         ║');
  console.log('║  You can now onboard the first real tenant.          ║');
  console.log('╚════════════════════════════════════════════════════╝\n');
}

main().catch(console.error);
