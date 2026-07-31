import pg from 'pg';

const connectionString = "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

const client = new pg.Client({
  connectionString,
});

async function run() {
  await client.connect();
  console.log("Connected to Supabase Postgres.");

  const sql = `
    CREATE TABLE IF NOT EXISTS role_permissions (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      role_name text NOT NULL,
      module_id text NOT NULL,
      has_access boolean DEFAULT false,
      tenant_id text,
      created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
      updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
      UNIQUE(role_name, module_id, tenant_id)
    );

    ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Allow authenticated read access" 
      ON role_permissions FOR SELECT 
      TO authenticated 
      USING (true);
      
    CREATE POLICY "Allow super_admin all access" 
      ON role_permissions FOR ALL 
      TO authenticated 
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'SUPER_ADMIN'
        )
      );

    -- Insert some defaults if needed, but the code falls back gracefully if missing.
  `;

  try {
    await client.query(sql);
    console.log("Created role_permissions table successfully.");
  } catch (e) {
    console.error("Error creating table:", e);
  } finally {
    await client.end();
  }
}

run();
