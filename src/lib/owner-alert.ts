const DEFAULT_ALERT_EMAIL = "daleburns1@yahoo.com";

export type ShopperAlert = {
  updated: boolean;
  buyerCode: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  zip: string;
  rvTypes: string[];
  manufacturer: string;
  model: string;
  timeline: string;
  minPrice: string;
  maxPrice: string;
  score: number;
  category: string;
};

export type SellAlert = {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  zip: string;
  rvCategory: string;
  year: string;
  make: string;
  model: string;
  payoffStatus: string;
  lenderName: string;
  payoffAmount: string;
  notes: string;
  photoCount: number;
  videoCount: number;
};

export function shopperAlertMessage(input: ShopperAlert) {
  const name = `${input.firstName} ${input.lastName}`.trim();
  const looking = [input.rvTypes.filter(Boolean).join(", "), input.manufacturer, input.model]
    .filter(Boolean)
    .join(" · ");
  const budget = [input.minPrice, input.maxPrice].filter(Boolean).join(" to ");
  const lines = [
    input.updated ? "A shopper updated a profile." : "A shopper finished a new profile.",
    "",
    `Name: ${name}`,
    `Phone: ${input.mobile}`,
    `Email: ${input.email}`,
    `ZIP: ${input.zip}`,
    `Looking for: ${looking || "Not listed"}`,
    `Timeline: ${input.timeline || "Not listed"}`,
    budget ? `Budget: ${budget}` : "",
    `Readiness: ${input.category} (${input.score})`,
    `Buyer code: ${input.buyerCode}`,
    "",
    "Full profile: https://dealerreadyrv.com/admin",
  ].filter((line) => line !== "");

  return {
    subject: `DealerReady: ${input.updated ? "updated shopper" : "new shopper"} — ${name}`,
    text: lines.join("\n"),
  };
}

export function sellAlertMessage(input: SellAlert) {
  const name = `${input.firstName} ${input.lastName}`.trim();
  const unit = [input.year, input.make, input.model].filter(Boolean).join(" ");
  const lines = [
    "Someone asked DealerReady to buy their RV.",
    "",
    `Name: ${name}`,
    `Phone: ${input.mobile}`,
    `Email: ${input.email}`,
    `ZIP: ${input.zip || "Not listed"}`,
    `Unit: ${[unit, input.rvCategory].filter(Boolean).join(" · ") || "Not listed"}`,
    `Payoff: ${input.payoffStatus}`,
    input.lenderName ? `Financing institution: ${input.lenderName}` : "",
    input.payoffAmount ? `Payoff amount: ${input.payoffAmount}` : "",
    input.notes ? `Notes: ${input.notes}` : "",
    `Photos: ${input.photoCount}`,
    `Videos: ${input.videoCount}`,
    "",
    "Open Supabase, Table Editor, sell_requests. Photos and video are in Storage, sell-media.",
  ].filter((line) => line !== "");

  return {
    subject: `DealerReady: We Buy request — ${name}`,
    text: lines.join("\n"),
  };
}

export async function sendOwnerAlert(message: { subject: string; text: string }) {
  const to = process.env.ALERT_EMAIL?.trim() || DEFAULT_ALERT_EMAIL;
  const key = process.env.RESEND_API_KEY?.trim();
  if (!to || !key) {
    console.error(`Owner alert not sent (mail sender is not connected): ${message.subject}`);
    return false;
  }

  const from = process.env.ALERT_FROM?.trim() || "DealerReady RV <onboarding@resend.dev>";
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: message.subject,
        text: message.text,
      }),
    });
    if (!response.ok) {
      console.error(`Owner alert failed (${response.status}) for: ${message.subject}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error(
      "Owner alert failed",
      error instanceof Error ? error.message : "unknown",
    );
    return false;
  }
}
