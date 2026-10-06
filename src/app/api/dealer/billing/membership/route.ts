import { NextResponse } from "next/server";
import { verifyDealerSessionToken } from "@/lib/dealer-auth";
import {
  getAppUrl,
  getStripe,
  isStripeConfigured,
  membershipAmountCents,
} from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        {
          error:
            "Stripe billing is not connected yet. Add your Stripe secret key first.",
        },
        { status: 503 },
      );
    }

    const body = (await request.json()) as { token?: string };
    const session = verifyDealerSessionToken(body.token?.trim() || "");
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
        { error: error.message || "Could not load dealer." },
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

    if (dealer.membership_status === "active") {
      return NextResponse.json({
        ok: true,
        alreadyActive: true,
      });
    }

    const stripe = getStripe();
    const appUrl = getAppUrl();

    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: dealer.email,
      client_reference_id: dealer.id,
      metadata: {
        dealerId: dealer.id,
        type: "membership",
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: membershipAmountCents(),
            recurring: { interval: "month" },
            product_data: {
              name: "DealerReady RV Pilot Membership",
              description: "$499/month founding dealer pilot membership",
            },
          },
        },
      ],
      success_url: `${appUrl}/dealer/dashboard?membership=success`,
      cancel_url: `${appUrl}/dealer/dashboard?membership=canceled`,
      subscription_data: {
        metadata: {
          dealerId: dealer.id,
          type: "membership",
        },
      },
    });

    return NextResponse.json({
      ok: true,
      url: checkout.url,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
