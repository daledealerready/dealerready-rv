-- Run once in Supabase SQL Editor so the admin page can list buyers safely.

create table if not exists public.app_settings (
  key text primary key,
  value text not null
);

insert into public.app_settings (key, value)
values ('admin_password', 'DealerReady2026')
on conflict (key) do update set value = excluded.value;

create or replace function public.admin_list_buyers(p_password text)
returns table (
  id uuid,
  created_at timestamptz,
  buyer_code text,
  score integer,
  category text,
  first_name text,
  last_name text,
  email text,
  mobile text,
  zip text,
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
  status text,
  profile jsonb
)
language plpgsql
security definer
set search_path = public
as $$
declare
  expected text;
begin
  select s.value into expected
  from public.app_settings s
  where s.key = 'admin_password';

  if expected is null or p_password is distinct from expected then
    raise exception 'Unauthorized';
  end if;

  return query
  select
    b.id,
    b.created_at,
    b.buyer_code,
    b.score,
    b.category,
    b.first_name,
    b.last_name,
    b.email,
    b.mobile,
    b.zip,
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
    b.status,
    b.profile
  from public.buyer_profiles b
  order by b.created_at desc
  limit 200;
end;
$$;

revoke all on function public.admin_list_buyers(text) from public;
grant execute on function public.admin_list_buyers(text) to anon, authenticated;
