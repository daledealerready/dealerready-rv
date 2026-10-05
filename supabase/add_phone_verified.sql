-- Optional: add phone verification tracking to buyer_profiles
alter table public.buyer_profiles
  add column if not exists phone_verified boolean not null default false;
