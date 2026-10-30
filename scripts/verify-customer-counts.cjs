const { Client } = require('pg');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf-8');
let dbUrl = '';
envFile.split('\n').forEach(line => {
  if (line.startsWith('DATABASE_URL=')) dbUrl = line.split('=')[1].trim().replace(/"/g, '');
});

const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

async function verify() {
  await client.connect();

  const counts = await client.query('SELECT customer_type, count(*) FROM customers GROUP BY customer_type ORDER BY customer_type');
  console.log('Customer counts by type in DB:');
  console.table(counts.rows);

  const companies = await client.query("SELECT full_name, customer_type FROM customers WHERE customer_type = 'Company' ORDER BY full_name");
  console.log('Companies:');
  console.table(companies.rows);

  const total = await client.query('SELECT count(*) FROM customers');
  console.log('Total customers:', total.rows[0].count);

  await client.end();
}

verify().catch(console.error);
