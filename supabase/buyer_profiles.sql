-- DealerReady RV buyer profiles
-- Run this once in Supabase: SQL Editor → New query → Run

create extension if not exists pgcrypto;

create table if not exists public.buyer_profiles (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  buyer_code text not null unique,
  score integer not null default 0,
  category text not null,
  first_name text,
  last_name text,
  email text,
  mobile text,
  zip text,
  purchase_timeline text,
  rv_types text[] default '{}',
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
  profile jsonb not null,
  status text not null default 'submitted'
);

create index if not exists buyer_profiles_created_at_idx
  on public.buyer_profiles (created_at desc);

create index if not exists buyer_profiles_email_idx
  on public.buyer_profiles (email);

create index if not exists buyer_profiles_category_idx
  on public.buyer_profiles (category);

alter table public.buyer_profiles enable row level security;

-- Allow the website to create new buyer profiles
drop policy if exists "Allow public inserts" on public.buyer_profiles;
create policy "Allow public inserts"
  on public.buyer_profiles
  for insert
  to anon, authenticated
  with check (true);

-- Nobody can read profiles from the public website key.
-- You will view profiles inside your Supabase dashboard.
drop policy if exists "No public reads" on public.buyer_profiles;
create policy "No public reads"
  on public.buyer_profiles
  for select
  to anon
  using (false);
