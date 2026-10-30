const { Client } = require('pg');
const fs = require('fs');
const dotenv = require('dotenv');

if (fs.existsSync('.env.local')) {
  const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

async function check() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('Connected to DB.');
  const profiles = await client.query('SELECT * FROM public.profiles');
  console.log('Profiles in DB count:', profiles.rows.length);
  console.log('Profiles in DB:', profiles.rows);
  const sa = await client.query("SELECT id, email, raw_user_meta_data FROM auth.users WHERE email = 'supeadmin@zynopms.com'");
  console.log('SA in auth.users:', sa.rows);
  await client.end();
}
check().catch(console.error);
