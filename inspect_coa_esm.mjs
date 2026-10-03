import * as XLSX from 'xlsx';
import fs from 'fs';

const xlsx = XLSX.default || XLSX;
const filePath = 'e:/Port/Property Management System/Documents/New Documents/COA to Simerjith 28092026.xlsx';
const buffer = fs.readFileSync(filePath);
const wb = xlsx.read(buffer, { type: 'buffer' });

let output = '';
output += 'Sheet Names: ' + JSON.stringify(wb.SheetNames, null, 2) + '\n';

for (const name of wb.SheetNames) {
  const sheet = wb.Sheets[name];
  const json = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  output += '\n========================================\n';
  output += `Sheet: ${name} (Total Rows: ${json.length})\n`;
  output += '========================================\n';
  output += 'Top 6 rows:\n';
  output += JSON.stringify(json.slice(0, 6), null, 2) + '\n';
}

fs.writeFileSync('inspect_out_utf8.json', JSON.stringify({
  sheets: wb.SheetNames.map(name => {
    const sheet = wb.Sheets[name];
    const json = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    return {
      name,
      totalRows: json.length,
      sampleRows: json.slice(0, 10)
    };
  })
}, null, 2), 'utf8');

console.log('Saved to inspect_out_utf8.json successfully!');
