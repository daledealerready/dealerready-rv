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

function rowPayload(
  profile: BuyerProfile,
  scoredProfile: BuyerProfile,
  score: number,
  category: string,
  phoneVerified: boolean,
  phone: string | null,
) {
  return {
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
    updated_at: new Date().toISOString(),
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      profile?: BuyerProfile;
      buyerCode?: string;
    };
    const profile = body.profile;
    const requestedCode = body.buyerCode?.trim().toUpperCase() || "";

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
    const email = profile.email.trim().toLowerCase();
    const payload = rowPayload(
      profile,
      scoredProfile,
      score,
      category,
      phoneVerified,
      phone,
    );

    // Prefer exact Buyer ID match, otherwise match by email so returning
    // clients update one record instead of creating duplicates.
    let existing:
      | {
          id: string;
          buyer_code: string;
          score: number | null;
          category: string | null;
          profile: unknown;
        }
      | null = null;

    if (requestedCode) {
      const byCode = await supabase
        .from("buyer_profiles")
        .select("id, buyer_code, score, category, profile")
        .eq("buyer_code", requestedCode)
        .maybeSingle();
      if (!byCode.error && byCode.data) {
        existing = byCode.data;
      }
    }

    if (!existing) {
      const byEmail = await supabase
        .from("buyer_profiles")
        .select("id, buyer_code, score, category, profile")
        .eq("email", email)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!byEmail.error && byEmail.data) {
        existing = byEmail.data;
      }
    }

    if (existing) {
      const historyInsert = await supabase.from("buyer_profile_history").insert({
        buyer_id: existing.id,
        buyer_code: existing.buyer_code,
        score: existing.score,
        category: existing.category,
        snapshot: existing.profile || {},
      });

      // If history table is not created yet, still allow the profile update.
      if (historyInsert.error) {
        const historyMsg = historyInsert.error.message?.toLowerCase() || "";
        const historyMissing =
          historyMsg.includes("buyer_profile_history") ||
          historyMsg.includes("does not exist");
        if (!historyMissing) {
          return NextResponse.json(
            {
              error:
                historyInsert.error.message ||
                "Could not archive prior profile.",
            },
            { status: 500 },
          );
        }
      }

      const { error: updateError } = await supabase
        .from("buyer_profiles")
        .update(payload)
        .eq("id", existing.id);

      if (updateError) {
        // Older DBs may not have phone_verified.
        if (updateError.message?.toLowerCase().includes("phone_verified")) {
          const { phone_verified: _ignored, ...withoutPhone } = payload;
          const retry = await supabase
            .from("buyer_profiles")
            .update(withoutPhone)
            .eq("id", existing.id);
          if (retry.error) {
            return NextResponse.json(
              { error: retry.error.message || "Could not update buyer profile." },
              { status: 500 },
            );
          }
        } else {
          return NextResponse.json(
            { error: updateError.message || "Could not update buyer profile." },
            { status: 500 },
          );
        }
      }

      return NextResponse.json({
        ok: true,
        updated: true,
        buyerCode: existing.buyer_code,
        score,
        category,
        phoneVerified,
      });
    }

    let buyerCode = makeBuyerCode();
    let saved = false;
    let lastError: string | null = null;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const { error } = await supabase.from("buyer_profiles").insert({
        buyer_code: buyerCode,
        ...payload,
      });

      if (!error) {
        saved = true;
        break;
      }

      if (error.message?.toLowerCase().includes("phone_verified")) {
        const { phone_verified: _ignored, ...withoutPhone } = payload;
        const retry = await supabase.from("buyer_profiles").insert({
          buyer_code: buyerCode,
          ...withoutPhone,
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
      updated: false,
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
