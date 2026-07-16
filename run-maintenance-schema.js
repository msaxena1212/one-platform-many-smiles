import { Client } from 'pg';

async function runMaintenanceSchema() {
  const connectionString = "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    
    const sql = `
CREATE TABLE IF NOT EXISTS maintenance_tickets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  unit_ref    TEXT,
  title       TEXT NOT NULL,
  description TEXT,
  category    TEXT NOT NULL DEFAULT 'general',
  priority    TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  status      TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','assigned','in_progress','resolved','closed')),
  assignee    TEXT,
  host_id     UUID,
  reported_by TEXT,
  resolved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE maintenance_tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_all" ON maintenance_tickets;
CREATE POLICY "public_all" ON maintenance_tickets FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE receipts ADD CONSTRAINT receipts_ref_key UNIQUE (ref);
    `;
    
    await client.query(sql);
    console.log("Maintenance Schema applied successfully!");
  } catch (error) {
    console.error("Error applying schema:", error);
  } finally {
    await client.end();
  }
}

runMaintenanceSchema();
