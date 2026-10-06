import { NextResponse } from "next/server";
import type { DealerApplication } from "@/lib/dealer";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { application?: DealerApplication };
    const application = body.application;

    if (!application) {
      return NextResponse.json(
        { error: "Missing dealer application." },
        { status: 400 },
      );
    }

    if (
      !application.legalBusinessName.trim() ||
      !application.phone.trim() ||
      !application.primaryContact.trim() ||
      !application.email.trim() ||
      !application.address.trim() ||
      !application.city.trim() ||
      !application.state.trim() ||
      !application.zip.trim()
    ) {
      return NextResponse.json(
        { error: "Please complete the required dealership fields." },
        { status: 400 },
      );
    }

    if (application.rvCategories.length === 0) {
      return NextResponse.json(
        { error: "Select at least one RV category you sell." },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("dealers").insert({
      status: "pending",
      legal_business_name: application.legalBusinessName.trim(),
      dba: application.dba.trim() || null,
      website: application.website.trim() || null,
      address: application.address.trim(),
      city: application.city.trim(),
      state: application.state.trim(),
      zip: application.zip.trim(),
      phone: application.phone.trim(),
      primary_contact: application.primaryContact.trim(),
      email: application.email.trim().toLowerCase(),
      locations_count: application.locationsCount.trim() || null,
      rv_categories: application.rvCategories,
      brands_carried: application.brandsCarried.trim() || null,
      inventory_type: application.inventoryType || null,
      typical_price_range: application.typicalPriceRange.trim() || null,
      states_served: application.statesServed.trim() || null,
      notes: application.notes.trim() || null,
      application,
    });

    if (error) {
      const message = error.message || "Could not submit application.";
      return NextResponse.json(
        {
          error:
            message.toLowerCase().includes("dealers") ||
            message.toLowerCase().includes("relation")
              ? "Dealer database setup is not finished yet. Run the dealers SQL in Supabase."
              : message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      status: "pending",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
