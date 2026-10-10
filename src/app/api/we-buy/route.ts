import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const CATEGORIES = [
  "Class A Diesel",
  "Class A Gas",
  "Class C",
  "High-end Fifth Wheel",
];

type SellFile = {
  path?: string;
  kind?: string;
  name?: string;
};

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
  payoffStatus?: string;
  lenderName?: string;
  files?: SellFile[];
};

function clean(value: string | undefined) {
  return value?.trim() || "";
}

function cleanFiles(files: SellFile[] | undefined) {
  return (files || []).slice(0, 22).map((file) => ({
    path: clean(file.path),
    kind: file.kind === "video" ? "video" : file.kind === "photo" ? "photo" : "",
    name: clean(file.name).slice(0, 180),
  }));
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
    const payoffStatus = clean(body.payoffStatus);
    const lenderName = payoffStatus === "Financed" ? clean(body.lenderName) : "";
    if (payoffStatus !== "Paid off" && payoffStatus !== "Financed") {
      return NextResponse.json(
        { error: "Tell us if the RV is paid off or financed." },
        { status: 400 },
      );
    }
    if (payoffStatus === "Financed" && lenderName.length < 2) {
      return NextResponse.json(
        { error: "Enter the financing institution name." },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();
    const files = cleanFiles(body.files);
    const pathOk = /^[0-9a-f-]{36}\/[A-Za-z0-9._-]{1,180}$/i;
    if (files.some((file) => (file.kind !== "photo" && file.kind !== "video") || !pathOk.test(file.path))) {
      return NextResponse.json({ error: "One of the photos or videos could not be saved." }, { status: 400 });
    }
    const payload = {
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
      p_files: files,
      p_payoff_status: payoffStatus,
      p_lender_name: lenderName,
    };
    let { error } = await supabase.rpc("submit_sell_request", payload);
    if (error) {
      const message = error.message.toLowerCase();
      if (message.includes("could not find the function") || message.includes("schema cache")) {
        const payoffNote = payoffStatus === "Financed" ? `Financed: ${lenderName}` : "Paid off";
        const notes = [clean(body.notes), payoffNote].filter(Boolean).join("\n");
        const fallback = await supabase.rpc("submit_sell_request", {
          p_first_name: firstName,
          p_last_name: lastName,
          p_email: email,
          p_mobile: mobile,
          p_zip: clean(body.zip),
          p_rv_category: rvCategory,
          p_year: clean(body.year),
          p_make: clean(body.make),
          p_model: clean(body.model),
          p_notes: notes,
          p_files: files,
        });
        error = fallback.error;
      }
    }

    if (error) {
      const message = error.message.toLowerCase();
      if (
        files.length > 0 &&
        (message.includes("could not find the function") ||
          message.includes("schema cache") ||
          message.includes("sell_request_files"))
      ) {
        return NextResponse.json(
          {
            error:
              "Photo and video storage is not turned on yet. Run sell_media.sql in Supabase, then send the request again.",
          },
          { status: 500 },
        );
      }
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
