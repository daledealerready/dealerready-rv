import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const ALLOWED = new Set(["pending", "approved", "suspended", "rejected"]);

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      password?: string;
      dealerId?: string;
      status?: string;
    };
    const password = body.password?.trim() ?? "";
    const expected = process.env.ADMIN_PASSWORD?.trim() ?? "";
    const dealerId = body.dealerId?.trim() ?? "";
    const status = body.status?.trim() ?? "";

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

    if (!dealerId || !ALLOWED.has(status)) {
      return NextResponse.json(
        { error: "Invalid dealer update request." },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.rpc("admin_update_dealer_status", {
      p_password: password,
      p_dealer_id: dealerId,
      p_status: status,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Could not update dealer." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      dealer: data,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
