import { NextResponse } from "next/server";
import { verifyDealerSessionToken } from "@/lib/dealer-auth";
import { assertLogo } from "@/lib/logo-image";
import { HEADER_AD_SLOT } from "@/lib/pricing";
import { getAppUrl, getStripe, isStripeConfigured } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase";

type AdBody = {
  token?: string;
  action?: "list" | "create" | "confirm" | "logo" | "update" | "stop";
  message?: string;
  startsOn?: string;
  endsOn?: string;
  sessionId?: string;
  logo?: string;
  adId?: string;
};

function clean(value: string | undefined) {
  return value?.trim() || "";
}

function failure(error: { message?: string } | null, fallback: string) {
  const message = error?.message || fallback;
  const lower = message.toLowerCase();
  if (lower.includes("unauthorized")) {
    return NextResponse.json(
      {
        error:
          "An active $499 membership is required before buying a header ad.",
      },
      { status: 402 },
    );
  }
  if (
    lower.includes("header_ad") ||
    lower.includes("could not find the function") ||
    lower.includes("schema cache")
  ) {
    return NextResponse.json(
      { error: "Header ad SQL is not installed yet. Run header_ads.sql in Supabase." },
      { status: 500 },
    );
  }
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AdBody;
    const session = verifyDealerSessionToken(body.token?.trim() || "");
    if (!session) {
      return NextResponse.json(
        { error: "Session expired. Please sign in again." },
        { status: 401 },
      );
    }

    const supabase = getSupabaseAdmin();
    const action = body.action || "list";

    if (action === "confirm") {
      const sessionId = clean(body.sessionId);
      if (!sessionId || !isStripeConfigured()) {
        return NextResponse.json({ ok: true });
      }
      const stripe = getStripe();
      const checkout = await stripe.checkout.sessions.retrieve(sessionId);
      const dealerId = checkout.metadata?.dealerId || "";
      if (
        checkout.metadata?.type === "header_ad" &&
        checkout.payment_status === "paid" &&
        dealerId === session.dealerId
      ) {
        const activated = await supabase.rpc("dealer_activate_header_ad", {
          p_stripe_session_id: checkout.id,
        });
        if (activated.error) return failure(activated.error, "Could not start ad.");
      }
    }

    if (action === "logo") {
      const adId = clean(body.adId);
      let logo = "";
      try {
        logo = assertLogo(body.logo?.trim() || "");
      } catch (logoError) {
        const logoMessage =
          logoError instanceof Error ? logoError.message : "Could not use that logo.";
        return NextResponse.json({ error: logoMessage }, { status: 400 });
      }
      if (!adId || !logo) {
        return NextResponse.json({ error: "Choose an ad and a logo." }, { status: 400 });
      }
      const saved = await supabase.rpc("dealer_set_header_ad_logo", {
        p_dealer_id: session.dealerId,
        p_ad_id: adId,
        p_logo: logo,
      });
      if (saved.error) return failure(saved.error, "Could not save the logo.");
    }

    if (action === "update") {
      const adId = clean(body.adId);
      const message = clean(body.message);
      const startsOn = clean(body.startsOn);
      const endsOn = clean(body.endsOn);
      if (!adId) {
        return NextResponse.json({ error: "Choose an ad to edit." }, { status: 400 });
      }
      if (message.length < 3 || message.length > 140) {
        return NextResponse.json(
          { error: "Write a short event message, up to 140 characters." },
          { status: 400 },
        );
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(startsOn) || !/^\d{4}-\d{2}-\d{2}$/.test(endsOn)) {
        return NextResponse.json(
          { error: "Choose a start date and an end date." },
          { status: 400 },
        );
      }
      if (endsOn < startsOn) {
        return NextResponse.json(
          { error: "End date must be on or after the start date." },
          { status: 400 },
        );
      }
      let logo = "";
      try {
        logo = assertLogo(body.logo?.trim() || "");
      } catch (logoError) {
        const logoMessage =
          logoError instanceof Error ? logoError.message : "Could not use that logo.";
        return NextResponse.json({ error: logoMessage }, { status: 400 });
      }
      const updated = await supabase.rpc("dealer_update_header_ad", {
        p_dealer_id: session.dealerId,
        p_ad_id: adId,
        p_message: message,
        p_starts_on: startsOn,
        p_ends_on: endsOn,
        p_logo: logo,
      });
      if (updated.error) {
        const lower = updated.error.message.toLowerCase();
        if (
          lower.includes("dealer_update_header_ad") ||
          lower.includes("could not find the function")
        ) {
          return NextResponse.json(
            {
              error:
                "Ad editing is not installed yet. Run header_ads_edit.sql in Supabase.",
            },
            { status: 500 },
          );
        }
        return failure(updated.error, "Could not update the ad.");
      }
    }

    if (action === "stop") {
      const adId = clean(body.adId);
      if (!adId) {
        return NextResponse.json({ error: "Choose an ad to stop." }, { status: 400 });
      }
      const stopped = await supabase.rpc("dealer_stop_header_ad", {
        p_dealer_id: session.dealerId,
        p_ad_id: adId,
      });
      if (stopped.error) {
        const lower = stopped.error.message.toLowerCase();
        if (
          lower.includes("dealer_stop_header_ad") ||
          lower.includes("could not find the function")
        ) {
          return NextResponse.json(
            {
              error:
                "Stop ad is not installed yet. Run header_ads_edit.sql in Supabase.",
            },
            { status: 500 },
          );
        }
        return failure(stopped.error, "Could not stop the ad.");
      }
    }

    if (action === "create") {
      if (!isStripeConfigured()) {
        return NextResponse.json(
          { error: "Stripe billing is not connected yet." },
          { status: 503 },
        );
      }

      const message = clean(body.message);
      const startsOn = clean(body.startsOn);
      const endsOn = clean(body.endsOn);
      if (message.length < 3 || message.length > 140) {
        return NextResponse.json(
          { error: "Write a short event message, up to 140 characters." },
          { status: 400 },
        );
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(startsOn) || !/^\d{4}-\d{2}-\d{2}$/.test(endsOn)) {
        return NextResponse.json(
          { error: "Choose a start date and an end date." },
          { status: 400 },
        );
      }
      if (endsOn < startsOn) {
        return NextResponse.json(
          { error: "End date must be on or after the start date." },
          { status: 400 },
        );
      }
      let logo = "";
      try {
        logo = assertLogo(body.logo?.trim() || "");
      } catch (logoError) {
        const logoMessage =
          logoError instanceof Error ? logoError.message : "Could not use that logo.";
        return NextResponse.json({ error: logoMessage }, { status: 400 });
      }

      const stripe = getStripe();
      const appUrl = getAppUrl();
      const priceCents = HEADER_AD_SLOT * 100;
      const checkout = await stripe.checkout.sessions.create({
        mode: "payment",
        client_reference_id: session.dealerId,
        metadata: {
          type: "header_ad",
          dealerId: session.dealerId,
        },
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "usd",
              unit_amount: priceCents,
              product_data: {
                name: "DealerReady header event ad",
                description: `${startsOn} through ${endsOn}`,
              },
            },
          },
        ],
        success_url: `${appUrl}/dealer/ads?ad=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/dealer/ads?ad=canceled`,
      });

      if (!checkout.id || !checkout.url) {
        return NextResponse.json(
          { error: "Could not start Stripe checkout." },
          { status: 500 },
        );
      }

      const created = await supabase.rpc("dealer_create_header_ad", {
        p_dealer_id: session.dealerId,
        p_message: message,
        p_starts_on: startsOn,
        p_ends_on: endsOn,
        p_price_cents: priceCents,
        p_stripe_session_id: checkout.id,
        p_logo: logo,
      });
      if (created.error) return failure(created.error, "Could not save the ad.");

      return NextResponse.json({ ok: true, url: checkout.url });
    }

    const listed = await supabase.rpc("dealer_list_header_ads", {
      p_dealer_id: session.dealerId,
    });
    if (listed.error) return failure(listed.error, "Could not load ads.");

    const ads = (Array.isArray(listed.data) ? listed.data : []).map((row) => ({
      id: row.id as string,
      message: row.message as string,
      startsOn: String(row.starts_on || "").slice(0, 10),
      endsOn: String(row.ends_on || "").slice(0, 10),
      price: Math.round(Number(row.price_cents || 0) / 100),
      status: row.status as string,
      logoUrl: (row.logo_url as string | null) || null,
    }));

    return NextResponse.json({ ok: true, ads, price: HEADER_AD_SLOT });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
