const XLSX = require('xlsx');
const wb = XLSX.readFile('E:\\Port\\Property Management System\\Documents\\Real Estate - Master with Data.xlsx');

// Read Unit Master sheet
const ws = wb.Sheets['Unit Master'];
const data = XLSX.utils.sheet_to_json(ws, { defval: '' });

console.log('Total rows in Unit Master:', data.length);
console.log('Columns:', Object.keys(data[0] || {}).join(', '));
console.log('\nFirst 3 rows sample:');
data.slice(0, 3).forEach(r => console.log(JSON.stringify(r)));

// Count occupied vs vacant
const occupied = data.filter(r => {
  const tenant = (r['Current Tenant'] || r['Tenant'] || r['current_tenant'] || '').toString().trim();
  const status = (r['Status'] || r['Lease Status'] || '').toString().trim().toLowerCase();
  return tenant && tenant.toLowerCase() !== 'vacant' && tenant.toLowerCase() !== '' && tenant !== '-';
});
const vacant = data.length - occupied.length;
console.log('\nOccupied (has tenant):', occupied.length);
console.log('Vacant:', vacant);

// Unique tenant names
const tenants = new Set();
data.forEach(r => {
  const t = (r['Current Tenant'] || r['Tenant'] || r['current_tenant'] || '').toString().trim();
  if (t && t.toLowerCase() !== 'vacant' && t !== '') tenants.add(t);
});
console.log('\nUnique tenant names:', tenants.size);
