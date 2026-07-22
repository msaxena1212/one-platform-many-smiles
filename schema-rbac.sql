-- 1. Update the role constraint on the profiles table
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('GUEST', 'HOST', 'ADMIN', 'SUPER_ADMIN', 'SALES', 'OWNER', 'PROP_MGR', 'LEASING', 'FINANCE', 'CASHIER', 'MAINTENANCE', 'TENANT'));

-- 2. Create modules enum if it doesn't exist (simulated via text check for simplicity, or we can use an ENUM type)
CREATE TABLE IF NOT EXISTS public.modules (
  id TEXT PRIMARY KEY
);

-- Insert module values
INSERT INTO public.modules (id)
VALUES 
  ('Tenant Mgmt'),
  ('Property CRUD'),
  ('Unit Mgmt'),
  ('Lease Creation'),
  ('Payment Collection'),
  ('Receipt Generation'),
  ('Maintenance Tickets'),
  ('Reports & Analytics'),
  ('User Management'),
  ('HRMS')
ON CONFLICT (id) DO NOTHING;

-- 3. Create role_permissions table
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role_name TEXT NOT NULL,
  module_id TEXT REFERENCES public.modules(id) ON DELETE CASCADE,
  has_access BOOLEAN DEFAULT FALSE,
  tenant_id UUID, -- For tenant specific overrides (NULL means global default)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role_name, module_id, tenant_id)
);

-- Enable RLS
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Modules are viewable by everyone" ON public.modules FOR SELECT USING (true);
CREATE POLICY "Role permissions are viewable by everyone" ON public.role_permissions FOR SELECT USING (true);

-- Super Admins can do everything (handled by global policy if added)
CREATE POLICY "Super Admins can manage permissions" ON public.role_permissions FOR ALL USING (public.is_super_admin());

-- Insert default global permissions (tenant_id IS NULL)
-- Based on the matrix provided
DO $$
DECLARE
  roles TEXT[] := ARRAY['SUPER_ADMIN', 'ADMIN', 'PROP_MGR', 'LEASING', 'FINANCE', 'CASHIER', 'MAINTENANCE', 'TENANT'];
  modules TEXT[] := ARRAY['Tenant Mgmt', 'Property CRUD', 'Unit Mgmt', 'Lease Creation', 'Payment Collection', 'Receipt Generation', 'Maintenance Tickets', 'Reports & Analytics', 'User Management', 'HRMS'];
  r TEXT;
  m TEXT;
  acc BOOLEAN;
BEGIN
  FOREACH r IN ARRAY roles
  LOOP
    FOREACH m IN ARRAY modules
    LOOP
      acc := FALSE;
      -- Set defaults based on role matrix
      IF r = 'SUPER_ADMIN' THEN acc := TRUE; END IF;
      
      IF r = 'ADMIN' THEN
        IF m IN ('Property CRUD', 'Unit Mgmt', 'Lease Creation', 'Payment Collection', 'Receipt Generation', 'Maintenance Tickets', 'Reports & Analytics', 'User Management', 'HRMS') THEN acc := TRUE; END IF;
      END IF;

      IF r = 'PROP_MGR' THEN
        IF m IN ('Property CRUD', 'Unit Mgmt', 'Lease Creation', 'Maintenance Tickets', 'Reports & Analytics') THEN acc := TRUE; END IF;
      END IF;

      IF r = 'LEASING' THEN
        IF m IN ('Lease Creation', 'Reports & Analytics') THEN acc := TRUE; END IF;
      END IF;

      IF r = 'FINANCE' THEN
        IF m IN ('Payment Collection', 'Receipt Generation', 'Reports & Analytics') THEN acc := TRUE; END IF;
      END IF;

      IF r = 'CASHIER' THEN
        IF m IN ('Payment Collection', 'Receipt Generation') THEN acc := TRUE; END IF;
      END IF;

      IF r = 'MAINTENANCE' THEN
        IF m IN ('Maintenance Tickets') THEN acc := TRUE; END IF;
      END IF;

      IF r = 'TENANT' THEN
        IF m IN ('Maintenance Tickets') THEN acc := TRUE; END IF;
      END IF;
      
      INSERT INTO public.role_permissions (role_name, module_id, has_access) 
      VALUES (r, m, acc)
      ON CONFLICT (role_name, module_id, tenant_id) 
      DO UPDATE SET has_access = EXCLUDED.has_access;
      
    END LOOP;
  END LOOP;
END
$$;
