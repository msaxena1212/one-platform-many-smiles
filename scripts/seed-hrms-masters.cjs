const { Client } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function seedHRMS() {
  const connectionString = process.env.DATABASE_URL || "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

  try {
    console.log("Connecting to PostgreSQL...");
    await client.connect();

    // 1. Seed Company & Branch
    const compRes = await client.query(`
      INSERT INTO public.hrms_companies (code, name, legal_name, currency, country, city)
      VALUES ('KINAN-CORP', 'Kinan Real Estate Holding', 'Kinan Property Management LLC', 'QAR', 'Qatar', 'Doha')
      ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
      RETURNING id;
    `);
    const companyId = compRes.rows[0].id;

    await client.query(`
      INSERT INTO public.hrms_branches (company_id, code, name, region, timezone)
      VALUES 
        ('${companyId}', 'BR-HQ', 'Lusail HQ Tower', 'Lusail', 'Asia/Qatar'),
        ('${companyId}', 'BR-PEARL', 'Pearl Luxury Residences Branch', 'The Pearl', 'Asia/Qatar'),
        ('${companyId}', 'BR-WESTBAY', 'West Bay Commercial Branch', 'West Bay', 'Asia/Qatar')
      ON CONFLICT DO NOTHING;
    `);

    // 2. Seed Shifts
    await client.query(`
      INSERT INTO public.hrms_shifts (name, start_time, end_time, break_duration_minutes, grace_period_minutes, is_night_shift)
      VALUES 
        ('General Day Shift', '08:00:00', '17:00:00', 60, 15, false),
        ('Early Morning Shift', '06:00:00', '14:30:00', 30, 15, false),
        ('Security & Concierge Night Shift', '22:00:00', '06:00:00', 45, 10, true)
      ON CONFLICT DO NOTHING;
    `);

    // 3. Seed Leave Types
    await client.query(`
      INSERT INTO public.hrms_leave_types (code, name, annual_allowance, is_paid, is_encashable, carry_forward_limit)
      VALUES
        ('AL', 'Annual Paid Leave', 30, true, true, 10),
        ('SL', 'Medical / Sick Leave', 14, true, false, 0),
        ('CL', 'Casual Leave', 7, true, false, 0),
        ('ML', 'Maternity Leave', 60, true, false, 0),
        ('UL', 'Unpaid Leave (LWP)', 30, false, false, 0)
      ON CONFLICT (code) DO NOTHING;
    `);

    // 4. Seed Expense Types
    await client.query(`
      INSERT INTO public.hrms_expense_types (name, max_limit)
      VALUES
        ('Client & Tenant Entertainment', 3000),
        ('Local Travel & Fuel Allowance', 1500),
        ('Mobile & Internet Reimbursement', 600),
        ('Emergency Property Maintenance Purchase', 5000)
      ON CONFLICT (name) DO NOTHING;
    `);

    // 5. Seed Announcements
    await client.query(`
      INSERT INTO public.hrms_announcements (title, content, priority, is_published)
      VALUES
        ('Q3 All-Hands Meeting & Property Performance Review', 'Join us this Thursday at 3:00 PM in Lusail HQ Conference Room A for the quarterly property review and employee recognitions.', 'High', true),
        ('Annual Health Insurance Policy Renewal', 'The updated health insurance cards for 2026-2027 are available for collection at the HR Department.', 'Normal', true),
        ('National Day Holiday Notification', 'Please note that our corporate offices will remain closed for National Day on Tuesday.', 'Urgent', true)
      ON CONFLICT DO NOTHING;
    `);

    // 6. Ensure some employee records exist with sample data
    const empCheck = await client.query('SELECT count(*) FROM public.employees');
    if (parseInt(empCheck.rows[0].count) === 0) {
      console.log("Creating baseline sample employees...");
      
      // Get or create department
      const deptRes = await client.query(`
        INSERT INTO public.departments (name, description)
        VALUES ('Property Operations', 'Property leasing, tenant onboarding and facility management')
        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
        RETURNING id;
      `);
      const deptId = deptRes.rows[0].id;

      const desigRes = await client.query(`
        INSERT INTO public.designations (title, department_id, level)
        VALUES ('Senior Property Manager', '${deptId}', 3)
        ON CONFLICT (title) DO UPDATE SET title = EXCLUDED.title
        RETURNING id;
      `);
      const desigId = desigRes.rows[0].id;

      await client.query(`
        INSERT INTO public.employees (
          employee_id_code, first_name, last_name, gender, nationality, 
          mobile_number, email, department_id, designation_id,
          basic_salary, hra, tra, other_allowances,
          bank_name, iban, employee_status, contract_type
        )
        VALUES 
          ('EMP-001', 'Mansoor', 'Al-Kuwari', 'Male', 'Qatari', '+974 5512 3456', 'mansoor.alkuwari@kinan.qa', '${deptId}', '${desigId}', 12000, 4000, 2000, 1000, 'Qatar National Bank', 'QA55QNBA0000000012345678901', 'Active', 'Permanent'),
          ('EMP-002', 'Fatima', 'Al-Nuaimi', 'Female', 'Qatari', '+974 5578 9012', 'fatima.nuaimi@kinan.qa', '${deptId}', '${desigId}', 14000, 4500, 2000, 1500, 'Commercial Bank Qatar', 'QA55CBQK0000000098765432101', 'Active', 'Permanent'),
          ('EMP-003', 'Tariq', 'Mahmoud', 'Male', 'Jordanian', '+974 6623 4567', 'tariq.m@kinan.qa', '${deptId}', '${desigId}', 8500, 2500, 1500, 500, 'Doha Bank', 'QA55DOHB0000000055443322110', 'Active', 'Permanent'),
          ('EMP-004', 'Sarah', 'Jenkins', 'Female', 'British', '+974 3345 6789', 'sarah.j@kinan.qa', '${deptId}', '${desigId}', 11000, 3500, 1500, 1000, 'HSBC Qatar', 'QA55MIDL0000000066778899001', 'Active', 'Permanent')
        ON CONFLICT DO NOTHING;
      `);
    }

    console.log("✅ HRMS Baseline Data Seeded Successfully!");
  } catch (err) {
    console.error("❌ Seeding error:", err.message);
  } finally {
    await client.end();
  }
}

seedHRMS();
