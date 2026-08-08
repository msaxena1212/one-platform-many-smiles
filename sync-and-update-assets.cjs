const { Client } = require('pg');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const connectionString = "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

// Helper to convert Excel serial dates or date strings to YYYY-MM-DD string
function parseToDateString(val) {
  if (val === null || val === undefined || val === '' || val === '-') return null;
  if (typeof val === 'number') {
    const jsDate = new Date(Math.round((val - (25567 + 2)) * 86400 * 1000));
    if (!isNaN(jsDate.getTime())) return jsDate.toISOString().split('T')[0];
  }
  const str = String(val).trim();
  if (!str || str === '-') return null;

  // Try format like 04-Jan-2025 or 2025-01-04
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  // Try DD-MMM-YYYY manually
  const parts = str.split(/[-/\s]+/);
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const months = { jan:0, feb:1, mar:2, apr:3, may:4, jun:5, jul:6, aug:7, sep:8, oct:9, nov:10, dec:11 };
    const month = months[parts[1].toLowerCase().slice(0,3)];
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && month !== undefined && !isNaN(year)) {
      const d = new Date(Date.UTC(year < 100 ? 2000 + year : year, month, day));
      return d.toISOString().split('T')[0];
    }
  }

  return null;
}

function parseNum(val) {
  if (val === null || val === undefined || val === '' || val === '-') return 0;
  if (typeof val === 'number') return val;
  const cleaned = String(val).replace(/,/g, '').replace(/QAR/gi, '').replace(/-/g, '').trim();
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

// Generate descriptive Asset Name
function buildAssetName(cat, subcat, brand, model) {
  const parts = [];
  if (brand && brand.trim() && brand.trim() !== '-') parts.push(brand.trim());
  if (subcat && subcat.trim()) {
    parts.push(subcat.trim());
  } else if (cat && cat.trim()) {
    parts.push(cat.trim());
  }
  if (model && model.trim() && model.trim() !== '-') {
    // Avoid repeating subcat name in model if model starts with subcat
    const m = model.trim();
    if (!parts.some(p => m.toLowerCase().includes(p.toLowerCase()))) {
      parts.push(m);
    } else {
      parts.push(m);
    }
  }
  const name = parts.filter((v, i, a) => a.indexOf(v) === i).join(' ');
  return name.trim() || 'Asset Item';
}

async function runSync() {
  console.log('Connecting to PostgreSQL database...');
  const client = new Client({ connectionString });
  await client.connect();

  console.log('Ensuring all columns exist in public.assets table...');
  await client.query(`
    ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS assigned_property_code TEXT;
    ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS assigned_unit_code TEXT;
    ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS assigned_employee_name TEXT;
    ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS addition_during_year NUMERIC DEFAULT 0;
    ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS total_asset_value NUMERIC DEFAULT 0;
    ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS disposal_value NUMERIC DEFAULT 0;
    ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS opening_accumulated_depreciation NUMERIC DEFAULT 0;
    ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS current_year_depreciation NUMERIC DEFAULT 0;
    ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS closing_accumulated_depreciation NUMERIC DEFAULT 0;
    ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS net_book_value NUMERIC DEFAULT 0;
    ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS return_date DATE;
    ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS disposal_date DATE;
  `);

  console.log('Fetching Properties, Units, Employees for mapping...');
  const propsRes = await client.query('SELECT id, property_code, title FROM public.properties');
  const unitsRes = await client.query('SELECT id, unit_number, unit_code, property_id FROM public.units');
  const empRes = await client.query("SELECT id, first_name, last_name, CONCAT(first_name, ' ', last_name) as full_name FROM public.employees");

  // Property mapping dictionary
  const propMap = {};
  propsRes.rows.forEach(p => {
    if (p.property_code) {
      propMap[p.property_code.trim().toLowerCase()] = p;
      propMap[p.property_code.replace(/[-\s]+/g, '').toLowerCase()] = p;
    }
    if (p.title) {
      propMap[p.title.trim().toLowerCase()] = p;
    }
  });

  // Manual property aliases
  const binOmran1 = propsRes.rows.find(p => p.property_code === 'BIN OMRAN 1');
  const binOmran2 = propsRes.rows.find(p => p.property_code === 'BIN OMRAN 2');
  const musheireb05 = propsRes.rows.find(p => p.property_code === 'MUSHEIREB - 05');
  const naser03 = propsRes.rows.find(p => p.property_code === 'NASER - 03');
  propMap['bin omran 3'] = binOmran2 || binOmran1;
  propMap['musheireb - 06'] = musheireb05;
  propMap['naser - 04'] = naser03;

  // Unit lookup dictionary: property_id + clean_unit_code -> unit object
  const unitMap = {};
  unitsRes.rows.forEach(u => {
    if (u.unit_code) {
      const codeClean = u.unit_code.trim().toLowerCase();
      unitMap[`${u.property_id}_${codeClean}`] = u;
      unitMap[`${u.property_id}_${codeClean.replace(/[-\s]+/g, '')}`] = u;
      if (u.unit_number) {
        unitMap[`${u.property_id}_${u.unit_number}`] = u;
      }
    }
  });

  // Employee mapping dictionary
  const empMap = {};
  empRes.rows.forEach(e => {
    if (e.full_name) empMap[e.full_name.trim().toLowerCase()] = e;
    if (e.first_name) empMap[e.first_name.trim().toLowerCase()] = e;
  });

  // Load Asset Master.xlsx
  const excelPath = path.join(__dirname, '..', 'Asset Master.xlsx');
  const wb = xlsx.readFile(excelPath);
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });

  console.log(`Processing ${rows.length} asset records from Asset Master.xlsx...`);

  // Clear existing assets table or prepare UPSERT
  await client.query('DELETE FROM public.assets');

  const updatedRows = [];
  let mappedPropCount = 0;
  let mappedUnitCount = 0;
  let mappedEmpCount = 0;

  for (let idx = 0; idx < rows.length; idx++) {
    const r = rows[idx];
    const assetSeq = idx + 1;
    const assetCode = r['Asset ID'] && String(r['Asset ID']).trim() ? String(r['Asset ID']).trim() : `AST-${String(assetSeq).padStart(4, '0')}`;

    const cat = r['Asset Category'] ? String(r['Asset Category']).trim() : '';
    const subcat = r['Asset Subcategory'] ? String(r['Asset Subcategory']).trim() : '';
    const brand = r['Brand'] ? String(r['Brand']).trim() : '';
    const model = r['Model'] ? String(r['Model']).trim() : '';

    const assetName = r['Asset Name'] && String(r['Asset Name']).trim() ? String(r['Asset Name']).trim() : buildAssetName(cat, subcat, brand, model);

    const serialNo = r['Serial / IMEI No.'] ? String(r['Serial / IMEI No.']).trim() : null;
    const ownershipType = r['Ownership Type'] ? String(r['Ownership Type']).trim() : 'Company Owned';
    const purchaseDate = parseToDateString(r['Purchase Date']);
    const supplier = r['Supplier'] ? String(r['Supplier']).trim() : null;
    const purchaseCost = parseNum(r['Purchase Cost (QAR)']);
    const warrantyExpiry = parseToDateString(r['Warranty Expiry Date']);
    const warrantyStatus = r['Warranty Status'] ? String(r['Warranty Status']).trim() : null;

    const rawPropCode = r['Assigned Property Code'] ? String(r['Assigned Property Code']).trim() : '';
    const rawUnitCode = r['Assigned Unit Code'] ? String(r['Assigned Unit Code']).trim() : '';
    const rawEmpName = r['Assigned Employee Name'] ? String(r['Assigned Employee Name']).trim() : '';
    const rawEmpId = r['Assigned Employee ID'] ? String(r['Assigned Employee ID']).trim() : '';

    // Property matching
    let propId = null;
    if (rawPropCode) {
      const pKey = rawPropCode.toLowerCase();
      const pNorm = pKey.replace(/[-\s]+/g, '');
      const matchedP = propMap[pKey] || propMap[pNorm];
      if (matchedP) {
        propId = matchedP.id;
        mappedPropCount++;
      }
    }

    // Unit matching
    let unitId = null;
    if (propId && rawUnitCode) {
      let simpleU = rawUnitCode;
      if (rawUnitCode.includes('-')) {
        const parts = rawUnitCode.split('-');
        simpleU = parts[parts.length - 1].trim();
      }
      const uNorm = simpleU.toLowerCase().replace(/[-\s]+/g, '');
      const uNormFull = rawUnitCode.toLowerCase().replace(/[-\s]+/g, '');

      let matchedU = unitMap[`${propId}_${simpleU.toLowerCase()}`] ||
                     unitMap[`${propId}_${uNorm}`] ||
                     unitMap[`${propId}_${uNormFull}`];

      if (!matchedU) {
        const propUnits = unitsRes.rows.filter(u => u.property_id === propId);
        matchedU = propUnits.find(u => {
          const uc = (u.unit_code || '').toLowerCase();
          return uc === simpleU.toLowerCase() || uc.includes(simpleU.toLowerCase()) || simpleU.toLowerCase().includes(uc);
        });
      }

      if (matchedU) {
        unitId = matchedU.id;
        mappedUnitCount++;
      }
    }

    // Employee matching
    let empId = null;
    if (rawEmpName) {
      const matchedE = empMap[rawEmpName.toLowerCase()];
      if (matchedE) {
        empId = matchedE.id;
        mappedEmpCount++;
      }
    }

    const assignmentDate = parseToDateString(r['Assignment Date']);
    const assetCondition = r['Asset Condition'] ? String(r['Asset Condition']).trim() : 'Fair';
    const assetStatus = r['Asset Status'] ? String(r['Asset Status']).trim() : 'Available';
    const lifeOfAsset = parseInt(r['Life Of Asset'], 10) || (r['Life Of Asset'] === 'Available' ? 5 : 5);
    const openingCost = parseNum(r['Opening Cost']);
    const lastServiceDate = parseToDateString(r['Last Service Date']);
    const nextServiceDate = parseToDateString(r['Next Service Date']);
    const returnDate = parseToDateString(r['Return Date']);
    const disposalDate = parseToDateString(r['Disposal Date']);
    const additionDuringYear = parseNum(r['Addition during the year']);
    const totalAssetValue = parseNum(r[' Total Asset Value ']) || purchaseCost;
    const disposalValue = parseNum(r['Disposal Value']);
    const openingAccDep = parseNum(r['Opening Accumulated Depreciation']);
    const currentYearDep = parseNum(r['Current Year Depreciation']);
    const closingAccDep = parseNum(r['Closing Accumulated Depreciation']);
    const netBookValue = parseNum(r['Net Book Value']) || purchaseCost;
    const remarks = r['Remarks'] ? String(r['Remarks']).trim() : null;

    // Insert into PostgreSQL
    await client.query(`
      INSERT INTO public.assets (
        asset_code, asset_name, category, subcategory, brand, model, serial_number,
        ownership_type, purchase_date, supplier, purchase_cost, warranty_expiry_date, warranty_status,
        assigned_property_id, assigned_property_code, assigned_unit_id, assigned_unit_code,
        assigned_employee_id, assigned_employee_name, assignment_date, asset_condition, asset_status,
        life_of_asset, opening_cost, last_service_date, next_service_date, return_date, disposal_date,
        addition_during_year, total_asset_value, disposal_value, opening_accumulated_depreciation,
        current_year_depreciation, closing_accumulated_depreciation, net_book_value, remarks
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13,
        $14, $15, $16, $17,
        $18, $19, $20, $21, $22,
        $23, $24, $25, $26, $27, $28,
        $29, $30, $31, $32,
        $33, $34, $35, $36
      )
    `, [
      assetCode, assetName, cat, subcat, brand, model, serialNo,
      ownershipType, purchaseDate, supplier, purchaseCost, warrantyExpiry, warrantyStatus,
      propId, rawPropCode, unitId, rawUnitCode,
      empId, rawEmpName, assignmentDate, assetCondition, assetStatus,
      lifeOfAsset, openingCost, lastServiceDate, nextServiceDate, returnDate, disposalDate,
      additionDuringYear, totalAssetValue, disposalValue, openingAccDep,
      currentYearDep, closingAccDep, netBookValue, remarks
    ]);

    // Construct updated object for Excel export
    const excelRow = {
      'Asset ID': assetCode,
      'Asset Name': assetName,
      'Asset Category': cat,
      'Asset Subcategory': subcat,
      'Brand': brand,
      'Model': model,
      'Serial / IMEI No.': serialNo || '',
      'Ownership Type': ownershipType,
      'Purchase Date': purchaseDate || '',
      'Supplier': supplier || '',
      'Purchase Cost (QAR)': purchaseCost,
      'Warranty Expiry Date': warrantyExpiry || '',
      'Warranty Status': warrantyStatus || '',
      'Department': r['Department'] || '',
      'Assigned Property Code': rawPropCode,
      'Assigned Unit Code': rawUnitCode,
      'Assigned Employee ID': rawEmpId,
      'Assigned Employee Name': rawEmpName,
      'Assignment Date': assignmentDate || '',
      'Asset Condition': assetCondition,
      'Asset Status': assetStatus,
      'Life Of Asset': lifeOfAsset,
      'Opening Cost': openingCost,
      'Last Service Date': lastServiceDate || '',
      'Addition during the year': additionDuringYear,
      ' Total Asset Value ': totalAssetValue,
      'Disposal Value': disposalValue,
      'Opening Accumulated Depreciation': openingAccDep,
      'Current Year Depreciation': currentYearDep,
      'Closing Accumulated Depreciation': closingAccDep,
      'Net Book Value': netBookValue,
      'Next Service Date': nextServiceDate || '',
      'Return Date': returnDate || '',
      'Disposal Date': disposalDate || '',
      'Remarks': remarks || ''
    };

    updatedRows.push(excelRow);
  }

  console.log(`\nSynchronization Summary:`);
  console.log(`- Total Assets Synced: ${rows.length}`);
  console.log(`- Properties Mapped to UUID: ${mappedPropCount}`);
  console.log(`- Units Mapped to UUID: ${mappedUnitCount}`);
  console.log(`- Employees Mapped: ${mappedEmpCount}`);

  // Write back to Excel file Asset Master.xlsx
  console.log(`Updating ${excelPath} with standardized asset details...`);
  const newSheet = xlsx.utils.json_to_sheet(updatedRows);
  wb.Sheets[sheetName] = newSheet;
  try {
    xlsx.writeFile(wb, excelPath);
    console.log(`Successfully updated ${excelPath}!`);
  } catch (fileErr) {
    console.warn(`Warning: Could not write directly to ${excelPath} (${fileErr.message}). Writing to Asset Master Updated.xlsx...`);
    const fallbackPath = path.join(__dirname, '..', 'Asset Master Updated.xlsx');
    xlsx.writeFile(wb, fallbackPath);
    console.log(`Successfully saved updated asset details to ${fallbackPath}!`);
  }

  await client.end();
}

runSync().catch(err => {
  console.error('Fatal Error during asset sync:', err);
  process.exit(1);
});
