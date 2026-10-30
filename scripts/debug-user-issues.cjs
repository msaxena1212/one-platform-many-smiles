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

  console.log('--- EMPLOYEES & DESIGNATIONS ---');
  const emps = await client.query(`
    SELECT e.id, e.first_name, e.last_name, e.user_id, e.employee_status, d.title as desig
    FROM employees e
    LEFT JOIN designations d ON e.designation_id = d.id
  `);
  console.log('Employees:', JSON.stringify(emps.rows, null, 2));

  console.log('--- PROFILES ---');
  const profs = await client.query(`SELECT id, full_name, email, role FROM profiles`);
  console.log('Profiles:', JSON.stringify(profs.rows, null, 2));

  console.log('--- PROPERTIES ---');
  const props = await client.query(`SELECT id, title, property_code FROM properties ORDER BY title`);
  console.log('Properties:', JSON.stringify(props.rows, null, 2));

  console.log('--- LULU UNITS ---');
  const luluUnits = await client.query(`
    SELECT u.id, u.unit_ref, u.unit_name, u.status, u.lease_status, u.current_tenant, p.title as prop_title
    FROM units u
    JOIN properties p ON u.property_id = p.id
    WHERE p.title ILIKE '%LULU%' OR p.property_code ILIKE '%LULU%' OR u.unit_name ILIKE '%LULU%'
  `);
  console.log('Lulu units in DB:', JSON.stringify(luluUnits.rows, null, 2));

  console.log('--- PAKISTAN EMBASSY IN CUSTOMERS ---');
  const custs = await client.query(`
    SELECT id, full_name, tenant_name, customer_type FROM customers WHERE full_name ILIKE '%Pakistan%' OR tenant_name ILIKE '%Pakistan%'
  `);
  console.log('Pakistan customers:', JSON.stringify(custs.rows, null, 2));

  await client.end();
})().catch(console.error);
