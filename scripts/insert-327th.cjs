const { Client } = require('pg');
const fs = require('fs');
const crypto = require('crypto');

const envFile = fs.readFileSync('.env.local', 'utf-8');
let dbUrl = '';
envFile.split('\n').forEach(line => {
  if (line.startsWith('DATABASE_URL=')) dbUrl = line.split('=')[1].trim().replace(/"/g, '');
});

const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

async function insertSijith() {
  await client.connect();
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
  `, [id, 'Individual', 'Mr. Sijith Pangil Chandran', '', 'Verified']);

  const count = await client.query('SELECT customer_type, count(*) FROM customers GROUP BY customer_type ORDER BY customer_type');
  console.log('Total customers now:');
  console.table(count.rows);

  const total = await client.query('SELECT count(*) FROM customers');
  console.log('Exact total customers in DB:', total.rows[0].count);

  await client.end();
}

insertSijith().catch(console.error);
