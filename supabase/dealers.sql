-- DealerReady RV dealer applications
-- Run once in Supabase SQL Editor

create table if not exists public.dealers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'pending',
  legal_business_name text not null,
  dba text,
  website text,
  address text,
  city text,
  state text,
  zip text,
  phone text not null,
  primary_contact text not null,
  email text not null,
  locations_count text,
  rv_categories text[] default '{}',
  brands_carried text,
  inventory_type text,
  typical_price_range text,
  states_served text,
  notes text,
  application jsonb not null default '{}'::jsonb
);

create index if not exists dealers_created_at_idx on public.dealers (created_at desc);
create index if not exists dealers_status_idx on public.dealers (status);
create index if not exists dealers_email_idx on public.dealers (email);

alter table public.dealers enable row level security;

drop policy if exists "Allow public dealer inserts" on public.dealers;
create policy "Allow public dealer inserts"
  on public.dealers
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "No public dealer reads" on public.dealers;
create policy "No public dealer reads"
  on public.dealers
  for select
  to anon
  using (false);

create table if not exists public.app_settings (
  key text primary key,
  value text not null
);

insert into public.app_settings (key, value)
values ('admin_password', 'DealerReady2026')
on conflict (key) do update set value = excluded.value;

create or replace function public.admin_list_dealers(p_password text)
returns setof public.dealers
language plpgsql
security definer
set search_path = public
as $$
declare
  expected text;
begin
  select s.value into expected
  from public.app_settings s
  where s.key = 'admin_password';

  if expected is null or p_password is distinct from expected then
    raise exception 'Unauthorized';
  end if;

  return query
  select d.*
  from public.dealers d
  order by d.created_at desc
  limit 200;
end;
$$;

revoke all on function public.admin_list_dealers(text) from public;
grant execute on function public.admin_list_dealers(text) to anon, authenticated;

create or replace function public.admin_update_dealer_status(
  p_password text,
  p_dealer_id uuid,
  p_status text
)
returns public.dealers
language plpgsql
security definer
set search_path = public
as $$
declare
  expected text;
  updated public.dealers;
begin
  select s.value into expected
  from public.app_settings s
  where s.key = 'admin_password';

  if expected is null or p_password is distinct from expected then
    raise exception 'Unauthorized';
  end if;

  if p_status not in ('pending', 'approved', 'suspended', 'rejected') then
    raise exception 'Invalid status';
  end if;

  update public.dealers
  set status = p_status,
      updated_at = now()
  where id = p_dealer_id
  returning * into updated;

  if updated.id is null then
    raise exception 'Dealer not found';
  end if;

  return updated;
end;
$$;

revoke all on function public.admin_update_dealer_status(text, uuid, text) from public;
grant execute on function public.admin_update_dealer_status(text, uuid, text) to anon, authenticated;
