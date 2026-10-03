import pg from 'pg';
import * as XLSX from 'xlsx';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const xlsx = XLSX.default || XLSX;
const filePath = 'e:/Port/Property Management System/Documents/New Documents/COA to Simerjith 28092026.xlsx';
const buffer = fs.readFileSync(filePath);
const wb = xlsx.read(buffer, { type: 'buffer' });

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const normalBalanceMap = {
  '1': 'Debit',
  '2': 'Credit',
  '3': 'Credit',
  '4': 'Credit',
  '5': 'Debit'
};

const reportTypeMap = {
  '1': 'Balance Sheet',
  '2': 'Balance Sheet',
  '3': 'Balance Sheet',
  '4': 'Profit & Loss',
  '5': 'Profit & Loss'
};

const finAccountTypeMap = {
  '1': 'ASSET',
  '2': 'LIABILITY',
  '3': 'EQUITY',
  '4': 'REVENUE',
  '5': 'EXPENSE'
};

async function batchInsert(client, tableName, columns, rows, batchSize = 200, onConflictClause = '') {
  if (!rows || rows.length === 0) return [];
  const results = [];
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const valuePlaceholders = [];
    const flatValues = [];
    let paramIdx = 1;

    for (const row of batch) {
      const rowPlaceholders = [];
      for (const col of columns) {
        rowPlaceholders.push(`$${paramIdx++}`);
        flatValues.push(row[col]);
      }
      valuePlaceholders.push(`(${rowPlaceholders.join(', ')})`);
    }

    const query = `
      INSERT INTO public.${tableName} (${columns.join(', ')})
      VALUES ${valuePlaceholders.join(', ')}
      ${onConflictClause}
      RETURNING id, code;
    `;
    const res = await client.query(query, flatValues);
    results.push(...res.rows);
  }
  return results;
}

async function batchInsertGeneric(client, tableName, columns, rows, batchSize = 200, onConflictClause = '') {
  if (!rows || rows.length === 0) return [];
  const results = [];
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const valuePlaceholders = [];
    const flatValues = [];
    let paramIdx = 1;

    for (const row of batch) {
      const rowPlaceholders = [];
      for (const col of columns) {
        rowPlaceholders.push(`$${paramIdx++}`);
        flatValues.push(row[col]);
      }
      valuePlaceholders.push(`(${rowPlaceholders.join(', ')})`);
    }

    const query = `
      INSERT INTO public.${tableName} (${columns.join(', ')})
      VALUES ${valuePlaceholders.join(', ')}
      ${onConflictClause};
    `;
    const res = await client.query(query, flatValues);
  }
}

