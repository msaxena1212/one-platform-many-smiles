const { Client } = require('pg');
const fs = require('fs');
const crypto = require('crypto');

const envFile = fs.readFileSync('.env.local', 'utf-8');
let dbUrl = '';
envFile.split('\n').forEach(line => {
  if (line.startsWith('DATABASE_URL=')) dbUrl = line.split('=')[1].trim().replace(/"/g, '');
});

const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

const guessType = (name) => {
  const l = name.toLowerCase().trim();
  if (
    l.startsWith('m/s') ||
    l.startsWith('m/s.') ||
    l.includes('trading') ||
    l.includes('w.l.l') ||
    l.includes('llc') ||
    l.includes('corp') ||
    l.includes('group') ||
    l.includes('co.') ||
    l.includes('company') ||
    l.includes('services') ||
    l.includes('international') ||
    l.includes('logistics') ||
    l.includes('contracting') ||
    l.includes('industries') ||
    l.includes('enterprise') ||
    l.includes('real estate') ||
    l.includes('embassy') ||
    l.includes('solutions') ||
    l.includes('limited') ||
    l.includes('sport club') ||
    l.includes('electrical') ||
    l.includes('katara')
  ) {
    return 'Company';
  }
  return 'Individual';
};

async function syncAllCustomers() {
  await client.connect();

  const res = await client.query(`
    SELECT DISTINCT TRIM(current_tenant) as tenant_name
    FROM units 
    WHERE current_tenant IS NOT NULL AND TRIM(current_tenant) != '' AND TRIM(current_tenant) != '—' AND TRIM(current_tenant) != '-'
    ORDER BY tenant_name
  `);

  const tenantNames = res.rows.map(r => r.tenant_name);
  console.log(`Found ${tenantNames.length} distinct tenant names in units table.`);

  // Clean customers table
  await client.query('DELETE FROM customers;');
  console.log('Cleared old customers table.');

  let companyCount = 0;
  let individualCount = 0;

  for (const name of tenantNames) {
    const customerType = guessType(name);
    if (customerType === 'Company') companyCount++;
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

  console.log(`Inserted ${tenantNames.length} customers into DB:`);
  console.log(`Companies: ${companyCount}, Individuals: ${individualCount}`);

  const summary = await client.query(`
    SELECT customer_type, count(*) 
    FROM customers 
    GROUP BY customer_type
  `);
  console.log('Customers in DB now:', summary.rows);

  await client.end();
}

syncAllCustomers().catch(console.error);
