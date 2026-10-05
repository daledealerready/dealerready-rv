import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

type Body = {
  password?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;
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
    const { data, error } = await supabase.rpc("admin_list_buyers", {
      p_password: password,
    });

    if (error) {
      const message = error.message || "Could not load buyers.";
      if (message.toLowerCase().includes("unauthorized")) {
        return NextResponse.json(
          { error: "Incorrect password." },
          { status: 401 },
        );
      }
      if (
        message.toLowerCase().includes("could not find the function") ||
        message.toLowerCase().includes("admin_list_buyers")
      ) {
        return NextResponse.json(
          {
            error:
              "Admin database setup is not finished yet. Run the admin SQL in Supabase.",
          },
          { status: 500 },
        );
      }
      return NextResponse.json({ error: message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      buyers: data ?? [],
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
