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
  const sql = fs.readFileSync('supabase/migrations/20260915170000_system_configurations_table.sql', 'utf-8');
  await client.query(sql);
  console.log('System configurations and in-app notifications tables created and seeded successfully!');
  
  const res = await client.query('SELECT config_key, category FROM public.system_configurations ORDER BY config_key');
  console.log('\nSeeded Config Keys:');
  res.rows.forEach(r => console.log(`  - [${r.category}] ${r.config_key}`));
  
  await client.end();
}

main().catch(err => {
  console.error('Migration error:', err.message);
  process.exit(1);
});
