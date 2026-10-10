import { NextResponse } from "next/server";
import { sellAlertMessage, sendOwnerAlert } from "@/lib/owner-alert";
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
  payoffAmount?: string;
  files?: SellFile[];
};

function clean(value: string | undefined) {
  return value?.trim() || "";
}

function cleanAmount(value: string | undefined) {
  const raw = clean(value).replace(/[$,\s]/g, "");
  if (!raw) return "";
  if (!/^\d+(\.\d{1,2})?$/.test(raw)) return null;
  const amount = Number(raw);
  if (!Number.isFinite(amount) || amount < 0 || amount > 9_999_999_999) return null;
  return raw;
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
    const hasPayoff = payoffStatus === "Has a payoff";
    const lenderName = hasPayoff ? clean(body.lenderName) : "";
    const payoffAmount = hasPayoff ? cleanAmount(body.payoffAmount) : "";
    if (payoffStatus !== "Paid off" && payoffStatus !== "Has a payoff") {
      return NextResponse.json(
        { error: "Tell us if this RV has a payoff." },
        { status: 400 },
      );
    }
    if (payoffAmount === null) {
      return NextResponse.json(
        { error: "Enter the payoff amount as a number, or leave it blank." },
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
      p_payoff_amount: payoffAmount,
    };
    let { error } = await supabase.rpc("submit_sell_request", payload);
    if (error) {
      const message = error.message.toLowerCase();
      if (message.includes("could not find the function") || message.includes("schema cache")) {
        const payoffNote = hasPayoff
          ? ["Has a payoff", lenderName ? `Lender: ${lenderName}` : "", payoffAmount ? `Payoff amount: ${payoffAmount}` : ""]
              .filter(Boolean)
              .join(". ")
          : "Paid off";
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

    const photoCount = files.filter((file) => file.kind === "photo").length;
    const videoCount = files.filter((file) => file.kind === "video").length;
    await sendOwnerAlert(
      sellAlertMessage({
        firstName,
        lastName,
        email,
        mobile,
        zip: clean(body.zip),
        rvCategory,
        year: clean(body.year),
        make: clean(body.make),
        model: clean(body.model),
        payoffStatus,
        lenderName,
        payoffAmount,
        notes: clean(body.notes),
        photoCount,
        videoCount,
      }),
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
