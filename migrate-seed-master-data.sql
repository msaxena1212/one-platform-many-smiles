-- ------------------------------------------------------------
-- Seed master data for Property Management System
-- ------------------------------------------------------------
-- This script populates the master lookup tables with the
-- distinct values defined in the user’s specification.
-- ------------------------------------------------------------

-- 1. Property Type Master
INSERT INTO public.property_type_master (name) VALUES
    ('Residential'), ('Retail'), ('Office'), ('Warehouse'), ('Industrial'),
    ('Staff Accommodation'), ('Land'), ('Other'), ('Hotel / Hospitality')
ON CONFLICT (name) DO NOTHING;

-- 2. Property Category Master
INSERT INTO public.property_category_master (name) VALUES
    ('Building'), ('Villa Compound'), ('Tower'), ('Mall'), ('Warehouse Complex'),
    ('Office Complex'), ('Subleased'), ('Under Renovation'), ('Other')
ON CONFLICT (name) DO NOTHING;

-- 3. Ownership Type Master
INSERT INTO public.ownership_type_master (name) VALUES
    ('Owned'), ('Leased'), ('Managed for Owner'), ('Joint Venture'),
    ('Other'), ('Sold'), ('Archived')
ON CONFLICT (name) DO NOTHING;

-- 4. Property Status Master
CREATE TABLE IF NOT EXISTS public.property_status_master (
    id   SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);
INSERT INTO public.property_status_master (name) VALUES
    ('Active'), ('Inactive'), ('Under Development'), ('Under Renovation'),
    ('Sold'), ('Archived'), ('Notice Given'), ('Renewal Due'), ('Expired')
ON CONFLICT (name) DO NOTHING;

-- 5. VAT / Tax Treatment Master
CREATE TABLE IF NOT EXISTS public.vat_tax_treatment_master (
    id   SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);
INSERT INTO public.vat_tax_treatment_master (name) VALUES
    ('Taxable'), ('Exempt'), ('Zero Rated'), ('Not Applicable'), ('Out of Scope')
ON CONFLICT (name) DO NOTHING;

-- 6. Yes/No Master (Yes, No, Partial)
CREATE TABLE IF NOT EXISTS public.yes_no_master (
    id   SERIAL PRIMARY KEY,
    label TEXT NOT NULL UNIQUE
);
INSERT INTO public.yes_no_master (label) VALUES
    ('Yes'), ('No'), ('Partial')
ON CONFLICT (label) DO NOTHING;

-- 7. Amenity / Facility Master
CREATE TABLE IF NOT EXISTS public.amenity_facility_master (
    id   SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);
-- Sample amenities from the specification
INSERT INTO public.amenity_facility_master (name) VALUES
    ('Swimming Pool'), ('Gym / Fitness Center'), ('Kids Play Area'),
    ('Covered Parking'), ('Security / CCTV'), ('Visitor Parking'),
    ('Rooftop Terrace'), ('Clubhouse / Community Hall'), ('Prayer Room'),
    ('Cafeteria / Restaurant'), ('Laundry Room'), ('Sports Court'),
    ('Jogging Track'), ('Spa / Sauna'), ('Storage Area'), ('Driver Room'),
    ('Maid Room'), ('Concierge'), ('Property Management Office'),
    ('Maintenance Office'), ('Wi‑Fi / Internet'), ('Other')
ON CONFLICT (name) DO NOTHING;

-- 8. Unit Type Master
CREATE TABLE IF NOT EXISTS public.unit_type_master (
    id   SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);
INSERT INTO public.unit_type_master (name) VALUES
    ('Apartment'), ('Studio'), ('Villa'), ('Townhouse'), ('Retail Unit'),
    ('Office Space'), ('Warehouse'), ('Shop'), ('Other')
ON CONFLICT (name) DO NOTHING;

-- 9. Unit Usage Master
CREATE TABLE IF NOT EXISTS public.unit_usage_master (
    id   SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);
INSERT INTO public.unit_usage_master (name) VALUES
    ('Residential'), ('Commercial'), ('Retail'), ('Office'), ('Storage'),
    ('Hospitality'), ('Parking'), ('Other')
ON CONFLICT (name) DO NOTHING;

-- 10. Bathroom Type / Layout Master
CREATE TABLE IF NOT EXISTS public.bathroom_type_master (
    id   SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);
INSERT INTO public.bathroom_type_master (name) VALUES
    ('Full Only'), ('Half Only'), ('Ensuite'), ('Shared')
ON CONFLICT (name) DO NOTHING;

-- 11. View Type Master
CREATE TABLE IF NOT EXISTS public.view_type_master (
    id   SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);
INSERT INTO public.view_type_master (name) VALUES
    ('Road View'), ('Sea View'), ('City View'), ('Garden View'),
    ('Pool View'), ('Internal View'), ('No Specific View'), ('Custom View')
ON CONFLICT (name) DO NOTHING;

-- 12. Furnishing Master
CREATE TABLE IF NOT EXISTS public.furnishing_master (
    id   SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);
INSERT INTO public.furnishing_master (name) VALUES
    ('Unfurnished'), ('Semi Furnished'), ('Fully Furnished'), ('Not Applicable')
ON CONFLICT (name) DO NOTHING;

-- 13. Unit Status Master
CREATE TABLE IF NOT EXISTS public.unit_status_master (
    id   SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);
INSERT INTO public.unit_status_master (name) VALUES
    ('Available'), ('Occupied'), ('Reserved'), ('Renewal Due'), ('Under Maintenance'),
    ('Blocked'), ('Expired'), ('Leased'), ('Sold')
ON CONFLICT (name) DO NOTHING;

-- 14. Lease Status Master
CREATE TABLE IF NOT EXISTS public.lease_status_master (
    id   SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);
INSERT INTO public.lease_status_master (name) VALUES
    ('Vacant'), ('Leased'), ('Renewal Due'), ('Notice Given'), ('Under Maintenance')
ON CONFLICT (name) DO NOTHING;

-- 15. Rent Frequency Master
CREATE TABLE IF NOT EXISTS public.rent_frequency_master (
    id   SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);
INSERT INTO public.rent_frequency_master (name) VALUES
    ('Monthly'), ('Quarterly'), ('Yearly'), ('One Time'), ('Half Yearly')
ON CONFLICT (name) DO NOTHING;

-- 16. Maintenance Responsibility Master
CREATE TABLE IF NOT EXISTS public.maintenance_responsibility_master (
    id   SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);
INSERT INTO public.maintenance_responsibility_master (name) VALUES
    ('Owner'), ('Tenant'), ('Property Manager'), ('Shared'), ('Not Applicable')
ON CONFLICT (name) DO NOTHING;

-- ------------------------------------------------------------
-- End of seed script
-- ------------------------------------------------------------