-- Sell-your-RV requests for the We Buy page
-- Run once in Supabase SQL Editor

create table if not exists public.sell_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  first_name text not null,
  last_name text not null,
  email text not null,
  mobile text not null,
  zip text,
  rv_category text not null,
  year text,
  make text,
  model text,
  notes text
);

alter table public.sell_requests enable row level security;

drop policy if exists "No public sell request reads" on public.sell_requests;
create policy "No public sell request reads"
  on public.sell_requests for select to anon using (false);

create or replace function public.submit_sell_request(
  p_first_name text,
  p_last_name text,
  p_email text,
  p_mobile text,
  p_zip text,
  p_rv_category text,
  p_year text,
  p_make text,
  p_model text,
  p_notes text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  if length(trim(coalesce(p_first_name, ''))) < 1
    or length(trim(coalesce(p_last_name, ''))) < 1
    or length(trim(coalesce(p_email, ''))) < 5
    or length(trim(coalesce(p_mobile, ''))) < 7
    or length(trim(coalesce(p_rv_category, ''))) < 2
  then
    raise exception 'Contact information is incomplete';
  end if;

  insert into public.sell_requests (
    first_name, last_name, email, mobile, zip, rv_category, year, make, model, notes
  ) values (
    trim(p_first_name),
    trim(p_last_name),
    lower(trim(p_email)),
    trim(p_mobile),
    nullif(trim(coalesce(p_zip, '')), ''),
    trim(p_rv_category),
    nullif(trim(coalesce(p_year, '')), ''),
    nullif(trim(coalesce(p_make, '')), ''),
    nullif(trim(coalesce(p_model, '')), ''),
    nullif(trim(coalesce(p_notes, '')), '')
  )
  returning id into new_id;

  return new_id;
end;
$$;

revoke all on function public.submit_sell_request(text, text, text, text, text, text, text, text, text, text) from public;
grant execute on function public.submit_sell_request(text, text, text, text, text, text, text, text, text, text) to anon, authenticated;
