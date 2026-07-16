const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      if (content.includes('USD ')) {
        content = content.replace(/USD /g, '$');
        changed = true;
      }
      if (content.includes('(USD)')) {
        content = content.replace(/\(USD\)/g, '($)');
        changed = true;
      }
      if (content.includes('currency: "USD"')) {
        // Intentionally keep this as USD, format it correctly
      }
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

replaceInDir('E:\\Port\\Property Management System\\one-platform-many-smiles\\src');
