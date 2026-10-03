const { Client } = require('pg');
const fs = require('fs');
const crypto = require('crypto');

const envFile = fs.readFileSync('.env.local', 'utf-8');
let dbUrl = '';
envFile.split('\n').forEach(line => {
  if (line.startsWith('DATABASE_URL=')) dbUrl = line.split('=')[1].trim().replace(/"/g, '');
});

const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

const companyNames = [
  "M/s Al Badi Trading Contracting",
  "M/S. Al Ameen Real Estate",
  "M/s.Embassy of Pakistan"
];

async function updateCustomers() {
  await client.connect();

  // Make mobile_number nullable if needed
  try {
    await client.query('ALTER TABLE customers ALTER COLUMN mobile_number DROP NOT NULL;');
    console.log('mobile_number column set to nullable.');
  } catch (e) {
    console.log('ALTER column note:', e.message);
  }

  // Get distinct tenants from units
  const res = await client.query(`
    SELECT DISTINCT current_tenant 
    FROM units 
    WHERE current_tenant IS NOT NULL AND current_tenant != '' 
    ORDER BY current_tenant
  `);

  const tenantNames = res.rows.map(r => r.current_tenant);
  console.log(`Found ${tenantNames.length} tenants in units table.`);

  // Clean customers table
  await client.query('DELETE FROM customers;');
  console.log('Cleared old customers table.');

  let companyCount = 0;
  let individualCount = 0;

  for (const name of tenantNames) {
    const isCompany = companyNames.some(c => c.toLowerCase() === name.toLowerCase()) ||
      name.toLowerCase().startsWith('m/s') ||
      name.toLowerCase().includes('trading') ||
      name.toLowerCase().includes('real estate') ||
      name.toLowerCase().includes('embassy');

    const customerType = isCompany ? 'Company' : 'Individual';
    if (isCompany) companyCount++;
    else individualCount++;

    const id = crypto.randomUUID();
    await client.query(`
      INSERT INTO customers (
        id,
        customer_type,
        full_name,
        mobile_number,
        verification_status,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
    `, [id, customerType, name, '', 'Verified']);
  }

  console.log(`Successfully inserted ${tenantNames.length} customers:`);
  console.log(`Companies: ${companyCount}, Individuals: ${individualCount}`);

  const verify = await client.query(`
    SELECT customer_type, count(*) 
    FROM customers 
    GROUP BY customer_type
  `);
  console.log('Verification in DB:', verify.rows);

  await client.end();
}

updateCustomers().catch(console.error);
