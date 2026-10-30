/**
 * sync_real_profiles.mjs
 * Syncs profiles for:
 * 1. Super Admin (supeadmin@zynopms.com) -> SUPER_ADMIN
 * 2. Al Ameen Admin (alameenadmin@yopmail.com) -> ADMIN
 * 3. 38 Real Employees from employees table
 * Total = 40 profiles.
 */

const SUPABASE_URL = 'https://rnebpqnzignwjeukgztz.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZWJwcW56aWdud2pldWtnenR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDE3NTg4MiwiZXhwIjoyMDk5NzUxODgyfQ.mRwmoyI1ZIKX96qT5dwrno4RATxj01qgSVZ10YigG28';

const HEADERS = {
  'apikey': SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json'
};

function resolveAppRole(remarks = '', firstName = '', lastName = '') {
  const full = `${firstName} ${lastName}`.toLowerCase();
  if (full.includes('jithin') || full.includes('shajid') || full.includes('hashim') || full.includes('jay alva') || full.includes('khawas')) {
    if (full.includes('farhan')) return 'LEASING';
    if (full.includes('shafraz')) return 'MAINTENANCE';
    if (full.includes('narayanan') || full.includes('raghunath') || full.includes('ajay') || full.includes('angira')) return 'ADMIN';
    return 'ADMIN';
  }
  if (full.includes('farhan')) return 'LEASING';
  return 'MAINTENANCE';
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║   Syncing Exact Real Profiles to Supabase                      ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // 1. Fetch all 38 employees
  const empRes = await fetch(`${SUPABASE_URL}/rest/v1/employees?select=*`, { headers: HEADERS });
  const employees = await empRes.json();
  console.log(`Fetched ${employees.length} employees from DB.`);

  // 2. Fetch tenant organisations to get tenant admin
  const tenantRes = await fetch(`${SUPABASE_URL}/rest/v1/tenant_organisations?select=*`, { headers: HEADERS });
  const tenants = await tenantRes.json();
  console.log(`Fetched ${tenants.length} tenant organisation(s).`);

  const profilesToInsert = [];

  // Super admin profile
  profilesToInsert.push({
    id: '22743744-a1e1-4d85-b342-7bfb9ceeb87d',
    role: 'SUPER_ADMIN',
    full_name: 'Super Admin',
    avatar_url: null,
    created_at: new Date().toISOString()
  });

  // Tenant Admin profile
  tenants.forEach(t => {
    if (t.admin_user_id) {
      profilesToInsert.push({
        id: t.admin_user_id,
        role: 'ADMIN',
        full_name: t.admin_name || 'Tenant Admin',
        avatar_url: null,
        created_at: t.created_at || new Date().toISOString()
      });
    }
  });

  // Employees profiles
  employees.forEach(e => {
    const role = resolveAppRole(e.remarks, e.first_name, e.last_name);
    const fullName = `${e.first_name || ''} ${e.last_name || ''}`.trim() || 'Employee';
    const profileId = e.user_id || e.id;

    profilesToInsert.push({
      id: profileId,
      role: role,
      full_name: fullName,
      avatar_url: null,
      created_at: e.created_at || new Date().toISOString()
    });
  });

  console.log(`\nInserting ${profilesToInsert.length} exact profiles...`);

  const insRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
    method: 'POST',
    headers: { ...HEADERS, 'Prefer': 'resolution=merge-duplicates' },
    body: JSON.stringify(profilesToInsert)
  });

  if (insRes.ok || insRes.status === 201 || insRes.status === 204) {
    console.log('✅ All profiles successfully synced to Supabase DB!');
  } else {
    console.error('⚠️ Insert notice:', await insRes.text());
  }

  // 3. Verify
  const verifyRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id,full_name,role`, { headers: HEADERS });
  const finalProfiles = await verifyRes.json();
  console.log(`\nVerified Profile Count in DB: ${finalProfiles.length}`);
  const byRole = {};
  finalProfiles.forEach(p => byRole[p.role] = (byRole[p.role] || 0) + 1);
  console.log('By Role:', byRole);
}

main().catch(console.error);
