import xlsx from 'xlsx';
import { Client } from 'pg';
import path from 'path';

const connectionString = process.env.DATABASE_URL || "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

async function seedAllPDCsFromExcel() {
  const client = new Client({ connectionString });
  await client.connect();

  try {
    console.log('Connecting to PostgreSQL database...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.pdcs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        lease_id UUID,
        cheque_number TEXT,
        bank TEXT,
        deposit_date DATE,
        amount NUMERIC(18,2),
        status TEXT DEFAULT 'In Hand',
        created_at TIMESTAMPTZ DEFAULT now(),
        maturity_date DATE,
        unit_name TEXT,
        property_code TEXT,
        tenant_name TEXT,
        rent_from_date DATE,
        rent_to_date DATE,
        sl_no INTEGER,
        status_pdc TEXT DEFAULT 'In Hand'
      );
    `);

    const excelPath = path.resolve('../Real Estate - Master with Data.xlsx');
    console.log(`Reading Excel file: ${excelPath}`);
    const wb = xlsx.readFile(excelPath);

    if (!wb.SheetNames.includes('PDC in Hand New')) {
      throw new Error('Sheet "PDC in Hand New" not found in Excel file!');
    }

    const ws = wb.Sheets['PDC in Hand New'];
    const rows = xlsx.utils.sheet_to_json(ws);
    console.log(`Found ${rows.length} PDC rows in sheet "PDC in Hand New".`);

    await client.query('BEGIN');
    await client.query('DELETE FROM public.pdcs');

    const pdcEntries = [];

    for (const r of rows) {
      const slNo = parseInt(r['SL.No']) || null;
      const unitName = String(r['Unit Name'] || '').trim();
      const propCode = String(r['Property Code'] || '').trim();
      const tenantName = String(r['Tenant Name'] || '').trim();
      const chequeNo = String(r['Cheque Number'] || '').trim();
      const bank = String(r['Bank'] || '').trim();

      let maturityDate = null;
      if (r['Maturity Date']) {
        if (typeof r['Maturity Date'] === 'number') {
          const jsDate = xlsx.SSF.parse_date_code(r['Maturity Date']);
          if (jsDate) maturityDate = `${jsDate.y}-${String(jsDate.m).padStart(2, '0')}-${String(jsDate.d).padStart(2, '0')}`;
        } else {
          const str = String(r['Maturity Date']).trim();
          const parts = str.split('.');
          if (parts.length === 3) {
            maturityDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
          }
        }
      }

      let rentFromDate = null;
      if (r['Rent From Date']) {
        if (typeof r['Rent From Date'] === 'number') {
          const jsDate = xlsx.SSF.parse_date_code(r['Rent From Date']);
          if (jsDate) rentFromDate = `${jsDate.y}-${String(jsDate.m).padStart(2, '0')}-${String(jsDate.d).padStart(2, '0')}`;
        } else {
          const str = String(r['Rent From Date']).trim();
          const parts = str.split('.');
          if (parts.length === 3) rentFromDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }

      let rentToDate = null;
      if (r['Rent To Date']) {
        if (typeof r['Rent To Date'] === 'number') {
          const jsDate = xlsx.SSF.parse_date_code(r['Rent To Date']);
          if (jsDate) rentToDate = `${jsDate.y}-${String(jsDate.m).padStart(2, '0')}-${String(jsDate.d).padStart(2, '0')}`;
        } else {
          const str = String(r['Rent To Date']).trim();
          const parts = str.split('.');
          if (parts.length === 3) rentToDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }

      const amountRaw = r[' Amount '] || r['Amount'] || 0;
      const amount = parseFloat(amountRaw) || 0;

      if (!chequeNo && !unitName && !tenantName) continue;

      pdcEntries.push([
        slNo, unitName, propCode, tenantName, chequeNo, bank, maturityDate, amount, rentFromDate, rentToDate, 'In Hand', 'In Hand'
      ]);
    }

    console.log(`Inserting ${pdcEntries.length} PDCs in bulk...`);
    const chunkSize = 100;
    for (let i = 0; i < pdcEntries.length; i += chunkSize) {
      const chunk = pdcEntries.slice(i, i + chunkSize);
      const valueStrings = [];
      const queryParams = [];
      let paramIdx = 1;

      for (const row of chunk) {
        const placeholders = [];
        for (let j = 0; j < 12; j++) {
          placeholders.push(`$${paramIdx++}`);
          queryParams.push(row[j]);
        }
        valueStrings.push(`(${placeholders.join(', ')})`);
      }

      await client.query(`
        INSERT INTO public.pdcs (
          sl_no, unit_name, property_code, tenant_name, cheque_number, bank, maturity_date, amount, rent_from_date, rent_to_date, status, status_pdc
        ) VALUES ${valueStrings.join(', ')}
      `, queryParams);
    }

    await client.query('COMMIT');
    console.log('Transaction committed successfully.');

    const totalPDCs = await client.query(`SELECT COUNT(*) FROM public.pdcs`);
    console.log(`\n================ PDC SEED SUMMARY ================`);
    console.log(`Total PDCs in DB: ${totalPDCs.rows[0].count}`);
    console.log(`==================================================\n`);

  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Error seeding PDCs:', error);
  } finally {
    await client.end();
  }
}

seedAllPDCsFromExcel();
