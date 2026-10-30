const { Client } = require('pg');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf-8');
let dbUrl = '';
envFile.split('\n').forEach(line => {
  if (line.startsWith('DATABASE_URL=')) dbUrl = line.split('=')[1].trim().replace(/"/g, '');
});

const client = new Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  const sql = fs.readFileSync('supabase/migrations/20260915120000_production_rls_policies.sql', 'utf-8');
  await client.query(sql);
  console.log('RLS Migration applied successfully to PostgreSQL!');
  await client.end();
}

main().catch(err => {
  console.error('Error applying RLS migration:', err);
  process.exit(1);
});
