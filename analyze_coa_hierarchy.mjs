import * as XLSX from 'xlsx';
import fs from 'fs';

const xlsx = XLSX.default || XLSX;
const filePath = 'e:/Port/Property Management System/Documents/New Documents/COA to Simerjith 28092026.xlsx';
const buffer = fs.readFileSync(filePath);
const wb = xlsx.read(buffer, { type: 'buffer' });

// 1. Analyze Master Hierarchy Sheets: Assets-New, Liabilities-New, Capital-New, Revenue-New, Expenses-New
const masterSheets = ['Assets-New', 'Liabilities-New', 'Capital-New', 'Revenue-New', 'Expenses-New'];

const coaTypes = new Map(); // code -> { code, name }
const coaGroups = new Map(); // code -> { code, name, type_code }
const coaClasses = new Map(); // code -> { code, name, group_code, type_code }
const coaGls = new Map(); // code -> { code, name, class_code, group_code, type_code }
const coaSls = new Map(); // code -> { code, name, gl_code, class_code, group_code, type_code }

for (const sheetName of masterSheets) {
  const sheet = wb.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  const headers = rows[0].map(h => String(h).trim().toUpperCase());
  
  // Find indices
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

  let currentType = '';
  let currentTypeName = '';
  let currentGroup = '';
  let currentGroupName = '';
  let currentClass = '';
  let currentClassName = '';
  let currentGl = '';
  let currentGlName = '';

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row.some(c => c !== '')) continue;

    const rawType = String(row[typeIdx] || '').trim();
    const rawTypeName = String(row[typeNameIdx] || '').trim();
    const rawGroup = String(row[groupIdx] || '').trim();
    const rawGroupName = String(row[groupNameIdx] || '').trim();
    const rawClass = String(row[classIdx] || '').trim();
    const rawClassName = String(row[classNameIdx] || '').trim();
    const rawGl = String(row[glIdx] || '').trim();
    const rawGlName = String(row[glNameIdx] || '').trim();
    const rawSl = String(row[slIdx] || '').trim();
    const rawSlName = String(row[slNameIdx] || '').trim();

    if (rawType) { currentType = rawType; currentTypeName = rawTypeName || currentTypeName; }
    if (rawGroup) { currentGroup = rawGroup; currentGroupName = rawGroupName || currentGroupName; }
    if (rawClass) { currentClass = rawClass; currentClassName = rawClassName || currentClassName; }
    if (rawGl) { currentGl = rawGl; currentGlName = rawGlName || currentGlName; }

    if (currentType) coaTypes.set(currentType, { code: currentType, name: currentTypeName });
    if (currentGroup) coaGroups.set(currentGroup, { code: currentGroup, name: currentGroupName, type_code: currentType });
    if (currentClass) coaClasses.set(currentClass, { code: currentClass, name: currentClassName, group_code: currentGroup, type_code: currentType });
    if (currentGl) coaGls.set(currentGl, { code: currentGl, name: currentGlName, class_code: currentClass, group_code: currentGroup, type_code: currentType });
    
    if (rawSl) {
      coaSls.set(rawSl, {
        code: rawSl,
        name: rawSlName,
        gl_code: currentGl,
        class_code: currentClass,
        group_code: currentGroup,
        type_code: currentType
      });
    }
  }
}

console.log('--- Master COA Hierarchy Counts ---');
console.log('Types:', coaTypes.size, Array.from(coaTypes.values()));
console.log('Groups:', coaGroups.size);
console.log('Classes:', coaClasses.size);
console.log('GLs:', coaGls.size);
console.log('SLs:', coaSls.size);

// Check Unit Ac Codes sheet
const unitSheet = wb.Sheets['Unit Ac Codes'];
const unitRows = xlsx.utils.sheet_to_json(unitSheet, { header: 1, defval: '' });
console.log('\n--- Unit Ac Codes Sheet Rows ---', unitRows.length - 1);

// Check Tenants-Unit Acs sheet
const tenantSheet = wb.Sheets['Tenants-Unit Acs'];
const tenantRows = xlsx.utils.sheet_to_json(tenantSheet, { header: 1, defval: '' });
console.log('--- Tenants-Unit Acs Sheet Rows ---', tenantRows.length - 1);
