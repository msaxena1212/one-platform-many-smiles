-- Migration: Add all missing KYC/profile columns to the customers table
-- These fields are defined in the TypeScript Customer type and Excel import adapter
-- but were never included in the original CREATE TABLE migration.

ALTER TABLE public.customers
  -- Core / shared fields
  ADD COLUMN IF NOT EXISTS display_name            TEXT,
  ADD COLUMN IF NOT EXISTS primary_mobile          TEXT,
  ADD COLUMN IF NOT EXISTS primary_email           TEXT,
  ADD COLUMN IF NOT EXISTS current_address         TEXT,
  ADD COLUMN IF NOT EXISTS preferred_communication TEXT
    CHECK (preferred_communication IN ('WhatsApp', 'Email', 'SMS', 'Phone Call')),
  ADD COLUMN IF NOT EXISTS customer_status         TEXT
    CHECK (customer_status IN ('Active', 'Inactive', 'Blacklisted', 'Prospect'))
    DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS remarks                 TEXT,

  -- Individual fields
  ADD COLUMN IF NOT EXISTS first_name              TEXT,
  ADD COLUMN IF NOT EXISTS middle_name             TEXT,
  ADD COLUMN IF NOT EXISTS last_name               TEXT,
  ADD COLUMN IF NOT EXISTS qid_expiry_date         DATE,
  ADD COLUMN IF NOT EXISTS passport_expiry_date    DATE,
  ADD COLUMN IF NOT EXISTS date_of_birth           DATE,
  ADD COLUMN IF NOT EXISTS gender                  TEXT
    CHECK (gender IN ('Male', 'Female', 'Other')),

  -- Company fields
  ADD COLUMN IF NOT EXISTS company_legal_name         TEXT,
  ADD COLUMN IF NOT EXISTS trade_name                 TEXT,
  ADD COLUMN IF NOT EXISTS cr_expiry_date             DATE,
  ADD COLUMN IF NOT EXISTS trade_licence_no           TEXT,
  ADD COLUMN IF NOT EXISTS trade_licence_expiry_date  DATE,
  ADD COLUMN IF NOT EXISTS computer_card_no           TEXT,
  ADD COLUMN IF NOT EXISTS computer_card_expiry_date  DATE,
  ADD COLUMN IF NOT EXISTS tax_identification_no      TEXT,
  ADD COLUMN IF NOT EXISTS registered_office_address  TEXT,
  ADD COLUMN IF NOT EXISTS billing_address            TEXT,
  ADD COLUMN IF NOT EXISTS company_telephone          TEXT,
  ADD COLUMN IF NOT EXISTS website                    TEXT,
  ADD COLUMN IF NOT EXISTS industry_activity          TEXT,
  ADD COLUMN IF NOT EXISTS signatory_qid_passport     TEXT,
  ADD COLUMN IF NOT EXISTS signatory_id_expiry_date   DATE,
  ADD COLUMN IF NOT EXISTS primary_contact_person     TEXT,
  ADD COLUMN IF NOT EXISTS contact_designation        TEXT,
  ADD COLUMN IF NOT EXISTS contact_mobile             TEXT,
  ADD COLUMN IF NOT EXISTS contact_email              TEXT;

-- Backfill: sync display_name from full_name for existing rows
UPDATE public.customers
SET display_name   = full_name,
    customer_status = COALESCE(customer_status, 'Active')
WHERE display_name IS NULL;
