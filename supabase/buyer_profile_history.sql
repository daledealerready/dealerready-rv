-- Returning client profile history
-- Run once in Supabase SQL Editor after buyer_profiles exists

create table if not exists public.buyer_profile_history (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  buyer_id uuid not null references public.buyer_profiles(id) on delete cascade,
  buyer_code text not null,
  score integer,
  category text,
  snapshot jsonb not null
);

create index if not exists buyer_profile_history_buyer_idx
  on public.buyer_profile_history (buyer_id, created_at desc);

create index if not exists buyer_profile_history_code_idx
  on public.buyer_profile_history (buyer_code);

alter table public.buyer_profile_history enable row level security;

drop policy if exists "No public history reads" on public.buyer_profile_history;
create policy "No public history reads"
  on public.buyer_profile_history for select to anon using (false);

drop policy if exists "No public history writes" on public.buyer_profile_history;
create policy "No public history writes"
  on public.buyer_profile_history for insert to anon with check (false);
