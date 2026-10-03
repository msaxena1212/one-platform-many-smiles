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
  
  // Units with tenant but status NOT Occupied
  const r1 = await client.query(`SELECT status, lease_status, COUNT(*) as cnt FROM units WHERE current_tenant IS NOT NULL AND current_tenant != '' GROUP BY status, lease_status`);
  console.log('Tenanted units by status:', JSON.stringify(r1.rows));
  
  // Units with NO tenant but status IS Occupied
  const r2 = await client.query(`SELECT status, COUNT(*) as cnt FROM units WHERE (current_tenant IS NULL OR current_tenant = '') GROUP BY status`);
  console.log('Empty tenant units by status:', JSON.stringify(r2.rows));
  
  // What the app shows - check how dashboard calculates occupancy
  // Check app-data-context query pattern
  const r3 = await client.query(`SELECT COUNT(*) as total FROM units`);
  const r4 = await client.query(`SELECT COUNT(*) as occupied FROM units WHERE current_tenant IS NOT NULL AND current_tenant != ''`);
  console.log(`Total: ${r3.rows[0].total}, Occupied (by current_tenant): ${r4.rows[0].occupied}`);
  
  await client.end();
})().catch(console.error);
