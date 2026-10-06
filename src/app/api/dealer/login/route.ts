import { NextResponse } from "next/server";
import { createDealerSessionToken } from "@/lib/dealer-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };
    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password?.trim() ?? "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Enter your email and password." },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.rpc("dealer_login", {
      p_email: email,
      p_password: password,
    });

    if (error) {
      const message = error.message || "Login failed.";
      if (
        message.toLowerCase().includes("could not find the function") ||
        message.toLowerCase().includes("dealer_login")
      ) {
        return NextResponse.json(
          {
            error:
              "Dealer login is not set up yet. Run the dealer login SQL in Supabase.",
          },
          { status: 500 },
        );
      }
      return NextResponse.json({ error: message }, { status: 500 });
    }

    const dealer = Array.isArray(data) ? data[0] : data;
    if (!dealer) {
      return NextResponse.json(
        {
          error:
            "Login failed. Use an approved dealer email and temporary password.",
        },
        { status: 401 },
      );
    }

    const token = createDealerSessionToken(dealer.id, dealer.email);

    return NextResponse.json({
      ok: true,
      token,
      dealer: {
        id: dealer.id,
        legalBusinessName: dealer.legal_business_name,
        dba: dealer.dba,
        email: dealer.email,
        primaryContact: dealer.primary_contact,
        status: dealer.status,
        phone: dealer.phone,
        city: dealer.city,
        state: dealer.state,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
