const fs = require('fs');
const path = require('path');
const dir = './src/routes';
const files = fs.readdirSync(dir).filter(f => f.startsWith('prop-mgr'));
for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/\/host/g, '/prop-mgr');
  fs.writeFileSync(filePath, content);
}
console.log('Replaced /host with /prop-mgr in all prop-mgr routes.');
