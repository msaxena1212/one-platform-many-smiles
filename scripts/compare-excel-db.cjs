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

// Get all unit-level details
const unitsByProperty = {};
data.forEach(r => {
  const prop = (r['Property Code'] || '').toString().trim();
  if (!unitsByProperty[prop]) unitsByProperty[prop] = { total: 0, occupied: 0, vacant: 0 };
  unitsByProperty[prop].total++;
  const tenant = (r['Current Tenant'] || '').toString().trim();
  if (tenant && tenant.toLowerCase() !== 'vacant') {
    unitsByProperty[prop].occupied++;
  } else {
    unitsByProperty[prop].vacant++;
  }
});

console.log('Property breakdown from Excel:');
Object.entries(unitsByProperty).sort((a,b) => a[0].localeCompare(b[0])).forEach(([prop, counts]) => {
  console.log(`  ${prop}: total=${counts.total}, occupied=${counts.occupied}, vacant=${counts.vacant}`);
});

// Get unique tenants from Excel
const excelTenants = new Set();
data.forEach(r => {
  const t = (r['Current Tenant'] || '').toString().trim();
  if (t && t.toLowerCase() !== 'vacant') excelTenants.add(t.toLowerCase().trim());
});
console.log('\nExcel unique tenant count:', excelTenants.size);

(async () => {
  const client = new Client({ connectionString: dbUrl });
  await client.connect();
  
  // Get DB customers
  const r1 = await client.query(`SELECT id, full_name, customer_type FROM customers ORDER BY full_name`);
  console.log('\nDB customer count:', r1.rows.length);
  
  // Find DB customers NOT in Excel tenants
  const notInExcel = r1.rows.filter(c => {
    const name = (c.full_name || '').toLowerCase().trim();
    return !excelTenants.has(name);
  });
  console.log('\nCustomers in DB but NOT matching Excel tenants:', notInExcel.length);
  notInExcel.forEach(c => console.log(`  - [${c.customer_type}] ${c.full_name}`));
  
  await client.end();
})().catch(console.error);
