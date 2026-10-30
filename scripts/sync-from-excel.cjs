const XLSX = require('xlsx');
const { Client } = require('pg');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf-8');
let dbUrl = '';
envFile.split('\n').forEach(line => {
  if (line.startsWith('DATABASE_URL=')) dbUrl = line.split('=').slice(1).join('=').trim().replace(/^['"]/, '').replace(/['"]\s*$/, '');
});

const wb = XLSX.readFile('E:\\Port\\Property Management System\\Documents\\Real Estate - Master with Data.xlsx');
const ws = wb.Sheets['Unit Master'];
const data = XLSX.utils.sheet_to_json(ws, { defval: '' });

(async () => {
  const client = new Client({ connectionString: dbUrl });
  await client.connect();
  
  // STEP 1: Remove the "Vacant" dummy customer
  const del1 = await client.query(`DELETE FROM customers WHERE full_name = 'Vacant' RETURNING id, full_name`);
  console.log('Deleted dummy customers:', del1.rows.map(r => r.full_name));
  
  // STEP 2: Check what "M/S. Al Ameen Real Estate" is linked to before deciding
  const check = await client.query(`
    SELECT u.unit_name, u.unit_ref, u.current_tenant 
    FROM units u 
    WHERE LOWER(u.current_tenant) LIKE '%al ameen%'
    LIMIT 10
  `);
  console.log('Al Ameen in units:', JSON.stringify(check.rows));
  
  // STEP 3: Sync unit statuses from Excel
  // Build a lookup: unitName -> { tenant, status }
  const excelUnits = new Map();
  data.forEach(r => {
    const unitName = (r['UnitName'] || '').toString().trim();
    const unitCode = (r['Unit Code / No.'] || '').toString().trim();
    const tenant = (r['Current Tenant'] || '').toString().trim();
    const isOccupied = tenant && tenant.toLowerCase() !== 'vacant';
    if (unitName) excelUnits.set(unitName, { tenant: isOccupied ? tenant : null, occupied: isOccupied });
    if (unitCode) excelUnits.set(unitCode, { tenant: isOccupied ? tenant : null, occupied: isOccupied });
  });
  
  // Get all units from DB
  const dbUnits = await client.query(`SELECT id, unit_name, unit_ref, unit_code, current_tenant, status, lease_status FROM units`);
  
  let updated = 0;
  let statusFixed = 0;
  
  for (const unit of dbUnits.rows) {
    // Match by unit_name
    const key = unit.unit_name || unit.unit_ref || unit.unit_code;
    const excelData = excelUnits.get(key) || excelUnits.get(unit.unit_ref) || excelUnits.get(unit.unit_code);
    
    if (!excelData) continue;
    
    const shouldBeOccupied = excelData.occupied;
    const currentlyOccupied = unit.status === 'Occupied';
    
    if (shouldBeOccupied !== currentlyOccupied) {
      // Update status to match Excel
      await client.query(`
        UPDATE units SET 
          status = $1,
          lease_status = $2
        WHERE id = $3
      `, [
        shouldBeOccupied ? 'Occupied' : 'Available',
        shouldBeOccupied ? 'Leased' : 'Vacant',
        unit.id
      ]);
      statusFixed++;
      console.log(`Fixed: ${key} -> ${shouldBeOccupied ? 'Occupied' : 'Available'} (was ${unit.status})`);
    }
  }
  
  console.log(`\nFixed ${statusFixed} unit statuses`);
  
  // Final verification
  const r1 = await client.query(`SELECT status, COUNT(*) as cnt FROM units GROUP BY status ORDER BY cnt DESC`);
  console.log('Final unit statuses:', JSON.stringify(r1.rows));
  
  const r2 = await client.query(`SELECT COUNT(*) as total FROM customers`);
  console.log('Total customers after cleanup:', r2.rows[0].total);
  
  const r3 = await client.query(`SELECT customer_type, COUNT(*) as cnt FROM customers GROUP BY customer_type`);
  console.log('Customers by type:', JSON.stringify(r3.rows));
  
  await client.end();
})().catch(console.error);
