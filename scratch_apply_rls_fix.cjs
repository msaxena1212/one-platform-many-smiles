const { Client } = require('pg');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf-8');
let dbUrl = '';
envFile.split('\n').forEach(line => {
  if (line.startsWith('DATABASE_URL=')) dbUrl = line.split('=')[1].trim().replace(/"/g, '');
});

if (!dbUrl) {
  console.error('DATABASE_URL not found in .env.local');
  process.exit(1);
}

const client = new Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

const FIX_RLS_SQL = `
-- ==========================================================
-- 1. Ensure RLS is properly configured on units table
-- ==========================================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'units') THEN
    ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'employees') THEN
    ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop all existing restrictive policies on units
DROP POLICY IF EXISTS "Public units are viewable by all" ON public.units;
DROP POLICY IF EXISTS "Authenticated users can manage units" ON public.units;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.units;
DROP POLICY IF EXISTS "Allow all operations for anon and authenticated" ON public.units;
DROP POLICY IF EXISTS "Staff can manage units" ON public.units;
DROP POLICY IF EXISTS "Anyone can insert units" ON public.units;
DROP POLICY IF EXISTS "Anyone can update units" ON public.units;
DROP POLICY IF EXISTS "Anyone can delete units" ON public.units;
DROP POLICY IF EXISTS "Public units" ON public.units;

-- Create full permissive policies for units
CREATE POLICY "Public units are viewable by all"
ON public.units FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow all operations for anon and authenticated"
ON public.units FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- ==========================================================
-- 2. Ensure RLS is properly configured on employees table
-- ==========================================================
DROP POLICY IF EXISTS "Public employees are viewable by all" ON public.employees;
DROP POLICY IF EXISTS "Authenticated users can manage employees" ON public.employees;
DROP POLICY IF EXISTS "Allow all operations for anon and authenticated on employees" ON public.employees;
DROP POLICY IF EXISTS "Staff can manage employees" ON public.employees;
DROP POLICY IF EXISTS "Anyone can insert employees" ON public.employees;
DROP POLICY IF EXISTS "Anyone can update employees" ON public.employees;
DROP POLICY IF EXISTS "Anyone can delete employees" ON public.employees;
DROP POLICY IF EXISTS "Public employees" ON public.employees;

CREATE POLICY "Public employees are viewable by all"
ON public.employees FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow all operations for anon and authenticated on employees"
ON public.employees FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Grant full table permissions to anon and authenticated roles
GRANT ALL ON public.units TO anon, authenticated, service_role;
GRANT ALL ON public.employees TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
`;

async function run() {
  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL database.');
    await client.query(FIX_RLS_SQL);
    console.log('Successfully applied RLS policies and table grants for units and employees!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

run();
