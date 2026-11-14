-- Browser-held client data moves to the database.
-- One table holds each record of the screens that used to keep their data only in the browser
-- (journals, AP, cashbook, bank accounts, PDC receipts, leasing and maintenance records, masters).
-- Records are JSON documents keyed by (store, id). Deletes are soft (deleted = true) so nothing is lost.

create table if not exists public.app_documents (
  store       text        not null,
  id          text        not null,
  data        jsonb       not null default '{}'::jsonb,
  deleted     boolean     not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  primary key (store, id)
);

create index if not exists app_documents_store_idx on public.app_documents (store) where deleted = false;

alter table public.app_documents enable row level security;

drop policy if exists "Staff can manage app documents" on public.app_documents;
create policy "Staff can manage app documents"
  on public.app_documents for all to authenticated
  using (true) with check (true);

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'app_documents') then
    alter publication supabase_realtime add table public.app_documents;
  end if;
end $$;
