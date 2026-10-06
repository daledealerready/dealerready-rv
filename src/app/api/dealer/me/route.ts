import { NextResponse } from "next/server";
import { verifyDealerSessionToken } from "@/lib/dealer-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { token?: string };
    const token = body.token?.trim() ?? "";
    const session = verifyDealerSessionToken(token);

    if (!session) {
      return NextResponse.json(
        { error: "Session expired. Please sign in again." },
        { status: 401 },
      );
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.rpc("dealer_session_lookup", {
      p_dealer_id: session.dealerId,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Could not load dealer session." },
        { status: 500 },
      );
    }

    const dealer = Array.isArray(data) ? data[0] : data;
    if (!dealer) {
      return NextResponse.json(
        { error: "Dealer account is not active." },
        { status: 401 },
      );
    }

    return NextResponse.json({
      ok: true,
      dealer: {
        id: dealer.id,
        legalBusinessName: dealer.legal_business_name,
        dba: dealer.dba,
        email: dealer.email,
        primaryContact: dealer.primary_contact,
        status: dealer.status,
        phone: dealer.phone,
        city: dealer.city,
        state: dealer.state,
        rvCategories: dealer.rv_categories || [],
        brandsCarried: dealer.brands_carried,
        inventoryType: dealer.inventory_type,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
