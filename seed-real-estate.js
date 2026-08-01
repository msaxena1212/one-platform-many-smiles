#!/usr/bin/env node
/**
 * Seed script for Real Estate - Simerjith.xlsx
 * 
 * This script:
 *  1. Reads all sheets and data ranges from the Excel workbook.
 *  2. Converts each sheet into JSON objects.
 *  3. Inserts the data into Supabase using the existing pg client pattern.
 *  4. Can be executed directly with `node seed-real-estate.js`.
 * 
 * Ensure you have installed the `xlsx` npm package before running:
 *   npm install xlsx
 * 
 * The script expects a Supabase connection string in the `connectionString`
 * variable (same format as used in other seed scripts).
 */

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { Client } = require('pg');

// -----------------------------------------------------------------------------
// 1️⃣ Configuration
// -----------------------------------------------------------------------------
const workbookPath = path.join(__dirname, 'Real Estate - Simerjith.xlsx');
if (!fs.existsSync(workbookPath)) {
  console.error('❌ Excel workbook not found:', workbookPath);
  process.exit(1);
}

// Use the same connection string pattern as existing seed scripts.
// Update with your actual Supabase PostgreSQL connection details.
const connectionString = "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

const client = new Client({ connectionString });

// -----------------------------------------------------------------------------
// 2️⃣ Helper Functions
// -----------------------------------------------------------------------------
/**
 * Sanitize a sheet name to be used as a PostgreSQL identifier (lowercase, underscores).
 */
function sanitizeIdentifier(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * Insert rows from a sheet into the corresponding table.
 * 
 * @param {string} tableName - Target Supabase table (usually derived from sheet name).
 * @param {string[]} columnNames - Ordered list of column names.
 * @param {Object[]} rows - Array of row objects keyed by column name.
 */
async function insertRows(tableName, columnNames, rows) {
  if (rows.length === 0) return;
  const escapedTable = `"${tableName}"`;
  const escapedColumns = columnNames.map(col => `"${col}"`).join(', ');
  const valuesPromises = rows.map(row => {
    const values = columnNames.map(col => `'${row[col].replace(/'/g, "''")}'`);
    return `(${values.join(', ')})`;
  });
  const valuesSql = valuesPromises.join(',\n  ');
  const query = `INSERT INTO ${escapedTable} (${escapedColumns}) VALUES\n${valuesSql};`;
  await client.query(query);
}

/**
 * Truncate a table to clear existing data (used before seeding).
 */
async function truncateTable(tableName) {
  await client.query(`TRUNCATE TABLE public.${tableName} RESTART IDENTITY CASCADE;`);
}

// -----------------------------------------------------------------------------
// 3️⃣ Main Seeding Logic
// -----------------------------------------------------------------------------
async function run() {
  await client.connect();
  console.log('✅ Connected to Supabase');

  // -------------------------------------------------------------------------
  // Optional: Clear existing data (comment out if you want to append only)
  // -------------------------------------------------------------------------
  // const tables = [
  //   'properties',
  //   'units',
  //   'leases',
  //   // add any other tables you plan to populate
  // ];
  // for (const tbl of tables) await truncateTable(tbl);
  // console.log('🧹 Existing data truncated');

  // -------------------------------------------------------------------------
  // 3️⃣1️⃣ Read the workbook and process each sheet
  // -------------------------------------------------------------------------
  const workbook = XLSX.readFile(workbookPath);
  console.log(`📚 Found ${workbook.SheetNames.length} sheet(s): ${workbook.SheetNames.join(', ')}`);

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    // Convert sheet data to a JSON array of objects (first row = headers)
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    console.log(`➡️  Processing sheet "${sheetName}" with ${rows.length} row(s)`);

    // Derive a target table name – use the sanitized sheet name.
    // If the sheet already matches a known table name, you can map it explicitly.
    const targetTable = sanitizeIdentifier(sheetName);
    const columnNames = Object.keys(rows[0] || {});

    // Insert the rows into Supabase
    await insertRows(targetTable, columnNames, rows);
    console.log(`✅ Inserted ${rows.length} rows into public.${targetTable}`);
  }

  console.log('🎉 All sheets have been seeded.');
  await client.end();
  process.exit(0);
}

// -----------------------------------------------------------------------------
// 4️⃣ Execute
// -----------------------------------------------------------------------------
run().catch(err => {
  console.error('💥 Seeding failed:', err);
  process.exit(1);
});