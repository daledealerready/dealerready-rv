import { NextResponse } from "next/server";
import type { BuyerProfile } from "@/lib/profile";
import { scoreProfile } from "@/lib/profile";
import {
  isTwilioConfigured,
  normalizeUsPhone,
  verifyPhoneVerificationToken,
} from "@/lib/phone";
import { getSupabaseAdmin } from "@/lib/supabase";

function makeBuyerCode() {
  const n = Math.floor(10000 + Math.random() * 90000);
  return `DR-${n}`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { profile?: BuyerProfile };
    const profile = body.profile;

    if (!profile) {
      return NextResponse.json(
        { error: "Missing buyer profile." },
        { status: 400 },
      );
    }

    if (
      !profile.firstName?.trim() ||
      !profile.lastName?.trim() ||
      !profile.email?.trim() ||
      !profile.mobile?.trim() ||
      !profile.zip?.trim()
    ) {
      return NextResponse.json(
        { error: "Contact information is incomplete." },
        { status: 400 },
      );
    }

    if (
      !profile.authAccurate ||
      !profile.authNotLender ||
      !profile.authMatch ||
      !profile.authPrivacy
    ) {
      return NextResponse.json(
        { error: "Authorization checkboxes are required." },
        { status: 400 },
      );
    }

    const phone = normalizeUsPhone(profile.mobile);
    let phoneVerified = false;

    if (isTwilioConfigured()) {
      if (!phone) {
        return NextResponse.json(
          { error: "Enter a valid U.S. mobile number." },
          { status: 400 },
        );
      }
      phoneVerified = verifyPhoneVerificationToken(
        profile.phoneVerificationToken || "",
        phone,
      );
      if (!phoneVerified) {
        return NextResponse.json(
          { error: "Please verify your mobile number before submitting." },
          { status: 400 },
        );
      }
    }

    const scoredProfile: BuyerProfile = {
      ...profile,
      phoneVerified,
      mobile: phone || profile.mobile.trim(),
    };

    const { score, category } = scoreProfile(scoredProfile);
    const supabase = getSupabaseAdmin();

    let buyerCode = makeBuyerCode();
    let saved = false;
    let lastError: string | null = null;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const { error } = await supabase.from("buyer_profiles").insert({
        buyer_code: buyerCode,
        score,
        category,
        first_name: profile.firstName.trim(),
        last_name: profile.lastName.trim(),
        email: profile.email.trim().toLowerCase(),
        mobile: phone || profile.mobile.trim(),
        zip: profile.zip.trim(),
        purchase_timeline: profile.purchaseTimeline,
        rv_types: profile.rvTypes,
        condition: profile.condition,
        preferred_manufacturer: profile.preferredManufacturer,
        min_price: profile.minPrice,
        max_price: profile.maxPrice,
        down_payment: profile.downPayment,
        has_trade: profile.hasTrade,
        credit_range: profile.creditRange,
        income_range: profile.incomeRange,
        travel_distance: profile.travelDistance,
        preferred_contact: profile.preferredContact,
        phone_verified: phoneVerified,
        profile: {
          ...scoredProfile,
          phoneVerificationToken: "",
        },
        status: "submitted",
      });

      if (!error) {
        saved = true;
        break;
      }

      // Older databases may not have phone_verified yet; retry without it.
      if (error.message?.toLowerCase().includes("phone_verified")) {
        const retry = await supabase.from("buyer_profiles").insert({
          buyer_code: buyerCode,
          score,
          category,
          first_name: profile.firstName.trim(),
          last_name: profile.lastName.trim(),
          email: profile.email.trim().toLowerCase(),
          mobile: phone || profile.mobile.trim(),
          zip: profile.zip.trim(),
          purchase_timeline: profile.purchaseTimeline,
          rv_types: profile.rvTypes,
          condition: profile.condition,
          preferred_manufacturer: profile.preferredManufacturer,
          min_price: profile.minPrice,
          max_price: profile.maxPrice,
          down_payment: profile.downPayment,
          has_trade: profile.hasTrade,
          credit_range: profile.creditRange,
          income_range: profile.incomeRange,
          travel_distance: profile.travelDistance,
          preferred_contact: profile.preferredContact,
          profile: {
            ...scoredProfile,
            phoneVerificationToken: "",
          },
          status: "submitted",
        });
        if (!retry.error) {
          saved = true;
          break;
        }
        lastError = retry.error.message;
        break;
      }

      lastError = error.message;
      if (error.code === "23505") {
        buyerCode = makeBuyerCode();
        continue;
      }
      break;
    }

    if (!saved) {
      return NextResponse.json(
        { error: lastError || "Could not save buyer profile." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      buyerCode,
      score,
      category,
      phoneVerified,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
