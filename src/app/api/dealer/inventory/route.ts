import { NextResponse } from "next/server";
import { verifyDealerSessionToken } from "@/lib/dealer-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

type InventoryBody = {
  token?: string;
  action?: "list" | "add" | "remove";
  id?: string;
  year?: string;
  manufacturer?: string;
  model?: string;
  floorplan?: string;
  condition?: string;
  price?: string;
  city?: string;
  state?: string;
  stockNumber?: string;
};

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
};

function clean(value: string | undefined) {
  return value?.trim() || "";
}

function mapUnits(rows: InventoryRow[]) {
  return rows.map((row) => ({
    id: row.id,
    year: row.year,
    manufacturer: row.manufacturer,
    model: row.model,
    floorplan: row.floorplan,
    condition: row.condition,
    price: row.price_cents == null ? null : Math.round(row.price_cents / 100),
    city: row.city,
    state: row.state,
    stockNumber: row.stock_number,
  }));
}

function failure(error: { message?: string } | null, fallback: string) {
  const message = error?.message || fallback;
  const lower = message.toLowerCase();
  if (lower.includes("unauthorized")) {
    return NextResponse.json(
      { error: "Dealer account is not approved." },
      { status: 401 },
    );
  }
  if (
    lower.includes("dealer_inventory") ||
    lower.includes("could not find the function") ||
    lower.includes("schema cache")
  ) {
    return NextResponse.json(
      {
        error:
          "Inventory access SQL is not installed yet. Run dealer_inventory_access.sql in Supabase.",
      },
      { status: 500 },
    );
  }
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as InventoryBody;
    const session = verifyDealerSessionToken(body.token?.trim() || "");
    if (!session) {
      return NextResponse.json(
        { error: "Session expired. Please sign in again." },
        { status: 401 },
      );
    }

    const supabase = getSupabaseAdmin();
    const action = body.action || "list";

    if (action === "remove") {
      const id = clean(body.id);
      if (!id) {
        return NextResponse.json({ error: "Missing unit." }, { status: 400 });
      }
      const removed = await supabase.rpc("dealer_inventory_remove", {
        p_dealer_id: session.dealerId,
        p_unit_id: id,
      });
      if (removed.error) return failure(removed.error, "Could not remove unit.");
    }

    if (action === "add") {
      const manufacturer = clean(body.manufacturer);
      const model = clean(body.model);
      const yearText = clean(body.year);
      const priceText = clean(body.price).replace(/[$,]/g, "");
      if (!manufacturer || !model) {
        return NextResponse.json(
          { error: "Brand and model are required." },
          { status: 400 },
        );
      }
      const year = yearText ? Number(yearText) : null;
      if (
        yearText &&
        (year == null || !Number.isInteger(year) || year < 1980 || year > 2035)
      ) {
        return NextResponse.json(
          { error: "Enter a valid year, like 2027." },
          { status: 400 },
        );
      }
      const price = priceText ? Number(priceText) : null;
      if (priceText && (price == null || !Number.isFinite(price) || price < 0)) {
        return NextResponse.json(
          { error: "Enter a valid price." },
          { status: 400 },
        );
      }

      const added = await supabase.rpc("dealer_inventory_add", {
        p_dealer_id: session.dealerId,
        p_year: year,
        p_manufacturer: manufacturer,
        p_model: model,
        p_floorplan: clean(body.floorplan),
        p_condition: clean(body.condition),
        p_price_cents: price == null ? null : Math.round(price * 100),
        p_city: clean(body.city),
        p_state: clean(body.state),
        p_stock_number: clean(body.stockNumber),
      });
      if (added.error) return failure(added.error, "Could not add unit.");
    }

    const listed = await supabase.rpc("dealer_inventory_list", {
      p_dealer_id: session.dealerId,
    });
    if (listed.error) return failure(listed.error, "Could not load inventory.");

    const rows = (Array.isArray(listed.data) ? listed.data : []) as InventoryRow[];
    return NextResponse.json({ ok: true, units: mapUnits(rows) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
