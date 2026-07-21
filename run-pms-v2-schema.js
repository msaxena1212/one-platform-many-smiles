import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSchema() {
  const connectionString = "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";
  const client = new Client({ connectionString });
  
  try {
    console.log("Connecting to Supabase...");
    await client.connect();
    
    console.log("Reading schema-pms-v2.sql...");
    const schemaPath = path.join(__dirname, 'schema-pms-v2.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log("Executing schema...");
    await client.query(sql);
    
    console.log("Schema applied successfully!");
  } catch (error) {
    console.error("Error applying schema:", error);
  } finally {
    await client.end();
  }
}

runSchema();
