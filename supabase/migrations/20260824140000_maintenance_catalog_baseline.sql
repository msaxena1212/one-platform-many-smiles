-- Baseline maintenance procurement catalog.
-- These are stockable maintenance spares/consumables used by Maintenance Management.
-- They remain ordinary Procurement Items and feed inventory_parts on accepted GRN.

INSERT INTO public.procurement_items (item_code, name, category, item_type, unit_of_measure, reorder_level, active)
VALUES
  ('MNT-HVAC-FLTR-001', 'AC Air Filter 24x24', 'HVAC', 'maintenance_spare', 'Nos', 20, true),
  ('MNT-HVAC-CAP-001', 'AC Capacitor 45+5 MFD', 'HVAC', 'maintenance_spare', 'Nos', 5, true),
  ('MNT-HVAC-DRN-001', 'AC Drain Hose', 'HVAC', 'maintenance_spare', 'Meter', 20, true),
  ('MNT-HVAC-BELT-001', 'AHU / FCU Fan Belt', 'HVAC', 'maintenance_spare', 'Nos', 10, true),
  ('MNT-ELEC-LED-001', 'LED Bulb 12W', 'Electrical', 'consumable', 'Nos', 50, true),
  ('MNT-ELEC-MCB-001', 'MCB 20A Single Pole', 'Electrical', 'maintenance_spare', 'Nos', 10, true),
  ('MNT-ELEC-CONT-001', 'Contactor 25A', 'Electrical', 'maintenance_spare', 'Nos', 5, true),
  ('MNT-ELEC-BATT-001', 'AA Battery', 'Electrical', 'consumable', 'Pack', 20, true),
  ('MNT-PLB-HOSE-001', 'Flexible Water Hose', 'Plumbing', 'maintenance_spare', 'Nos', 10, true),
  ('MNT-PLB-VALVE-001', 'Angle Valve 1/2 Inch', 'Plumbing', 'maintenance_spare', 'Nos', 10, true),
  ('MNT-PLB-SEAL-001', 'PTFE Thread Seal Tape', 'Plumbing', 'consumable', 'Roll', 25, true),
  ('MNT-PLB-WASH-001', 'Rubber Washer Assortment', 'Plumbing', 'consumable', 'Pack', 10, true),
  ('MNT-CIVL-SIL-001', 'Silicone Sealant', 'Civil / General', 'consumable', 'Tube', 15, true),
  ('MNT-CIVL-CEM-001', 'Repair Cement', 'Civil / General', 'consumable', 'Bag', 5, true),
  ('MNT-CIVL-PAINT-001', 'Touch-up Paint', 'Civil / General', 'consumable', 'Can', 10, true),
  ('MNT-FIRE-HOSE-001', 'Fire Hose 1.5 Inch', 'Fire & Safety', 'maintenance_spare', 'Nos', 4, true),
  ('MNT-FIRE-EXT-001', 'Fire Extinguisher Refill', 'Fire & Safety', 'consumable', 'Service', 10, true),
  ('MNT-GEN-LUBE-001', 'Multipurpose Lubricant', 'General Maintenance', 'consumable', 'Can', 10, true),
  ('MNT-GEN-SCREW-001', 'Maintenance Screw & Fastener Kit', 'General Maintenance', 'consumable', 'Pack', 10, true),
  ('MNT-GEN-GLOVE-001', 'Maintenance Safety Gloves', 'General Maintenance', 'consumable', 'Pair', 25, true)
ON CONFLICT (item_code) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  item_type = EXCLUDED.item_type,
  unit_of_measure = EXCLUDED.unit_of_measure,
  reorder_level = EXCLUDED.reorder_level,
  active = EXCLUDED.active,
  updated_at = now();
