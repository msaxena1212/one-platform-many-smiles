import xlsx from 'xlsx';
import fs from 'fs';

const files = fs.readdirSync('..').filter(f => f.endsWith('.xlsx'));
console.log('Found excel files:', files);

for (const file of files) {
  try {
    const wb = xlsx.readFile(`../${file}`);
    console.log(`\nFile: ${file}`);
    for (const sheet of wb.SheetNames) {
      if (sheet.toLowerCase().includes('pdc') || sheet.toLowerCase().includes('cheque') || sheet.toLowerCase().includes('real estate')) {
        const ws = wb.Sheets[sheet];
        const rows = xlsx.utils.sheet_to_json(ws);
        console.log(`  Sheet "${sheet}": ${rows.length} rows`);
        if (rows.length > 0) {
          console.log('    Sample headers:', Object.keys(rows[0]));
        }
      }
    }
  } catch (e) {
    console.error(`Error reading ${file}:`, e.message);
  }
}
