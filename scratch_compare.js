import xlsx from 'xlsx';
import { Client } from 'pg';

const connectionString = "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

async function checkSampleComparison() {
  const wb = xlsx.readFile('../COA-For New Co (1).xlsx');
  const ws = wb.Sheets['Unit Ac Codes'];
  const excelRows = xlsx.utils.sheet_to_json(ws);

  console.log('Excel first 5 rows:');
  excelRows.slice(0, 5).forEach(r => console.log(r['Property Name'], '|||', r['Unit Code']));

  const client = new Client({ connectionString });
  await client.connect();

  const dbUnits = await client.query(`SELECT id, unit_name, unit_code, unit_ref, property_id FROM public.units LIMIT 10`);
  console.log('\nDB first 10 rows:');
  console.log(dbUnits.rows);

  const dbProps = await client.query(`SELECT id, name, property_code FROM public.properties LIMIT 10`);
  console.log('\nDB properties first 10 rows:');
  console.log(dbProps.rows);

  await client.end();
}

checkSampleComparison().catch(console.error);
