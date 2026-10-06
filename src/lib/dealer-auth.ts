import { createHmac, timingSafeEqual, randomBytes } from "crypto";

export type DealerSessionPayload = {
  dealerId: string;
  email: string;
  issuedAt: number;
};

function getSessionSecret() {
  return (
    process.env.DEALER_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    process.env.PHONE_VERIFY_SECRET ||
    "dealerready-dev-secret"
  );
}

export function createTempDealerPassword() {
  const raw = randomBytes(6).toString("base64url").replace(/[^a-zA-Z0-9]/g, "");
  return `DR-${raw.slice(0, 8)}`;
}

export function createDealerSessionToken(dealerId: string, email: string) {
  const payload: DealerSessionPayload = {
    dealerId,
    email: email.toLowerCase(),
    issuedAt: Date.now(),
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", getSessionSecret())
    .update(body)
    .digest("base64url");
  return `${body}.${signature}`;
}

export function verifyDealerSessionToken(
  token: string,
  maxAgeMs = 1000 * 60 * 60 * 24 * 14,
): DealerSessionPayload | null {
  try {
    const [body, signature] = token.split(".");
    if (!body || !signature) return null;

    const expected = createHmac("sha256", getSessionSecret())
      .update(body)
      .digest("base64url");
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as DealerSessionPayload;

    if (!payload?.dealerId || !payload?.email || !payload?.issuedAt) return null;
    if (Date.now() - payload.issuedAt > maxAgeMs) return null;

    return payload;
  } catch {
    return null;
  }
}
