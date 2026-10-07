const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function check() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('Connected.');
  const profiles = await client.query('SELECT * FROM public.profiles');
  console.log('Profiles in DB:', profiles.rows);
  const sa = await client.query("SELECT id, email, raw_user_meta_data FROM auth.users WHERE email = 'supeadmin@zynopms.com'");
  console.log('SA in auth.users:', sa.rows);
  await client.end();
}
check().catch(console.error);
