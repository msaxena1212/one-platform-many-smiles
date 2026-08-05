const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const dir = 'E:\\Port\\Property Management System';
const files = [
  'Asset Master.xlsx',
  'Employee Master.xlsx',
  'Property Details.-EM.xlsx',
  'Real Estate - Master with Data.xlsx'
];

for (const file of files) {
  const filePath = path.join(dir, file);
  if (fs.existsSync(filePath)) {
    console.log(`\n=== Reading ${file} ===`);
    try {
      const workbook = xlsx.readFile(filePath);
      for (const sheetName of workbook.SheetNames) {
        console.log(`\nSheet: ${sheetName}`);
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
        if (data.length > 0) {
          console.log(`Headers: ${JSON.stringify(data[0])}`);
          // Print unique values for a few columns if it looks like a master table
          const numRows = data.length;
          console.log(`Rows: ${numRows}`);
        } else {
          console.log('Empty sheet');
        }
      }
    } catch (e) {
      console.log(`Error reading ${file}: ${e.message}`);
    }
  } else {
    console.log(`${file} not found.`);
  }
}
