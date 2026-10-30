/**
 * onboard_alameen_tenant.mjs
 * Onboards "Al Ameen Real Estate" on the Enterprise Plan
 * Creates Auth user, Profile, Tenant Organisation, and Subscription Invoice.
 */

const SUPABASE_URL = 'https://rnebpqnzignwjeukgztz.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZWJwcW56aWdud2pldWtnenR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDE3NTg4MiwiZXhwIjoyMDk5NzUxODgyfQ.mRwmoyI1ZIKX96qT5dwrno4RATxj01qgSVZ10YigG28';

const TENANT_NAME = 'Al Ameen Real Estate';
const TENANT_KEY = 'al-ameen-real-estate';
const ADMIN_EMAIL = 'alameenadmin@yopmail.com';
const ADMIN_PASSWORD = 'Mindz#789@';
const ADMIN_NAME = 'Al Ameen Admin';
const PLAN = 'Enterprise';

const HEADERS = {
  'apikey': SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json'
};

const ALL_RBAC_MODULES = [
  "dashboard", "properties", "units", "leases", "reservations", 
  "customers", "maintenance", "finance", "accounting", "journal", 
  "ledger", "pdc", "deposits", "hrms", "assets", "procurement", 
  "vendors", "analytics", "reports", "portal", "security", "settings"
];

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║   Onboarding Tenant: Al Ameen Real Estate (Enterprise)         ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // Step 1: Create or update Admin in Auth
  console.log('─── 1. Provisioning Supabase Auth User ───');
  const authPayload = {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: {
      full_name: ADMIN_NAME,
      role: 'ADMIN',
      tenant_key: TENANT_KEY,
      organisation_name: TENANT_NAME
    },
    app_metadata: {
      role: 'ADMIN',
      tenant_key: TENANT_KEY
    }
  };

  const createAuthRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(authPayload)
  });

  const createAuthBody = await createAuthRes.json();
  let adminUserId = createAuthBody?.id || createAuthBody?.user?.id;

  if (!createAuthRes.ok) {
    if (createAuthBody?.message?.includes('already been registered') || createAuthBody?.msg?.includes('already been registered')) {
      console.log('  ℹ️ User already in Auth. Updating password and metadata...');
      const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, { headers: HEADERS });
      const listData = await listRes.json();
      const existingUser = (listData?.users || listData || []).find(u => u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());

      if (existingUser) {
        adminUserId = existingUser.id;
        await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${adminUserId}`, {
          method: 'PUT',
          headers: HEADERS,
          body: JSON.stringify({
            password: ADMIN_PASSWORD,
            email_confirm: true,
            user_metadata: authPayload.user_metadata,
            app_metadata: authPayload.app_metadata
          })
        });
        console.log(`  ✅ Auth user updated: ID = ${adminUserId}`);
      }
    } else {
      console.error('  ❌ Auth creation failed:', createAuthBody);
    }
  } else {
    console.log(`  ✅ Auth user created: ID = ${adminUserId}`);
  }

  // Step 2: Insert / Upsert into tenant_organisations
  console.log('\n─── 2. Creating Tenant Organisation Record ───');
  const orgPayload = {
    tenant_key: TENANT_KEY,
    name: TENANT_NAME,
    legal_entity_name: 'Al Ameen Real Estate W.L.L',
    commercial_reg_no: 'CR-90821-QA',
    country: 'Qatar',
    city: 'Doha',
    primary_email: ADMIN_EMAIL,
    admin_name: ADMIN_NAME,
    admin_email: ADMIN_EMAIL,
    admin_user_id: adminUserId,
    plan: PLAN,
    billing_cycle: 'annual',
    status: 'Active',
    max_properties: 100,
    max_units: 3000,
    max_staff_users: 100,
    max_storage_gb: 500,
    enabled_modules: ALL_RBAC_MODULES,
    subscription_amount: 24990,
    currency: 'QAR',
    payment_method: 'Corporate Bank Transfer (IBAN)',
    payment_status: 'Paid',
    transaction_ref: `TXN-ALAMEEN-${Date.now().toString().slice(-6)}`,
    total_paid: 24990,
    created_at: new Date().toISOString()
  };

  const orgRes = await fetch(`${SUPABASE_URL}/rest/v1/tenant_organisations`, {
    method: 'POST',
    headers: {
      ...HEADERS,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(orgPayload)
  });

  const orgBody = await orgRes.json();
  const createdOrg = Array.isArray(orgBody) ? orgBody[0] : orgBody;
  const orgId = createdOrg?.id;

  if (!orgRes.ok) {
    console.error('  ❌ Failed to insert tenant organisation:', orgBody);
  } else {
    console.log(`  ✅ Tenant Organisation created with ID: ${orgId}`);
  }

  // Step 3: Insert Subscription Invoice
  console.log('\n─── 3. Generating Subscription Invoice ───');
  const invoicePayload = {
    invoice_number: `INV-SUB-${Date.now().toString().slice(-6)}`,
    tenant_id: orgId || '00000000-0000-0000-0000-000000000001',
    tenant_key: TENANT_KEY,
    tenant_name: TENANT_NAME,
    plan: PLAN,
    billing_cycle: 'annual',
    subtotal_amount: 24990,
    tax_amount: 0,
    discount_amount: 0,
    total_amount: 24990,
    currency: 'QAR',
    status: 'Paid',
    payment_method: 'Corporate Bank Transfer (IBAN)',
    transaction_ref: orgPayload.transaction_ref,
    payment_date: new Date().toISOString(),
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    created_at: new Date().toISOString()
  };

  const invRes = await fetch(`${SUPABASE_URL}/rest/v1/tenant_subscription_invoices`, {
    method: 'POST',
    headers: { ...HEADERS, 'Prefer': 'return=representation' },
    body: JSON.stringify(invoicePayload)
  });

  const invBody = await invRes.json();
  if (!invRes.ok) {
    console.error('  ⚠️ Invoice warning:', invBody);
  } else {
    console.log(`  ✅ Enterprise Invoice generated: ${invoicePayload.invoice_number}`);
  }

  // Step 4: Upsert into profiles table
  console.log('\n─── 4. Upserting Administrator Profile ───');
  if (adminUserId) {
    const profilePayload = {
      id: adminUserId,
      role: 'ADMIN',
      full_name: ADMIN_NAME,
      avatar_url: null
    };

    const profRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: { ...HEADERS, 'Prefer': 'resolution=merge-duplicates' },
      body: JSON.stringify(profilePayload)
    });

    if (profRes.ok || profRes.status === 201 || profRes.status === 204) {
      console.log('  ✅ Admin Profile mapped to ADMIN role');
    } else {
      console.warn('  ⚠️ Profile notice:', await profRes.text());
    }
  }

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║   🎉 TENANT ONBOARDING COMPLETE!                                ║');
  console.log('╠════════════════════════════════════════════════════════════════╣');
  console.log(`║   Organisation: ${TENANT_NAME.padEnd(46)}║`);
  console.log(`║   Plan:         Enterprise (Unlimited Modules)                 ║`);
  console.log(`║   Admin Email:  ${ADMIN_EMAIL.padEnd(46)}║`);
  console.log(`║   Password:     ${ADMIN_PASSWORD.padEnd(46)}║`);
  console.log(`║   Role:         ADMIN                                          ║`);
  console.log(`║   Landing Route:/admin                                         ║`);
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
}

main().catch(console.error);
