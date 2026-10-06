import { NextResponse } from "next/server";
import { verifyDealerSessionToken } from "@/lib/dealer-auth";
import { getLeadPrice } from "@/lib/pricing";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { token?: string };
    const session = verifyDealerSessionToken(body.token?.trim() || "");
    if (!session) {
      return NextResponse.json(
        { error: "Session expired. Please sign in again." },
        { status: 401 },
      );
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.rpc("dealer_marketplace_list", {
      p_dealer_id: session.dealerId,
    });

    if (error) {
      const message = error.message || "Could not load marketplace.";
      if (
        message.toLowerCase().includes("could not find the function") ||
        message.toLowerCase().includes("dealer_marketplace_list")
      ) {
        return NextResponse.json(
          {
            error:
              "Marketplace SQL is not installed yet. Run marketplace.sql in Supabase.",
          },
          { status: 500 },
        );
      }
      if (message.toLowerCase().includes("unauthorized")) {
        return NextResponse.json(
          { error: "Dealer account is not approved." },
          { status: 401 },
        );
      }
      return NextResponse.json({ error: message }, { status: 500 });
    }

    const rows = Array.isArray(data) ? data : [];
    const opportunities = rows.map((row) => {
      const pricing = getLeadPrice({
        category: row.category,
        rvTypes: row.rv_types,
        maxPrice: row.max_price,
      });
      return {
        buyerId: row.buyer_id,
        buyerCode: row.buyer_code,
        createdAt: row.created_at,
        score: row.score,
        category: row.category,
        purchaseTimeline: row.purchase_timeline,
        rvTypes: row.rv_types || [],
        condition: row.condition,
        preferredManufacturer: row.preferred_manufacturer,
        minPrice: row.min_price,
        maxPrice: row.max_price,
        downPayment: row.down_payment,
        hasTrade: row.has_trade,
        creditRange: row.credit_range,
        incomeRange: row.income_range,
        travelDistance: row.travel_distance,
        preferredContact: row.preferred_contact,
        zip: row.zip,
        purchaseCount: row.purchase_count,
        spotsLeft: Math.max(0, 3 - Number(row.purchase_count || 0)),
        price: pricing.price,
        priceBandLabel: pricing.bandLabel,
        tier: pricing.tier,
        sellable: pricing.sellable,
      };
    });

    return NextResponse.json({ ok: true, opportunities });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
