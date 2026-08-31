// Read COA-For New Co (1).xlsx and dump full hierarchy
const xlsx = require('xlsx');
const path = require('path');

const file = path.join('E:/Port/Property Management System', 'COA-For New Co (1).xlsx');
const workbook = xlsx.readFile(file);

console.log('=== SHEETS ===');
console.log(JSON.stringify(workbook.SheetNames, null, 2));

for (const sheetName of workbook.SheetNames) {
  console.log(`\n========================================`);
  console.log(`Sheet: ${sheetName}`);
  console.log(`========================================`);
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  const maxRow = Math.min(data.length, 500);
  for (let i = 0; i < maxRow; i++) {
    const row = data[i];
    if (!row || row.length === 0) {
      console.log(`[${i}] (empty)`);
      continue;
    }
    console.log(`[${i}] ${JSON.stringify(row)}`);
  }
  if (data.length > maxRow) {
    console.log(`... (${data.length - maxRow} more rows)`);
  }
}
