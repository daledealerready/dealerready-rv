-- Paid header event ads
-- Run once in Supabase SQL Editor

create table if not exists public.header_ads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  dealer_id uuid not null references public.dealers(id) on delete cascade,
  message text not null,
  starts_on date not null,
  ends_on date not null,
  price_cents integer not null,
  status text not null default 'pending',
  stripe_session_id text unique
);

create index if not exists header_ads_window_idx
  on public.header_ads (status, starts_on, ends_on);

alter table public.header_ads enable row level security;

drop policy if exists "No public header ad reads" on public.header_ads;
create policy "No public header ad reads"
  on public.header_ads for select to anon using (false);

create or replace function public.dealer_create_header_ad(
  p_dealer_id uuid,
  p_message text,
  p_starts_on date,
  p_ends_on date,
  p_price_cents integer,
  p_stripe_session_id text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  if not exists (
    select 1 from public.dealers d
    where d.id = p_dealer_id
      and d.status = 'approved'
      and d.membership_status = 'active'
  ) then
    raise exception 'Unauthorized';
  end if;

  if p_ends_on < p_starts_on then
    raise exception 'End date must be on or after the start date';
  end if;

  if length(trim(coalesce(p_message, ''))) < 3 then
    raise exception 'Message is too short';
  end if;

  insert into public.header_ads (
    dealer_id, message, starts_on, ends_on, price_cents, status, stripe_session_id
  ) values (
    p_dealer_id,
    left(trim(p_message), 140),
    p_starts_on,
    p_ends_on,
    p_price_cents,
    'pending',
    p_stripe_session_id
  )
  returning id into new_id;

  return new_id;
end;
$$;

create or replace function public.dealer_activate_header_ad(
  p_stripe_session_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.header_ads
  set status = 'active'
  where stripe_session_id = p_stripe_session_id
    and status = 'pending';
end;
$$;

drop function if exists public.dealer_list_header_ads(uuid);

create or replace function public.dealer_list_header_ads(p_dealer_id uuid)
returns table (
  id uuid,
  message text,
  starts_on date,
  ends_on date,
  price_cents integer,
  status text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    a.id, a.message, a.starts_on, a.ends_on, a.price_cents, a.status, a.created_at
  from public.header_ads a
  where a.dealer_id = p_dealer_id
    and exists (
      select 1 from public.dealers d
      where d.id = p_dealer_id and d.status = 'approved'
    )
  order by a.created_at desc;
$$;

drop function if exists public.public_active_header_ads();

create or replace function public.public_active_header_ads()
returns table (
  id uuid,
  message text,
  dealer_name text,
  starts_on date,
  ends_on date
)
language sql
stable
security definer
set search_path = public
as $$
  select
    a.id,
    a.message,
    coalesce(nullif(d.dba, ''), d.legal_business_name, 'Dealer'),
    a.starts_on,
    a.ends_on
  from public.header_ads a
  join public.dealers d on d.id = a.dealer_id
  where a.status = 'active'
    and a.starts_on <= current_date
    and a.ends_on >= current_date
  order by a.created_at desc;
$$;

revoke all on function public.dealer_create_header_ad(uuid, text, date, date, integer, text) from public;
grant execute on function public.dealer_create_header_ad(uuid, text, date, date, integer, text) to anon, authenticated;

revoke all on function public.dealer_activate_header_ad(text) from public;
grant execute on function public.dealer_activate_header_ad(text) to anon, authenticated;

revoke all on function public.dealer_list_header_ads(uuid) from public;
grant execute on function public.dealer_list_header_ads(uuid) to anon, authenticated;

revoke all on function public.public_active_header_ads() from public;
grant execute on function public.public_active_header_ads() to anon, authenticated;
