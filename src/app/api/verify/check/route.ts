import { NextResponse } from "next/server";
import {
  createPhoneVerificationToken,
  isTwilioConfigured,
  normalizeUsPhone,
  twilioCheckVerification,
} from "@/lib/phone";

export async function POST(request: Request) {
  try {
    if (!isTwilioConfigured()) {
      return NextResponse.json(
        {
          error:
            "Phone verification is not set up yet. Add Twilio keys in Vercel first.",
        },
        { status: 503 },
      );
    }

    const body = (await request.json()) as { mobile?: string; code?: string };
    const phone = normalizeUsPhone(body.mobile || "");
    const code = (body.code || "").replace(/\D/g, "");

    if (!phone) {
      return NextResponse.json(
        { error: "Enter a valid U.S. mobile number." },
        { status: 400 },
      );
    }

    if (code.length < 4 || code.length > 10) {
      return NextResponse.json(
        { error: "Enter the 6-digit code from your text message." },
        { status: 400 },
      );
    }

    const result = await twilioCheckVerification(phone, code);
    if (result.status !== "approved") {
      return NextResponse.json(
        { error: "That code is incorrect or expired. Try again." },
        { status: 400 },
      );
    }

    const verificationToken = createPhoneVerificationToken(phone);

    return NextResponse.json({
      ok: true,
      phone,
      verificationToken,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not verify code.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
