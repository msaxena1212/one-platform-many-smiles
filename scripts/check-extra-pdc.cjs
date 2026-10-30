const { Client } = require('pg');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf-8');
let dbUrl = '';
envFile.split('\n').forEach(line => {
  if (line.startsWith('DATABASE_URL=')) dbUrl = line.split('=')[1].trim().replace(/"/g, '');
});

const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

async function main() {
  await client.connect();

  const XLSX = require('xlsx');
  const wb = XLSX.readFile('E:/Port/Property Management System/Documents/New Documents/PDC In Hand to simerjith 27092026.xlsx');
  const rawData = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
  
  // Filter out any summary/total/header row that lacks a tenant name or unit name
  const data = rawData.filter(r => r['Tenant Name'] && r['Unit Name'] && r['Cheque Number']);
  console.log('Filtered valid PDC rows to insert:', data.length);

  function parseDate(val) {
    if (!val) return null;
    if (val instanceof Date) return val.toISOString().split('T')[0];
    if (typeof val === 'number') {
      const d = XLSX.SSF.parse_date_code(val);
      if (d) return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
    }
    const s = String(val).trim();
    const parts = s.split(/[./-]/);
    if (parts.length === 3) {
      if (parts[2].length === 4) {
        return `${parts[2]}-${String(parts[1]).padStart(2, '0')}-${String(parts[0]).padStart(2, '0')}`;
      } else if (parts[0].length === 4) {
        return `${parts[0]}-${String(parts[1]).padStart(2, '0')}-${String(parts[2]).padStart(2, '0')}`;
      }
    }
    return null;
  }

  await client.query('BEGIN');
  await client.query('DELETE FROM pdcs');
  
  const CHUNK_SIZE = 100;
  let inserted = 0;
  for (let i = 0; i < data.length; i += CHUNK_SIZE) {
    const chunk = data.slice(i, i + CHUNK_SIZE);
    const values = [];
    const params = [];
    let pIdx = 1;

    for (const r of chunk) {
      const slNo = r['SL.No'] ? String(r['SL.No']).trim() : null;
      const unitName = r['Unit Name'] ? String(r['Unit Name']).trim() : '';
      const propCode = r['Property Code'] ? String(r['Property Code']).trim() : '';
      const tenantName = r['Tenant Name'] ? String(r['Tenant Name']).trim() : '';
      const chqNo = r['Cheque Number'] ? String(r['Cheque Number']).trim() : '';
      const bank = r['Bank'] ? String(r['Bank']).trim() : 'CBQ';
      const maturityDate = parseDate(r['Maturity Date']);
      const amount = Number(r['Amount'] || 0);
      const rentFrom = parseDate(r['Rent From Date']);
      const rentTo = parseDate(r['Rent To Date']);

      values.push(`($${pIdx}, $${pIdx+1}, $${pIdx+2}, $${pIdx+3}, $${pIdx+4}, $${pIdx+5}, $${pIdx+6}, $${pIdx+7}, $${pIdx+8}, $${pIdx+9}, $${pIdx+10}, $${pIdx+11})`);
      params.push(chqNo, bank, amount, 'received', maturityDate, unitName, propCode, tenantName, rentFrom, rentTo, slNo, 'received');
      pIdx += 12;
    }

    await client.query(`
      INSERT INTO pdcs (
        cheque_number, bank, amount, status, maturity_date, 
        unit_name, property_code, tenant_name, rent_from_date, rent_to_date, sl_no, status_pdc
      ) VALUES ${values.join(', ')}
    `, params);
    inserted += chunk.length;
  }

  await client.query('COMMIT');
  console.log('Successfully committed all rows to pdcs table:', inserted);

  // Verify unique counts
  const res = await client.query(`
    SELECT 
      count(*) as total_vouchers,
      count(DISTINCT property_code) as properties,
      count(DISTINCT (property_code || '||' || unit_name)) as units,
      count(DISTINCT LOWER(TRIM(tenant_name))) as customers
    FROM pdcs
  `);
  console.log('Verification in pdcs table:', res.rows[0]);

  // Check assets count in DB
  const assetCount = await client.query('SELECT count(*) FROM assets');
  console.log('Database assets count:', assetCount.rows[0].count);

  await client.end();
}

main().catch(console.error);
