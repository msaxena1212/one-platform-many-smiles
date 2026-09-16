const { Client } = require('pg');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf-8');
let dbUrl = '';
envFile.split('\n').forEach(line => {
  if (line.startsWith('DATABASE_URL=')) dbUrl = line.split('=')[1].trim().replace(/"/g, '');
});

const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

async function main() {
  await client.connect();
  const sql = fs.readFileSync('supabase/migrations/20260915180000_tenant_organisations_table.sql', 'utf-8');
  await client.query(sql);
  console.log('Tenant organisations table created and seeded successfully!');
  
  const res = await client.query('SELECT tenant_key, name, plan, status FROM public.tenant_organisations');
  console.log('\nTenant Organisations:');
  res.rows.forEach(r => console.log(`  - [${r.plan}] ${r.name} (${r.tenant_key}) — ${r.status}`));
  
  await client.end();
}

main().catch(err => {
  console.error('Migration error:', err.message);
  process.exit(1);
});
