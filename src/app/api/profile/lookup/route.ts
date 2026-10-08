import { NextResponse } from "next/server";
import type { BuyerProfile } from "@/lib/profile";
import { emptyProfile } from "@/lib/profile";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      buyerCode?: string;
    };

    const email = body.email?.trim().toLowerCase() || "";
    const buyerCode = body.buyerCode?.trim().toUpperCase() || "";

    if (!email || !buyerCode) {
      return NextResponse.json(
        { error: "Enter your email and Buyer ID to load your profile." },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("buyer_profiles")
      .select("buyer_code, email, profile, category, score, updated_at")
      .eq("email", email)
      .eq("buyer_code", buyerCode)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: error.message || "Could not look up profile." },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          error:
            "No matching client found. Check your email and Buyer ID (example: DR-12345).",
        },
        { status: 404 },
      );
    }

    const stored = (data.profile || {}) as Partial<BuyerProfile>;
    const profile: BuyerProfile = {
      ...emptyProfile,
      ...stored,
      email: data.email || email,
      phoneVerificationToken: "",
    };

    return NextResponse.json({
      ok: true,
      buyerCode: data.buyer_code,
      category: data.category,
      score: data.score,
      updatedAt: data.updated_at,
      profile,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
