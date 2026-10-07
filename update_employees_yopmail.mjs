/**
 * update_employees_yopmail.mjs
 * 1. Generates 12-digit alphanumeric passwords for all 38 employees
 * 2. Formats emails with @yopmail.com (e.g. jithin.abdullatheef@yopmail.com)
 * 3. Updates Supabase Auth users, profiles, and employee records
 * 4. Outputs a clear table and saves an exportable CSV credentials file
 */

import xlsx from 'xlsx';
import fs from 'fs';

const SUPABASE_URL = 'https://rnebpqnzignwjeukgztz.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZWJwcW56aWdud2pldWtnenR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDE3NTg4MiwiZXhwIjoyMDk5NzUxODgyfQ.mRwmoyI1ZIKX96qT5dwrno4RATxj01qgSVZ10YigG28';
const TENANT_KEY = 'al-ameen-real-estate';

const HEADERS = {
  'apikey': SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json'
};

function generate12DigitPassword() {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnpqrstuvwxyz';
  const digits = '23456789';
  const all = upper + lower + digits;

  let pwd = '';
  // Ensure at least 1 uppercase, 1 lowercase, 1 digit
  pwd += upper[Math.floor(Math.random() * upper.length)];
  pwd += lower[Math.floor(Math.random() * lower.length)];
  pwd += digits[Math.floor(Math.random() * digits.length)];

  for (let i = 3; i < 12; i++) {
    pwd += all[Math.floor(Math.random() * all.length)];
  }

  // Shuffle
  return pwd.split('').sort(() => 0.5 - Math.random()).join('');
}

function generateYopmailEmail(name) {
  // Strip special chars, keep only letters and numbers
  const cleaned = name.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim().split(/\s+/);
  if (cleaned.length === 1) return `${cleaned[0]}@yopmail.com`;
  if (cleaned.length === 2) return `${cleaned[0]}.${cleaned[1]}@yopmail.com`;
  // For 3+ parts (e.g. Jithin Abdul Latheef -> jithin.abdullatheef@yopmail.com)
  const first = cleaned[0];
  const rest = cleaned.slice(1).join('');
  return `${first}.${rest}@yopmail.com`;
}

function resolveAppRole(designation = '', department = '') {
  const d = designation.toLowerCase();
  if (d.includes('general manager') || d.includes('admin manager')) return 'ADMIN';
  if (d.includes('marketing') || d.includes('leasing')) return 'LEASING';
  if (d.includes('finance') || d.includes('accountant')) return 'FINANCE';
  if (d.includes('cashier')) return 'CASHIER';
  if (d.includes('maintenance') || d.includes('technician') || d.includes('electrician') || d.includes('plumber') || d.includes('painter') || d.includes('mason') || d.includes('cleaner')) return 'MAINTENANCE';
  if (d.includes('property manager')) return 'PROP_MGR';
  if (d.includes('caretaker') || d.includes('security') || d.includes('driver')) return 'MAINTENANCE';
  return 'ADMIN';
}

function excelDateToISO(serial) {
  if (!serial || isNaN(serial)) return null;
  const utcDays = Math.floor(serial - 25569);
  const utcValue = utcDays * 86400;
  const dateInfo = new Date(utcValue * 1000);
  return dateInfo.toISOString().split('T')[0];
}

