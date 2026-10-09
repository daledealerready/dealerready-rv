-- Lets approved dealers add inventory, and lets shoppers search it.
-- Run once in Supabase SQL Editor.

create or replace function public.dealer_inventory_list(p_dealer_id uuid)
returns table (
  id uuid,
  year integer,
  manufacturer text,
  model text,
  floorplan text,
  condition text,
  price_cents integer,
  city text,
  state text,
  stock_number text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    i.id, i.year, i.manufacturer, i.model, i.floorplan, i.condition,
    i.price_cents, i.city, i.state, i.stock_number, i.created_at
  from public.dealer_inventory i
  where i.dealer_id = p_dealer_id
    and i.is_active = true
    and exists (
      select 1 from public.dealers d
      where d.id = p_dealer_id and d.status = 'approved'
    )
  order by i.created_at desc;
$$;

create or replace function public.dealer_inventory_add(
  p_dealer_id uuid,
  p_year integer,
  p_manufacturer text,
  p_model text,
  p_floorplan text,
  p_condition text,
  p_price_cents integer,
  p_city text,
  p_state text,
  p_stock_number text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  dealer_city text;
  dealer_state text;
begin
  select d.city, d.state into dealer_city, dealer_state
  from public.dealers d
  where d.id = p_dealer_id and d.status = 'approved';

  if not found then
    raise exception 'Unauthorized';
  end if;

  insert into public.dealer_inventory (
    dealer_id, year, manufacturer, model, floorplan, condition,
    price_cents, city, state, stock_number, is_active
  ) values (
    p_dealer_id,
    p_year,
    p_manufacturer,
    p_model,
    nullif(p_floorplan, ''),
    nullif(p_condition, ''),
    p_price_cents,
    coalesce(nullif(p_city, ''), dealer_city),
    coalesce(nullif(p_state, ''), dealer_state),
    nullif(p_stock_number, ''),
    true
  );
end;
$$;

create or replace function public.dealer_inventory_remove(
  p_dealer_id uuid,
  p_unit_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.dealers d
    where d.id = p_dealer_id and d.status = 'approved'
  ) then
    raise exception 'Unauthorized';
  end if;

  update public.dealer_inventory
  set is_active = false
  where id = p_unit_id
    and dealer_id = p_dealer_id;
end;
$$;

create or replace function public.search_dealer_inventory(
  p_year integer,
  p_manufacturer text,
  p_model text,
  p_floorplan text
)
returns table (
  id uuid,
  year integer,
  manufacturer text,
  model text,
  floorplan text,
  condition text,
  price_cents integer,
  city text,
  state text,
  stock_number text,
  dealer_name text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    i.id,
    i.year,
    i.manufacturer,
    i.model,
    i.floorplan,
    i.condition,
    i.price_cents,
    i.city,
    i.state,
    i.stock_number,
    coalesce(nullif(d.dba, ''), d.legal_business_name, 'Participating dealer')
  from public.dealer_inventory i
  join public.dealers d on d.id = i.dealer_id
  where i.is_active = true
    and d.status = 'approved'
    and (p_year is null or i.year is null or i.year = p_year)
    and (p_manufacturer is null or p_manufacturer = '' or i.manufacturer ilike '%' || p_manufacturer || '%')
    and (p_model is null or p_model = '' or i.model ilike '%' || p_model || '%')
    and (
      p_floorplan is null
      or p_floorplan = ''
      or replace(coalesce(i.floorplan, ''), ' ', '') ilike '%' || replace(coalesce(p_floorplan, ''), ' ', '') || '%'
    )
  order by i.created_at desc
  limit 50;
$$;

revoke all on function public.dealer_inventory_list(uuid) from public;
grant execute on function public.dealer_inventory_list(uuid) to anon, authenticated;

revoke all on function public.dealer_inventory_add(uuid, integer, text, text, text, text, integer, text, text, text) from public;
grant execute on function public.dealer_inventory_add(uuid, integer, text, text, text, text, integer, text, text, text) to anon, authenticated;

revoke all on function public.dealer_inventory_remove(uuid, uuid) from public;
grant execute on function public.dealer_inventory_remove(uuid, uuid) to anon, authenticated;

revoke all on function public.search_dealer_inventory(integer, text, text, text) from public;
grant execute on function public.search_dealer_inventory(integer, text, text, text) to anon, authenticated;
