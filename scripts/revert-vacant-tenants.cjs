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
  
  // Revert units where current_tenant = 'Vacant' - these are NOT real tenants
  const revert = await client.query(`
    UPDATE units
    SET 
      status = 'Available',
      lease_status = 'Vacant',
      current_tenant = NULL
    WHERE current_tenant IN ('Vacant', 'vacant', 'VACANT')
    RETURNING id, unit_name, unit_ref
  `);
  console.log(`Reverted ${revert.rowCount} units with "Vacant" as tenant name`);
  
  // Final breakdown
  const r1 = await client.query(`SELECT status, COUNT(*) as cnt FROM units GROUP BY status`);
  console.log('Status breakdown:', JSON.stringify(r1.rows));
  
  const r2 = await client.query(`SELECT COUNT(*) as with_real_tenant FROM units WHERE current_tenant IS NOT NULL AND current_tenant NOT IN ('Vacant', 'Available', 'N/A', '') AND LENGTH(TRIM(current_tenant)) > 1`);
  console.log('Units with real tenant:', r2.rows[0].with_real_tenant);
  
  await client.end();
})().catch(console.error);
