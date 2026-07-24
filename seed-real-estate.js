import { Client } from 'pg';
import XLSX from 'xlsx';
import path from 'path';

// Path to the Excel workbook
const workbookPath = path.resolve('e:\\\\Port\\\\Property Management System\\\\Real Estate - Simerjith.xlsx');

// Load the workbook
const workbook = XLSX.readFile(workbookPath);

// Supabase connection string (use the same as in seed-all-data.js)
const connectionString = 'postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
const client = new Client({ connectionString });

async function seedRealEstate() {
  await client.connect();
  console.log('Connected to Supabase');

  // Process each sheet
  workbook.SheetNames.forEach(sheetName => {
    console.log(`Processing sheet: ${sheetName}`);
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    if (rows.length === 0) {
      console.log(`Sheet ${sheetName} is empty – skipping`);
      return;
    }

    // Use the sheet name (lower‑cased, safe for PostgreSQL identifiers) as the target table
    const tableName = `"${sheetName.toLowerCase().replace(/"/g, '""')}"`;

    // Escape column names for PostgreSQL
    const columnNames = Object.keys(rows[0]);
    const escapedColumns = columnNames.map(col => `"${col.replace(/"/g, '""')}"`);

    // Build the INSERT statement template
    const placeholders = columnNames.map((_c, i) => `$${i + 1}`).join(', ');
    const queryTemplate = `INSERT INTO ${tableName} (${escapedColumns.join(', ')}) VALUES (${placeholders})`;

    // Insert each row
    rows.forEach((row, idx) => {
      const values = columnNames.map(col => row[col]);
      client.query(queryTemplate, values)
        .then(() => console.log(`Inserted row ${idx + 1} into ${sheetName}`))
        .catch(err => console.error(`Error inserting row ${idx + 1} into ${sheetName}:`, err.message));
    });
  });

  console.log('All sheets processed – seeding complete.');
  await client.end();
}

seedRealEstate().catch(err => {
  console.error('Seeding error:', err);
});