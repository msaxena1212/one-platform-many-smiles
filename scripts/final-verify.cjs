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
  
  console.log('=== FINAL DATA VERIFICATION ===');
  
  const c1 = await client.query(`SELECT customer_type, COUNT(*) as cnt FROM customers GROUP BY customer_type ORDER BY cnt DESC`);
  console.log('Customers by type:', JSON.stringify(c1.rows));
  
  const c2 = await client.query(`SELECT COUNT(*) as total FROM customers`);
  console.log('Total customers:', c2.rows[0].total);
  
  const u1 = await client.query(`SELECT status, COUNT(*) as cnt FROM units GROUP BY status ORDER BY cnt DESC`);
  console.log('Units by status:', JSON.stringify(u1.rows));
  
  const u2 = await client.query(`SELECT COUNT(*) as total FROM units`);
  console.log('Total units:', u2.rows[0].total);
  
  const u3 = await client.query(`SELECT COUNT(*) as cnt FROM units WHERE status = 'Occupied'`);
  console.log('Occupied units:', u3.rows[0].cnt);
  
  const u4 = await client.query(`SELECT COUNT(*) as cnt FROM units WHERE status = 'Available'`);
  console.log('Available units:', u4.rows[0].cnt);
  
  await client.end();
})().catch(console.error);
