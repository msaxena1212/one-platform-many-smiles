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

const DROP_RESTRICTIVE_POLICIES_SQL = `
-- Drop any conflicting restrictive policies on employees
DROP POLICY IF EXISTS "Employees modifiable by HR/Admins" ON public.employees;
DROP POLICY IF EXISTS "Employees viewable by all authenticated users" ON public.employees;
DROP POLICY IF EXISTS "Staff can manage employees" ON public.employees;
DROP POLICY IF EXISTS "Public employees are viewable by all" ON public.employees;
DROP POLICY IF EXISTS "Allow all operations for anon and authenticated on employees" ON public.employees;

-- Drop any conflicting restrictive policies on units
DROP POLICY IF EXISTS "Units modifiable by staff" ON public.units;
DROP POLICY IF EXISTS "Staff can manage units" ON public.units;
DROP POLICY IF EXISTS "Public units are viewable by all" ON public.units;
DROP POLICY IF EXISTS "Allow all operations for anon and authenticated" ON public.units;

-- Ensure clean, working permissive policies
CREATE POLICY "Public employees are viewable by all"
ON public.employees FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow all operations for anon and authenticated on employees"
ON public.employees FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Public units are viewable by all"
ON public.units FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow all operations for anon and authenticated"
ON public.units FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);
`;

async function run() {
  try {
    await client.connect();
    await client.query(DROP_RESTRICTIVE_POLICIES_SQL);
    console.log('Successfully dropped old restrictive policies and refreshed clean RLS policies!');
    const polRes = await client.query("SELECT tablename, policyname, roles, cmd, qual, with_check FROM pg_policies WHERE tablename IN ('units', 'employees')");
    console.log('Current Active Policies:', JSON.stringify(polRes.rows, null, 2));
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await client.end();
  }
}
run();
