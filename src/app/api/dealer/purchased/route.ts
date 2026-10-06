import { NextResponse } from "next/server";
import { verifyDealerSessionToken } from "@/lib/dealer-auth";
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
    const { data, error } = await supabase.rpc("dealer_purchased_leads", {
      p_dealer_id: session.dealerId,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Could not load purchased leads." },
        { status: 500 },
      );
    }

    const rows = Array.isArray(data) ? data : [];
    return NextResponse.json({
      ok: true,
      leads: rows.map((row) => ({
        purchaseId: row.purchase_id,
        purchasedAt: row.purchased_at,
        price: Math.round(Number(row.price_cents || 0) / 100),
        paymentStatus: row.payment_status,
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
      })),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
