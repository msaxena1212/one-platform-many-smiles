const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function applyMigration() {
  const connectionString = process.env.DATABASE_URL || "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  
  try {
    console.log("Connecting to PostgreSQL...");
    await client.connect();
    
    console.log("Reading HRMS migration file...");
    const migrationFile = path.join(process.cwd(), 'supabase', 'migrations', '202608240001_hrms_full_suite.sql');
    const sql = fs.readFileSync(migrationFile, 'utf8');
    
    console.log("Executing HRMS schema migration...");
    await client.query(sql);
    
    console.log("✅ HRMS Database Schema created and updated successfully!");
  } catch (err) {
    console.error("❌ Migration error:", err.message);
  } finally {
    await client.end();
  }
}

applyMigration();
