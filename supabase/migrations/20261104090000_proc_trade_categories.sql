-- Admin-managed trade categories for the procurement Item Catalog.
CREATE TABLE IF NOT EXISTS public.proc_trade_categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  sort_order INT  NOT NULL DEFAULT 0,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS proc_trade_categories_name_uq
  ON public.proc_trade_categories (LOWER(name));

ALTER TABLE public.proc_trade_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS proc_trade_categories_all ON public.proc_trade_categories;
CREATE POLICY proc_trade_categories_all ON public.proc_trade_categories
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

INSERT INTO public.proc_trade_categories (name, sort_order) VALUES
  ('HVAC',10),('HVAC Spare',20),('Electrical',30),('Plumbing',40),('Civil Works',50),
  ('Elevator',60),('Fire Safety',70),('CCTV / Security',80),('Landscaping',90),
  ('Furnishing',100),('IT Equipment',110),('Pool Equipment',120),
  ('Cleaning Supplies',130),('Staff',140),('Other',150)
ON CONFLICT DO NOTHING;
