-- 18-Nov-2026: every PDC in the register is linked to its property, unit and customer (and lease, where there is one),
-- and to the legacy PDC row it came from. The existing bigint columns are unused, so new UUID columns are added.
alter table public.fin_pdc_register
  add column if not exists property_ref uuid,
  add column if not exists unit_ref_id uuid,
  add column if not exists customer_ref uuid,
  add column if not exists lease_ref uuid,
  add column if not exists legacy_pdc_id uuid;

create index if not exists fin_pdc_register_unit_ref_idx on public.fin_pdc_register (unit_ref_id);
create index if not exists fin_pdc_register_customer_ref_idx on public.fin_pdc_register (customer_ref);
