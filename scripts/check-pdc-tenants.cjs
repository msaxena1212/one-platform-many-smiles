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

  const pdcTenants = await client.query(`
    SELECT DISTINCT tenant_name FROM pdcs WHERE tenant_name IS NOT NULL AND tenant_name != '' ORDER BY tenant_name
  `);
  console.log('PDC tenant names count:', pdcTenants.rows.length);
  console.log(pdcTenants.rows.map(r => r.tenant_name));

  await client.end();
}

main().catch(console.error);
