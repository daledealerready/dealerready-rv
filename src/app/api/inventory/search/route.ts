import { NextResponse } from "next/server";
import { parseExactUnit } from "@/lib/exact-unit";
import { getSupabaseAdmin } from "@/lib/supabase";

type SearchRow = {
  id: string;
  year: number | null;
  manufacturer: string;
  model: string;
  floorplan: string | null;
  condition: string | null;
  price_cents: number | null;
  city: string | null;
  state: string | null;
  stock_number: string | null;
  dealer_name: string | null;
};

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() || "";
  const unit = parseExactUnit(query);

  if (!unit.raw) {
    return NextResponse.json({
      ok: true,
      unit,
      inventoryReady: true,
      units: [],
    });
  }

  try {
    const supabase = getSupabaseAdmin();
    const like = (value: string) => value.replace(/[%_]/g, " ").trim();
    const { data, error } = await supabase.rpc("search_dealer_inventory", {
      p_year: unit.year ? Number(unit.year) : null,
      p_manufacturer: like(unit.manufacturer),
      p_model: like(unit.model),
      p_floorplan: like(unit.floorplan),
    });

    if (error) {
      const message = error.message.toLowerCase();
      if (
        message.includes("search_dealer_inventory") ||
        message.includes("could not find the function") ||
        message.includes("does not exist") ||
        message.includes("schema cache")
      ) {
        return NextResponse.json({
          ok: true,
          unit,
          inventoryReady: false,
          units: [],
        });
      }
      return NextResponse.json(
        { error: error.message || "Could not search inventory." },
        { status: 500 },
      );
    }

    const units = ((data || []) as SearchRow[]).map((row) => ({
      id: row.id,
      year: row.year,
      manufacturer: row.manufacturer,
      model: row.model,
      floorplan: row.floorplan,
      condition: row.condition,
      price: row.price_cents ? Math.round(row.price_cents / 100) : null,
      city: row.city,
      state: row.state,
      stockNumber: row.stock_number,
      dealerName: row.dealer_name || "Participating dealer",
    }));

    return NextResponse.json({
      ok: true,
      unit,
      inventoryReady: true,
      units,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
