-- Fix: gen_salt type error on Supabase
-- Run this whole script in SQL Editor

create extension if not exists pgcrypto;

alter table public.dealers
  add column if not exists password_hash text;

create or replace function public.admin_approve_dealer_with_password(
  p_password text,
  p_dealer_id uuid,
  p_temp_password text
)
returns public.dealers
language plpgsql
security definer
set search_path = public, extensions
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

  if length(trim(p_temp_password)) < 8 then
    raise exception 'Temporary password must be at least 8 characters';
  end if;

  update public.dealers
  set status = 'approved',
      password_hash = crypt(trim(p_temp_password)::text, gen_salt('bf'::text)),
      updated_at = now()
  where id = p_dealer_id
  returning * into updated;

  if updated.id is null then
    raise exception 'Dealer not found';
  end if;

  return updated;
end;
$$;

create or replace function public.dealer_login(
  p_email text,
  p_password text
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
  state text
)
language plpgsql
security definer
set search_path = public, extensions
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
    d.state
  from public.dealers d
  where lower(d.email) = lower(trim(p_email))
    and d.status = 'approved'
    and d.password_hash is not null
    and d.password_hash = crypt(trim(p_password)::text, d.password_hash)
  limit 1;
end;
$$;
