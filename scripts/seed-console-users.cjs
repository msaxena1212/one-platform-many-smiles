const { Client } = require('pg');
const { connectionString } = require('./database-config.cjs');

const USERS = [
  { email: 'tenant@zyno.com', password: 'Password123!', role: 'TENANT', fullName: 'Demo Tenant' },
  { email: 'propmgr@zyno.com', password: 'Password123!', role: 'PROP_MGR', fullName: 'Demo Property Manager' },
  { email: 'admin@zyno.com', password: 'Password123!', role: 'ADMIN', fullName: 'Demo Admin' },
  { email: 'superadmin@zyno.com', password: 'Password123!', role: 'SUPER_ADMIN', fullName: 'Demo Super Admin' },
  { email: 'leasing@zyno.com', password: 'Password123!', role: 'LEASING', fullName: 'Demo Leasing Officer' },
  { email: 'finance@zyno.com', password: 'Password123!', role: 'FINANCE', fullName: 'Demo Finance Officer' },
  { email: 'cashier@zyno.com', password: 'Password123!', role: 'CASHIER', fullName: 'Demo Cashier' },
  { email: 'maintenance@zyno.com', password: 'Password123!', role: 'MAINTENANCE', fullName: 'Demo Maintenance Officer' }
];

async function seedUsers() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('Connected to PostgreSQL Database.');

  // Ensure pgcrypto is installed
  await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');

  for (const u of USERS) {
    const existing = await client.query('SELECT id FROM auth.users WHERE email = $1', [u.email]);
    let userId;
    if (existing.rows.length > 0) {
      userId = existing.rows[0].id;
      console.log(`Updating existing auth user: ${u.email} (${userId})`);
      await client.query(`
        UPDATE auth.users 
        SET encrypted_password = crypt($1, gen_salt('bf')),
            email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
            raw_user_meta_data = jsonb_build_object('full_name', $2::text, 'role', $3::text),
            raw_app_meta_data = jsonb_build_object('provider', 'email', 'providers', array['email'])
        WHERE id = $4
      `, [u.password, u.fullName, u.role, userId]);
    } else {
      console.log(`Creating new auth user: ${u.email}`);
      const insertRes = await client.query(`
        INSERT INTO auth.users (
          instance_id,
          id,
          aud,
          role,
          email,
          encrypted_password,
          email_confirmed_at,
          raw_app_meta_data,
          raw_user_meta_data,
          created_at,
          updated_at
        ) VALUES (
          '00000000-0000-0000-0000-000000000000',
          gen_random_uuid(),
          'authenticated',
          'authenticated',
          $1,
          crypt($2, gen_salt('bf')),
          NOW(),
          jsonb_build_object('provider', 'email', 'providers', array['email']),
          jsonb_build_object('full_name', $3::text, 'role', $4::text),
          NOW(),
          NOW()
        )
        RETURNING id;
      `, [u.email, u.password, u.fullName, u.role]);
      userId = insertRes.rows[0].id;
    }

    // Upsert into public.profiles
    await client.query(`
      INSERT INTO public.profiles (id, role, full_name, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE 
      SET role = EXCLUDED.role,
          full_name = EXCLUDED.full_name,
          updated_at = NOW();
    `, [userId, u.role, u.fullName]);

    console.log(`Synced public.profiles for: ${u.email} -> Role: ${u.role}`);
  }

  await client.end();
  console.log('\n🎉 ALL USERS AND ROLES SUCCESSFULLY CREATED & SYNCHRONIZED!');
}

seedUsers().catch(err => {
  console.error('❌ Error executing user seed:', err);
  process.exit(1);
});
