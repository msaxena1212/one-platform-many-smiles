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

// Build normalizer: strips spaces/dashes for fuzzy match
const normalize = (s) => (s || '').toString().toLowerCase().replace(/[\s\-_\/\.]+/g, '').trim();

// Build Excel lookup keyed on normalized UnitName AND UnitCode
const excelMap = new Map(); // normalized key -> {tenant, contractNo, start, end, rent, occupied, propCode}
data.forEach(r => {
  const unitName = normalize(r['UnitName'] || '');
  const unitCode = normalize(r['Unit Code / No.'] || '');
  const propCode = normalize(r['Property Code'] || '');
  const tenant = (r['Current Tenant'] || '').toString().trim();
  const isOccupied = tenant && tenant.toLowerCase() !== 'vacant';
  const entry = {
    tenant: isOccupied ? tenant : null,
    occupied: isOccupied,
    contractNo: (r['Contract No.'] || '').toString().trim(),
    start: r['Contract Start Date'] ? r['Contract Start Date'].toString().trim() : '',
    end: r['Contract End Date'] ? r['Contract End Date'].toString().trim() : '',
    rent: Number(r['Current Rent'] || 0),
    propCode: r['Property Code'],
  };
  if (unitName) excelMap.set(unitName, entry);
  if (unitCode && propCode) excelMap.set(propCode + unitCode, entry); // composite key
});

(async () => {
  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  // Reset all units to correct state first - clear previous partial fixes
  // We'll go unit by unit from DB and match to Excel
  const dbUnits = await client.query(`
    SELECT id, unit_name, unit_ref, unit_code, current_tenant, status, lease_status, property_id
    FROM units
  `);

  console.log(`DB has ${dbUnits.rows.length} units total`);

  let matchedCount = 0;
  let updatedCount = 0;
  let unmatchedUnits = [];

  for (const unit of dbUnits.rows) {
    // Try multiple normalized keys
    const nName = normalize(unit.unit_name);
    const nRef = normalize(unit.unit_ref);
    const nCode = normalize(unit.unit_code);

    const entry = excelMap.get(nName) || excelMap.get(nRef) || excelMap.get(nCode);

    if (!entry) {
      unmatchedUnits.push(unit.unit_name || unit.unit_ref || unit.unit_code);
      continue;
    }

    matchedCount++;
    const dbOccupied = unit.status === 'Occupied';

    if (dbOccupied !== entry.occupied) {
      // Need to update
      await client.query(`
        UPDATE units SET
          status = $1,
          lease_status = $2,
          current_tenant = $3
        WHERE id = $4
      `, [
        entry.occupied ? 'Occupied' : 'Available',
        entry.occupied ? 'Leased' : 'Vacant',
        entry.tenant,
        unit.id
      ]);
      updatedCount++;
      const label = unit.unit_name || unit.unit_ref;
      console.log(`  Updated: "${label}" -> ${entry.occupied ? 'Occupied ('+entry.tenant+')' : 'Available'} (was ${unit.status})`);
    }
  }

  console.log(`\nMatched: ${matchedCount}/${dbUnits.rows.length}`);
  console.log(`Updated: ${updatedCount}`);
  if (unmatchedUnits.length) {
    console.log(`Unmatched DB units (${unmatchedUnits.length}):`, unmatchedUnits.slice(0, 10).join(', '));
  }

  // Final counts
  const r1 = await client.query(`SELECT status, COUNT(*) as cnt FROM units GROUP BY status ORDER BY cnt DESC`);
  console.log('\nFinal status counts:', JSON.stringify(r1.rows));

  const r2 = await client.query(`SELECT COUNT(*) as total FROM customers`);
  const r3 = await client.query(`SELECT customer_type, COUNT(*) as cnt FROM customers GROUP BY customer_type ORDER BY cnt DESC`);
  console.log('Customers:', r2.rows[0].total, '| By type:', JSON.stringify(r3.rows));

  await client.end();
})().catch(console.error);
