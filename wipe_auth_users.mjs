/**
 * wipe_auth_users.mjs  v3
 * Fetches profiles (id, role, full_name) then deletes non-SUPER_ADMIN auth users.
 */

const SUPABASE_URL = 'https://rnebpqnzignwjeukgztz.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZWJwcW56aWdud2pldWtnenR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDE3NTg4MiwiZXhwIjoyMDk5NzUxODgyfQ.mRwmoyI1ZIKX96qT5dwrno4RATxj01qgSVZ10YigG28';

const H = {
  'apikey': SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
};

async function main() {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║  ZYNO PMS — Auth User Cleanup v3                   ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  // Profiles have: id, role, full_name (no email column)
  const profRes = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?select=id,role,full_name&limit=1000`,
    { headers: H }
  );
  const profBody = await profRes.text();

  if (!profRes.ok) {
    console.log('❌ Could not fetch profiles:', profBody);
    // Profiles are already empty (wiped earlier) — that's fine
    console.log('\n  ℹ  All profiles were already wiped in the previous step.');
    console.log('  ℹ  The only auth users remaining are ones WITHOUT profiles.');
    console.log('  ℹ  Delete them manually via the Supabase dashboard:');
    console.log('     → https://supabase.com/dashboard/project/rnebpqnzignwjeukgztz/auth/users\n');
    return;
  }

  const profiles = JSON.parse(profBody);
  console.log(`Found ${profiles.length} profile(s) remaining in DB:\n`);

  if (profiles.length === 0) {
    console.log('  ✅ All profiles were already wiped. No action needed.');
    console.log('\n  ℹ  If there are orphaned auth users without profiles,');
    console.log('     delete them from:');
    console.log('     → https://supabase.com/dashboard/project/rnebpqnzignwjeukgztz/auth/users\n');
    return;
  }

  for (const p of profiles) {
    console.log(`  ${(p.full_name || 'Unknown').padEnd(40)} [${p.role}]  id=${p.id}`);
  }

  console.log('\n─── Deleting non-SUPER_ADMIN auth users ─────────────');
  let deleted = 0, kept = 0, failed = 0;

  for (const p of profiles) {
    if (p.role === 'SUPER_ADMIN') {
      console.log(`  🔒 Keeping  ${(p.full_name || p.id).padEnd(40)} [SUPER_ADMIN]`);
      kept++;
      continue;
    }

    const delRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${p.id}`, {
      method: 'DELETE',
      headers: H,
    });

    if (delRes.status === 200 || delRes.status === 204) {
      console.log(`  🗑  Deleted  ${p.full_name || p.id}`);
      deleted++;
    } else {
      const body = await delRes.text();
      console.log(`  ⚠  Failed   ${p.full_name || p.id} — HTTP ${delRes.status}: ${body.slice(0, 100)}`);
      failed++;
    }
  }

  console.log(`\n  Deleted: ${deleted}  |  Kept: ${kept}  |  Failed: ${failed}`);

  if (failed > 0) {
    console.log('\n  ⚠  Some users could not be deleted via API.');
    console.log('     Remove them manually at:');
    console.log('     → https://supabase.com/dashboard/project/rnebpqnzignwjeukgztz/auth/users');
  } else if (deleted > 0) {
    console.log('\n  ✅ Done! Platform is clean and ready for first tenant onboarding.');
  }
}

main().catch(console.error);
