-- 20261105150000_procurement_items_catalog.sql
-- Item Master Catalog Table and Baseline Data

CREATE TABLE IF NOT EXISTS public.procurement_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Other',
  item_type TEXT NOT NULL DEFAULT 'maintenance_spare' CHECK (item_type IN ('asset', 'maintenance_spare', 'consumable', 'service')),
  budget_type TEXT NOT NULL DEFAULT 'OPEX' CHECK (budget_type IN ('CAPEX', 'OPEX')),
  budget_head TEXT NOT NULL DEFAULT 'Maintenance Items',
  unit_price NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
  unit_of_measure TEXT NOT NULL DEFAULT 'Nos',
  reorder_level NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (reorder_level >= 0),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_procurement_items_code ON public.procurement_items(item_code);
CREATE INDEX IF NOT EXISTS idx_procurement_items_category ON public.procurement_items(category);
CREATE INDEX IF NOT EXISTS idx_procurement_items_active ON public.procurement_items(active);

-- Enable RLS
ALTER TABLE public.procurement_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'procurement_items' AND policyname = 'procurement_items_all'
  ) THEN
    CREATE POLICY "procurement_items_all" ON public.procurement_items FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Seed baseline items from user catalog
INSERT INTO public.procurement_items (item_code, name, category, item_type, budget_type, budget_head, unit_price, unit_of_measure, reorder_level, active)
VALUES
  ('ITM-001', '12w panel lamp', 'Electrical', 'maintenance_spare', 'OPEX', 'Maintenance Items', 0, 'pcs', 10, true),
  ('ITM-002', '24w surface LED', 'Electrical', 'maintenance_spare', 'OPEX', 'Maintenance Items', 0, 'pcs', 10, true),
  ('ITM-003', '25mm PPr conceld', 'Plumbing', 'maintenance_spare', 'OPEX', 'Maintenance Items', 0, 'pcs', 10, true),
  ('ITM-004', '2F tube rod', 'Electrical', 'maintenance_spare', 'OPEX', 'Maintenance Items', 0, 'pcs', 10, true),
  ('ITM-005', '2g switch', 'Electrical', 'maintenance_spare', 'OPEX', 'Maintenance Items', 0, 'pcs', 10, true),
  ('ITM-006', '2w panel lamp', 'Electrical', 'maintenance_spare', 'OPEX', 'Maintenance Items', 0, 'pcs', 10, true),
  ('ITM-007', '2x1.5 brush', 'Civil Work', 'maintenance_spare', 'OPEX', 'Maintenance Items', 0, 'pcs', 10, true),
  ('ITM-008', '3/c 2.5mm', 'Electrical', 'maintenance_spare', 'OPEX', 'Maintenance Items', 0, 'pcs', 10, true),
  ('MNT-HVAC-FLTR-001', 'AC Air Filter 24x24', 'HVAC', 'maintenance_spare', 'OPEX', 'Maintenance Items', 45, 'Nos', 20, true),
  ('MNT-HVAC-CAP-001', 'AC Capacitor 45+5 MFD', 'HVAC', 'maintenance_spare', 'OPEX', 'Maintenance Items', 65, 'Nos', 5, true),
  ('MNT-HVAC-DRN-001', 'AC Drain Hose', 'HVAC', 'maintenance_spare', 'OPEX', 'Maintenance Items', 15, 'Meter', 20, true),
  ('MNT-ELEC-LED-001', 'LED Bulb 12W', 'Electrical', 'consumable', 'OPEX', 'Maintenance Items', 18, 'Nos', 50, true),
  ('MNT-ELEC-MCB-001', 'MCB 20A Single Pole', 'Electrical', 'maintenance_spare', 'OPEX', 'Maintenance Items', 35, 'Nos', 10, true),
  ('MNT-PLB-HOSE-001', 'Flexible Water Hose 1/2 Inch', 'Plumbing', 'maintenance_spare', 'OPEX', 'Maintenance Items', 25, 'Nos', 10, true),
  ('MNT-PLB-VALVE-001', 'Angle Valve 1/2 Inch Heavy Duty', 'Plumbing', 'maintenance_spare', 'OPEX', 'Maintenance Items', 40, 'Nos', 10, true),
  ('MNT-CIVL-SIL-001', 'Silicone Sealant Waterproof', 'Civil Work', 'consumable', 'OPEX', 'Maintenance Items', 22, 'Tube', 15, true)
ON CONFLICT (item_code) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  item_type = EXCLUDED.item_type,
  budget_type = EXCLUDED.budget_type,
  budget_head = EXCLUDED.budget_head,
  unit_price = EXCLUDED.unit_price,
  unit_of_measure = EXCLUDED.unit_of_measure,
  reorder_level = EXCLUDED.reorder_level,
  active = EXCLUDED.active,
  updated_at = now();
