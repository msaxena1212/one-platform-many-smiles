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
  const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND (table_name ILIKE '%config%' OR table_name ILIKE '%setting%' OR table_name ILIKE '%tenant%' OR table_name ILIKE '%company%') ORDER BY table_name");
  console.log('Matching tables:', res.rows.map(r => r.table_name));
  await client.end();
}

main().catch(console.error);
