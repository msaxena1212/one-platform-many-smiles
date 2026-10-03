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
  
  // Find units where current_tenant is 'Vacant', 'Available', 'N/A' or similar non-names
  const badNames = ['Vacant', 'Available', 'N/A', 'None', 'NULL', '-', 'vacant', 'available'];
  
  const r1 = await client.query(`
    SELECT unit_ref, unit_name, current_tenant, status, lease_status 
    FROM units 
    WHERE current_tenant IN ('Vacant', 'Available', 'N/A', 'None', '-', 'vacant', 'available', 'NULL', '')
    LIMIT 30
  `);
  console.log('Units with bad current_tenant values:', JSON.stringify(r1.rows));
  
  // Count: how many truly occupied (have real tenant name, not placeholder)
  const r2 = await client.query(`
    SELECT COUNT(*) as cnt FROM units 
    WHERE current_tenant IS NOT NULL 
    AND current_tenant NOT IN ('Vacant', 'Available', 'N/A', 'None', '-', 'vacant', 'available', 'NULL', '')
    AND current_tenant != ''
    AND LENGTH(TRIM(current_tenant)) > 1
  `);
  console.log('Units with actual tenant names:', r2.rows[0].cnt);
  
  await client.end();
})().catch(console.error);
