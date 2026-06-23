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
  status TEXT CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED')) DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW(),
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
