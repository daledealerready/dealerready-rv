-- Photos and walk-around videos for We Buy requests.
-- Run once in the Supabase SQL Editor.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'sell-media',
  'sell-media',
  false,
  47185920,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
    'video/mp4',
    'video/quicktime',
    'video/webm'
  ]
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can upload sell media" on storage.objects;
create policy "Public can upload sell media"
on storage.objects
for insert
to anon, authenticated
with check (
  bucket_id = 'sell-media'
  and (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$'
);

create table if not exists public.sell_request_files (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  sell_request_id uuid not null references public.sell_requests(id) on delete cascade,
  storage_path text not null,
  kind text not null check (kind in ('photo', 'video')),
  file_name text
);

alter table public.sell_request_files enable row level security;

drop policy if exists "No public sell file reads" on public.sell_request_files;
create policy "No public sell file reads"
  on public.sell_request_files for select to anon using (false);

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
  p_files jsonb
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

revoke all on function public.submit_sell_request(text, text, text, text, text, text, text, text, text, text, jsonb) from public;
grant execute on function public.submit_sell_request(text, text, text, text, text, text, text, text, text, text, jsonb) to anon, authenticated;
