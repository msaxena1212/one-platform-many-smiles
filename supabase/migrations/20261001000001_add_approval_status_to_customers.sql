-- Migration: Add approval_status column to customers table
-- The column exists in the TypeScript type definition and import adapter
-- but was never included in any CREATE TABLE migration for customers.

ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS approval_status TEXT
    CHECK (approval_status IN ('Pending', 'Approved', 'Rejected', 'Under Review'))
    DEFAULT 'Approved';

-- Backfill existing rows
UPDATE public.customers
SET approval_status = 'Approved'
WHERE approval_status IS NULL;
