import { NextResponse } from "next/server";
import {
  isTwilioConfigured,
  normalizeUsPhone,
  twilioSendVerification,
} from "@/lib/phone";

export async function GET() {
  return NextResponse.json({
    configured: isTwilioConfigured(),
  });
}

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

    const body = (await request.json()) as { mobile?: string };
    const phone = normalizeUsPhone(body.mobile || "");
    if (!phone) {
      return NextResponse.json(
        { error: "Enter a valid U.S. mobile number." },
        { status: 400 },
      );
    }

    await twilioSendVerification(phone);

    return NextResponse.json({
      ok: true,
      phone,
      message: "Verification code sent.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not send verification text.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