async function importCOA() {
  const client = await pool.connect();
  try {
    console.log('Starting full robust batch COA import...');
    
    // 1. Prepare maps from Master Sheets
    const masterSheets = [
      { name: 'Assets-New', typeCode: '1', typeName: 'Assets' },
      { name: 'Liabilities-New', typeCode: '2', typeName: 'Liabilities' },
      { name: 'Capital-New', typeCode: '3', typeName: 'Capital' },
      { name: 'Revenue-New', typeCode: '4', typeName: 'Revenue' },
      { name: 'Expenses-New', typeCode: '5', typeName: 'Expenditure' }
    ];

    const typeMap = new Map();
    const groupMap = new Map();
    const classMap = new Map();
    const glMap = new Map();
    const slMap = new Map();

    for (const s of masterSheets) {
      typeMap.set(s.typeCode, {
        code: s.typeCode,
        name: s.typeName,
        normal_balance: normalBalanceMap[s.typeCode],
        report_type: reportTypeMap[s.typeCode]
      });

      const sheet = wb.Sheets[s.name];
      const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });
      const headers = rows[0].map(h => String(h).trim().toUpperCase());

      const groupIdx = headers.indexOf('GROUP');
      const groupNameIdx = headers.indexOf('GROUP NAME');
      const classIdx = headers.indexOf('CLASS');
      const classNameIdx = headers.indexOf('CLASS NAME');
      const glIdx = headers.indexOf('GL');
      const glNameIdx = headers.indexOf('GL NAME');
      const slIdx = headers.indexOf('SL');
      const slNameIdx = headers.indexOf('SL NAME');

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

        if (currentGroup) groupMap.set(currentGroup, { code: currentGroup, name: currentGroupName, type_code: s.typeCode });
        if (currentClass) classMap.set(currentClass, { code: currentClass, name: currentClassName, group_code: currentGroup, type_code: s.typeCode });
        if (currentGl) glMap.set(currentGl, { code: currentGl, name: currentGlName, class_code: currentClass, group_code: currentGroup, type_code: s.typeCode });
        if (rawSl) {
          slMap.set(rawSl, {
            code: rawSl,
            name: rawSlName,
            gl_code: currentGl,
            class_code: currentClass,
            group_code: currentGroup,
            type_code: s.typeCode
          });
        }
      }
    }

    // Process Unit Ac Codes
    const unitSheet = wb.Sheets['Unit Ac Codes'];
    const unitRows = xlsx.utils.sheet_to_json(unitSheet, { header: 1, defval: '' });
    for (let i = 1; i < unitRows.length; i++) {
      const row = unitRows[i];
      if (!row.some(c => c !== '')) continue;
      const pdcCode = String(row[2] || '').trim();
      const pdcName = String(row[3] || '').trim();
      const depCode = String(row[4] || '').trim();
      const depName = String(row[5] || '').trim();
      const recCode = String(row[6] || '').trim();
      const recName = String(row[7] || '').trim();

      if (pdcCode && !slMap.has(pdcCode)) {
        slMap.set(pdcCode, { code: pdcCode, name: pdcName, gl_code: '21400', class_code: '214', group_code: '21', type_code: '2' });
      }
      if (depCode && !slMap.has(depCode)) {
        slMap.set(depCode, { code: depCode, name: depName, gl_code: '21500', class_code: '215', group_code: '21', type_code: '2' });
      }
      if (recCode && !slMap.has(recCode)) {
        slMap.set(recCode, { code: recCode, name: recName, gl_code: '12413', class_code: '124', group_code: '12', type_code: '1' });
      }
    }

    // Process Tenants-Unit Acs
    const tenantSheet = wb.Sheets['Tenants-Unit Acs'];
    const tenantRows = xlsx.utils.sheet_to_json(tenantSheet, { header: 1, defval: '' });
    for (let i = 1; i < tenantRows.length; i++) {
      const row = tenantRows[i];
      if (!row.some(c => c !== '')) continue;
      const recCode = String(row[8] || '').trim();
      const recName = String(row[9] || '').trim();
      const pdcCode = String(row[10] || '').trim();
      const pdcName = String(row[11] || '').trim();
      const depCode = String(row[12] || '').trim();
      const depName = String(row[13] || '').trim();

      if (recCode && !slMap.has(recCode)) {
        slMap.set(recCode, { code: recCode, name: recName, gl_code: '12413', class_code: '124', group_code: '12', type_code: '1' });
      }
      if (pdcCode && !slMap.has(pdcCode)) {
        slMap.set(pdcCode, { code: pdcCode, name: pdcName, gl_code: '21400', class_code: '214', group_code: '21', type_code: '2' });
      }
      if (depCode && !slMap.has(depCode)) {
        slMap.set(depCode, { code: depCode, name: depName, gl_code: '21500', class_code: '215', group_code: '21', type_code: '2' });
      }
    }

    // 2. Insert coa_types
    console.log(`Inserting ${typeMap.size} coa_types...`);
    const typeIdMap = new Map();
    for (const t of typeMap.values()) {
      const res = await client.query(`
        INSERT INTO public.coa_types (code, name, normal_balance, report_type)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (code) DO UPDATE 
        SET name = EXCLUDED.name, normal_balance = EXCLUDED.normal_balance, report_type = EXCLUDED.report_type, updated_at = NOW()
        RETURNING id, code;
      `, [t.code, t.name, t.normal_balance, t.report_type]);
      typeIdMap.set(res.rows[0].code, res.rows[0].id);
    }

    // 3. Insert coa_groups
    console.log(`Inserting ${groupMap.size} coa_groups...`);
    const groupIdMap = new Map();
    for (const g of groupMap.values()) {
      const typeId = typeIdMap.get(g.type_code);
      const res = await client.query(`
        INSERT INTO public.coa_groups (type_id, type_code, code, name)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (code) DO UPDATE 
        SET name = EXCLUDED.name, type_id = EXCLUDED.type_id, type_code = EXCLUDED.type_code, updated_at = NOW()
        RETURNING id, code;
      `, [typeId, g.type_code, g.code, g.name]);
      groupIdMap.set(res.rows[0].code, res.rows[0].id);
    }

    // 4. Insert coa_classes
    console.log(`Inserting ${classMap.size} coa_classes...`);
    const classIdMap = new Map();
    for (const c of classMap.values()) {
      const typeId = typeIdMap.get(c.type_code);
      const groupId = groupIdMap.get(c.group_code);
      const res = await client.query(`
        INSERT INTO public.coa_classes (group_id, type_id, group_code, type_code, code, name)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (code) DO UPDATE 
        SET name = EXCLUDED.name, group_id = EXCLUDED.group_id, type_id = EXCLUDED.type_id, updated_at = NOW()
        RETURNING id, code;
      `, [groupId, typeId, c.group_code, c.type_code, c.code, c.name]);
      classIdMap.set(res.rows[0].code, res.rows[0].id);
    }

    // 5. Insert coa_gl
    console.log(`Inserting ${glMap.size} coa_gl accounts...`);
    const glIdMap = new Map();
    for (const gl of glMap.values()) {
      const typeId = typeIdMap.get(gl.type_code);
      const groupId = groupIdMap.get(gl.group_code);
      const classId = classIdMap.get(gl.class_code);
      const normalBalance = normalBalanceMap[gl.type_code] || 'Debit';

      const requiresProp = ['11000', '41100', '41101', '41201', '51001', '51002', '51003', '51004', '51106'].includes(gl.code);
      const requiresUnit = ['12413', '21400', '21500'].includes(gl.code);
      const requiresTenant = ['12410', '12411', '12413', '21100', '21200', '21400', '21500'].includes(gl.code);
      const requiresVendor = ['21000'].includes(gl.code);
      const requiresEmployee = ['12412', '22001', '22002', '22003'].includes(gl.code);

      const res = await client.query(`
        INSERT INTO public.coa_gl (
          class_id, group_id, type_id, class_code, group_code, type_code, code, name, normal_balance,
          requires_property, requires_unit, requires_tenant, requires_vendor, requires_employee
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (code) DO UPDATE 
        SET name = EXCLUDED.name, class_id = EXCLUDED.class_id, group_id = EXCLUDED.group_id, type_id = EXCLUDED.type_id,
            requires_property = EXCLUDED.requires_property, requires_unit = EXCLUDED.requires_unit,
            requires_tenant = EXCLUDED.requires_tenant, requires_vendor = EXCLUDED.requires_vendor,
            requires_employee = EXCLUDED.requires_employee, updated_at = NOW()
        RETURNING id, code;
      `, [classId, groupId, typeId, gl.class_code, gl.group_code, gl.type_code, gl.code, gl.name, normalBalance,
          requiresProp, requiresUnit, requiresTenant, requiresVendor, requiresEmployee]);
      glIdMap.set(res.rows[0].code, res.rows[0].id);
    }

    // 6. Batch Insert coa_sl (6502 rows)
    console.log(`Batch inserting ${slMap.size} coa_sl accounts in chunks of 200...`);
    const slRows = [];
    for (const sl of slMap.values()) {
      const typeId = typeIdMap.get(sl.type_code);
      const groupId = groupIdMap.get(sl.group_code);
      const classId = classIdMap.get(sl.class_code);
      const glId = glIdMap.get(sl.gl_code);
      const normalBalance = normalBalanceMap[sl.type_code] || 'Debit';

      if (!glId) continue;
      slRows.push({
        gl_id: glId,
        class_id: classId,
        group_id: groupId,
        type_id: typeId,
        gl_code: sl.gl_code,
        class_code: sl.class_code,
        group_code: sl.group_code,
        type_code: sl.type_code,
        code: sl.code,
        name: sl.name,
        normal_balance: normalBalance
      });
    }

    const slColumns = ['gl_id', 'class_id', 'group_id', 'type_id', 'gl_code', 'class_code', 'group_code', 'type_code', 'code', 'name', 'normal_balance'];
    const insertedSls = await batchInsert(
      client,
      'coa_sl',
      slColumns,
      slRows,
      200,
      `ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, gl_id = EXCLUDED.gl_id, class_id = EXCLUDED.class_id, group_id = EXCLUDED.group_id, type_id = EXCLUDED.type_id, updated_at = NOW()`
    );
    const slIdMap = new Map(insertedSls.map(r => [r.code, r.id]));
    console.log(`Successfully batch inserted ${insertedSls.length} coa_sl records.`);

    // 7. Batch Synchronize erp_chart_of_accounts: ROOT GLs first, then SLs
    console.log('Batch synchronizing erp_chart_of_accounts (GLs first, then SLs)...');
    const erpGlRows = [];
    for (const gl of glMap.values()) {
      const typeObj = typeMap.get(gl.type_code);
      const groupObj = groupMap.get(gl.group_code);
      const classObj = classMap.get(gl.class_code);
      erpGlRows.push({
        code: gl.code,
        name: gl.name,
        type: typeObj?.name || 'Assets',
        type_code: gl.type_code,
        type_name: typeObj?.name || 'Assets',
        group_code: gl.group_code,
        group_name: groupObj?.name || '',
        class_code: gl.class_code,
        class_name: classObj?.name || '',
        gl_code: gl.code,
        gl_name: gl.name,
        sl_code: gl.code,
        sl_name: gl.name
      });
    }

    const erpColumns = ['code', 'name', 'type', 'type_code', 'type_name', 'group_code', 'group_name', 'class_code', 'class_name', 'gl_code', 'gl_name', 'sl_code', 'sl_name'];
    await batchInsert(
      client,
      'erp_chart_of_accounts',
      erpColumns,
      erpGlRows,
      200,
      `ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, type_code = EXCLUDED.type_code, type_name = EXCLUDED.type_name, group_code = EXCLUDED.group_code, group_name = EXCLUDED.group_name, class_code = EXCLUDED.class_code, class_name = EXCLUDED.class_name, gl_code = EXCLUDED.gl_code, gl_name = EXCLUDED.gl_name, sl_code = EXCLUDED.sl_code, sl_name = EXCLUDED.sl_name`
    );

    const erpSlRows = [];
    for (const sl of slMap.values()) {
      const typeObj = typeMap.get(sl.type_code);
      const groupObj = groupMap.get(sl.group_code);
      const classObj = classMap.get(sl.class_code);
      const glObj = glMap.get(sl.gl_code);

      erpSlRows.push({
        code: sl.code,
        name: sl.name,
        type: typeObj?.name || 'Assets',
        type_code: sl.type_code,
        type_name: typeObj?.name || 'Assets',
        group_code: sl.group_code,
        group_name: groupObj?.name || '',
        class_code: sl.class_code,
        class_name: classObj?.name || '',
        gl_code: sl.gl_code,
        gl_name: glObj?.name || '',
        sl_code: sl.code,
        sl_name: sl.name
      });
    }

    await batchInsert(
      client,
      'erp_chart_of_accounts',
      erpColumns,
      erpSlRows,
      200,
      `ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, type_code = EXCLUDED.type_code, type_name = EXCLUDED.type_name, group_code = EXCLUDED.group_code, group_name = EXCLUDED.group_name, class_code = EXCLUDED.class_code, class_name = EXCLUDED.class_name, gl_code = EXCLUDED.gl_code, gl_name = EXCLUDED.gl_name, sl_code = EXCLUDED.sl_code, sl_name = EXCLUDED.sl_name`
    );
    console.log(`Successfully synchronized erp_chart_of_accounts with ${erpGlRows.length + erpSlRows.length} accounts.`);

    // 8. Batch Synchronize fin_coa_accounts: Using valid account_type enum (ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE)
    console.log('Batch synchronizing fin_coa_accounts...');
    for (const gl of glMap.values()) {
      const finType = finAccountTypeMap[gl.type_code] || 'ASSET';
      const groupObj = groupMap.get(gl.group_code);
      const classObj = classMap.get(gl.class_code);

      await client.query(`
        INSERT INTO public.fin_coa_accounts (
          account_code, account_name, account_type, group_name, class_name, account_level, is_active
        )
        VALUES ($1, $2, $3, $4, $5, 'GL', true)
        ON CONFLICT (account_code) DO UPDATE
        SET account_name = EXCLUDED.account_name, account_type = EXCLUDED.account_type,
            group_name = EXCLUDED.group_name, class_name = EXCLUDED.class_name;
      `, [gl.code, gl.name, finType, groupObj?.name || '', classObj?.name || '']);
    }

    const glFinMap = new Map((await client.query(`SELECT id, account_code FROM public.fin_coa_accounts WHERE account_level = 'GL'`)).rows.map(r => [r.account_code, r.id]));

    const finSlRows = [];
    for (const sl of slMap.values()) {
      const finType = finAccountTypeMap[sl.type_code] || 'ASSET';
      const groupObj = groupMap.get(sl.group_code);
      const classObj = classMap.get(sl.class_code);
      const parentId = glFinMap.get(sl.gl_code) || null;

      finSlRows.push({
        account_code: sl.code,
        account_name: sl.name,
        account_type: finType,
        group_name: groupObj?.name || '',
        class_name: classObj?.name || '',
        account_level: 'SL',
        parent_account_id: parentId,
        is_active: true
      });
    }

    const finColumns = ['account_code', 'account_name', 'account_type', 'group_name', 'class_name', 'account_level', 'parent_account_id', 'is_active'];
    await batchInsertGeneric(
      client,
      'fin_coa_accounts',
      finColumns,
      finSlRows,
      200,
      `ON CONFLICT (account_code) DO UPDATE SET account_name = EXCLUDED.account_name, account_type = EXCLUDED.account_type, group_name = EXCLUDED.group_name, class_name = EXCLUDED.class_name, parent_account_id = EXCLUDED.parent_account_id`
    );
    console.log(`Successfully synchronized fin_coa_accounts with ${finSlRows.length} SL accounts.`);

    // 9. Map Units to unit_coa_mapping and unit_coas
    console.log('Mapping Unit Account Codes...');
    const dbUnits = await client.query(`SELECT id, unit_code, property_id FROM public.units`);
    const unitByCode = new Map(dbUnits.rows.map(u => [u.unit_code.toUpperCase(), u]));

    const dbProperties = await client.query(`SELECT id, title, property_code FROM public.properties`);
    const propByName = new Map(dbProperties.rows.map(p => [p.title.toLowerCase().trim(), p]));

    const unitCoasRows = [];
    const unitMappingRows = [];
    let mappedUnitsCount = 0;

    for (let i = 1; i < unitRows.length; i++) {
      const row = unitRows[i];
      if (!row.some(c => c !== '')) continue;
      const propName = String(row[0] || '').trim();
      const unitCode = String(row[1] || '').trim();
      const pdcCode = String(row[2] || '').trim();
      const pdcName = String(row[3] || '').trim();
      const depCode = String(row[4] || '').trim();
      const depName = String(row[5] || '').trim();
      const recCode = String(row[6] || '').trim();
      const recName = String(row[7] || '').trim();

      const matchedUnit = unitByCode.get(unitCode.toUpperCase());
      const matchedProp = propByName.get(propName.toLowerCase());

      const unitId = matchedUnit?.id || null;
      const propId = matchedUnit?.property_id || matchedProp?.id || null;

      unitCoasRows.push({
        property_name: propName,
        unit_code: unitCode,
        pdc_in_hand_code: pdcCode,
        pdc_in_hand_name: pdcName,
        deposit_code: depCode,
        deposit_name: depName,
        receivables_code: recCode,
        receivables_name: recName
      });

      if (unitId) {
        const pdcSlId = slIdMap.get(pdcCode) || null;
        const depSlId = slIdMap.get(depCode) || null;
        const recSlId = slIdMap.get(recCode) || null;

        unitMappingRows.push({
          unit_id: unitId,
          property_id: propId,
          unit_code: unitCode,
          property_name: propName,
          receivable_sl_id: recSlId,
          receivable_sl_code: recCode,
          receivable_sl_name: recName,
          pdc_sl_id: pdcSlId,
          pdc_sl_code: pdcCode,
          pdc_sl_name: pdcName,
          deposit_sl_id: depSlId,
          deposit_sl_code: depCode,
          deposit_sl_name: depName,
          status: 'Active'
        });

        // Update units table
        await client.query(`
          UPDATE public.units
          SET pdc_in_hand_code = $1, pdc_in_hand_name = $2,
              deposit_code = $3, deposit_name = $4,
              receivables_code = $5, receivables_name = $6
          WHERE id = $7;
        `, [pdcCode, pdcName, depCode, depName, recCode, recName, unitId]);

        mappedUnitsCount++;
      }
    }

    // Clean and insert unit_coas
    await client.query(`TRUNCATE TABLE public.unit_coas;`);
    const unitCoasColumns = ['property_name', 'unit_code', 'pdc_in_hand_code', 'pdc_in_hand_name', 'deposit_code', 'deposit_name', 'receivables_code', 'receivables_name'];
    await batchInsertGeneric(client, 'unit_coas', unitCoasColumns, unitCoasRows, 200, '');

    // Insert unit_coa_mapping
    const unitMappingColumns = [
      'unit_id', 'property_id', 'unit_code', 'property_name',
      'receivable_sl_id', 'receivable_sl_code', 'receivable_sl_name',
      'pdc_sl_id', 'pdc_sl_code', 'pdc_sl_name',
      'deposit_sl_id', 'deposit_sl_code', 'deposit_sl_name', 'status'
    ];
    await batchInsertGeneric(
      client,
      'unit_coa_mapping',
      unitMappingColumns,
      unitMappingRows,
      200,
      `ON CONFLICT (unit_id) DO UPDATE SET property_id = EXCLUDED.property_id, property_name = EXCLUDED.property_name, receivable_sl_id = EXCLUDED.receivable_sl_id, receivable_sl_code = EXCLUDED.receivable_sl_code, receivable_sl_name = EXCLUDED.receivable_sl_name, pdc_sl_id = EXCLUDED.pdc_sl_id, pdc_sl_code = EXCLUDED.pdc_sl_code, pdc_sl_name = EXCLUDED.pdc_sl_name, deposit_sl_id = EXCLUDED.deposit_sl_id, deposit_sl_code = EXCLUDED.deposit_sl_code, deposit_sl_name = EXCLUDED.deposit_sl_name, updated_at = NOW()`
    );
    console.log(`Successfully mapped ${mappedUnitsCount} units to COA sub-ledgers.`);

    // 10. Map Properties
    console.log('Mapping Property default COA...');
    for (const prop of dbProperties.rows) {
      await client.query(`
        INSERT INTO public.property_coa_mapping (
          property_id, property_code, property_name
        )
        VALUES ($1, $2, $3)
        ON CONFLICT (property_id) DO UPDATE
        SET property_code = EXCLUDED.property_code, property_name = EXCLUDED.property_name, updated_at = NOW();
      `, [prop.id, prop.property_code, prop.title]);
    }

    // 11. Transaction Account Rules
    console.log('Seeding transaction account rules...');
    const defaultRules = [
      { type: 'RENT_INVOICE', pm: null, dt: null, pt: null, dGl: '12413', dSl: null, cGl: '41100', cSl: '41100001', desc: 'Rental Billing Invoice' },
      { type: 'RENT_RECEIPT', pm: 'BANK', dt: null, pt: null, dGl: '12000', dSl: '12000001', cGl: '12413', cSl: null, desc: 'Rent Receipt via Bank Transfer' },
      { type: 'RENT_RECEIPT', pm: 'CASH', dt: null, pt: null, dGl: '12000', dSl: '12000001', cGl: '12413', cSl: null, desc: 'Rent Receipt via Cash' },
      { type: 'PDC_COLLECTION', pm: 'PDC', dt: null, pt: 'RENT_PDC', dGl: '12900', dSl: '12900001', cGl: '21400', cSl: null, desc: 'PDC Cheque Received for Rent' },
      { type: 'PDC_DEPOSIT_BANK', pm: 'PDC', dt: null, pt: 'RENT_PDC', dGl: '12000', dSl: '12000001', cGl: '12900', cSl: '12900001', desc: 'PDC Cheque Deposited to Bank' },
      { type: 'PDC_RETURN', pm: 'PDC', dt: null, pt: 'RENT_PDC', dGl: '12900', dSl: '12900001', cGl: '12000', cSl: '12000001', desc: 'PDC Returned / Bounced' },
      { type: 'SECURITY_DEPOSIT_RECEIPT', pm: 'BANK', dt: 'SECURITY', pt: null, dGl: '12000', dSl: '12000001', cGl: '21500', cSl: null, desc: 'Security Deposit Received via Bank' },
      { type: 'SECURITY_DEPOSIT_RECEIPT', pm: 'CASH', dt: 'SECURITY', pt: null, dGl: '12000', dSl: '12000001', cGl: '21500', cSl: null, desc: 'Security Deposit Received via Cash' },
      { type: 'DEPOSIT_REFUND', pm: 'BANK', dt: 'SECURITY', pt: null, dGl: '21500', dSl: null, cGl: '12000', cSl: '12000001', desc: 'Security Deposit Refunded to Tenant' },
      { type: 'DAMAGE_CHARGE', pm: null, dt: null, pt: null, dGl: '12413', dSl: null, cGl: '41201', cSl: '41201003', desc: 'Damage Charge billed to tenant' },
      { type: 'PENALTY_CHARGE', pm: null, dt: null, pt: null, dGl: '12413', dSl: null, cGl: '41201', cGl_name: 'Other Income', cSl: '41201002', desc: 'Penalty Charge billed to tenant' },
      { type: 'VENDOR_INVOICE', pm: null, dt: null, pt: null, dGl: '51004', dSl: '51004001', cGl: '21000', cSl: '21000001', desc: 'Vendor Direct Expense Invoice' },
      { type: 'VENDOR_PAYMENT', pm: 'BANK', dt: null, pt: null, dGl: '21000', dSl: '21000001', cGl: '12000', cSl: '12000001', desc: 'Vendor Invoice Payment via Bank' },
      { type: 'ASSET_DEPRECIATION', pm: null, dt: null, pt: null, dGl: '51106', dSl: '51106001', cGl: '11000', cSl: '11000001', desc: 'Fixed Asset Monthly Depreciation' }
    ];

    for (const r of defaultRules) {
      await client.query(`
        INSERT INTO public.fin_transaction_account_rules (
          transaction_type, payment_method, deposit_type, pdc_type,
          debit_gl_code, debit_sl_code, credit_gl_code, credit_sl_code,
          description, is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
        ON CONFLICT DO NOTHING;
      `, [r.type, r.pm, r.dt, r.pt, r.dGl, r.dSl, r.cGl, r.cSl, r.desc]);
    }

    console.log('\n=============================================');
    console.log('BATCH COA IMPORT COMPLETED SUCCESSFULLY!');
    console.log(`- Types: ${typeMap.size}`);
    console.log(`- Groups: ${groupMap.size}`);
    console.log(`- Classes: ${classMap.size}`);
    console.log(`- GLs: ${glMap.size}`);
    console.log(`- SLs: ${slMap.size}`);
    console.log(`- ERP COA records: ${erpGlRows.length + erpSlRows.length}`);
    console.log(`- Fin COA records: ${finSlRows.length + glMap.size}`);
    console.log(`- Mapped Units: ${mappedUnitsCount} of ${dbUnits.rows.length}`);
    console.log(`- Mapped Properties: ${dbProperties.rows.length}`);
    console.log('=============================================\n');

  } catch (err) {
    console.error('Import Error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

importCOA();
