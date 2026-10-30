const { Client } = require('pg');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf-8');
let dbUrl = '';
envFile.split('\n').forEach(line => {
  if (line.startsWith('DATABASE_URL=')) dbUrl = line.split('=').slice(1).join('=').trim().replace(/^['"]/, '').replace(/['"]\s*$/, '');
});

(async () => {
  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  console.log('--- PROFILES COLUMNS & ROWS ---');
  const profs = await client.query(`SELECT * FROM profiles`);
  console.log('Profiles:', profs.rows);

  console.log('--- DESIGNATIONS ---');
  const desigs = await client.query(`SELECT * FROM designations`);
  console.log('Designations:', desigs.rows);

  console.log('--- PROPERTIES ---');
  const props = await client.query(`SELECT id, title, property_code FROM properties ORDER BY title`);
  console.log('Properties:', props.rows);

  console.log('--- LULU UNITS ---');
  const luluUnits = await client.query(`
    SELECT u.id, u.unit_ref, u.unit_name, u.status, u.lease_status, u.current_tenant, p.title as prop_title, p.property_code
    FROM units u
    JOIN properties p ON u.property_id = p.id
    WHERE p.title ILIKE '%LULU%' OR p.property_code ILIKE '%LULU%' OR u.unit_name ILIKE '%LULU%'
  `);
  console.log('Lulu units in DB:', luluUnits.rows);

  console.log('--- PAKISTAN EMBASSY IN CUSTOMERS ---');
  const custs = await client.query(`
    SELECT id, full_name, tenant_name, customer_type FROM customers WHERE full_name ILIKE '%Pakistan%' OR tenant_name ILIKE '%Pakistan%'
  `);
  console.log('Pakistan customers in DB:', custs.rows);

  const allCustCount = await client.query(`SELECT count(*), customer_type FROM customers GROUP BY customer_type`);
  console.log('Customer counts by type in DB:', allCustCount.rows);

  await client.end();
})().catch(console.error);
