import { NextResponse } from "next/server";
import { parseExactUnit } from "@/lib/exact-unit";
import { getSupabaseAdmin } from "@/lib/supabase";

type InventoryRow = {
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
  dealers:
    | { legal_business_name: string | null; dba: string | null; city: string | null; state: string | null }
    | { legal_business_name: string | null; dba: string | null; city: string | null; state: string | null }[]
    | null;
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
    let requestBuilder = supabase
      .from("dealer_inventory")
      .select(
        "id, year, manufacturer, model, floorplan, condition, price_cents, city, state, stock_number, dealers(legal_business_name, dba, city, state)",
      )
      .eq("is_active", true)
      .limit(50);

    const like = (value: string) => value.replace(/[%_,.()]/g, " ").trim();
    if (unit.year) requestBuilder = requestBuilder.eq("year", Number(unit.year));
    if (unit.manufacturer) {
      requestBuilder = requestBuilder.ilike("manufacturer", `%${like(unit.manufacturer)}%`);
    }
    if (unit.model) requestBuilder = requestBuilder.ilike("model", `%${like(unit.model)}%`);
    if (unit.floorplan) {
      const compact = like(unit.floorplan).replace(/\s+/g, "");
      requestBuilder = requestBuilder.or(
        `floorplan.ilike.%${like(unit.floorplan)}%,floorplan.ilike.%${compact}%`,
      );
    }

    const { data, error } = await requestBuilder;
    if (error) {
      const message = error.message.toLowerCase();
      if (
        message.includes("dealer_inventory") ||
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

    const units = ((data || []) as InventoryRow[]).map((row) => {
      const dealer = Array.isArray(row.dealers) ? row.dealers[0] : row.dealers;
      return {
        id: row.id,
        year: row.year,
        manufacturer: row.manufacturer,
        model: row.model,
        floorplan: row.floorplan,
        condition: row.condition,
        price: row.price_cents ? Math.round(row.price_cents / 100) : null,
        city: row.city || dealer?.city || null,
        state: row.state || dealer?.state || null,
        stockNumber: row.stock_number,
        dealerName: dealer?.dba || dealer?.legal_business_name || "Participating dealer",
      };
    });

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
