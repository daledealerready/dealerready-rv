-- Dealer login support
-- Run once in Supabase SQL Editor

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
set search_path = public
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
      password_hash = crypt(trim(p_temp_password), gen_salt('bf')),
      updated_at = now()
  where id = p_dealer_id
  returning * into updated;

  if updated.id is null then
    raise exception 'Dealer not found';
  end if;

  return updated;
end;
$$;

revoke all on function public.admin_approve_dealer_with_password(text, uuid, text) from public;
grant execute on function public.admin_approve_dealer_with_password(text, uuid, text) to anon, authenticated;

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
    d.state
  from public.dealers d
  where lower(d.email) = lower(trim(p_email))
    and d.status = 'approved'
    and d.password_hash is not null
    and d.password_hash = crypt(trim(p_password), d.password_hash)
  limit 1;
end;
$$;

revoke all on function public.dealer_login(text, text) from public;
grant execute on function public.dealer_login(text, text) to anon, authenticated;

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
  inventory_type text
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
    d.inventory_type
  from public.dealers d
  where d.id = p_dealer_id
    and d.status = 'approved'
  limit 1;
end;
$$;

revoke all on function public.dealer_session_lookup(uuid) from public;
grant execute on function public.dealer_session_lookup(uuid) to anon, authenticated;