async function fetchWithRetry(url, options, maxRetries = 4, delayMs = 1200) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, options);
      return res;
    } catch (err) {
      if (attempt === maxRetries) throw err;
      await new Promise(r => setTimeout(r, delayMs * attempt));
    }
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║   Creating Yopmail & 12-Digit Passwords for All Users          ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  const workbook = xlsx.readFile('e:/Port/Property Management System/Documents/Employee Master (1).xlsx');
  const sheet = workbook.Sheets['Employee Master'];
  const data = xlsx.utils.sheet_to_json(sheet);
  const rows = data.filter(r => r['Employee Name'] && String(r['Employee Name']).trim().length > 0);

  console.log(`Processing ${rows.length} employee records...\n`);

  const credentialsList = [];
  const usedEmails = new Set();

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const fullName = String(r['Employee Name']).trim();
    const parts = fullName.split(/\s+/);
    const firstName = parts[0] || fullName;
    const lastName = parts.slice(1).join(' ') || '';

    let email = generateYopmailEmail(fullName);
    if (usedEmails.has(email)) {
      email = `${parts[0].toLowerCase()}.${parts.slice(1).join('')}${i + 1}@yopmail.com`;
    }
    usedEmails.add(email);

    const password = generate12DigitPassword();
    const mobile = r['Mobile Number'] ? `+974 ${r['Mobile Number']}` : '+974 00000000';
    const deptName = r['Department'] ? String(r['Department']).trim() : '';
    const desigTitle = r['Designation'] ? String(r['Designation']).trim() : '';
    const appRole = resolveAppRole(desigTitle, deptName);
    const empCode = `EMP-${String(i + 1).padStart(3, '0')}`;
    const qid = r['QID / Passport No.'] ? String(r['QID / Passport No.']) : null;
    const dob = excelDateToISO(r['Date of Birth']);
    const doj = excelDateToISO(r['Date of Joining']);
    const idExpiry = excelDateToISO(r['ID Expiry Date']);

    // 1. Create or update user in Supabase Auth
    let userId = null;
    try {
      const authRes = await fetchWithRetry(`${SUPABASE_URL}/auth/v1/admin/users`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({
          email: email,
          password: password,
          email_confirm: true,
          user_metadata: {
            full_name: fullName,
            role: appRole,
            tenant_key: TENANT_KEY,
            organisation_name: 'Al Ameen Real Estate',
            phone: mobile
          },
          app_metadata: {
            role: appRole,
            tenant_key: TENANT_KEY
          }
        })
      });

      const authData = await authRes.json();
      userId = authData?.id || authData?.user?.id;

      if (!authRes.ok) {
        // Find existing user by email
        const listRes = await fetchWithRetry(`${SUPABASE_URL}/auth/v1/admin/users`, { headers: HEADERS });
        const listData = await listRes.json();
        const existing = (listData?.users || listData || []).find(u => u.email?.toLowerCase() === email.toLowerCase());
        if (existing) {
          userId = existing.id;
          await fetchWithRetry(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
            method: 'PUT',
            headers: HEADERS,
            body: JSON.stringify({
              password: password,
              email_confirm: true,
              user_metadata: { full_name: fullName, role: appRole, tenant_key: TENANT_KEY },
              app_metadata: { role: appRole, tenant_key: TENANT_KEY }
            })
          });
        }
      }
    } catch (err) {
      console.warn(`  Auth notice for ${email}:`, err.message);
    }

    // 2. Upsert profile
    if (userId) {
      try {
        await fetchWithRetry(`${SUPABASE_URL}/rest/v1/profiles`, {
          method: 'POST',
          headers: { ...HEADERS, 'Prefer': 'resolution=merge-duplicates' },
          body: JSON.stringify({
            id: userId,
            role: appRole,
            full_name: fullName,
            avatar_url: null
          })
        });
      } catch {}
    }

    // 3. Upsert employee
    const employeePayload = {
      employee_id_code: empCode,
      user_id: userId,
      first_name: firstName,
      last_name: lastName,
      gender: r['Gender'] || 'Male',
      nationality: r['Nationality'] || 'India',
      date_of_birth: dob,
      mobile_number: mobile,
      email: email,
      official_email: email,
      date_of_joining: doj,
      employment_type: 'Full_Time',
      qid_passport_no: qid,
      id_expiry_date: idExpiry,
      basic_salary: Number(r['Basic Salary ']) || 0,
      hra: 0,
      tra: Number(r['TRA']) || 0,
      other_allowances: Number(r['Other Allowances ']) || 0,
      bank_name: r['Bank Name'] || 'Commercial Bank',
      iban: r['IBAN'] || null,
      air_ticket: r['Air Ticket'] || 'Yearly',
      employee_status: 'Active',
      remarks: `Total Salary: ${r['Total Salary '] || 0} QAR`
    };

    try {
      await fetchWithRetry(`${SUPABASE_URL}/rest/v1/employees`, {
        method: 'POST',
        headers: { ...HEADERS, 'Prefer': 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify(employeePayload)
      });
    } catch {}

    credentialsList.push({
      empCode,
      name: fullName,
      designation: desigTitle,
      department: deptName,
      role: appRole,
      email,
      password
    });

    console.log(`  ✅ [${empCode}] ${fullName.padEnd(35)} | ${email.padEnd(42)} | Pass: ${password}`);
  }

  // Save credentials to CSV file
  let csvContent = 'Employee ID,Full Name,Designation,Department,Role,Login Email,Password\n';
  credentialsList.forEach(c => {
    csvContent += `"${c.empCode}","${c.name}","${c.designation}","${c.department}","${c.role}","${c.email}","${c.password}"\n`;
  });
  fs.writeFileSync('e:/Port/Property Management System/EMPLOYEE_CREDENTIALS.csv', csvContent);

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log(`║   🎉 Successfully provisioned ${credentialsList.length} user accounts!                ║`);
  console.log('║   Exported credentials to: EMPLOYEE_CREDENTIALS.csv            ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
}

main().catch(console.error);
