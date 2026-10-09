import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const CATEGORIES = [
  "Class A Diesel",
  "Class A Gas",
  "Class C",
  "High-end Fifth Wheel",
];

type SellBody = {
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  zip?: string;
  rvCategory?: string;
  year?: string;
  make?: string;
  model?: string;
  notes?: string;
};

function clean(value: string | undefined) {
  return value?.trim() || "";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SellBody;
    const firstName = clean(body.firstName);
    const lastName = clean(body.lastName);
    const email = clean(body.email);
    const mobile = clean(body.mobile);
    const rvCategory = clean(body.rvCategory);

    if (!firstName || !lastName || !email.includes("@") || mobile.length < 7) {
      return NextResponse.json(
        { error: "Name, email, and mobile number are required." },
        { status: 400 },
      );
    }
    if (!CATEGORIES.includes(rvCategory)) {
      return NextResponse.json(
        { error: "Choose the type of RV you want to sell." },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.rpc("submit_sell_request", {
      p_first_name: firstName,
      p_last_name: lastName,
      p_email: email,
      p_mobile: mobile,
      p_zip: clean(body.zip),
      p_rv_category: rvCategory,
      p_year: clean(body.year),
      p_make: clean(body.make),
      p_model: clean(body.model),
      p_notes: clean(body.notes),
    });

    if (error) {
      const message = error.message.toLowerCase();
      if (
        message.includes("submit_sell_request") ||
        message.includes("could not find the function") ||
        message.includes("sell_requests")
      ) {
        return NextResponse.json(
          { error: "We Buy requests are not turned on yet. Run we_buy.sql in Supabase." },
          { status: 500 },
        );
      }
      return NextResponse.json(
        { error: error.message || "Could not save your request." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
