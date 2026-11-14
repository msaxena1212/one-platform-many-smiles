-- Finance write-through: receivable invoices become a real table (they lived only in browser storage),
-- and the voucher tables are published to Supabase Realtime so every screen and session sees new entries at once.

create table if not exists public.fin_receivable_invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_no text not null unique,
  invoice_date date,
  billing_period text,
  property_name text,
  unit_ref text,
  tenant_name text,
  lease_id text,
  stream text,
  account_code text,
  amount numeric(14,2) not null default 0,
  status text not null default 'Pending',
  -- Full invoice object as the app holds it, so nothing is lost in the round trip.
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists fin_receivable_invoices_unit_period_idx
  on public.fin_receivable_invoices (unit_ref, billing_period);

alter table public.fin_receivable_invoices enable row level security;

drop policy if exists "Staff can manage receivable invoices" on public.fin_receivable_invoices;
create policy "Staff can manage receivable invoices"
  on public.fin_receivable_invoices for all to authenticated
  using (true) with check (true);

-- Realtime: publish the voucher tables and receivable invoices.
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'fin_vouchers') then
    alter publication supabase_realtime add table public.fin_vouchers;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'fin_voucher_lines') then
    alter publication supabase_realtime add table public.fin_voucher_lines;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'fin_receivable_invoices') then
    alter publication supabase_realtime add table public.fin_receivable_invoices;
  end if;
end $$;
