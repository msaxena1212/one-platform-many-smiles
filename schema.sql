-- Supabase PostgreSQL Schema for StayHub (Property Management System)

-- Enable PostGIS for location-based search
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Users Table (Extends Supabase Auth)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT CHECK (role IN ('GUEST', 'HOST', 'ADMIN')) DEFAULT 'GUEST',
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Properties Table
CREATE TABLE public.properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  property_type TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  location GEOGRAPHY(POINT), -- PostGIS point
  max_guests INTEGER NOT NULL DEFAULT 1,
  bedrooms INTEGER NOT NULL DEFAULT 1,
  beds INTEGER NOT NULL DEFAULT 1,
  bathrooms NUMERIC NOT NULL DEFAULT 1,
  base_price_per_night NUMERIC NOT NULL,
  cleaning_fee NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Amenities
CREATE TABLE public.amenities (
  id TEXT PRIMARY KEY, -- e.g., 'wifi', 'pool'
  label TEXT NOT NULL,
  icon TEXT
);

-- Property Amenities mapping
CREATE TABLE public.property_amenities (
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  amenity_id TEXT REFERENCES public.amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (property_id, amenity_id)
);

-- 4. Property Images
CREATE TABLE public.property_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0
);

-- 5. Bookings
CREATE TABLE public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE RESTRICT,
  guest_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests_count INTEGER NOT NULL,
  total_price NUMERIC NOT NULL,
  status TEXT CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED')) DEFAULT 'PENDING',    -- Status values are already capitalized; no change needed.  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Prevent double booking using Exclude constraint (Requires btree_gist)
  CONSTRAINT check_dates CHECK (check_in < check_out)
);

-- Enable btree_gist extension for overlapping date constraint
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE public.bookings ADD CONSTRAINT no_overlapping_bookings 
  EXCLUDE USING GIST (
    property_id WITH =,
    daterange(check_in, check_out, '[)') WITH &&
  ) WHERE (status IN ('PENDING', 'CONFIRMED', 'COMPLETED'));

-- 6. Reviews
CREATE TABLE public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Setup
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can view, but only the user can update their own
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Properties: Anyone can view active properties, Hosts can manage their own
CREATE POLICY "Active properties are viewable by everyone" ON public.properties FOR SELECT USING (is_active = TRUE OR auth.uid() = host_id);
CREATE POLICY "Hosts can insert their properties" ON public.properties FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Hosts can update their properties" ON public.properties FOR UPDATE USING (auth.uid() = host_id);

-- Bookings: Guests can see their own, Hosts can see bookings for their properties
CREATE POLICY "Guests can view their own bookings" ON public.bookings FOR SELECT USING (auth.uid() = guest_id);
CREATE POLICY "Hosts can view bookings for their properties" ON public.bookings FOR SELECT USING (
  property_id IN (SELECT id FROM public.properties WHERE host_id = auth.uid())
);
CREATE POLICY "Guests can insert bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = guest_id);
-- Supabase PostgreSQL Schema for PMS v2.0
-- Extending the existing database with Module 2 & 3 (Customer & Lease Management)

-- 1. Customers Table (Module 2)
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_type TEXT CHECK (customer_type IN ('Individual', 'Company')) DEFAULT 'Individual',
  full_name TEXT NOT NULL,
  qatar_id TEXT,
  passport_number TEXT,
  commercial_registration TEXT,
  nationality TEXT,
  mobile_number TEXT NOT NULL,
  email_address TEXT,
  permanent_address TEXT,
  local_address TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  employer_name TEXT,
  employer_address TEXT,
  designation TEXT,
  monthly_income NUMERIC,
  authorized_signatory_name TEXT,
  authorized_signatory_id TEXT,
  verification_status TEXT CHECK (verification_status IN ('Pending', 'Verified', 'Rejected', 'Additional Info Required')) DEFAULT 'Pending',
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 2. Reservations Table (Pre-Lease)
CREATE TABLE IF NOT EXISTS public.reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id UUID, -- REFERENCES public.units(id) ON DELETE CASCADE, (Assuming units table exists from previous phase)
  prospect_name TEXT NOT NULL,
  prospect_contact TEXT NOT NULL,
  prospect_id_type TEXT,
  prospect_id_number TEXT,
  marketing_agent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  proposed_lease_period INTEGER,
  expected_start_date DATE,
  proposed_rental_amount NUMERIC,
  reservation_validity TIMESTAMPTZ,
  special_conditions TEXT,
  status TEXT CHECK (status IN ('Active', 'Extended', 'Cancelled', 'Expired', 'Converted')) DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Leases Table (Module 3)
