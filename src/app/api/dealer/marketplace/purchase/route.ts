import { NextResponse } from "next/server";
import { getLeadPrice } from "@/lib/pricing";
import {
  getAppUrl,
  getStripe,
  isStripeConfigured,
} from "@/lib/stripe";
import { verifyDealerSessionToken } from "@/lib/dealer-auth";
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
    const dealerRes = await supabase.rpc("dealer_session_lookup", {
      p_dealer_id: session.dealerId,
    });
    if (dealerRes.error) {
      return NextResponse.json(
        { error: dealerRes.error.message || "Could not load dealer." },
        { status: 500 },
      );
    }
    const dealer = Array.isArray(dealerRes.data)
      ? dealerRes.data[0]
      : dealerRes.data;
    if (!dealer) {
      return NextResponse.json(
        { error: "Dealer account is not active." },
        { status: 401 },
      );
    }

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

    // If Stripe is not connected yet, keep pilot unlock so testing can continue.
    if (!isStripeConfigured()) {
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
      return NextResponse.json({
        ok: true,
        mode: "pilot_unlock",
        purchase: {
          purchaseId: row?.purchase_id,
          price: pricing.price,
          paymentStatus: "pilot_unlock",
        },
      });
    }

    if (dealer.membership_status !== "active") {
      return NextResponse.json(
        {
          error:
            "Activate your $499/month pilot membership before unlocking leads.",
          needsMembership: true,
        },
        { status: 402 },
      );
    }

    const stripe = getStripe();
    const appUrl = getAppUrl();
    const priceCents = pricing.price * 100;

    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: dealer.stripe_customer_id || undefined,
      customer_email: dealer.stripe_customer_id ? undefined : dealer.email,
      client_reference_id: dealer.id,
      metadata: {
        type: "lead",
        dealerId: dealer.id,
        buyerId,
        priceCents: String(priceCents),
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: priceCents,
            product_data: {
              name: `DealerReady Lead ${match.buyer_code}`,
              description: `${match.category} · Score ${match.score}`,
            },
          },
        },
      ],
      success_url: `${appUrl}/dealer/purchased?paid=1`,
      cancel_url: `${appUrl}/dealer/marketplace?canceled=1`,
    });

    if (!checkout.id || !checkout.url) {
      return NextResponse.json(
        { error: "Could not start Stripe checkout." },
        { status: 500 },
      );
    }

    const pending = await supabase.rpc("dealer_create_pending_lead_checkout", {
      p_dealer_id: session.dealerId,
      p_buyer_id: buyerId,
      p_price_cents: priceCents,
      p_stripe_session_id: checkout.id,
    });
    if (pending.error) {
      return NextResponse.json(
        { error: pending.error.message || "Could not save checkout." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      mode: "stripe",
      url: checkout.url,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
