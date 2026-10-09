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

function clean(value: string | undefined) {
  return value?.trim() || "";
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
    const dealerRes = await supabase
      .from("dealers")
      .select("id, status, city, state")
      .eq("id", session.dealerId)
      .maybeSingle();

    if (dealerRes.error || !dealerRes.data || dealerRes.data.status !== "approved") {
      return NextResponse.json(
        { error: "Dealer account is not approved." },
        { status: 401 },
      );
    }

    const action = body.action || "list";

    if (action === "remove") {
      const id = clean(body.id);
      if (!id) {
        return NextResponse.json({ error: "Missing unit." }, { status: 400 });
      }
      const { error } = await supabase
        .from("dealer_inventory")
        .update({ is_active: false })
        .eq("id", id)
        .eq("dealer_id", session.dealerId);
      if (error) {
        return NextResponse.json(
          { error: error.message || "Could not remove unit." },
          { status: 500 },
        );
      }
      return NextResponse.json({ ok: true });
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

      const { error } = await supabase.from("dealer_inventory").insert({
        dealer_id: session.dealerId,
        year,
        manufacturer,
        model,
        floorplan: clean(body.floorplan) || null,
        condition: clean(body.condition) || null,
        price_cents: price == null ? null : Math.round(price * 100),
        city: clean(body.city) || dealerRes.data.city || null,
        state: clean(body.state) || dealerRes.data.state || null,
        stock_number: clean(body.stockNumber) || null,
        is_active: true,
      });
      if (error) {
        const message = error.message || "Could not add unit.";
        if (message.toLowerCase().includes("dealer_inventory")) {
          return NextResponse.json(
            { error: "Inventory SQL is not installed yet. Run dealer_inventory.sql." },
            { status: 500 },
          );
        }
        return NextResponse.json({ error: message }, { status: 500 });
      }
    }

    const { data, error } = await supabase
      .from("dealer_inventory")
      .select(
        "id, year, manufacturer, model, floorplan, condition, price_cents, city, state, stock_number, created_at",
      )
      .eq("dealer_id", session.dealerId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Could not load inventory." },
        { status: 500 },
      );
    }

    const units = (data || []).map((row) => ({
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

    return NextResponse.json({ ok: true, units });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
