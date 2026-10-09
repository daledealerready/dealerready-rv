-- Let a dealer edit a paid header ad without buying it again
-- Run once in Supabase SQL Editor

create or replace function public.dealer_update_header_ad(
  p_dealer_id uuid,
  p_ad_id uuid,
  p_message text,
  p_starts_on date,
  p_ends_on date,
  p_logo text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_ends_on < p_starts_on then
    raise exception 'End date must be on or after the start date';
  end if;

  if length(trim(coalesce(p_message, ''))) < 3 then
    raise exception 'Message is too short';
  end if;

  update public.header_ads
  set message = left(trim(p_message), 140),
      starts_on = p_starts_on,
      ends_on = p_ends_on,
      logo_url = case
        when p_logo is null or p_logo = '' then logo_url
        else p_logo
      end
  where id = p_ad_id
    and dealer_id = p_dealer_id
    and status = 'active';

  if not found then
    raise exception 'Ad not found';
  end if;
end;
$$;

revoke all on function public.dealer_update_header_ad(uuid, uuid, text, date, date, text) from public;
grant execute on function public.dealer_update_header_ad(uuid, uuid, text, date, date, text) to anon, authenticated;

create or replace function public.dealer_stop_header_ad(
  p_dealer_id uuid,
  p_ad_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.header_ads
  set status = 'stopped'
  where id = p_ad_id
    and dealer_id = p_dealer_id
    and status = 'active';

  if not found then
    raise exception 'Ad not found';
  end if;
end;
$$;

revoke all on function public.dealer_stop_header_ad(uuid, uuid) from public;
grant execute on function public.dealer_stop_header_ad(uuid, uuid) to anon, authenticated;
