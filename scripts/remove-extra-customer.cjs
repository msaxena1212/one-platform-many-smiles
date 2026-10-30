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

  // Check if Al Ameen is referenced in any units still marked Occupied
  const r0 = await client.query(`SELECT unit_name, status, current_tenant FROM units WHERE LOWER(current_tenant) LIKE '%al ameen%'`);
  console.log('Al Ameen units:', JSON.stringify(r0.rows));

  // Remove M/S. Al Ameen Real Estate from customers (not in Excel)
  const del = await client.query(`DELETE FROM customers WHERE full_name = 'M/S. Al Ameen Real Estate' RETURNING id, full_name`);
  console.log('Deleted:', del.rows.map(r => r.full_name));

  // Also clear current_tenant for any Available units that still show this name
  const upd = await client.query(`
    UPDATE units SET current_tenant = NULL 
    WHERE LOWER(current_tenant) LIKE '%al ameen%' AND status = 'Available'
    RETURNING unit_name
  `);
  console.log('Cleared Al Ameen from available units:', upd.rows.map(r => r.unit_name));

  // Final verification
  const r1 = await client.query(`SELECT status, COUNT(*) as cnt FROM units GROUP BY status ORDER BY cnt DESC`);
  console.log('\n=== FINAL VERIFICATION ===');
  console.log('Unit statuses:', JSON.stringify(r1.rows));

  const r2 = await client.query(`SELECT COUNT(*) as total FROM customers`);
  const r3 = await client.query(`SELECT customer_type, COUNT(*) as cnt FROM customers GROUP BY customer_type ORDER BY cnt DESC`);
  console.log('Total customers:', r2.rows[0].total);
  console.log('By type:', JSON.stringify(r3.rows));

  await client.end();
})().catch(console.error);
