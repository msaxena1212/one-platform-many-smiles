import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

async function runSchema() {
  const connectionString = "postgresql://postgres.rvlnwpsijbzcqxutsgwy:IzkXrKVvcnf4pwpS@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres";
  const client = new Client({ connectionString });
  
  try {
    console.log("Connecting to Supabase...");
    await client.connect();
    
    console.log("Reading schema.sql...");
    const schemaPath = path.join(process.cwd(), 'schema.sql');
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
