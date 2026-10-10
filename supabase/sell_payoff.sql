-- Paid off or financed, plus the lender name, on We Buy requests.
-- Run once in the Supabase SQL Editor.

alter table public.sell_requests
  add column if not exists payoff_status text,
  add column if not exists lender_name text;

drop function if exists public.submit_sell_request(text, text, text, text, text, text, text, text, text, text);
drop function if exists public.submit_sell_request(text, text, text, text, text, text, text, text, text, text, jsonb);

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
  p_notes text,
  p_files jsonb default '[]'::jsonb,
  p_payoff_status text default '',
  p_lender_name text default ''
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
  item jsonb;
  item_path text;
  item_kind text;
  item_name text;
  file_count integer := 0;
  payoff text := trim(coalesce(p_payoff_status, ''));
  lender text := nullif(trim(coalesce(p_lender_name, '')), '');
begin
  if length(trim(coalesce(p_first_name, ''))) < 1
    or length(trim(coalesce(p_last_name, ''))) < 1
    or length(trim(coalesce(p_email, ''))) < 5
    or length(trim(coalesce(p_mobile, ''))) < 7
    or length(trim(coalesce(p_rv_category, ''))) < 2
  then
    raise exception 'Contact information is incomplete';
  end if;

  if payoff not in ('Paid off', 'Financed') then
    raise exception 'Tell us if the RV is paid off or financed';
  end if;

  if payoff = 'Financed' and lender is null then
    raise exception 'Financing institution name is required';
  end if;

  if payoff = 'Paid off' then
    lender := null;
  end if;

  insert into public.sell_requests (
    first_name, last_name, email, mobile, zip, rv_category, year, make, model, notes,
    payoff_status, lender_name
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
    nullif(trim(coalesce(p_notes, '')), ''),
    payoff,
    lender
  )
  returning id into new_id;

  for item in select value from jsonb_array_elements(coalesce(p_files, '[]'::jsonb))
  loop
    item_path := trim(coalesce(item->>'path', ''));
    item_kind := trim(coalesce(item->>'kind', ''));
    item_name := nullif(trim(coalesce(item->>'name', '')), '');
    file_count := file_count + 1;

    if file_count > 22 then
      raise exception 'Too many files';
    end if;
    if item_kind not in ('photo', 'video') then
      raise exception 'Unknown file type';
    end if;
    if item_path !~ '^[0-9a-fA-F-]{36}/[A-Za-z0-9._-]{1,180}$' then
      raise exception 'Invalid file path';
    end if;

    insert into public.sell_request_files (sell_request_id, storage_path, kind, file_name)
    values (new_id, item_path, item_kind, item_name);
  end loop;

  return new_id;
end;
$$;

revoke all on function public.submit_sell_request(text, text, text, text, text, text, text, text, text, text, jsonb, text, text) from public;
grant execute on function public.submit_sell_request(text, text, text, text, text, text, text, text, text, text, jsonb, text, text) to anon, authenticated;
