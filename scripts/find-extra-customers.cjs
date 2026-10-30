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

// Get unique Excel tenants (occupied only)
const excelTenants = new Set();
data.forEach(r => {
  const t = (r['Current Tenant'] || '').toString().trim();
  if (t && t.toLowerCase() !== 'vacant') excelTenants.add(t.toLowerCase().trim());
});

console.log('Excel unique tenant count:', excelTenants.size);

(async () => {
  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  const r1 = await client.query(`SELECT id, full_name, customer_type FROM customers ORDER BY full_name`);
  console.log('DB customer count:', r1.rows.length);

  // Find which DB customers are NOT in Excel
  const notInExcel = r1.rows.filter(c => {
    const name = (c.full_name || '').toLowerCase().trim();
    return !excelTenants.has(name);
  });
  
  console.log('\nCustomers NOT in Excel tenants:', notInExcel.length);
  notInExcel.forEach(c => console.log(`  [${c.customer_type}] "${c.full_name}"`));

  // Also check: what Excel tenants are NOT in DB customers
  const dbNames = new Set(r1.rows.map(c => (c.full_name || '').toLowerCase().trim()));
  const notInDb = [...excelTenants].filter(t => !dbNames.has(t));
  console.log('\nExcel tenants NOT in DB customers:', notInDb.length);
  notInDb.forEach(t => console.log(`  "${t}"`));

  await client.end();
})().catch(console.error);
