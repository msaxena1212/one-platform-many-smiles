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

  const allUnits = await client.query(`
    SELECT id, unit_name, current_tenant, status, lease_status
    FROM units
    WHERE current_tenant IS NOT NULL
    ORDER BY current_tenant
  `);

  console.log('Units with current_tenant:', allUnits.rows.length);

  const tenantSet = new Set();
  const rawList = [];
  allUnits.rows.forEach(u => {
    const t = (u.current_tenant || '').trim();
    if (t && t !== '—' && t !== '-') {
      tenantSet.add(t);
      rawList.push(t);
    }
  });

  console.log('Total non-empty tenant entries:', rawList.length);
  console.log('Unique tenant count:', tenantSet.size);

  const unitsWithoutTenant = await client.query(`
    SELECT id, unit_name, current_tenant, status, lease_status
    FROM units
    WHERE current_tenant IS NULL OR TRIM(current_tenant) = '' OR TRIM(current_tenant) = '—' OR TRIM(current_tenant) = '-'
  `);
  console.log('Units without tenant:', unitsWithoutTenant.rows.length);
  console.log(unitsWithoutTenant.rows);

  await client.end();
}

main().catch(console.error);
