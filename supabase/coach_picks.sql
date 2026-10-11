-- Coach picks on dealer leads. Paste this whole file in Supabase SQL Editor and run it once.
-- A shopper's exact coach, or every brand from a layout search, shows on the marketplace lead and on a purchased lead.
-- Name, phone, and email stay hidden until the dealer buys the lead.
-- This does not change We Buy, photos, or payoff.

drop function if exists public.dealer_marketplace_list(uuid);

create function public.dealer_marketplace_list(p_dealer_id uuid)
returns table (
  buyer_id uuid,
  buyer_code text,
  created_at timestamptz,
  score integer,
  category text,
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
  zip text,
  purchase_count integer,
  coach_search text,
  coach_picks text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.dealer_is_approved(p_dealer_id) then
    raise exception 'Unauthorized';
  end if;

  return query
  select
    b.id,
    b.buyer_code,
    b.created_at,
    b.score,
    b.category,
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
    b.zip,
    coalesce((
      select count(*)::integer
      from public.lead_purchases lp
      where lp.buyer_id = b.id
    ), 0) as purchase_count,
    case
      when b.profile ->> 'coachSearchKind' in ('exact', 'description')
      then b.profile ->> 'coachSearchKind'
      else ''
    end as coach_search,
    coalesce((
      select string_agg(picked.item, E'\n' order by picked.ord)
      from jsonb_array_elements_text(
        case
          when jsonb_typeof(b.profile -> 'coachPicks') = 'array'
          then b.profile -> 'coachPicks'
          else '[]'::jsonb
        end
      ) with ordinality as picked(item, ord)
    ), '') as coach_picks
  from public.buyer_profiles b
  where b.score >= 70
    and b.category in ('Qualified Buyer', 'Dealer Ready', 'Premier Buyer')
    and not exists (
      select 1
      from public.lead_purchases lp
      where lp.dealer_id = p_dealer_id
        and lp.buyer_id = b.id
    )
    and coalesce((
      select count(*)::integer
      from public.lead_purchases lp
      where lp.buyer_id = b.id
    ), 0) < 3
  order by b.score desc, b.created_at desc
  limit 200;
end;
$$;

revoke all on function public.dealer_marketplace_list(uuid) from public;
grant execute on function public.dealer_marketplace_list(uuid) to anon, authenticated;

drop function if exists public.dealer_purchased_leads(uuid);

create function public.dealer_purchased_leads(p_dealer_id uuid)
returns table (
  purchase_id uuid,
  purchased_at timestamptz,
  price_cents integer,
  payment_status text,
  buyer_id uuid,
  buyer_code text,
  first_name text,
  last_name text,
  email text,
  mobile text,
  zip text,
  preferred_contact text,
  score integer,
  category text,
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
  coach_search text,
  coach_picks text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.dealer_is_approved(p_dealer_id) then
    raise exception 'Unauthorized';
  end if;

  return query
  select
    lp.id,
    lp.created_at,
    lp.price_cents,
    lp.payment_status,
    b.id,
    b.buyer_code,
    b.first_name,
    b.last_name,
    b.email,
    b.mobile,
    b.zip,
    b.preferred_contact,
    b.score,
    b.category,
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
    case
      when b.profile ->> 'coachSearchKind' in ('exact', 'description')
      then b.profile ->> 'coachSearchKind'
      else ''
    end as coach_search,
    coalesce((
      select string_agg(picked.item, E'\n' order by picked.ord)
      from jsonb_array_elements_text(
        case
          when jsonb_typeof(b.profile -> 'coachPicks') = 'array'
          then b.profile -> 'coachPicks'
          else '[]'::jsonb
        end
      ) with ordinality as picked(item, ord)
    ), '') as coach_picks
  from public.lead_purchases lp
  join public.buyer_profiles b on b.id = lp.buyer_id
  where lp.dealer_id = p_dealer_id
  order by lp.created_at desc
  limit 200;
end;
$$;

revoke all on function public.dealer_purchased_leads(uuid) from public;
grant execute on function public.dealer_purchased_leads(uuid) to anon, authenticated;
