import * as XLSX from 'xlsx';
import fs from 'fs';

const xlsx = XLSX.default || XLSX;
const filePath = 'e:/Port/Property Management System/Documents/New Documents/COA to Simerjith 28092026.xlsx';
const buffer = fs.readFileSync(filePath);
const wb = xlsx.read(buffer, { type: 'buffer' });

const masterSheets = [
  { name: 'Assets-New', defaultTypeCode: '1', defaultTypeName: 'Assets' },
  { name: 'Liabilities-New', defaultTypeCode: '2', defaultTypeName: 'Liabilities' },
  { name: 'Capital-New', defaultTypeCode: '3', defaultTypeName: 'Capital' },
  { name: 'Revenue-New', defaultTypeCode: '4', defaultTypeName: 'Revenue' },
  { name: 'Expenses-New', defaultTypeCode: '5', defaultTypeName: 'Expenditure' }
];

const coaTypes = new Map();
const coaGroups = new Map();
const coaClasses = new Map();
const coaGls = new Map();
const coaSls = new Map();

for (const s of masterSheets) {
  const sheet = wb.Sheets[s.name];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  const headers = rows[0].map(h => String(h).trim().toUpperCase());
  
  const typeIdx = headers.indexOf('TYPE');
  const typeNameIdx = headers.indexOf('TYPE NAME');
  const groupIdx = headers.indexOf('GROUP');
  const groupNameIdx = headers.indexOf('GROUP NAME');
  const classIdx = headers.indexOf('CLASS');
  const classNameIdx = headers.indexOf('CLASS NAME');
  const glIdx = headers.indexOf('GL');
  const glNameIdx = headers.indexOf('GL NAME');
  const slIdx = headers.indexOf('SL');
  const slNameIdx = headers.indexOf('SL NAME');

  // Set the canonical type
  coaTypes.set(s.defaultTypeCode, { code: s.defaultTypeCode, name: s.defaultTypeName });

  let currentGroup = '';
  let currentGroupName = '';
  let currentClass = '';
  let currentClassName = '';
  let currentGl = '';
  let currentGlName = '';

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row.some(c => c !== '')) continue;

    const rawGroup = String(row[groupIdx] || '').trim();
    const rawGroupName = String(row[groupNameIdx] || '').trim();
    const rawClass = String(row[classIdx] || '').trim();
    const rawClassName = String(row[classNameIdx] || '').trim();
    const rawGl = String(row[glIdx] || '').trim();
    const rawGlName = String(row[glNameIdx] || '').trim();
    const rawSl = String(row[slIdx] || '').trim();
    const rawSlName = String(row[slNameIdx] || '').trim();

    if (rawGroup) { currentGroup = rawGroup; currentGroupName = rawGroupName || currentGroupName; }
    if (rawClass) { currentClass = rawClass; currentClassName = rawClassName || currentClassName; }
    if (rawGl) { currentGl = rawGl; currentGlName = rawGlName || currentGlName; }

    if (currentGroup) {
      coaGroups.set(currentGroup, { code: currentGroup, name: currentGroupName, type_code: s.defaultTypeCode });
    }
    if (currentClass) {
      coaClasses.set(currentClass, { code: currentClass, name: currentClassName, group_code: currentGroup, type_code: s.defaultTypeCode });
    }
    if (currentGl) {
      coaGls.set(currentGl, { code: currentGl, name: currentGlName, class_code: currentClass, group_code: currentGroup, type_code: s.defaultTypeCode });
    }
    if (rawSl) {
      coaSls.set(rawSl, {
        code: rawSl,
        name: rawSlName,
        gl_code: currentGl,
        class_code: currentClass,
        group_code: currentGroup,
        type_code: s.defaultTypeCode
      });
    }
  }
}

console.log('=== Normalized Master COA Summary ===');
console.log('Types:', Array.from(coaTypes.values()));
console.log('\nGroups (' + coaGroups.size + '):', Array.from(coaGroups.values()));
console.log('\nClasses (' + coaClasses.size + '):', Array.from(coaClasses.values()));
console.log('\nGLs (' + coaGls.size + '):', Array.from(coaGls.values()));
console.log('\nSLs (' + coaSls.size + ') count.');

// Let's inspect Unit Ac Codes
const unitSheet = wb.Sheets['Unit Ac Codes'];
const unitRows = xlsx.utils.sheet_to_json(unitSheet, { header: 1, defval: '' });
console.log('\n=== Unit Ac Codes Sample ===');
console.log('Headers:', unitRows[0]);
console.log('Count:', unitRows.length - 1);
console.log('First 3:', unitRows.slice(1, 4));

// Let's inspect Tenants-Unit Acs
const tenantSheet = wb.Sheets['Tenants-Unit Acs'];
const tenantRows = xlsx.utils.sheet_to_json(tenantSheet, { header: 1, defval: '' });
console.log('\n=== Tenants-Unit Acs Sample ===');
console.log('Headers:', tenantRows[0]);
console.log('Count:', tenantRows.length - 1);
console.log('First 3:', tenantRows.slice(1, 4));
