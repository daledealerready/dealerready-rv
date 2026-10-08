# DealerReady RV — Product Vision (captured from Dale)

Last updated: 2026-10-08  
Status: Pilot in progress. Do not start over — build on the current lead engine.

## North star
When people think motorhome / RV, they think **DealerReady** — a complete one-stop shop.
Dealers know shoppers think that way too, which makes the platform more valuable to buy into.

## What the pilot already proves
- Shopper completes RV needs / description profile
- Profile is stored and scored
- Approved dealers log in, browse marketplace, unlock leads
- Pilot pricing: **$499/month membership + lead fees** (Stripe sandbox connected)

## Core customer journey (keep + expand)
1. Shopper describes the motorhome / RV they want
2. Every matching dealership / inventory path can be found for that description
3. Shopper can browse matching inventory without leaving DealerReady
4. Same person is stored as a **client**
5. On return visits, description changes update the profile and keep history
6. When they become a **serious buyer**, the process switches: activate and contact dealers
7. Leads can be sold to every relevant dealership

## Dealer advertising ticker (paid header slot)
- Continuous banner / ticker across the site header at all times
- Dealers can promote an event for a paid slot
- Runs on a loop during the event date range
- Auto-stops when event dates end
- Monetizes attention even before a lead is purchased

## Post-pilot membership pricing (multi-store)
Base (pilot): one store = standard monthly membership + buy leads.

After pilot success, multi-location discount:
- 1 store → 1× membership
- 3 stores → 1.5× membership (covers all 3)
- 4 stores → 2× membership (covers all 4)
- 10 stores → 5× membership (covers all 10)

Working rule Dale described: for **3+ stores**, charge **(number of stores ÷ 2) ×** the single-store membership, and that one membership covers every store in the group.  
Open detail: pricing for exactly **2 stores** (likely 2×, or a small bundle — decide before build).

Leads remain separately purchasable (membership covers access; leads are usage).

## DealerReady buyout / acquisition service
Separate service on the platform:
- DealerReady helps people who want to sell / get out
- Focus categories: Class A diesel, Class A gas, Super C, C-Class, high-end fifth wheels
- This is a seller-side / acquisition offer, not the same as dealer lead marketplace

## Suggested build order (so nothing is forgotten, but pilot stays first)
1. Finish Stripe test checkout + prove pilot membership / lead pay flow
2. Returning-client profile update + history
3. Dealer-uploaded inventory browse / match (start here before external feeds)
4. Paid header advertising ticker (event date window)
5. Serious-buyer auto-activation / contact (Twilio or email first)
6. Multi-store membership pricing (post-pilot)
7. Buyout / “we’ll help you sell / we buy” service

## Decisions still open
- Inventory source for v1: dealer self-upload vs external feeds (recommend self-upload first)
- Exact 2-store membership price
- Whether multi-store groups share one lead wallet or buy leads per store
- Buyout: brokerage/consignment vs DealerReady purchasing units on balance sheet
