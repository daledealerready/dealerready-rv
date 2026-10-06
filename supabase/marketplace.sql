-- Marketplace + pilot lead unlock
-- Run once in Supabase SQL Editor

create table if not exists public.lead_purchases (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  dealer_id uuid not null references public.dealers(id) on delete cascade,
  buyer_id uuid not null references public.buyer_profiles(id) on delete cascade,
  buyer_code text not null,
  price_cents integer not null default 0,
  payment_status text not null default 'pilot_unlock',
  unique (dealer_id, buyer_id)
);

create index if not exists lead_purchases_dealer_idx
  on public.lead_purchases (dealer_id, created_at desc);

alter table public.lead_purchases enable row level security;

drop policy if exists "No public lead purchase reads" on public.lead_purchases;
create policy "No public lead purchase reads"
  on public.lead_purchases for select to anon using (false);

drop policy if exists "No public lead purchase inserts" on public.lead_purchases;
create policy "No public lead purchase inserts"
  on public.lead_purchases for insert to anon with check (false);

create or replace function public.dealer_is_approved(p_dealer_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.dealers d
    where d.id = p_dealer_id
      and d.status = 'approved'
  );
$$;

create or replace function public.dealer_marketplace_list(p_dealer_id uuid)
returns table (
  buyer_id uuid,
  buyer_code text,
  created_at timestamptz,
  score integer,
  category text,
  purchase_timeline text,
  rv_types text[],
  condition text,
  preferred_manufacturer text,
  min_price text,
  max_price text,
  down_payment text,
  has_trade text,
  credit_range text,
  income_range text,
  travel_distance text,
  preferred_contact text,
  zip text,
  purchase_count integer
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.dealer_is_approved(p_dealer_id) then
    raise exception 'Unauthorized';
  end if;

  return query
  select
    b.id,
    b.buyer_code,
    b.created_at,
    b.score,
    b.category,
    b.purchase_timeline,
    b.rv_types,
    b.condition,
    b.preferred_manufacturer,
    b.min_price,
    b.max_price,
    b.down_payment,
    b.has_trade,
    b.credit_range,
    b.income_range,
    b.travel_distance,
    b.preferred_contact,
    b.zip,
    coalesce((
      select count(*)::integer
      from public.lead_purchases lp
      where lp.buyer_id = b.id
    ), 0) as purchase_count
  from public.buyer_profiles b
  where b.score >= 70
    and b.category in ('Qualified Buyer', 'Dealer Ready', 'Premier Buyer')
    and not exists (
      select 1
      from public.lead_purchases lp
      where lp.dealer_id = p_dealer_id
        and lp.buyer_id = b.id
    )
    and coalesce((
      select count(*)::integer
      from public.lead_purchases lp
      where lp.buyer_id = b.id
    ), 0) < 3
  order by b.score desc, b.created_at desc
  limit 200;
end;
$$;

revoke all on function public.dealer_marketplace_list(uuid) from public;
grant execute on function public.dealer_marketplace_list(uuid) to anon, authenticated;

create or replace function public.dealer_purchase_lead(
  p_dealer_id uuid,
  p_buyer_id uuid,
  p_price_cents integer
)
returns table (
  purchase_id uuid,
  buyer_id uuid,
  buyer_code text,
  first_name text,
  last_name text,
  email text,
  mobile text,
  zip text,
  preferred_contact text,
  score integer,
  category text,
  purchase_timeline text,
  rv_types text[],
  condition text,
  preferred_manufacturer text,
  min_price text,
  max_price text,
  down_payment text,
  has_trade text,
  credit_range text,
  income_range text,
  travel_distance text,
  profile jsonb,
  price_cents integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  buyer public.buyer_profiles;
  existing_count integer;
  new_purchase public.lead_purchases;
begin
  if not public.dealer_is_approved(p_dealer_id) then
    raise exception 'Unauthorized';
  end if;

  select * into buyer
  from public.buyer_profiles b
  where b.id = p_buyer_id;

  if buyer.id is null then
    raise exception 'Lead not found';
  end if;

  if buyer.score < 70
     or buyer.category not in ('Qualified Buyer', 'Dealer Ready', 'Premier Buyer') then
    raise exception 'Lead is not available for purchase';
  end if;

  if exists (
    select 1 from public.lead_purchases lp
    where lp.dealer_id = p_dealer_id and lp.buyer_id = p_buyer_id
  ) then
    raise exception 'Lead already purchased';
  end if;

  select count(*)::integer into existing_count
  from public.lead_purchases lp
  where lp.buyer_id = p_buyer_id;

  if existing_count >= 3 then
    raise exception 'Lead is no longer available';
  end if;

  insert into public.lead_purchases (
    dealer_id,
    buyer_id,
    buyer_code,
    price_cents,
    payment_status
  )
  values (
    p_dealer_id,
    buyer.id,
    buyer.buyer_code,
    greatest(p_price_cents, 0),
    'pilot_unlock'
  )
  returning * into new_purchase;

  return query
  select
    new_purchase.id,
    buyer.id,
    buyer.buyer_code,
    buyer.first_name,
    buyer.last_name,
    buyer.email,
    buyer.mobile,
    buyer.zip,
    buyer.preferred_contact,
    buyer.score,
    buyer.category,
    buyer.purchase_timeline,
    buyer.rv_types,
    buyer.condition,
    buyer.preferred_manufacturer,
    buyer.min_price,
    buyer.max_price,
    buyer.down_payment,
    buyer.has_trade,
    buyer.credit_range,
    buyer.income_range,
    buyer.travel_distance,
    buyer.profile,
    new_purchase.price_cents;
end;
$$;

revoke all on function public.dealer_purchase_lead(uuid, uuid, integer) from public;
grant execute on function public.dealer_purchase_lead(uuid, uuid, integer) to anon, authenticated;

create or replace function public.dealer_purchased_leads(p_dealer_id uuid)
returns table (
  purchase_id uuid,
  purchased_at timestamptz,
  price_cents integer,
  payment_status text,
  buyer_id uuid,
  buyer_code text,
  first_name text,
  last_name text,
  email text,
  mobile text,
  zip text,
  preferred_contact text,
  score integer,
  category text,
  purchase_timeline text,
  rv_types text[],
  condition text,
  preferred_manufacturer text,
  min_price text,
  max_price text,
  down_payment text,
  has_trade text,
  credit_range text,
  income_range text,
  travel_distance text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.dealer_is_approved(p_dealer_id) then
    raise exception 'Unauthorized';
  end if;

  return query
  select
    lp.id,
    lp.created_at,
    lp.price_cents,
    lp.payment_status,
    b.id,
    b.buyer_code,
    b.first_name,
    b.last_name,
    b.email,
    b.mobile,
    b.zip,
    b.preferred_contact,
    b.score,
    b.category,
    b.purchase_timeline,
    b.rv_types,
    b.condition,
    b.preferred_manufacturer,
    b.min_price,
    b.max_price,
    b.down_payment,
    b.has_trade,
    b.credit_range,
    b.income_range,
    b.travel_distance
  from public.lead_purchases lp
  join public.buyer_profiles b on b.id = lp.buyer_id
  where lp.dealer_id = p_dealer_id
  order by lp.created_at desc
  limit 200;
end;
$$;

revoke all on function public.dealer_purchased_leads(uuid) from public;
grant execute on function public.dealer_purchased_leads(uuid) to anon, authenticated;
