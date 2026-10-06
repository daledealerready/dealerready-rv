import { NextResponse } from "next/server";
import { createTempDealerPassword } from "@/lib/dealer-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      password?: string;
      dealerId?: string;
    };
    const password = body.password?.trim() ?? "";
    const expected = process.env.ADMIN_PASSWORD?.trim() ?? "";
    const dealerId = body.dealerId?.trim() ?? "";

    if (!expected) {
      return NextResponse.json(
        { error: "Admin password is not configured yet." },
        { status: 500 },
      );
    }
    if (!password || password !== expected) {
      return NextResponse.json(
        { error: "Incorrect password." },
        { status: 401 },
      );
    }
    if (!dealerId) {
      return NextResponse.json(
        { error: "Missing dealer id." },
        { status: 400 },
      );
    }

    const tempPassword = createTempDealerPassword();
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.rpc(
      "admin_approve_dealer_with_password",
      {
        p_password: password,
        p_dealer_id: dealerId,
        p_temp_password: tempPassword,
      },
    );

    if (error) {
      const message = error.message || "Could not approve dealer.";
      if (
        message.toLowerCase().includes("could not find the function") ||
        message.toLowerCase().includes("admin_approve_dealer_with_password")
      ) {
        return NextResponse.json(
          {
            error:
              "Dealer login SQL is not installed yet. Run dealer_login.sql in Supabase.",
          },
          { status: 500 },
        );
      }
      return NextResponse.json({ error: message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      dealer: data,
      tempPassword,
      loginUrl: "/sign-in",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
