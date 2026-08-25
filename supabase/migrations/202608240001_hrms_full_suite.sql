-- 202608240001_hrms_full_suite.sql
-- Enterprise HRMS Complete Database Schema Migration

-- 1. Multi-Company & Organization Masters
CREATE TABLE IF NOT EXISTS public.hrms_companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  legal_name TEXT,
  registration_no TEXT,
  tax_id TEXT,
  currency TEXT DEFAULT 'QAR',
  financial_year_start DATE DEFAULT '2026-01-01',
  country TEXT DEFAULT 'Qatar',
  state TEXT,
  city TEXT DEFAULT 'Doha',
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hrms_entities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.hrms_companies(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, code)
);

CREATE TABLE IF NOT EXISTS public.hrms_branches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.hrms_companies(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  region TEXT,
  timezone TEXT DEFAULT 'Asia/Qatar',
  address TEXT,
  contact_number TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hrms_business_units (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.hrms_companies(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  head_employee_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure departments has needed columns
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.hrms_companies(id) ON DELETE SET NULL;
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS business_unit_id UUID REFERENCES public.hrms_business_units(id) ON DELETE SET NULL;
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS department_head_id UUID;
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

CREATE TABLE IF NOT EXISTS public.hrms_sub_departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hrms_grades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  level INTEGER DEFAULT 1,
  min_salary NUMERIC DEFAULT 0,
  max_salary NUMERIC DEFAULT 0,
  benefits JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure designations has needed columns
ALTER TABLE public.designations ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE public.designations ADD COLUMN IF NOT EXISTS grade_id UUID REFERENCES public.hrms_grades(id) ON DELETE SET NULL;
ALTER TABLE public.designations ADD COLUMN IF NOT EXISTS job_level INTEGER DEFAULT 1;
ALTER TABLE public.designations ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2. Extend Employees Table for Enterprise Lifecycle
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.hrms_companies(id) ON DELETE SET NULL;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.hrms_branches(id) ON DELETE SET NULL;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS business_unit_id UUID REFERENCES public.hrms_business_units(id) ON DELETE SET NULL;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS sub_department_id UUID REFERENCES public.hrms_sub_departments(id) ON DELETE SET NULL;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS grade_id UUID REFERENCES public.hrms_grades(id) ON DELETE SET NULL;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS hr_manager_id UUID REFERENCES public.employees(id) ON DELETE SET NULL;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS official_email TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS marital_status TEXT DEFAULT 'Single';
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS contract_type TEXT DEFAULT 'Permanent';
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS probation_status TEXT DEFAULT 'In Probation';
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS probation_end_date DATE;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS confirmation_date DATE;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS notice_period_days INTEGER DEFAULT 30;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS date_of_exit DATE;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS exit_reason TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS rehire_eligible BOOLEAN DEFAULT true;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS device_user_id TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS bank_account_holder TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS bank_account_type TEXT DEFAULT 'Checking';
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS swift_code TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS emergency_contacts JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS qualifications JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS previous_experience JSONB DEFAULT '[]'::jsonb;

-- Employee Transfers Tracking
CREATE TABLE IF NOT EXISTS public.hrms_employee_transfers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  effective_date DATE NOT NULL,
  transfer_type TEXT NOT NULL, -- 'Department', 'Branch', 'Designation', 'Manager', 'Salary'
  from_details JSONB NOT NULL,
  to_details JSONB NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'Approved', -- 'Pending', 'Approved', 'Rejected'
  approved_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employee Documents
CREATE TABLE IF NOT EXISTS public.hrms_employee_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- 'Passport', 'QID', 'Visa', 'OfferLetter', 'Degree', 'Contract', 'TaxProof'
  document_name TEXT NOT NULL,
  document_url TEXT NOT NULL,
  issue_date DATE,
  expiry_date DATE,
  verification_status TEXT DEFAULT 'Verified', -- 'Pending', 'Verified', 'Rejected'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Workforce, Shift & Attendance
CREATE TABLE IF NOT EXISTS public.hrms_shifts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.hrms_companies(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_duration_minutes INTEGER DEFAULT 60,
  grace_period_minutes INTEGER DEFAULT 15,
  is_night_shift BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hrms_shift_allocations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  shift_id UUID REFERENCES public.hrms_shifts(id) ON DELETE CASCADE,
  from_date DATE NOT NULL,
  to_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hrms_attendance_raw_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  device_id TEXT,
  device_user_id TEXT,
  event_time TIMESTAMPTZ NOT NULL,
  direction TEXT NOT NULL, -- 'IN', 'OUT'
  source TEXT DEFAULT 'Web', -- 'Biometric', 'Web', 'Mobile', 'Manual'
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hrms_attendance_daily (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  shift_id UUID REFERENCES public.hrms_shifts(id) ON DELETE SET NULL,
  first_in TIMESTAMPTZ,
  last_out TIMESTAMPTZ,
  total_working_hours NUMERIC DEFAULT 0,
  break_hours NUMERIC DEFAULT 0,
  late_minutes INTEGER DEFAULT 0,
  early_minutes INTEGER DEFAULT 0,
  overtime_minutes INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'PRESENT', -- 'PRESENT', 'ABSENT', 'HALF_DAY', 'WEEK_OFF', 'HOLIDAY', 'LEAVE', 'COMP_OFF', 'ON_DUTY', 'LATE', 'EARLY_EXIT'
  is_regularized BOOLEAN DEFAULT false,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, attendance_date)
);

CREATE TABLE IF NOT EXISTS public.hrms_attendance_regularizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  requested_in TIMESTAMPTZ,
  requested_out TIMESTAMPTZ,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'Pending', -- 'Pending', 'Approved', 'Rejected'
  reviewed_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hrms_overtime_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  overtime_date DATE NOT NULL,
  overtime_hours NUMERIC NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'Pending', -- 'Pending', 'Approved', 'Rejected'
  approved_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Leave Management
CREATE TABLE IF NOT EXISTS public.hrms_leave_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  annual_allowance INTEGER DEFAULT 30,
  is_paid BOOLEAN DEFAULT true,
  is_encashable BOOLEAN DEFAULT true,
  carry_forward_limit INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hrms_leave_balances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type_id UUID REFERENCES public.hrms_leave_types(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  total_entitled NUMERIC DEFAULT 30,
  used NUMERIC DEFAULT 0,
  pending NUMERIC DEFAULT 0,
  encashed NUMERIC DEFAULT 0,
  balance NUMERIC GENERATED ALWAYS AS (total_entitled - used - encashed) STORED,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, leave_type_id, year)
);

CREATE TABLE IF NOT EXISTS public.hrms_leave_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type_id UUID REFERENCES public.hrms_leave_types(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_count NUMERIC NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'Pending', -- 'Pending', 'Approved', 'Rejected', 'Cancelled'
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT
);

CREATE TABLE IF NOT EXISTS public.hrms_leave_encashments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type_id UUID REFERENCES public.hrms_leave_types(id) ON DELETE CASCADE,
  days_encashed NUMERIC NOT NULL,
  calculated_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Payroll, Salary Components, & Statutory
CREATE TABLE IF NOT EXISTS public.hrms_salary_components (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'Earning', 'Deduction', 'Reimbursement'
  is_statutory BOOLEAN DEFAULT false,
  is_taxable BOOLEAN DEFAULT true,
  calculation_type TEXT DEFAULT 'Fixed', -- 'Fixed', 'Percentage'
  default_amount NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hrms_salary_structures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hrms_employee_salaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  effective_from DATE NOT NULL,
  effective_to DATE,
  basic_salary NUMERIC DEFAULT 0,
  hra NUMERIC DEFAULT 0,
  transport_allowance NUMERIC DEFAULT 0,
  other_allowance NUMERIC DEFAULT 0,
  gross_salary NUMERIC GENERATED ALWAYS AS (basic_salary + hra + transport_allowance + other_allowance) STORED,
  components JSONB DEFAULT '[]'::jsonb,
  is_current BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hrms_payroll_cycles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.hrms_companies(id) ON DELETE SET NULL,
  name TEXT NOT NULL, -- e.g. 'August 2026 Payroll'
  cycle_month INTEGER NOT NULL,
  cycle_year INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'Draft', -- 'Draft', 'Processing', 'Approved', 'Paid', 'Locked'
  total_gross NUMERIC DEFAULT 0,
  total_deductions NUMERIC DEFAULT 0,
  total_net NUMERIC DEFAULT 0,
  total_employees INTEGER DEFAULT 0,
  approved_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, cycle_month, cycle_year)
);

CREATE TABLE IF NOT EXISTS public.hrms_payroll_payslips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  payroll_cycle_id UUID REFERENCES public.hrms_payroll_cycles(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  working_days NUMERIC DEFAULT 30,
  present_days NUMERIC DEFAULT 30,
  paid_leaves NUMERIC DEFAULT 0,
  unpaid_leaves NUMERIC DEFAULT 0,
  overtime_hours NUMERIC DEFAULT 0,
  basic_pay NUMERIC DEFAULT 0,
  allowances NUMERIC DEFAULT 0,
  overtime_pay NUMERIC DEFAULT 0,
  incentives NUMERIC DEFAULT 0,
  gross_earnings NUMERIC DEFAULT 0,
  statutory_deductions NUMERIC DEFAULT 0,
  loan_deductions NUMERIC DEFAULT 0,
  fines_deductions NUMERIC DEFAULT 0,
  total_deductions NUMERIC DEFAULT 0,
  net_salary NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Generated', -- 'Generated', 'Approved', 'Paid'
  payment_mode TEXT DEFAULT 'Bank Transfer',
  payment_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hrms_employee_loans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  loan_amount NUMERIC NOT NULL,
  disbursed_date DATE NOT NULL,
  tenure_months INTEGER NOT NULL,
  monthly_emi NUMERIC NOT NULL,
  total_repaid NUMERIC DEFAULT 0,
  remaining_balance NUMERIC NOT NULL,
  status TEXT DEFAULT 'Active', -- 'Pending', 'Active', 'Completed', 'Cancelled'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hrms_employee_fines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  incident_date DATE NOT NULL,
  amount NUMERIC NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'Pending', -- 'Pending', 'Deducted', 'Waived'
  deducted_in_payroll_id UUID REFERENCES public.hrms_payroll_cycles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Performance & Appraisals
CREATE TABLE IF NOT EXISTS public.hrms_appraisal_cycles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  interval_type TEXT DEFAULT 'Annual', -- 'Quarterly', 'Semi-Annual', 'Annual'
  status TEXT DEFAULT 'Active', -- 'Draft', 'Active', 'Completed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hrms_kpa_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  designation_id UUID REFERENCES public.designations(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  weightage INTEGER DEFAULT 100,
  metrics JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hrms_employee_appraisals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appraisal_cycle_id UUID REFERENCES public.hrms_appraisal_cycles(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  manager_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  self_score NUMERIC DEFAULT 0,
  manager_score NUMERIC DEFAULT 0,
  peer_score NUMERIC DEFAULT 0,
  final_score NUMERIC DEFAULT 0,
  self_remarks TEXT,
  manager_remarks TEXT,
  status TEXT DEFAULT 'Initiated', -- 'Initiated', 'Self_Submitted', 'Manager_Reviewed', 'Completed'
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(appraisal_cycle_id, employee_id)
);

-- 7. Travel & Expense Management
CREATE TABLE IF NOT EXISTS public.hrms_expense_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  max_limit NUMERIC DEFAULT 5000,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hrms_expense_claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  expense_type_id UUID REFERENCES public.hrms_expense_types(id) ON DELETE SET NULL,
  expense_date DATE NOT NULL,
  amount NUMERIC NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  receipt_url TEXT,
  status TEXT DEFAULT 'Pending', -- 'Pending', 'Approved', 'Reimbursed', 'Rejected'
  approved_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  reimbursed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Asset Clearance & Employee Allocation
CREATE TABLE IF NOT EXISTS public.hrms_asset_allocations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  allocated_date DATE NOT NULL,
  expected_return_date DATE,
  returned_date DATE,
  condition_at_allocation TEXT DEFAULT 'Good',
  condition_at_return TEXT,
  status TEXT DEFAULT 'Allocated', -- 'Allocated', 'Returned', 'Damaged'
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Exit Lifecycle, Clearances & FNF Settlement
CREATE TABLE IF NOT EXISTS public.hrms_resignations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  resignation_date DATE NOT NULL,
  requested_last_working_date DATE NOT NULL,
  approved_last_working_date DATE,
  notice_period_served_days INTEGER,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'Submitted', -- 'Submitted', 'Under_Review', 'Accepted', 'Withdrawn', 'Rejected'
  accepted_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hrms_exit_clearances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resignation_id UUID REFERENCES public.hrms_resignations(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  department_name TEXT NOT NULL, -- 'IT_Assets', 'HR', 'Finance', 'Operations', 'Manager'
  cleared_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  is_cleared BOOLEAN DEFAULT false,
  cleared_at TIMESTAMPTZ,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hrms_fnf_settlements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resignation_id UUID REFERENCES public.hrms_resignations(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  settlement_date DATE NOT NULL,
  last_working_date DATE NOT NULL,
  unpaid_salary NUMERIC DEFAULT 0,
  leave_encashment NUMERIC DEFAULT 0,
  gratuity_amount NUMERIC DEFAULT 0,
  notice_pay_adjustment NUMERIC DEFAULT 0,
  other_earnings NUMERIC DEFAULT 0,
  total_gross_settlement NUMERIC DEFAULT 0,
  loan_deduction NUMERIC DEFAULT 0,
  asset_recovery_deduction NUMERIC DEFAULT 0,
  other_deductions NUMERIC DEFAULT 0,
  total_deductions NUMERIC DEFAULT 0,
  net_payable NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Draft', -- 'Draft', 'Approved', 'Disbursed'
  approved_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  disbursed_at TIMESTAMPTZ,
  payment_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Announcements & Help Desk
CREATE TABLE IF NOT EXISTS public.hrms_announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'Normal', -- 'Low', 'Normal', 'High', 'Urgent'
  target_department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  posted_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hrms_helpdesk_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_number TEXT UNIQUE NOT NULL,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 'HR', 'IT', 'Payroll', 'Facilities', 'Grievance'
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'Medium', -- 'Low', 'Medium', 'High', 'Critical'
  status TEXT DEFAULT 'Open', -- 'Open', 'In_Progress', 'Resolved', 'Closed'
  assigned_to UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security policies
ALTER TABLE public.hrms_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrms_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrms_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrms_business_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrms_sub_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrms_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrms_employee_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrms_employee_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrms_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrms_shift_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrms_attendance_raw_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrms_attendance_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrms_attendance_regularizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrms_overtime_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrms_leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrms_leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrms_leave_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrms_leave_encashments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrms_salary_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrms_salary_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrms_employee_salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrms_payroll_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrms_payroll_payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrms_employee_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrms_employee_fines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrms_appraisal_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrms_kpa_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrms_employee_appraisals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrms_expense_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrms_expense_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrms_asset_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrms_resignations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrms_exit_clearances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrms_fnf_settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrms_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrms_helpdesk_tickets ENABLE ROW LEVEL SECURITY;

-- Permissive authenticated read/write for seamless operation
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename LIKE 'hrms_%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "hrms_auth_all" ON public.%I', tbl);
    EXECUTE format('CREATE POLICY "hrms_auth_all" ON public.%I FOR ALL USING (true) WITH CHECK (true)', tbl);
  END LOOP;
END $$;
