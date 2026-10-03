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

  const tenants = await client.query(`
    SELECT DISTINCT current_tenant 
    FROM units 
    WHERE current_tenant IS NOT NULL AND TRIM(current_tenant) != '' AND TRIM(current_tenant) != '—' AND TRIM(current_tenant) != '-'
    ORDER BY current_tenant
  `);

  console.log('Distinct tenants across all units in DB count:', tenants.rows.length);
  console.log(tenants.rows.map(r => r.current_tenant));

  await client.end();
}

main().catch(console.error);
