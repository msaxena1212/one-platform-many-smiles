const XLSX = require('xlsx');
const { Client } = require('pg');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf-8');
let dbUrl = '';
envFile.split('\n').forEach(line => {
  if (line.startsWith('DATABASE_URL=')) dbUrl = line.split('=').slice(1).join('=').trim().replace(/^['"]/, '').replace(/['"]\s*$/, '');
});

const wb = XLSX.readFile('E:\\Port\\Property Management System\\Documents\\Real Estate - Master with Data.xlsx');
const pdcWs = wb.Sheets['PDC in Hand New'];
const pdcData = XLSX.utils.sheet_to_json(pdcWs, { defval: '' });

// PDC companies 
const pdcCompanies = new Set();
pdcData.forEach(r => {
  const t = (r['Tenant Name'] || '').toString().trim();
  if (t && (
    t.toLowerCase().startsWith('m/s') || 
    t.toLowerCase().includes('company') || 
    t.toLowerCase().includes('trading') ||
    t.toLowerCase().includes('limited') ||
    t.toLowerCase().includes('solutions') ||
    t.toLowerCase().includes('corp') ||
    t.toLowerCase().includes('contracting') ||
    t.toLowerCase().includes('real estate') ||
    t.toLowerCase().includes('club') ||
    t.toLowerCase().includes('group') ||
    t.toLowerCase().includes('llc') ||
    t.toLowerCase().includes('wll') ||
    t.toLowerCase().includes('industries') ||
    t.toLowerCase().includes('services')
  )) {
    pdcCompanies.add(t);
  }
});
console.log('PDC company tenants:', [...pdcCompanies].length);
[...pdcCompanies].forEach(c => console.log(' -', c));

(async () => {
  const client = new Client({ connectionString: dbUrl });
  await client.connect();
  
  // Current DB companies
  const r1 = await client.query(`SELECT full_name FROM customers WHERE customer_type = 'Company' ORDER BY full_name`);
  console.log('\nDB companies:', r1.rows.length);
  r1.rows.forEach(r => console.log(' -', r.full_name));
  
  await client.end();
})().catch(console.error);
