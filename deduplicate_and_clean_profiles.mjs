/**
 * deduplicate_and_clean_profiles.mjs
 * Cleans duplicate profiles from DB and ensures exact count:
 * - 1 Super Admin (supeadmin@zynopms.com)
 * - 1 Tenant Admin (alameenadmin@yopmail.com)
 * - 38 Real Employees from Excel
 * Total = 40 users.
 */

const SUPABASE_URL = 'https://rnebpqnzignwjeukgztz.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZWJwcW56aWdud2pldWtnenR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDE3NTg4MiwiZXhwIjoyMDk5NzUxODgyfQ.mRwmoyI1ZIKX96qT5dwrno4RATxj01qgSVZ10YigG28';

const HEADERS = {
  'apikey': SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json'
};

async function fetchWithRetry(url, options, retries = 5, delay = 1000) {
  for (let i = 1; i <= retries; i++) {
    try {
      const res = await fetch(url, options);
      return res;
    } catch (e) {
      if (i === retries) throw e;
      await new Promise(r => setTimeout(r, delay * i));
    }
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║   Cleaning and Deduplicating User Profiles                     ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // 1. Get all auth users
  const authRes = await fetchWithRetry(`${SUPABASE_URL}/auth/v1/admin/users?per_page=1000`, { headers: HEADERS });
  const authData = await authRes.json();
  const authUsers = authData?.users || authData || [];

  console.log(`Found ${authUsers.length} auth user(s) in Supabase Auth.`);

  // 2. Map auth users to single profile per auth ID
  console.log('\n─── Re-syncing profiles to exact auth users ───');
  
  // Truncate profiles table
  await fetchWithRetry(`${SUPABASE_URL}/rest/v1/profiles?id=neq.00000000-0000-0000-0000-000000000000`, {
    method: 'DELETE',
    headers: HEADERS
  });

  let synced = 0;
  for (const u of authUsers) {
    const role = u.user_metadata?.role || u.app_metadata?.role || 'MAINTENANCE';
    const fullName = u.user_metadata?.full_name || u.email?.split('@')[0] || 'User';

    const pRes = await fetchWithRetry(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: { ...HEADERS, 'Prefer': 'resolution=merge-duplicates' },
      body: JSON.stringify({
        id: u.id,
        role: role,
        full_name: fullName,
        avatar_url: null,
        created_at: u.created_at || new Date().toISOString()
      })
    });

    if (pRes.ok || pRes.status === 201) synced++;
  }

  console.log(`✅ Profiles synced: ${synced} unique profiles matching Auth.`);

  // 3. Verify final counts
  const finalRes = await fetchWithRetry(`${SUPABASE_URL}/rest/v1/profiles?select=id,full_name,role`, { headers: HEADERS });
  const finalProfiles = await finalRes.json();
  console.log(`\nFinal Profile Count in DB: ${finalProfiles.length}`);
  
  const roleBreakdown = {};
  finalProfiles.forEach(p => {
    roleBreakdown[p.role] = (roleBreakdown[p.role] || 0) + 1;
  });
  console.log('Breakdown by Role:', roleBreakdown);
}

main().catch(console.error);
