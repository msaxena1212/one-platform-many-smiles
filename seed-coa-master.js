import xlsx from 'xlsx';
import { Client } from 'pg';
import path from 'path';

const connectionString = "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

async function seedCOAMasterLightning() {
  const client = new Client({ connectionString });
  await client.connect();

  try {
    console.log('Connecting to PostgreSQL database...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.erp_chart_of_accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now()
      );

      ALTER TABLE public.erp_chart_of_accounts
        ADD COLUMN IF NOT EXISTS type_code TEXT,
        ADD COLUMN IF NOT EXISTS type_name TEXT,
        ADD COLUMN IF NOT EXISTS group_code TEXT,
        ADD COLUMN IF NOT EXISTS group_name TEXT,
        ADD COLUMN IF NOT EXISTS class_code TEXT,
        ADD COLUMN IF NOT EXISTS class_name TEXT,
        ADD COLUMN IF NOT EXISTS gl_code TEXT,
        ADD COLUMN IF NOT EXISTS gl_name TEXT,
        ADD COLUMN IF NOT EXISTS sl_code TEXT,
        ADD COLUMN IF NOT EXISTS sl_name TEXT;

      CREATE TABLE IF NOT EXISTS public.unit_coas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        property_name TEXT,
        unit_code TEXT UNIQUE NOT NULL,
        pdc_in_hand_code TEXT,
        pdc_in_hand_name TEXT,
        deposit_code TEXT,
        deposit_name TEXT,
        receivables_code TEXT,
        receivables_name TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );

      ALTER TABLE public.units
        ADD COLUMN IF NOT EXISTS pdc_in_hand_code TEXT,
        ADD COLUMN IF NOT EXISTS pdc_in_hand_name TEXT,
        ADD COLUMN IF NOT EXISTS deposit_code TEXT,
        ADD COLUMN IF NOT EXISTS deposit_name TEXT,
        ADD COLUMN IF NOT EXISTS receivables_code TEXT,
        ADD COLUMN IF NOT EXISTS receivables_name TEXT;
    `);

    const excelPath = path.resolve('../COA-For New Co (1).xlsx');
    console.log(`Reading Excel file: ${excelPath}`);
    const wb = xlsx.readFile(excelPath);

    const masterSheets = [
      { sheet: 'Assets-New', defaultType: 'Assets' },
      { sheet: 'Liabilities-New', defaultType: 'Liabilities' },
      { sheet: 'Capital-New', defaultType: 'Capital' },
      { sheet: 'Revenue-New', defaultType: 'Revenue' },
      { sheet: 'Expenses-New', defaultType: 'Expenditure' }
    ];

    await client.query('BEGIN');

    const coaRecordsMap = new Map();

    for (const item of masterSheets) {
      if (!wb.SheetNames.includes(item.sheet)) continue;
      const ws = wb.Sheets[item.sheet];
      const rows = xlsx.utils.sheet_to_json(ws);

      const validRows = rows.filter(row => {
        const slCode = String(row['SL'] || '').trim();
        const glCode = String(row['GL'] || '').trim();
        const slName = String(row['SL NAME'] || '').trim();
        const glName = String(row['GL NAME'] || '').trim();
        return (slCode || glCode) && (slName || glName);
      });

      for (const row of validRows) {
        const typeCode = String(row['TYPE'] || '').trim();
        const typeName = String(row['TYPE NAME'] || item.defaultType).trim();
        const groupCode = String(row['GROUP'] || '').trim();
        const groupName = String(row['GROUP NAME'] || '').trim();
        const classCode = String(row['CLASS'] || '').trim();
        const className = String(row['CLASS NAME'] || '').trim();
        const glCode = String(row['GL'] || '').trim();
        const glName = String(row['GL NAME'] || '').trim();
        const slCode = String(row['SL'] || '').trim();
        const slName = String(row['SL NAME'] || '').trim();

        const code = slCode || glCode;
        const name = slName || glName;

        coaRecordsMap.set(code, [
          code, name, typeName, typeCode, typeName, groupCode, groupName, classCode, className, glCode, glName, slCode, slName
        ]);
      }
    }

    const dbUnitsResult = await client.query(`SELECT id, unit_name, unit_code, unit_ref FROM public.units`);
    const dbUnits = dbUnitsResult.rows;

    const unitCoasBatch = [];
    const unitUpdatesBatch = [];

    if (wb.SheetNames.includes('Unit Ac Codes')) {
      const ws = wb.Sheets['Unit Ac Codes'];
      const rows = xlsx.utils.sheet_to_json(ws);
      const validUnitRows = rows.filter(r => String(r['Unit Code'] || '').trim());

      for (const r of validUnitRows) {
        const propName = String(r['Property Name'] || '').trim();
        const unitCode = String(r['Unit Code'] || '').trim();
        const pdcCode = String(r['PDC In Hand'] || '').trim();
        const pdcName = String(r['SL Name'] || '').trim();
        const depCode = String(r['Deposit'] || '').trim();
        const depName = String(r['SL Name_1'] || r['SL Name'] || '').trim();
        const recCode = String(r['Receivables'] || '').trim();
        const recName = String(r['SL Name_2'] || r['SL Name'] || '').trim();

        if (pdcCode && pdcName) {
          coaRecordsMap.set(pdcCode, [
            pdcCode, pdcName, 'Assets', '1', 'Assets', '12', 'Current Assets', '129', 'PDC In Hand', '12900', 'PDC In Hand', pdcCode, pdcName
          ]);
        }
        if (depCode && depName) {
          coaRecordsMap.set(depCode, [
            depCode, depName, 'Liabilities', '2', 'Liabilities', '21', 'Current Liabilities', '215', 'Deposits Received', '21500', 'Deposits - Leasing Customers', depCode, depName
          ]);
        }
        if (recCode && recName) {
          coaRecordsMap.set(recCode, [
            recCode, recName, 'Assets', '1', 'Assets', '12', 'Current Assets', '124', 'Accounts Receivables', '12413', 'Tenant Receivables', recCode, recName
          ]);
        }

        unitCoasBatch.push([propName, unitCode, pdcCode, pdcName, depCode, depName, recCode, recName]);

        const cleanCode = unitCode.replace(/\s+/g, '').toLowerCase();
        const matched = dbUnits.find(u => 
          (u.unit_name && u.unit_name.replace(/\s+/g, '').toLowerCase() === cleanCode) ||
          (u.unit_code && u.unit_code.replace(/\s+/g, '').toLowerCase() === cleanCode) ||
          (u.unit_ref && u.unit_ref.replace(/\s+/g, '').toLowerCase() === cleanCode)
        );

        if (matched) {
          unitUpdatesBatch.push([matched.id, pdcCode, pdcName, depCode, depName, recCode, recName]);
        }
      }
    }

    console.log(`Bulk inserting ${coaRecordsMap.size} Chart of Accounts...`);
    const allCOAEntries = Array.from(coaRecordsMap.values());
    const chunkSize = 100;
    for (let i = 0; i < allCOAEntries.length; i += chunkSize) {
      const chunk = allCOAEntries.slice(i, i + chunkSize);
      const valueStrings = [];
      const queryParams = [];
      let paramIdx = 1;

      for (const row of chunk) {
        const placeholders = [];
        for (let j = 0; j < 13; j++) {
          placeholders.push(`$${paramIdx++}`);
          queryParams.push(row[j]);
        }
        valueStrings.push(`(${placeholders.join(', ')})`);
      }

      await client.query(`
        INSERT INTO public.erp_chart_of_accounts (
          code, name, type, type_code, type_name, group_code, group_name, class_code, class_name, gl_code, gl_name, sl_code, sl_name
        ) VALUES ${valueStrings.join(', ')}
        ON CONFLICT (code) DO UPDATE SET
          name = EXCLUDED.name,
          type = EXCLUDED.type,
          type_code = EXCLUDED.type_code,
          type_name = EXCLUDED.type_name,
          group_code = EXCLUDED.group_code,
          group_name = EXCLUDED.group_name,
          class_code = EXCLUDED.class_code,
          class_name = EXCLUDED.class_name,
          gl_code = EXCLUDED.gl_code,
          gl_name = EXCLUDED.gl_name,
          sl_code = EXCLUDED.sl_code,
          sl_name = EXCLUDED.sl_name;
      `, queryParams);
    }

    console.log(`Bulk inserting ${unitCoasBatch.length} Unit COA records...`);
    for (let i = 0; i < unitCoasBatch.length; i += chunkSize) {
      const chunk = unitCoasBatch.slice(i, i + chunkSize);
      const valueStrings = [];
      const queryParams = [];
      let paramIdx = 1;

      for (const row of chunk) {
        const placeholders = [];
        for (let j = 0; j < 8; j++) {
          placeholders.push(`$${paramIdx++}`);
          queryParams.push(row[j]);
        }
        valueStrings.push(`(${placeholders.join(', ')})`);
      }

      await client.query(`
        INSERT INTO public.unit_coas (
          property_name, unit_code, pdc_in_hand_code, pdc_in_hand_name, deposit_code, deposit_name, receivables_code, receivables_name
        ) VALUES ${valueStrings.join(', ')}
        ON CONFLICT (unit_code) DO UPDATE SET
          property_name = EXCLUDED.property_name,
          pdc_in_hand_code = EXCLUDED.pdc_in_hand_code,
          pdc_in_hand_name = EXCLUDED.pdc_in_hand_name,
          deposit_code = EXCLUDED.deposit_code,
          deposit_name = EXCLUDED.deposit_name,
          receivables_code = EXCLUDED.receivables_code,
          receivables_name = EXCLUDED.receivables_name;
      `, queryParams);
    }

    console.log(`Bulk updating ${unitUpdatesBatch.length} matched units in DB...`);
    for (let i = 0; i < unitUpdatesBatch.length; i += chunkSize) {
      const chunk = unitUpdatesBatch.slice(i, i + chunkSize);
      const valueStrings = [];
      const queryParams = [];
      let paramIdx = 1;

      for (const row of chunk) {
        valueStrings.push(`($${paramIdx++}::uuid, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++})`);
        queryParams.push(row[0], row[1], row[2], row[3], row[4], row[5], row[6]);
      }

      await client.query(`
        UPDATE public.units AS u
        SET pdc_in_hand_code = v.pdc_code,
            pdc_in_hand_name = v.pdc_name,
            deposit_code = v.dep_code,
            deposit_name = v.dep_name,
            receivables_code = v.rec_code,
            receivables_name = v.rec_name
        FROM (VALUES ${valueStrings.join(', ')}) AS v(id, pdc_code, pdc_name, dep_code, dep_name, rec_code, rec_name)
        WHERE u.id = v.id;
      `, queryParams);
    }

    await client.query('COMMIT');
    console.log('Transaction committed successfully!');

    const totalCOA = await client.query(`SELECT COUNT(*) FROM public.erp_chart_of_accounts`);
    const totalUnitCOA = await client.query(`SELECT COUNT(*) FROM public.unit_coas`);
    const totalUnitsWithCOA = await client.query(`SELECT COUNT(*) FROM public.units WHERE pdc_in_hand_code IS NOT NULL`);

    console.log('\n================ FINAL COA SUMMARY ================');
    console.log(`Total Chart of Accounts (erp_chart_of_accounts): ${totalCOA.rows[0].count}`);
    console.log(`Total Unit COA Records (unit_coas): ${totalUnitCOA.rows[0].count}`);
    console.log(`Total Units Enriched with COA (units): ${totalUnitsWithCOA.rows[0].count}`);
    console.log('===================================================\n');

  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Error in lightning seeding:', error);
  } finally {
    await client.end();
  }
}

seedCOAMasterLightning();
