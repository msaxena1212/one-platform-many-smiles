-- Rent-free (free period) fields on leases so contract edits persist and propagate everywhere.
-- No defaults on purpose: NULL means "never saved", so the loader can fall back to imported data.
ALTER TABLE public.leases
  ADD COLUMN IF NOT EXISTS has_rent_free         BOOLEAN,
  ADD COLUMN IF NOT EXISTS rent_free_period_days INT,
  ADD COLUMN IF NOT EXISTS rent_free_position    TEXT;
