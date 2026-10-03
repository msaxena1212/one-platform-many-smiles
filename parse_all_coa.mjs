import * as XLSX from 'xlsx';
import fs from 'fs';

const xlsx = XLSX.default || XLSX;
const filePath = 'e:/Port/Property Management System/Documents/New Documents/COA to Simerjith 28092026.xlsx';
const buffer = fs.readFileSync(filePath);
const wb = xlsx.read(buffer, { type: 'buffer' });

const summary = {};

for (const name of wb.SheetNames) {
  const sheet = wb.Sheets[name];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  const headers = rows[0] || [];
  const dataRows = rows.slice(1).filter(r => r.some(c => c !== ''));
  
  summary[name] = {
    headers,
    totalRows: rows.length,
    nonEmptyRows: dataRows.length,
    sampleRows: dataRows.slice(0, 5)
  };
}

fs.writeFileSync('coa_detailed_parse.json', JSON.stringify(summary, null, 2));
console.log('Parsed all sheets in COA Excel!');
