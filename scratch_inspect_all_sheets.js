import xlsx from 'xlsx';

const wb = xlsx.readFile('../COA-For New Co (1).xlsx');

for (const sheetName of wb.SheetNames) {
  console.log(`\n=== Sheet: ${sheetName} ===`);
  const ws = wb.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(ws, { header: 1 });
  console.log('Row count:', rows.length);
  if (rows.length > 0) {
    console.log('Headers:', rows[0]);
    if (rows.length > 1) console.log('Sample Row 1:', rows[1]);
  }
}
