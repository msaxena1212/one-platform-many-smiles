const { Client } = require('pg');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf-8');
let dbUrl = '';
envFile.split('\n').forEach(line => {
  if (line.startsWith('DATABASE_URL=')) dbUrl = line.split('=')[1].trim().replace(/"/g, '');
});

const client = new Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

async function inspect() {
  try {
    await client.connect();
    const empRes = await client.query("SELECT count(*), json_agg(json_build_object('code', employee_id_code, 'name', first_name || ' ' || coalesce(last_name, ''))) FROM employees");
    console.log('Employees in DB count:', empRes.rows[0].count);
    console.log('Employees sample:', JSON.stringify(empRes.rows[0].json_agg?.slice(0, 5), null, 2));

    const polRes = await client.query("SELECT tablename, policyname, roles, cmd, qual, with_check FROM pg_policies WHERE tablename IN ('units', 'employees')");
    console.log('Policies on units and employees:', JSON.stringify(polRes.rows, null, 2));
  } catch (e) {
    console.error('Error inspecting:', e);
  } finally {
    await client.end();
  }
}
inspect();
