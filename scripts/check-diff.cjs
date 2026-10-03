const { Client } = require('pg');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf-8');
let dbUrl = '';
envFile.split('\n').forEach(line => {
  if (line.startsWith('DATABASE_URL=')) dbUrl = line.split('=')[1].trim().replace(/"/g, '');
});

const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

async function check() {
  await client.connect();

  const custs = await client.query('SELECT id, full_name, customer_type FROM customers ORDER BY full_name');
  console.log('Total customers in DB:', custs.rows.length);

  const hasABC = custs.rows.find(c => c.full_name.includes('ABC Trading'));
  console.log('Has ABC Trading in DB:', hasABC);

  const companies = custs.rows.filter(c => c.customer_type === 'Company');
  console.log('Companies in DB count:', companies.length);
  console.table(companies);

  const individuals = custs.rows.filter(c => c.customer_type === 'Individual');
  console.log('Individuals in DB count:', individuals.length);

  await client.end();
}

check().catch(console.error);
