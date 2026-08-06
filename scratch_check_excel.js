import xlsx from 'xlsx';

const wb = xlsx.readFile('../COA-For New Co (1).xlsx');
const ws = wb.Sheets['Unit Ac Codes'];
const data = xlsx.utils.sheet_to_json(ws, { header: 1 });

console.log('Total rows in Unit Ac Codes sheet:', data.length);
console.log('Headers:', data[0]);
console.log('First 5 rows:');
for (let i = 1; i <= 5; i++) {
  console.log(data[i]);
}
console.log('Last 5 rows:');
for (let i = data.length - 5; i < data.length; i++) {
  console.log(data[i]);
}
