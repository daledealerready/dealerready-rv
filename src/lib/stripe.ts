import Stripe from "stripe";
import { PILOT_MEMBERSHIP_MONTHLY } from "@/lib/pricing";

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Stripe is not configured yet.");
  }
  return new Stripe(key);
}

export function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    "https://dealerreadyrv.com"
  ).replace(/\/$/, "");
}

export function membershipAmountCents() {
  return PILOT_MEMBERSHIP_MONTHLY * 100;
}
