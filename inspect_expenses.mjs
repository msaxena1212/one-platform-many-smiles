import * as XLSX from 'xlsx';
import fs from 'fs';

const xlsx = XLSX.default || XLSX;
const filePath = 'e:/Port/Property Management System/Documents/New Documents/COA to Simerjith 28092026.xlsx';
const buffer = fs.readFileSync(filePath);
const wb = xlsx.read(buffer, { type: 'buffer' });

const sheet = wb.Sheets['Expenses-New'];
const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });
console.log('Expenses rows:');
rows.slice(0, 15).forEach((r, idx) => {
  console.log(`Row ${idx}:`, r);
});
