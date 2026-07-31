-- schema-hrms.sql
-- HRMS and Asset Master schema for StayHub / PMS

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Designations / Job Titles Table
CREATE TABLE IF NOT EXISTS public.designations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL UNIQUE,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Employees Table
-- Links a person to system user (via user_id), though some employees might not have app access
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id_code TEXT UNIQUE, -- e.g., 'EMP-001'
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL UNIQUE,
  
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  gender TEXT,
  nationality TEXT,
  date_of_birth DATE,
  mobile_number TEXT,
  email TEXT UNIQUE,
  
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  designation_id UUID REFERENCES public.designations(id) ON DELETE SET NULL,
  reporting_manager_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  
  date_of_joining DATE,
  employment_type TEXT,
  qid_passport_no TEXT,
  id_expiry_date DATE,
  
  -- Salary details (simplified, could be separate table)
  basic_salary NUMERIC DEFAULT 0,
  hra NUMERIC DEFAULT 0,
  tra NUMERIC DEFAULT 0,
  other_allowances NUMERIC DEFAULT 0,
  total_salary NUMERIC GENERATED ALWAYS AS (basic_salary + hra + tra + other_allowances) STORED,
  
  bank_name TEXT,
  iban TEXT,
  air_ticket TEXT,
  employee_status TEXT DEFAULT 'Active',
  
  emergency_contact_name TEXT,
  emergency_contact_relation TEXT,
  emergency_contact_number TEXT,
  remarks TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Asset Master Table
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_code TEXT UNIQUE,
  asset_name TEXT NOT NULL,
  category TEXT,
  subcategory TEXT,
  brand TEXT,
  model TEXT,
  serial_number TEXT,
  ownership_type TEXT,
  purchase_date DATE,
  supplier TEXT,
  purchase_cost NUMERIC DEFAULT 0,
  warranty_expiry_date DATE,
  warranty_status TEXT,
  
  -- Linkages
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  assigned_property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  assigned_unit_id UUID, -- If there's a units table, this should reference it
  assigned_employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  assignment_date DATE,
  
  asset_condition TEXT,
  asset_status TEXT DEFAULT 'Available',
  life_of_asset INTEGER,
  opening_cost NUMERIC DEFAULT 0,
  last_service_date DATE,
  next_service_date DATE,
  remarks TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Admin access for now)
CREATE POLICY "Departments viewable by all authenticated users" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Departments modifiable by HR/Admins" ON public.departments FOR ALL USING (public.is_super_admin() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN');

CREATE POLICY "Designations viewable by all authenticated users" ON public.designations FOR SELECT USING (true);
CREATE POLICY "Designations modifiable by HR/Admins" ON public.designations FOR ALL USING (public.is_super_admin() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN');

CREATE POLICY "Employees viewable by all authenticated users" ON public.employees FOR SELECT USING (true);
CREATE POLICY "Employees modifiable by HR/Admins" ON public.employees FOR ALL USING (public.is_super_admin() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN');

CREATE POLICY "Assets viewable by all authenticated users" ON public.assets FOR SELECT USING (true);
CREATE POLICY "Assets modifiable by Admins and Prop Mgrs" ON public.assets FOR ALL USING (
  public.is_super_admin() OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('ADMIN', 'PROP_MGR')
);

-- Note: We assume public.is_super_admin() and public.properties exist from previous schemas.
