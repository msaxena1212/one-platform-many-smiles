-- 20261105160000_pms_app_state.sql
-- Universal persistent state table in Supabase PostgreSQL
-- Eliminates client localStorage data loss across all devices and browsers.

CREATE TABLE IF NOT EXISTS public.pms_app_state (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookup by key
CREATE INDEX IF NOT EXISTS idx_pms_app_state_id ON public.pms_app_state(id);

-- Enable RLS with open access policy for authenticated and anon roles
ALTER TABLE public.pms_app_state ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'pms_app_state' AND policyname = 'pms_app_state_all'
  ) THEN
    CREATE POLICY "pms_app_state_all" ON public.pms_app_state FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

