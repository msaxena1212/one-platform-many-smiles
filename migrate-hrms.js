import { createClient } from '@supabase/supabase-js';
import { Client } from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import xlsx from 'xlsx';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = 'https://rnebpqnzignwjeukgztz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZWJwcW56aWdud2pldWtnenR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxNzU4ODIsImV4cCI6MjA5OTc1MTg4Mn0.maLd6Jgr8uggrfu5uZg9sjRmG0z0r7NlaMB4wIdSRTg';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const connectionString = "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

// Helper to convert excel serial date to JS Date
function excelDateToJSDate(serial) {
  if (!serial) return null;
  if (typeof serial === 'string') return new Date(serial).toISOString().split('T')[0];
  const utc_days  = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;                                        
  const date_info = new Date(utc_value * 1000);
  return date_info.toISOString().split('T')[0];
}

async function run() {
  const pgClient = new Client({ connectionString });
  await pgClient.connect();
  
  let credentialsMarkdown = '# HRMS User Credentials\n\n| Employee Name | Email | Password | Role |\n|---|---|---|---|\n';

  try {
    console.log('Reading Employee Master...');
    const empWorkbook = xlsx.readFile(path.join(process.cwd(), '..', 'Employee Master.xlsx'));
    const empSheet = empWorkbook.Sheets['Employee Master'];
    const empData = xlsx.utils.sheet_to_json(empSheet);

    const departmentMap = {};
    const designationMap = {};
    const employeeMapByName = {}; // For assets
    
    // Clear old data
    console.log('Clearing old hrms data...');
    await pgClient.query('DELETE FROM public.assets');
    await pgClient.query('DELETE FROM public.employees');
    await pgClient.query('DELETE FROM public.designations');
    await pgClient.query('DELETE FROM public.departments');

    console.log(`Processing ${empData.length} employees...`);
    let count = 1;
    for (const row of empData) {
      const empName = row['Employee Name'] || `Employee ${count}`;
      const departmentName = row['Department'];
      const designationTitle = row['Designation'];
      
      // 1. Department
      let deptId = null;
      if (departmentName) {
        if (!departmentMap[departmentName]) {
          const res = await pgClient.query(`INSERT INTO public.departments (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`, [departmentName]);
          departmentMap[departmentName] = res.rows[0].id;
        }
        deptId = departmentMap[departmentName];
      }
      
      // 2. Designation
      let desigId = null;
      if (designationTitle) {
        if (!designationMap[designationTitle]) {
          const res = await pgClient.query(`INSERT INTO public.designations (title, department_id) VALUES ($1, $2) ON CONFLICT (title) DO UPDATE SET title = EXCLUDED.title RETURNING id`, [designationTitle, deptId]);
          designationMap[designationTitle] = res.rows[0].id;
        }
        desigId = designationMap[designationTitle];
      }
      
      // 3. Create User in Auth
      let email = row['Email'];
      if (!email || email.trim() === '') {
        email = `emp${count}@zyno.com`;
      }
      const password = `Pass@${Math.random().toString(36).slice(-6)}`;
      
      let userId = null;
      
      // Assign role based on department/designation loosely
      let role = 'ADMIN';
      if (departmentName === 'Finance and Operations') role = 'FINANCE';
      if (departmentName === 'Leasing') role = 'LEASING';
      if (departmentName === 'Maintenance') role = 'MAINTENANCE';
      if (designationTitle && designationTitle.includes('Manager')) role = 'PROP_MGR';
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: empName,
            role: role
          }
        }
      });
      
      if (authError) {
         if (authError.message.includes("already registered")) {
            // Find existing
            const res = await pgClient.query(`SELECT id FROM auth.users WHERE email = $1`, [email]);
            if (res.rows.length > 0) userId = res.rows[0].id;
         } else {
            console.error(`Auth Error for ${email}:`, authError.message);
         }
      } else if (authData.user) {
         userId = authData.user.id;
      }
      
      if (userId) {
        // Upsert profile
        await pgClient.query(`
          INSERT INTO public.profiles (id, role, full_name) 
          VALUES ($3, $1, $2)
          ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, full_name = EXCLUDED.full_name
        `, [role, empName, userId]);
      }
      
      credentialsMarkdown += `| ${empName} | ${email} | ${password} | ${role} |\n`;
      
      // 4. Create Employee
      const empRes = await pgClient.query(`
        INSERT INTO public.employees (
          employee_id_code, user_id, first_name, last_name, gender, nationality, 
          date_of_birth, mobile_number, email, department_id, designation_id, 
          date_of_joining, employment_type, qid_passport_no, id_expiry_date,
          basic_salary, hra, tra, other_allowances, bank_name, iban, air_ticket,
          employee_status, emergency_contact_name, emergency_contact_relation, emergency_contact_number, remarks
        ) VALUES (
          $1, $2, $3, $4, $5, $6, 
          $7, $8, $9, $10, $11, 
          $12, $13, $14, $15,
          $16, $17, $18, $19, $20, $21, $22,
          $23, $24, $25, $26, $27
        ) RETURNING id
      `, [
        row['Employee ID'] || `E-${count}`,
        userId,
        empName.split(' ')[0] || 'Unknown',
        empName.split(' ').slice(1).join(' ') || '.',
        row['Gender'],
        row['Nationality'],
        excelDateToJSDate(row['Date of Birth']),
        row['Mobile Number']?.toString(),
        email,
        deptId,
        desigId,
        excelDateToJSDate(row['Date of Joining']),
        row['Employment Type'],
        row['QID / Passport No.']?.toString(),
        excelDateToJSDate(row['ID Expiry Date']),
        parseFloat(row['Basic Salary ']) || 0,
        parseFloat(row['HRA']) || 0,
        parseFloat(row['TRA']) || 0,
        parseFloat(row['Other Allowances ']) || 0,
        row['Bank Name'],
        row['IBAN'],
        row['Air Ticket'],
        row['Employee Status'] || 'Active',
        row['Emergency Contact Name'],
        row['Relation with Employee'],
        row['Emergency Contact No.']?.toString(),
        row['Remarks']
      ]);
      
      employeeMapByName[empName.trim().toLowerCase()] = empRes.rows[0].id;
      count++;
    }
    
    // Save credentials
    fs.writeFileSync(path.join(process.cwd(), '..', 'user_credentials.md'), credentialsMarkdown);
    console.log('Saved credentials to user_credentials.md');

    // Fetch properties for asset assignment
    const propRes = await pgClient.query('SELECT id, property_code FROM public.properties');
    const propertyMap = {};
    for (const p of propRes.rows) {
      if (p.property_code) propertyMap[p.property_code.trim().toLowerCase()] = p.id;
    }

    console.log('Reading Asset Master...');
    const assetWorkbook = xlsx.readFile(path.join(process.cwd(), '..', 'Asset Master.xlsx'));
    const assetSheet = assetWorkbook.Sheets['Asset Master'];
    const assetData = xlsx.utils.sheet_to_json(assetSheet);

    console.log(`Processing ${assetData.length} assets...`);
    let acount = 1;
    for (const row of assetData) {
      const propCode = row['Assigned Property Code'];
      let propId = null;
      if (propCode && propertyMap[propCode.trim().toLowerCase()]) {
        propId = propertyMap[propCode.trim().toLowerCase()];
      }
      
      const empName = row['Assigned Employee Name'];
      let empId = null;
      if (empName && employeeMapByName[empName.trim().toLowerCase()]) {
        empId = employeeMapByName[empName.trim().toLowerCase()];
      }
      
      await pgClient.query(`
        INSERT INTO public.assets (
          asset_code, asset_name, category, subcategory, brand, model, serial_number,
          ownership_type, purchase_date, supplier, purchase_cost, warranty_expiry_date, warranty_status,
          assigned_property_id, assigned_employee_id, assignment_date, asset_condition, asset_status,
          life_of_asset, opening_cost, last_service_date, next_service_date, remarks
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12, $13,
          $14, $15, $16, $17, $18,
          $19, $20, $21, $22, $23
        )
      `, [
        row['Asset ID'] || `AST-${acount}`,
        row['Asset Name'] || `Asset ${acount}`,
        row['Asset Category'],
        row['Asset Subcategory'],
        row['Brand'],
        row['Model'],
        row['Serial / IMEI No.']?.toString(),
        row['Ownership Type'],
        excelDateToJSDate(row['Purchase Date']),
        row['Supplier'],
        parseFloat(row['Purchase Cost (QAR)']) || 0,
        excelDateToJSDate(row['Warranty Expiry Date']),
        row['Warranty Status'],
        propId,
        empId,
        excelDateToJSDate(row['Assignment Date']),
        row['Asset Condition'],
        row['Asset Status'] || 'Available',
        parseInt(row['Life Of Asset']) || 0,
        parseFloat(row['Opening Cost']) || 0,
        excelDateToJSDate(row['Last Service Date']),
        excelDateToJSDate(row['Next Service Date']),
        row['Remarks']
      ]);
      acount++;
    }
    
    console.log('Data synchronization complete!');

  } catch (error) {
    console.error("Migration Error:", error);
  } finally {
    await pgClient.end();
  }
}

run();
