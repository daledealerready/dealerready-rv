-- Stripe billing fields for dealers + pending lead checkouts
-- Run once in Supabase SQL Editor

alter table public.dealers
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists membership_status text not null default 'inactive',
  add column if not exists membership_current_period_end timestamptz;

create table if not exists public.pending_lead_checkouts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  dealer_id uuid not null references public.dealers(id) on delete cascade,
  buyer_id uuid not null references public.buyer_profiles(id) on delete cascade,
  price_cents integer not null,
  stripe_session_id text unique,
  status text not null default 'pending'
);

create index if not exists pending_lead_checkouts_dealer_idx
  on public.pending_lead_checkouts (dealer_id, created_at desc);

alter table public.pending_lead_checkouts enable row level security;

drop policy if exists "No public pending checkout reads" on public.pending_lead_checkouts;
create policy "No public pending checkout reads"
  on public.pending_lead_checkouts for select to anon using (false);

-- Postgres cannot change a function's return columns with CREATE OR REPLACE.
-- Drop the old dealer_session_lookup first, then recreate with billing fields.
drop function if exists public.dealer_session_lookup(uuid);

create or replace function public.dealer_session_lookup(
  p_dealer_id uuid
)
returns table (
  id uuid,
  legal_business_name text,
  dba text,
  email text,
  primary_contact text,
  status text,
  phone text,
  city text,
  state text,
  rv_categories text[],
  brands_carried text,
  inventory_type text,
  membership_status text,
  membership_current_period_end timestamptz,
  stripe_customer_id text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    d.id,
    d.legal_business_name,
    d.dba,
    d.email,
    d.primary_contact,
    d.status,
    d.phone,
    d.city,
    d.state,
    d.rv_categories,
    d.brands_carried,
    d.inventory_type,
    d.membership_status,
    d.membership_current_period_end,
    d.stripe_customer_id
  from public.dealers d
  where d.id = p_dealer_id
    and d.status = 'approved'
  limit 1;
end;
$$;

revoke all on function public.dealer_session_lookup(uuid) from public;
grant execute on function public.dealer_session_lookup(uuid) to anon, authenticated;

create or replace function public.dealer_set_membership(
  p_dealer_id uuid,
  p_membership_status text,
  p_stripe_customer_id text,
  p_stripe_subscription_id text,
  p_period_end timestamptz
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.dealers
  set membership_status = p_membership_status,
      stripe_customer_id = coalesce(p_stripe_customer_id, stripe_customer_id),
      stripe_subscription_id = coalesce(p_stripe_subscription_id, stripe_subscription_id),
      membership_current_period_end = p_period_end,
      updated_at = now()
  where id = p_dealer_id;

  if not found then
    raise exception 'Dealer not found';
  end if;
end;
$$;

revoke all on function public.dealer_set_membership(uuid, text, text, text, timestamptz) from public;
grant execute on function public.dealer_set_membership(uuid, text, text, text, timestamptz) to anon, authenticated;

create or replace function public.dealer_create_pending_lead_checkout(
  p_dealer_id uuid,
  p_buyer_id uuid,
  p_price_cents integer,
  p_stripe_session_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.dealer_is_approved(p_dealer_id) then
    raise exception 'Unauthorized';
  end if;

  insert into public.pending_lead_checkouts (
    dealer_id, buyer_id, price_cents, stripe_session_id, status
  ) values (
    p_dealer_id, p_buyer_id, p_price_cents, p_stripe_session_id, 'pending'
  );
end;
$$;

revoke all on function public.dealer_create_pending_lead_checkout(uuid, uuid, integer, text) from public;
grant execute on function public.dealer_create_pending_lead_checkout(uuid, uuid, integer, text) to anon, authenticated;

create or replace function public.dealer_get_pending_lead_checkout(
  p_stripe_session_id text
)
returns table (
  id uuid,
  dealer_id uuid,
  buyer_id uuid,
  price_cents integer,
  status text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select p.id, p.dealer_id, p.buyer_id, p.price_cents, p.status
  from public.pending_lead_checkouts p
  where p.stripe_session_id = p_stripe_session_id
  limit 1;
end;
$$;

revoke all on function public.dealer_get_pending_lead_checkout(text) from public;
grant execute on function public.dealer_get_pending_lead_checkout(text) to anon, authenticated;

create or replace function public.dealer_mark_pending_lead_checkout(
  p_stripe_session_id text,
  p_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.pending_lead_checkouts
  set status = p_status
  where stripe_session_id = p_stripe_session_id;
end;
$$;

revoke all on function public.dealer_mark_pending_lead_checkout(text, text) from public;
grant execute on function public.dealer_mark_pending_lead_checkout(text, text) to anon, authenticated;

create or replace function public.dealer_mark_lead_purchase_paid(
  p_purchase_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.lead_purchases
  set payment_status = 'paid'
  where id = p_purchase_id;
end;
$$;

revoke all on function public.dealer_mark_lead_purchase_paid(uuid) from public;
grant execute on function public.dealer_mark_lead_purchase_paid(uuid) to anon, authenticated;
