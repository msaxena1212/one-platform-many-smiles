const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const connectionString = "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

async function runUpdate() {
  console.log('Connecting to PostgreSQL database...');
  const client = new Client({ connectionString });
  await client.connect();

  console.log('Fetching Properties and Units from DB...');
  const propsRes = await client.query('SELECT id, property_code, title FROM public.properties');
  const unitsRes = await client.query('SELECT id, unit_code, unit_name, unit_ref, property_id FROM public.units');

  const propMap = {};
  propsRes.rows.forEach(p => {
    if (p.property_code) propMap[p.property_code.trim().toLowerCase()] = p;
    if (p.title) propMap[p.title.trim().toLowerCase()] = p;
  });

  const unitLookup = {};
  unitsRes.rows.forEach(u => {
    if (u.unit_name) unitLookup[`${u.property_id}_${u.unit_name.trim().toLowerCase()}`] = u;
    if (u.unit_code) unitLookup[`${u.property_id}_${u.unit_code.trim().toLowerCase()}`] = u;
    if (u.unit_ref) unitLookup[`${u.property_id}_${u.unit_ref.trim().toLowerCase()}`] = u;
    if (u.unit_name) unitLookup[u.unit_name.trim().toLowerCase()] = u;
    if (u.unit_code) unitLookup[u.unit_code.trim().toLowerCase()] = u;
  });

  // Read prompt lines from transcript
  const transcriptPath = 'C:\\Users\\mindz\\.gemini\\antigravity-ide\\brain\\68e22abf-7a5d-4abe-a449-f734c063c4b9\\.system_generated\\logs\\transcript_full.jsonl';
  const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n').filter(Boolean);
  const userSteps = lines.map(l => JSON.parse(l)).filter(obj => obj.type === 'USER_INPUT' && obj.content && obj.content.includes('Unit AC Codes'));
  const lastStep = userSteps[userSteps.length - 1];
  const rawLines = lastStep.content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const headerIdx = rawLines.findIndex(l => l.includes('Property Name') && l.includes('Unit Code') && l.includes('PDC In Hand'));

  console.log(`Processing Unit AC Codes starting at line ${headerIdx}...`);

  let updatedCount = 0;
  const acDataMap = {}; // unit_id -> AC details

  for (let i = headerIdx + 1; i < rawLines.length; i++) {
    const line = rawLines[i];
    if (line.includes('</USER_REQUEST>') || line.includes('NOTE:')) break;
    const parts = line.split('\t').map(p => p.trim());
    if (parts.length < 4) continue;

    const propName = parts[0];
    const unitCode = parts[1];
    const pdcCode = parts[2] || null;
    const pdcName = parts[3] || null;
    const depCode = parts[4] || null;
    const depName = parts[5] || null;
    const recCode = parts[6] || null;
    const recName = parts[7] || null;

    let matchedProp = propMap[propName.toLowerCase()];
    if (!matchedProp) {
      matchedProp = propsRes.rows.find(p => p.title && p.title.toLowerCase().includes(propName.toLowerCase()) || p.property_code && p.property_code.toLowerCase().includes(propName.toLowerCase()));
    }

    let matchedUnit = null;
    if (matchedProp) {
      matchedUnit = unitLookup[`${matchedProp.id}_${unitCode.toLowerCase()}`];
      if (!matchedUnit && unitCode.includes('-')) {
        const simpleU = unitCode.split('-').pop().trim().toLowerCase();
        matchedUnit = unitLookup[`${matchedProp.id}_${simpleU}`];
      }
    }
    if (!matchedUnit) {
      matchedUnit = unitLookup[unitCode.toLowerCase()];
    }

    if (matchedUnit) {
      await client.query(`
        UPDATE public.units
        SET pdc_in_hand_code = $1,
            pdc_in_hand_name = $2,
            deposit_code = $3,
            deposit_name = $4,
            receivables_code = $5,
            receivables_name = $6,
            updated_at = NOW()
        WHERE id = $7
      `, [pdcCode, pdcName, depCode, depName, recCode, recName, matchedUnit.id]);

      acDataMap[matchedUnit.id] = { pdcCode, pdcName, depCode, depName, recCode, recName, unitCode, propName };
      updatedCount++;
    }
  }

  console.log(`Successfully updated ${updatedCount} units in PostgreSQL database.`);

  // Update Excel file Real Estate - Master with Data.xlsx
  const excelPath = path.join(__dirname, '..', 'Real Estate - Master with Data.xlsx');
  if (fs.existsSync(excelPath)) {
    console.log(`Updating ${excelPath}...`);
    try {
      const wb = xlsx.readFile(excelPath);
      const sheetName = 'Unit Master';
      if (wb.Sheets[sheetName]) {
        const rows = xlsx.utils.sheet_to_json(wb.Sheets[sheetName]);
        rows.forEach(r => {
          const uCode = r['Unit Code / No.'] || r['UnitName'];
          if (uCode) {
            const uKey = uCode.trim().toLowerCase();
            const matchedU = unitsRes.rows.find(u => (u.unit_code && u.unit_code.toLowerCase() === uKey) || (u.unit_name && u.unit_name.toLowerCase() === uKey) || (u.unit_ref && u.unit_ref.toLowerCase() === uKey));
            if (matchedU && acDataMap[matchedU.id]) {
              const ac = acDataMap[matchedU.id];
              r['PDC In Hand Code'] = ac.pdcCode;
              r['PDC In Hand Name'] = ac.pdcName;
              r['Deposit Code'] = ac.depCode;
              r['Deposit Name'] = ac.depName;
              r['Receivables Code'] = ac.recCode;
              r['Receivables Name'] = ac.recName;
            }
          }
        });
        wb.Sheets[sheetName] = xlsx.utils.json_to_sheet(rows);
        try {
          xlsx.writeFile(wb, excelPath);
          console.log(`Successfully updated ${excelPath}!`);
        } catch (e) {
          const fbPath = path.join(__dirname, '..', 'Real Estate - Master with Data Updated.xlsx');
          xlsx.writeFile(wb, fbPath);
          console.log(`Saved updated Excel to ${fbPath}`);
        }
      }
    } catch (err) {
      console.warn('Excel update warning:', err.message);
    }
  }

  await client.end();
}

runUpdate().catch(console.error);