CREATE TABLE IF NOT EXISTS public.leases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id UUID, -- REFERENCES public.units(id) ON DELETE RESTRICT,
  property_id UUID REFERENCES public.properties(id) ON DELETE RESTRICT,
  customer_id UUID REFERENCES public.customers(id) ON DELETE RESTRICT,
  lease_number TEXT UNIQUE NOT NULL,
  lease_status TEXT CHECK (lease_status IN (
    'DRAFT', 'DOCUMENTS_PENDING', 'DOCUMENTS_VERIFIED', 'AGREEMENT_CREATED', 
    'TENANT_SIGNED', 'PAYMENT_PENDING', 'PAYMENT_COLLECTED', 'LANDLORD_SIGNED', 
    'KEY_HANDOVER_PENDING', 'KEY_HANDED_OVER', 'CHECK_IN_PENDING', 'CHECK_IN_COMPLETED', 
    'ACTIVE', 'RENEWAL_NOTICE_SENT', 'RENEWAL_DISCUSSION', 'RENEWAL_CONFIRMED', 
    'RENEWAL_AGREEMENT_CREATED', 'NON_RENEWAL_NOTICE', 'CHECK_OUT_SCHEDULED', 
    'CHECK_OUT_COMPLETED', 'SETTLEMENT_PENDING', 'SETTLEMENT_COMPLETED', 'CLOSED', 'TERMINATED'
  )) DEFAULT 'DRAFT',
  commencement_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  lease_period_months INTEGER NOT NULL,
  rental_amount NUMERIC NOT NULL,
  payment_frequency TEXT CHECK (payment_frequency IN ('Monthly', 'Quarterly', 'Semi-Annually', 'Annually')) DEFAULT 'Monthly',
  security_deposit NUMERIC DEFAULT 0,
  security_deposit_status TEXT CHECK (security_deposit_status IN ('Pending', 'Received', 'Refunded', 'Adjusted')) DEFAULT 'Pending',
  grace_period_days INTEGER DEFAULT 5,
  late_penalty_percentage NUMERIC DEFAULT 0,
  late_penalty_fixed NUMERIC DEFAULT 0,
  renewal_terms TEXT,
  notice_period_days INTEGER DEFAULT 60,
  maintenance_responsibility TEXT CHECK (maintenance_responsibility IN ('Landlord', 'Tenant', 'Shared')) DEFAULT 'Landlord',
  utility_responsibility TEXT CHECK (utility_responsibility IN ('Landlord', 'Tenant', 'Shared')) DEFAULT 'Tenant',
  parking_details TEXT,
  special_conditions TEXT,
  number_of_pdc INTEGER DEFAULT 0,
  tenant_signed_doc_url TEXT,
  landlord_signed_doc_url TEXT,
  tenant_signature_date DATE,
  landlord_signature_date DATE,
  signed_by_receiver TEXT,
  key_handover_date DATE,
  previous_lease_id UUID REFERENCES public.leases(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 4. Key Handovers
CREATE TABLE IF NOT EXISTS public.key_handovers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lease_id UUID REFERENCES public.leases(id) ON DELETE CASCADE,
  handover_date TIMESTAMPTZ NOT NULL,
  keys_issued JSONB DEFAULT '[]'::jsonb,
  access_cards_issued JSONB DEFAULT '[]'::jsonb,
  parking_remotes JSONB DEFAULT '[]'::jsonb,
  meter_readings JSONB DEFAULT '{}'::jsonb,
  staff_name TEXT NOT NULL,
  staff_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Inspection Reports (Check In / Check Out)
CREATE TABLE IF NOT EXISTS public.inspection_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lease_id UUID REFERENCES public.leases(id) ON DELETE CASCADE,
  inspection_type TEXT CHECK (inspection_type IN ('Check-In', 'Check-Out')) NOT NULL,
  inspection_date TIMESTAMPTZ NOT NULL,
  unit_condition JSONB DEFAULT '{}'::jsonb,
  furniture JSONB DEFAULT '{}'::jsonb,
  appliances JSONB DEFAULT '{}'::jsonb,
  fixtures JSONB DEFAULT '{}'::jsonb,
  meter_readings JSONB DEFAULT '{}'::jsonb,
  keys_access JSONB DEFAULT '{}'::jsonb,
  photos JSONB DEFAULT '[]'::jsonb,
  damages JSONB DEFAULT '[]'::jsonb,
  pending_work JSONB DEFAULT '[]'::jsonb,
  inspector_name TEXT NOT NULL,
  tenant_acknowledged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add Foreign Keys for Inspections to Leases
ALTER TABLE public.leases ADD COLUMN IF NOT EXISTS check_in_report_id UUID REFERENCES public.inspection_reports(id) ON DELETE SET NULL;
ALTER TABLE public.leases ADD COLUMN IF NOT EXISTS check_out_report_id UUID REFERENCES public.inspection_reports(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.key_handovers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_reports ENABLE ROW LEVEL SECURITY;

-- Basic Policies (For Admin/Host)
CREATE POLICY "Public Customers" ON public.customers FOR ALL USING (true);
CREATE POLICY "Public Reservations" ON public.reservations FOR ALL USING (true);
CREATE POLICY "Public Leases" ON public.leases FOR ALL USING (true);
CREATE POLICY "Public Key Handovers" ON public.key_handovers FOR ALL USING (true);
CREATE POLICY "Public Inspection Reports" ON public.inspection_reports FOR ALL USING (true);

