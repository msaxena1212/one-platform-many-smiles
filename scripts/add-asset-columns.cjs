require("dotenv").config({ path: ".env.local" });
const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const sql = "ALTER TABLE assets ADD COLUMN IF NOT EXISTS department TEXT, ADD COLUMN IF NOT EXISTS depreciation_method TEXT, ADD COLUMN IF NOT EXISTS depreciation_rate NUMERIC";
pool.query(sql).then(r => { 
  console.log("Migration OK - department, depreciation_method, depreciation_rate columns added to assets table"); 
  pool.end(); 
}).catch(e => { 
  console.error("Error:", e.message); 
  pool.end(); 
});
