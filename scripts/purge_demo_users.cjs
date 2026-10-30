const { Client } = require('pg');
const fs = require('fs');
const dotenv = require('dotenv');

if (fs.existsSync('.env.local')) {
  const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

async function purgeDemoUsers() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('Connected to PostgreSQL.');

  // 1. Identify all demo user IDs to delete
  // We strictly keep:
  // - supeadmin@zynopms.com (Super Admin)
  // - alameenadmin@yopmail.com (Tenant Admin)
  // - 38 employees from Excel with @yopmail.com
  
  const usersToPurgeRes = await client.query(`
    SELECT id, email FROM auth.users 
    WHERE email NOT IN (
      'supeadmin@zynopms.com',
      'alameenadmin@yopmail.com'
    )
    AND email NOT LIKE '%@yopmail.com';
  `);
  
  const purgeIds = usersToPurgeRes.rows.map(u => u.id);
  console.log(`Found ${purgeIds.length} demo/phantom accounts to permanently purge.`);

  if (purgeIds.length > 0) {
    // A. Delete from profiles
    const delProfiles = await client.query('DELETE FROM public.profiles WHERE id = ANY($1)', [purgeIds]);
    console.log(`Deleted ${delProfiles.rowCount} demo profiles.`);

    // B. Delete from auth.identities
    await client.query('DELETE FROM auth.identities WHERE user_id = ANY($1)', [purgeIds]);
    console.log(`Deleted auth.identities for demo users.`);

    // C. Delete from auth.sessions
    await client.query('DELETE FROM auth.sessions WHERE user_id = ANY($1)', [purgeIds]);

    // D. Delete from auth.users
    const delAuth = await client.query('DELETE FROM auth.users WHERE id = ANY($1)', [purgeIds]);
    console.log(`Deleted ${delAuth.rowCount} accounts from auth.users.`);
  }

  // 2. Double check remaining counts
  const remainingAuth = await client.query('SELECT id, email FROM auth.users ORDER BY email');
  console.log(`Remaining in auth.users: ${remainingAuth.rows.length}`);

  const remainingProfiles = await client.query('SELECT id, full_name, role FROM public.profiles');
  console.log(`Remaining in public.profiles: ${remainingProfiles.rows.length}`);

  // 3. Make sure public.employees table is also clean
  const empRes = await client.query('SELECT id, email FROM public.employees');
  console.log(`Employees in master roster: ${empRes.rows.length}`);

  await client.end();
}

purgeDemoUsers().catch(console.error);
