const { Client } = require('pg');
const fs = require('fs');
const dotenv = require('dotenv');

if (fs.existsSync('.env.local')) {
  const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

async function inspectUsers() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('Connected.');
  
  const authUsersRes = await client.query('SELECT id, email, created_at FROM auth.users');
  console.log(`Total auth.users: ${authUsersRes.rows.length}`);
  
  const demoUsers = authUsersRes.rows.filter(u => 
    u.email.includes('@zyno.com') || 
    u.email.includes('@alameen.qa') || 
    u.email.startsWith('emp') ||
    u.email.includes('example.com')
  );
  console.log(`Demo / phantom users count: ${demoUsers.length}`);
  console.log('Sample demo users:', demoUsers.slice(0, 10).map(u => u.email));

  const realUsers = authUsersRes.rows.filter(u => 
    u.email === 'supeadmin@zynopms.com' || 
    u.email === 'alameenadmin@yopmail.com' ||
    u.email.endsWith('@yopmail.com')
  );
  console.log(`Real users count (Super admin + Al Ameen admin + 38 staff @yopmail.com): ${realUsers.length}`);
  console.log('Real users list:', realUsers.map(u => u.email));

  await client.end();
}
inspectUsers().catch(console.error);
