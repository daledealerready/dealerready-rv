-- Dealer inventory used by exact-unit search
-- Run once in Supabase SQL Editor

create table if not exists public.dealer_inventory (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  dealer_id uuid not null references public.dealers(id) on delete cascade,
  year integer,
  manufacturer text not null,
  model text not null,
  floorplan text,
  condition text,
  price_cents integer,
  city text,
  state text,
  stock_number text,
  is_active boolean not null default true
);

create index if not exists dealer_inventory_match_idx
  on public.dealer_inventory (year, manufacturer, model);

alter table public.dealer_inventory enable row level security;

drop policy if exists "No public inventory reads" on public.dealer_inventory;
create policy "No public inventory reads"
  on public.dealer_inventory for select to anon using (false);
