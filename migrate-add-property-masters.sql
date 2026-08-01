-- ------------------------------------------------------------
-- Migration: Add master tables and extended columns to public.properties
-- ------------------------------------------------------------
-- Up migration -------------------------------------------------
BEGIN;

-- 1. Master lookup tables -------------------------------------

-- Property Type Master
CREATE TABLE IF NOT EXISTS public.property_type_master (
    id   SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- Property Category Master
CREATE TABLE IF NOT EXISTS public.property_category_master (
    id   SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- Ownership Type Master
CREATE TABLE IF NOT EXISTS public.ownership_type_master (
    id   SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- Country Master
CREATE TABLE IF NOT EXISTS public.country_master (
    id   SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- City Master (linked toCountry)
CREATE TABLE IF NOT EXISTS public.city_master (
    id           SERIAL PRIMARY KEY,
    name         TEXT NOT NULL,
    country_id   INT NOT NULL REFERENCES public.country_master(id) ON DELETE CASCADE,
    UNIQUE(name, country_id)
);

-- Area / Zone Master
CREATE TABLE IF NOT EXISTS public.area_zone_master (
    id   SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- Street / Building Name Master
CREATE TABLE IF NOT EXISTS public.street_building_name_master (
    id            SERIAL PRIMARY KEY,
    street_name   TEXT NOT NULL,
    zone_id       INT REFERENCES public.area_zone_master(id) ON DELETE SET NULL,
    UNIQUE(street_name, zone_id)
);

-- Plot / Building No. Master
CREATE TABLE IF NOT EXISTS public.plot_building_no_master (
    id                 SERIAL PRIMARY KEY,
    plot_number      TEXT NOT NULL,
    building_no      TEXT,
    street_id        INT REFERENCES public.street_building_name_master(id) ON DELETE SET NULL
);

-- Title Deed / Registration No. Master
CREATE TABLE IF NOT EXISTS public.title_deed_master (
    id                 SERIAL PRIMARY KEY,
    deed_number      TEXT NOT NULL UNIQUE,
    property_id      INT REFERENCES public.properties(id) ON DELETE CASCADE
);

-- Municipality / Building Ref No. Master
CREATE TABLE IF NOT EXISTS public.municipality_building_ref_master (
    id               SERIAL PRIMARY KEY,
    ref_number       TEXT NOT NULL,
    building_id      INT REFERENCES public.plot_building_no_master(id) ON DELETE SET NULL
);

-- Owner / Landlord Master (users who own the property)
CREATE TABLE IF NOT EXISTS public.owner_landlord_master (
    id                 SERIAL PRIMARY KEY,
    owner_name       TEXT NOT NULL,
    contact_email    TEXT,
    contact_phone    TEXT,
    UNIQUE(owner_name)
);

-- Property Manager Master
CREATE TABLE IF NOT EXISTS public.property_manager_master (
    id                 SERIAL PRIMARY KEY,
    manager_name     TEXT NOT NULL,
    contact_email    TEXT,
    contact_phone    TEXT,
    UNIQUE(manager_name)
);

-- -- Additional lookup masters (expand as needed)
-- (the above covers the core requested masters)

-- 2. Extend public.properties with new columns ---------------

ALTER TABLE public.properties
    ADD COLUMN IF NOT EXISTS property_code          TEXT,
    ADD COLUMN IF NOT EXISTS property_name          TEXT,
    ADD COLUMN IF NOT EXISTS cost_center_code       TEXT,
    ADD COLUMN IF NOT EXISTS cost_center_name       TEXT,
    ADD COLUMN IF NOT EXISTS property_type_id       INT REFERENCES public.property_type_master(id),
    ADD COLUMN IF NOT EXISTS property_category_id   INT REFERENCES public.property_category_master(id),
    ADD COLUMN IF NOT EXISTS ownership_type_id      INT REFERENCES public.ownership_type_master(id),
    ADD COLUMN IF NOT EXISTS country_id             INT REFERENCES public.country_master(id),
    ADD COLUMN IF NOT EXISTS city_id                INT REFERENCES public.city_master(id),
    ADD COLUMN IF NOT EXISTS area_zone_id           INT REFERENCES public.area_zone_master(id),
    ADD COLUMN IF NOT EXISTS street_building_name_id INT REFERENCES public.street_building_name_master(id),
    ADD COLUMN IF NOT EXISTS plot_building_no_id    INT REFERENCES public.plot_building_no_master(id),
    ADD COLUMN IF NOT EXISTS title_deed_id          INT REFERENCES public.title_deed_master(id),
    ADD COLUMN IF NOT EXISTS municipality_ref_id    INT REFERENCES public.municipality_building_ref_master(id),
    ADD COLUMN IF NOT EXISTS owner_landlord_id      INT REFERENCES public.owner_landlord_master(id),
    ADD COLUMN IF NOT EXISTS property_manager_id    INT REFERENCES public.property_manager_master(id),
    ADD COLUMN IF NOT EXISTS no_of_floors           INT,
    ADD COLUMN IF NOT EXISTS no_of_units            INT,
    ADD COLUMN IF NOT EXISTS total_built_up_area_sqm NUMERIC,
    ADD COLUMN IF NOT EXISTS common_area_sqm        NUMERIC,
    ADD COLUMN IF NOT EXISTS parking_count          INT,
    ADD COLUMN IF NOT EXISTS no_of_elevators        INT,
    ADD COLUMN IF NOT EXISTS amenity_facility_1     TEXT,
    ADD COLUMN IF NOT EXISTS amenity_facility_2     TEXT,
    ADD COLUMN IF NOT EXISTS amenity_facility_3     TEXT,
    ADD COLUMN IF NOT EXISTS amenity_facility_4     TEXT,
    ADD COLUMN IF NOT EXISTS amenity_facility_5     TEXT,
    ADD COLUMN IF NOT EXISTS other_amenities        TEXT,
    ADD COLUMN IF NOT EXISTS completion_date        DATE,
    ADD COLUMN IF NOT EXISTS handover_date          DATE,
    ADD COLUMN IF NOT EXISTS property_status        TEXT,
    ADD COLUMN IF NOT EXISTS documents_received     BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS remarks              TEXT;

-- 3. Create indexes for faster lookups (optional) ------------
CREATE INDEX IF NOT EXISTS idx_properties_property_type_id   ON public.properties(property_type_id);
CREATE INDEX IF NOT EXISTS idx_properties_property_category_id ON public.properties(property_category_id);
CREATE INDEX IF NOT EXISTS idx_properties_country_id           ON public.properties(country_id);
CREATE INDEX IF NOT EXISTS idx_properties_city_id              ON public.properties(city_id);

-- 4. Populate master tables with initial static data (example) --
INSERT INTO public.property_type_master (name) VALUES
    ('Residential'), ('Commercial'), ('Industrial'), ('Mixed-Use')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.property_category_master (name) VALUES
    ('Apartment'), ('Villa'), ('Office Space'), ('Warehouse'), ('Retail')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.ownership_type_master (name) VALUES
    ('Freehold'), ('Leasehold'), ('Co‑ownership')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.country_master (name) VALUES
    ('Qatar'), ('United Arab Emirates'), ('Saudi Arabia')
ON CONFLICT (name) DO NOTHING;

-- For demonstration, insert a default country "Qatar" if not present
INSERT INTO public.country_master (name) VALUES ('Qatar')
ON CONFLICT (name) DO NOTHING;

-- Example city entry (Doha) linked to Qatar
INSERT INTO public.city_master (name, country_id)
SELECT 'Doha', id FROM public.country_master WHERE name = 'Qatar'
ON CONFLICT (name, country_id) DO NOTHING;

-- You can add more static entries for area_zone, street_building_name, etc. as needed.

COMMIT;
-- ------------------------------------------------------------
-- Down migration (drop added columns & masters if you ever roll back)
-- ------------------------------------------------------------
-- NOTE: Review down statements carefully before executing in production.
-- ------------------------------------------------------------
BEGIN;

-- Drop data inserted in up migration (order matters)
DELETE FROM public.properties WHERE id IN (
    SELECT id FROM public.properties WHERE property_type_id IS NOT NULL
    -- Add any specific cleanup you need here
);

-- Drop the new master tables (ensure they are not depended on)
DROP TABLE IF EXISTS public.other_amenities; -- placeholder if you added any
DROP TABLE IF EXISTS public.property_manager_master;
DROP TABLE IF EXISTS public.owner_landlord_master;
DROP TABLE IF EXISTS public.title_deed_master;
DROP TABLE IF EXISTS public.municipality_building_ref_master;
DROP TABLE IF EXISTS public.plot_building_no_master;
DROP TABLE IF EXISTS public.street_building_name_master;
DROP TABLE IF EXISTS public.area_zone_master;
DROP TABLE IF EXISTS public.city_master;
DROP TABLE IF EXISTS public.country_master;
DROP TABLE IF EXISTS public.ownership_type_master;
DROP TABLE IF EXISTS public.property_category_master;
DROP TABLE IF EXISTS public.property_type_master;

-- Drop the newly added columns from public.properties
ALTER TABLE public.properties
    DROP COLUMN IF EXISTS property_code,
    DROP COLUMN IF EXISTS property_name,
    DROP COLUMN IF EXISTS cost_center_code,
    DROP COLUMN IF EXISTS cost_center_name,
    DROP COLUMN IF EXISTS property_type_id,
    DROP COLUMN IF EXISTS property_category_id,
    DROP COLUMN IF EXISTS ownership_type_id,
    DROP COLUMN IF EXISTS country_id,
    DROP COLUMN IF EXISTS city_id,
    DROP COLUMN IF EXISTS area_zone_id,
    DROP COLUMN IF EXISTS street_building_name_id,
    DROP COLUMN IF EXISTS plot_building_no_id,
    DROP COLUMN IF EXISTS title_deed_id,
    DROP COLUMN IF EXISTS municipality_ref_id,
    DROP COLUMN IF EXISTS owner_landlord_id,
    DROP COLUMN IF EXISTS property_manager_id,
    DROP COLUMN IF EXISTS no_of_floors,
    DROP COLUMN IF EXISTS no_of_units,
    DROP COLUMN IF EXISTS total_built_up_area_sqm,
    DROP COLUMN IF EXISTS common_area_sqm,
    DROP COLUMN IF EXISTS parking_count,
    DROP COLUMN IF EXISTS no_of_elevators,
    DROP COLUMN IF EXISTS amenity_facility_1,
    DROP COLUMN IF EXISTS amenity_facility_2,
    DROP COLUMN IF EXISTS amenity_facility_3,
    DROP COLUMN IF EXISTS amenity_facility_4,
    DROP COLUMN IF EXISTS amenity_facility_5,
    DROP COLUMN IF EXISTS other_amenities,
    DROP COLUMN IF EXISTS completion_date,
    DROP COLUMN IF EXISTS handover_date,
    DROP COLUMN IF EXISTS property_status,
    DROP COLUMN IF EXISTS documents_received,
    DROP COLUMN IF EXISTS remarks;

DROP INDEX IF EXISTS idx_properties_property_type_id;
DROP INDEX IF EXISTS idx_properties_property_category_id;
DROP INDEX IF EXISTS idx_properties_country_id;
DROP INDEX IF EXISTS idx_properties_city_id;

COMMIT;