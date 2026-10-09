import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

async function activateMembershipFromSession(session: Stripe.Checkout.Session) {
  const dealerId =
    session.metadata?.dealerId || session.client_reference_id || "";
  if (!dealerId) return;

  const stripe = getStripe();
  const supabase = getSupabaseAdmin();

  let periodEnd: string | null = null;
  let subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id || null;

  if (subscriptionId) {
    const subscription = (await stripe.subscriptions.retrieve(
      subscriptionId,
    )) as Stripe.Subscription & { current_period_end?: number };
    if (subscription.current_period_end) {
      periodEnd = new Date(subscription.current_period_end * 1000).toISOString();
    }
    subscriptionId = subscription.id;
  }

  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id || null;

  await supabase.rpc("dealer_set_membership", {
    p_dealer_id: dealerId,
    p_membership_status: "active",
    p_stripe_customer_id: customerId,
    p_stripe_subscription_id: subscriptionId,
    p_period_end: periodEnd,
  });
}

async function completeLeadCheckout(session: Stripe.Checkout.Session) {
  const supabase = getSupabaseAdmin();
  const pendingRes = await supabase.rpc("dealer_get_pending_lead_checkout", {
    p_stripe_session_id: session.id,
  });
  if (pendingRes.error) {
    throw new Error(pendingRes.error.message);
  }

  const pending = Array.isArray(pendingRes.data)
    ? pendingRes.data[0]
    : pendingRes.data;
  if (!pending) return;
  if (pending.status === "completed") return;

  const purchaseRes = await supabase.rpc("dealer_purchase_lead", {
    p_dealer_id: pending.dealer_id,
    p_buyer_id: pending.buyer_id,
    p_price_cents: pending.price_cents,
  });
  if (purchaseRes.error) {
    // If already purchased, just mark pending completed.
    if (!purchaseRes.error.message.toLowerCase().includes("already purchased")) {
      throw new Error(purchaseRes.error.message);
    }
  } else {
    const purchased = Array.isArray(purchaseRes.data)
      ? purchaseRes.data[0]
      : purchaseRes.data;
    if (purchased?.purchase_id) {
      await supabase.rpc("dealer_mark_lead_purchase_paid", {
        p_purchase_id: purchased.purchase_id,
      });
    }
  }

  await supabase.rpc("dealer_mark_pending_lead_checkout", {
    p_stripe_session_id: session.id,
    p_status: "completed",
  });
}

export async function POST(request: Request) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: "Stripe is not configured." },
        { status: 503 },
      );
    }

    const stripe = getStripe();
    const signature = request.headers.get("stripe-signature");
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const rawBody = await request.text();

    let event: Stripe.Event;
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } else {
      // Fallback for initial setup before webhook secret is added.
      event = JSON.parse(rawBody) as Stripe.Event;
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const type = session.metadata?.type;
      if (type === "membership" || session.mode === "subscription") {
        await activateMembershipFromSession(session);
      }
      if (type === "header_ad") {
        const supabase = getSupabaseAdmin();
        const activated = await supabase.rpc("dealer_activate_header_ad", {
          p_stripe_session_id: session.id,
        });
        if (activated.error) {
          throw new Error(activated.error.message);
        }
      }
      if (type === "lead" || (session.mode === "payment" && session.metadata?.buyerId)) {
        await completeLeadCheckout(session);
      }
    }

    if (
      event.type === "customer.subscription.deleted" ||
      event.type === "customer.subscription.updated"
    ) {
      const subscription = event.data.object as Stripe.Subscription & {
        current_period_end?: number;
      };
      const dealerId = subscription.metadata?.dealerId;
      if (dealerId) {
        const supabase = getSupabaseAdmin();
        const status =
          subscription.status === "active" || subscription.status === "trialing"
            ? "active"
            : "inactive";
        await supabase.rpc("dealer_set_membership", {
          p_dealer_id: dealerId,
          p_membership_status: status,
          p_stripe_customer_id:
            typeof subscription.customer === "string"
              ? subscription.customer
              : subscription.customer?.id || null,
          p_stripe_subscription_id: subscription.id,
          p_period_end: subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : null,
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Webhook error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
