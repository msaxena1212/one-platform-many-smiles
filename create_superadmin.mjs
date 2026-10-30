/**
 * create_superadmin.mjs
 * Provisions the Super Admin user in Supabase Auth & creates their Profile with role = 'SUPER_ADMIN'.
 */

const SUPABASE_URL = 'https://rnebpqnzignwjeukgztz.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZWJwcW56aWdud2pldWtnenR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDE3NTg4MiwiZXhwIjoyMDk5NzUxODgyfQ.mRwmoyI1ZIKX96qT5dwrno4RATxj01qgSVZ10YigG28';

const EMAIL = 'supeadmin@zynopms.com';
const PASSWORD = 'Mindz#007';
const ROLE = 'SUPER_ADMIN';
const FULL_NAME = 'Super Admin';

const HEADERS = {
  'apikey': SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json'
};

async function main() {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║   Creating Super Admin Credentials                 ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  console.log(`Email:    ${EMAIL}`);
  console.log(`Role:     ${ROLE}\n`);

  // Step 1: Create user via Supabase Auth Admin API
  const authPayload = {
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: {
      full_name: FULL_NAME,
      role: ROLE
    },
    app_metadata: {
      role: ROLE
    }
  };

  const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(authPayload)
  });

  const createBody = await createRes.json();
  let userId = createBody?.id || createBody?.user?.id;

  if (!createRes.ok) {
    if (createBody?.message?.includes('already been registered') || createBody?.msg?.includes('already been registered')) {
      console.log('ℹ️ User already registered in Auth. Updating password and metadata...');
      
      // Look up user by email or list users
      const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, { headers: HEADERS });
      const listData = await listRes.json();
      const existingUser = (listData?.users || listData || []).find((u) => u.email?.toLowerCase() === EMAIL.toLowerCase());

      if (existingUser) {
        userId = existingUser.id;
        const updateRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
          method: 'PUT',
          headers: HEADERS,
          body: JSON.stringify({
            password: PASSWORD,
            email_confirm: true,
            user_metadata: { full_name: FULL_NAME, role: ROLE },
            app_metadata: { role: ROLE }
          })
        });
        if (!updateRes.ok) {
          console.error('❌ Failed to update user:', await updateRes.text());
          process.exit(1);
        }
        console.log('✅ Auth user password and metadata updated successfully.');
      } else {
        console.error('❌ Could not locate existing user to update:', createBody);
        process.exit(1);
      }
    } else {
      console.error('❌ Failed to create user in Auth:', createBody);
      process.exit(1);
    }
  } else {
    console.log(`✅ Auth user created successfully with ID: ${userId}`);
  }

  // Step 2: Ensure profile record exists with role = SUPER_ADMIN
  console.log('\n─── Syncing profile table ───');
  const profilePayload = {
    id: userId,
    role: ROLE,
    full_name: FULL_NAME,
    avatar_url: null
  };

  const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
    method: 'POST',
    headers: {
      ...HEADERS,
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify(profilePayload)
  });

  if (!profileRes.ok && profileRes.status !== 201 && profileRes.status !== 204) {
    console.error('⚠️ Could not upsert profile (might already exist or schema issue):', await profileRes.text());
  } else {
    console.log('✅ Profile record synced with role = SUPER_ADMIN');
  }

  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║   🎉 SUPER ADMIN CREATION COMPLETE!                ║');
  console.log('║                                                    ║');
  console.log(`║   Email:    ${EMAIL.padEnd(31)}║`);
  console.log(`║   Password: ${PASSWORD.padEnd(31)}║`);
  console.log('║   Role:     SUPER_ADMIN                            ║');
  console.log('╚════════════════════════════════════════════════════╝\n');
}

main().catch(console.error);
