import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { password?: string };
    const password = body.password?.trim() ?? "";
    const expected = process.env.ADMIN_PASSWORD?.trim() ?? "";

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

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.rpc("admin_list_dealers", {
      p_password: password,
    });

    if (error) {
      const message = error.message || "Could not load dealers.";
      if (message.toLowerCase().includes("unauthorized")) {
        return NextResponse.json(
          { error: "Incorrect password." },
          { status: 401 },
        );
      }
      if (
        message.toLowerCase().includes("could not find the function") ||
        message.toLowerCase().includes("admin_list_dealers") ||
        message.toLowerCase().includes("dealers")
      ) {
        return NextResponse.json(
          {
            error:
              "Dealer database setup is not finished yet. Run the dealers SQL in Supabase.",
          },
          { status: 500 },
        );
      }
      return NextResponse.json({ error: message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      dealers: data ?? [],
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
