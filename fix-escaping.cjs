const fs = require('fs');
const files = [
  'src/routes/leasing.index.tsx', 
  'src/routes/finance.index.tsx', 
  'src/routes/cashier.index.tsx', 
  'src/routes/maintenance.index.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  // Replace \` with `
  content = content.replace(/\\`/g, '`');
  // Replace \$ with $
  content = content.replace(/\\\$/g, '$');
  fs.writeFileSync(file, content);
}
console.log('Fixed escaping issues in dashboards');
