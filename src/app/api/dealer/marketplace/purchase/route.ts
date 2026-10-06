import { NextResponse } from "next/server";
import { verifyDealerSessionToken } from "@/lib/dealer-auth";
import { getLeadPrice } from "@/lib/pricing";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      token?: string;
      buyerId?: string;
    };
    const session = verifyDealerSessionToken(body.token?.trim() || "");
    if (!session) {
      return NextResponse.json(
        { error: "Session expired. Please sign in again." },
        { status: 401 },
      );
    }

    const buyerId = body.buyerId?.trim() || "";
    if (!buyerId) {
      return NextResponse.json(
        { error: "Missing buyer opportunity." },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();

    // Pull marketplace row set and find this buyer for price calculation.
    const listed = await supabase.rpc("dealer_marketplace_list", {
      p_dealer_id: session.dealerId,
    });
    if (listed.error) {
      return NextResponse.json(
        { error: listed.error.message || "Could not verify lead." },
        { status: 500 },
      );
    }

    const match = (Array.isArray(listed.data) ? listed.data : []).find(
      (row) => row.buyer_id === buyerId,
    );
    if (!match) {
      return NextResponse.json(
        { error: "This opportunity is no longer available." },
        { status: 404 },
      );
    }

    const pricing = getLeadPrice({
      category: match.category,
      rvTypes: match.rv_types,
      maxPrice: match.max_price,
    });
    if (!pricing.sellable || pricing.price == null) {
      return NextResponse.json(
        { error: "This lead is not sellable." },
        { status: 400 },
      );
    }

    const { data, error } = await supabase.rpc("dealer_purchase_lead", {
      p_dealer_id: session.dealerId,
      p_buyer_id: buyerId,
      p_price_cents: pricing.price * 100,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Could not unlock lead." },
        { status: 500 },
      );
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (!row) {
      return NextResponse.json(
        { error: "Purchase did not complete." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      purchase: {
        purchaseId: row.purchase_id,
        price: pricing.price,
        paymentStatus: "pilot_unlock",
        buyer: {
          buyerId: row.buyer_id,
          buyerCode: row.buyer_code,
          firstName: row.first_name,
          lastName: row.last_name,
          email: row.email,
          mobile: row.mobile,
          zip: row.zip,
          preferredContact: row.preferred_contact,
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
        },
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
