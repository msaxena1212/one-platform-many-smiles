import xlsx from 'xlsx';
import { Client } from 'pg';

const connectionString = "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

async function verifyMapping() {
  const wb = xlsx.readFile('../COA-For New Co (1).xlsx');
  const ws = wb.Sheets['Unit Ac Codes'];
  const excelRows = xlsx.utils.sheet_to_json(ws);

  console.log('Excel Unit Ac Codes row count:', excelRows.length);
  console.log('Sample row keys:', Object.keys(excelRows[0]));

  const client = new Client({ connectionString });
  await client.connect();

  const dbUnits = await client.query(`SELECT id, unit_name, unit_code, unit_ref FROM public.units`);
  console.log('DB units count:', dbUnits.rows.length);

  let matchCount = 0;
  for (const row of excelRows) {
    const propName = row['Property Name'];
    const unitCode = row['Unit Code'];
    // try to match with DB units
    const found = dbUnits.rows.find(u => 
      u.unit_name === unitCode || 
      u.unit_code === unitCode || 
      u.unit_ref === unitCode ||
      u.unit_name === `${propName} - ${unitCode}`
    );
    if (found) matchCount++;
  }

  console.log('Matched DB units count:', matchCount, '/', excelRows.length);

  await client.end();
}

verifyMapping().catch(console.error);
