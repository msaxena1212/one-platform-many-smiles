import { readFileSync } from 'fs';

function checkFile(file) {
  const src = readFileSync(file, 'utf8');
  let braces = 0, parens = 0, brackets = 0;
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    // Skip single-line comments
    if (c === '/' && src[i+1] === '/') {
      while (i < src.length && src[i] !== '\n') i++;
      continue;
    }
    // Skip block comments
    if (c === '/' && src[i+1] === '*') {
      i += 2;
      while (i < src.length && !(src[i] === '*' && src[i+1] === '/')) i++;
      i += 2;
      continue;
    }
    // Skip template literals (rough)
    if (c === '`') {
      i++;
      let depth = 1;
      while (i < src.length && depth > 0) {
        if (src[i] === '\\') { i += 2; continue; }
        if (src[i] === '`') depth--;
        i++;
      }
      continue;
    }
    // Skip string literals
    if (c === '"' || c === "'") {
      const q = c; i++;
      while (i < src.length && src[i] !== q) {
        if (src[i] === '\\') i++;
        i++;
      }
      i++;
      continue;
    }
    if (c === '{') braces++;
    else if (c === '}') braces--;
    else if (c === '(') parens++;
    else if (c === ')') parens--;
    else if (c === '[') brackets++;
    else if (c === ']') brackets--;
    i++;
  }
  const ok = braces === 0 && parens === 0 && brackets === 0;
  console.log(`${file.split('/').pop()}: braces=${braces} parens=${parens} brackets=${brackets} => ${ok ? 'OK ✓' : 'UNBALANCED! ✗'}`);
}

checkFile('src/components/leasing-module.tsx');
checkFile('src/components/leasing/bulk-pdc-deposit-modal.tsx');
