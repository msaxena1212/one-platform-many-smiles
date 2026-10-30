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

  const unitsWithTenant = await client.query(`
    SELECT id, unit_code, unit_name, current_tenant, status, lease_status, current_rent, contract_start_date, contract_end_date
    FROM units
    WHERE current_tenant IS NOT NULL AND current_tenant != ''
    ORDER BY current_tenant
  `);
  console.log(`Units with current_tenant: ${unitsWithTenant.rows.length}`);
  
  const custs = await client.query('SELECT * FROM customers');
  console.log('Current customers table:', custs.rows);

  const leases = await client.query('SELECT * FROM leases');
  console.log('Current leases count:', leases.rows.length);

  await client.end();
}

main().catch(console.error);
