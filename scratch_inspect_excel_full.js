import xlsx from 'xlsx';

const wb = xlsx.readFile('../COA-For New Co (1).xlsx');
const ws = wb.Sheets['Unit Ac Codes'];
const excelData = xlsx.utils.sheet_to_json(ws, { header: 1 });

console.log('Total rows in Excel sheet:', excelData.length - 1);
console.log('Sample rows:');
for (let i = 1; i <= 10; i++) {
  console.log(excelData[i]);
}
