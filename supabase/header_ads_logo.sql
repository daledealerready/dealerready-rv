-- Add dealer logos to header ads
-- Run once in Supabase SQL Editor

alter table public.header_ads
  add column if not exists logo_url text;

drop function if exists public.dealer_create_header_ad(uuid, text, date, date, integer, text);
drop function if exists public.dealer_create_header_ad(uuid, text, date, date, integer, text, text);

create or replace function public.dealer_create_header_ad(
  p_dealer_id uuid,
  p_message text,
  p_starts_on date,
  p_ends_on date,
  p_price_cents integer,
  p_stripe_session_id text,
  p_logo text
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
    dealer_id, message, starts_on, ends_on, price_cents, status, stripe_session_id, logo_url
  ) values (
    p_dealer_id,
    left(trim(p_message), 140),
    p_starts_on,
    p_ends_on,
    p_price_cents,
    'pending',
    p_stripe_session_id,
    nullif(p_logo, '')
  )
  returning id into new_id;

  return new_id;
end;
$$;

create or replace function public.dealer_set_header_ad_logo(
  p_dealer_id uuid,
  p_ad_id uuid,
  p_logo text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.header_ads
  set logo_url = nullif(p_logo, '')
  where id = p_ad_id
    and dealer_id = p_dealer_id
    and status = 'active';

  if not found then
    raise exception 'Ad not found';
  end if;
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
  created_at timestamptz,
  logo_url text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    a.id, a.message, a.starts_on, a.ends_on, a.price_cents, a.status, a.created_at, a.logo_url
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
  ends_on date,
  logo_url text
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
    a.ends_on,
    a.logo_url
  from public.header_ads a
  join public.dealers d on d.id = a.dealer_id
  where a.status = 'active'
    and a.starts_on <= current_date
    and a.ends_on >= current_date
  order by a.created_at desc;
$$;

revoke all on function public.dealer_create_header_ad(uuid, text, date, date, integer, text, text) from public;
grant execute on function public.dealer_create_header_ad(uuid, text, date, date, integer, text, text) to anon, authenticated;

revoke all on function public.dealer_set_header_ad_logo(uuid, uuid, text) from public;
grant execute on function public.dealer_set_header_ad_logo(uuid, uuid, text) to anon, authenticated;

revoke all on function public.dealer_list_header_ads(uuid) from public;
grant execute on function public.dealer_list_header_ads(uuid) to anon, authenticated;

revoke all on function public.public_active_header_ads() from public;
grant execute on function public.public_active_header_ads() to anon, authenticated;
