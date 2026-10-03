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
  
  const r1 = await client.query('SELECT COUNT(*) as total, customer_type FROM customers GROUP BY customer_type');
  console.log('Customer counts by type:', JSON.stringify(r1.rows));
  
  const r2 = await client.query('SELECT COUNT(*) as total FROM customers');
  console.log('Total customers:', r2.rows[0].total);
  
  const r3 = await client.query("SELECT COUNT(*) as total_units, COUNT(CASE WHEN status = 'occupied' THEN 1 END) as occupied FROM units");
  console.log('Units:', JSON.stringify(r3.rows));
  
  await client.end();
})().catch(console.error);
