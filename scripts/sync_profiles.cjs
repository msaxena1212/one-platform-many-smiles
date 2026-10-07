const { Client } = require('pg');
const fs = require('fs');
const dotenv = require('dotenv');

if (fs.existsSync('.env.local')) {
  const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

async function fixProfiles() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('Connected to DB.');
  
  // 1. Check all auth.users
  const usersRes = await client.query("SELECT id, email, raw_user_meta_data, created_at FROM auth.users");
  console.log(`Found ${usersRes.rows.length} users in auth.users`);

  // 2. Insert profiles for all users
  for (const u of usersRes.rows) {
    const meta = u.raw_user_meta_data || {};
    const fullName = meta.full_name || meta.name || u.email.split('@')[0];
    let role = meta.role || 'GUEST';
    if (u.email === 'supeadmin@zynopms.com') {
      role = 'SUPER_ADMIN';
    } else if (u.email === 'alameenadmin@yopmail.com') {
      role = 'ADMIN';
    }
    
    await client.query(`
      INSERT INTO public.profiles (id, full_name, role, created_at)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) DO UPDATE
      SET full_name = EXCLUDED.full_name,
          role = EXCLUDED.role;
    `, [u.id, fullName, role, u.created_at || new Date().toISOString()]);
    console.log(`Synced profile for ${u.email} -> ${role} (${fullName})`);
  }

  // 3. Verify get_current_user_role fallback
  const saProfile = await client.query("SELECT * FROM public.profiles WHERE id = '22743744-a1e1-4d85-b342-7bfb9ceeb87d'");
  console.log('Super admin profile now in DB:', saProfile.rows);

  await client.end();
}
fixProfiles().catch(console.error);
