const XLSX = require('xlsx');

const wb = XLSX.readFile('E:\\Port\\Property Management System\\Documents\\Real Estate - Master with Data.xlsx');

// Check Property Master sheet
const propWs = wb.Sheets['Property Master'];
if (propWs) {
  const propData = XLSX.utils.sheet_to_json(propWs, { defval: '' });
  console.log('Property Master rows:', propData.length);
  console.log('Property Master columns:', Object.keys(propData[0] || {}).join(', '));
  console.log('First 3 properties:');
  propData.slice(0, 3).forEach(r => console.log(JSON.stringify(r)));
}

// Check PDC in Hand New sheet
const pdcWs = wb.Sheets['PDC in Hand New'];
if (pdcWs) {
  const pdcData = XLSX.utils.sheet_to_json(pdcWs, { defval: '' });
  console.log('\nPDC in Hand rows:', pdcData.length);
  console.log('PDC columns:', Object.keys(pdcData[0] || {}).join(', '));
  
  // Unique tenant names from PDC
  const pdcTenants = new Set();
  pdcData.forEach(r => {
    const t = (r['Tenant'] || r['Tenant Name'] || r['Drawer'] || r['drawer_name'] || Object.values(r).find(v => typeof v === 'string' && v.length > 3) || '').toString().trim();
    if (t) pdcTenants.add(t.toLowerCase());
  });
  console.log('Unique PDC tenants (sample):', [...pdcTenants].slice(0, 10));
}

// Unit Master - list all unique tenant names that are companies (M/S prefix)
const unitWs = wb.Sheets['Unit Master'];
const unitData = XLSX.utils.sheet_to_json(unitWs, { defval: '' });
const companies = [...new Set(unitData
  .map(r => (r['Current Tenant'] || '').toString().trim())
  .filter(t => t && t.toLowerCase() !== 'vacant' && 
    (t.toUpperCase().startsWith('M/S') || 
     t.toUpperCase().startsWith('MS ') ||
     t.toLowerCase().includes('company') || 
     t.toLowerCase().includes('corp') ||
     t.toLowerCase().includes('trading') ||
     t.toLowerCase().includes('limited') ||
     t.toLowerCase().includes('solutions') ||
     t.toLowerCase().includes('contracting') ||
     t.toLowerCase().includes('real estate') ||
     t.toLowerCase().includes('club') ||
     t.toLowerCase().includes('group') ||
     t.toLowerCase().includes('llc') ||
     t.toLowerCase().includes('wll') ||
     t.toLowerCase().includes('industries') ||
     t.toLowerCase().includes('services')
    )
  )
)];
console.log('\nLikely Company tenants in Unit Master:', companies.length);
companies.forEach(c => console.log(' -', c));
