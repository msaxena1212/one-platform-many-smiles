-- Immutable change log written by the /api/db server route.
-- Every update / upsert / delete (and insert) made through the API stores the affected rows here
-- BEFORE the change is applied, so any change can be reviewed and restored. Additive and idempotent.

CREATE TABLE IF NOT EXISTS public.api_change_log (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    timestamptz NOT NULL DEFAULT now(),
  actor_id      uuid,
  actor_email   text,
  op            text NOT NULL CHECK (op IN ('insert','update','upsert','delete','restore')),
  table_name    text NOT NULL,
  filters       jsonb,
  new_values    jsonb,
  before_rows   jsonb,
  row_count     integer NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS api_change_log_table_idx ON public.api_change_log (table_name, created_at DESC);
CREATE INDEX IF NOT EXISTS api_change_log_actor_idx ON public.api_change_log (actor_id, created_at DESC);

ALTER TABLE public.api_change_log ENABLE ROW LEVEL SECURITY;

-- Anyone who can call the API may append; only signed-in users may read. No UPDATE / DELETE policies
-- exist, so the log cannot be altered or erased through the API or the browser client.
DROP POLICY IF EXISTS api_change_log_insert ON public.api_change_log;
CREATE POLICY api_change_log_insert ON public.api_change_log
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS api_change_log_select ON public.api_change_log;
CREATE POLICY api_change_log_select ON public.api_change_log
  FOR SELECT TO authenticated USING (true);

REVOKE UPDATE, DELETE, TRUNCATE ON public.api_change_log FROM anon, authenticated;
