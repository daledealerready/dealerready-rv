import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.rpc("public_active_header_ads");
    if (error) {
      const message = error.message.toLowerCase();
      if (
        message.includes("public_active_header_ads") ||
        message.includes("could not find the function") ||
        message.includes("does not exist") ||
        message.includes("schema cache")
      ) {
        return NextResponse.json({ ok: true, ads: [] });
      }
      return NextResponse.json(
        { error: error.message || "Could not load ads." },
        { status: 500 },
      );
    }

    const ads = (Array.isArray(data) ? data : []).map((row) => ({
      id: row.id as string,
      message: row.message as string,
      dealerName: (row.dealer_name as string) || "Dealer",
    }));

    return NextResponse.json({ ok: true, ads });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
