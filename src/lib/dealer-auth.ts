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
  const issuedAt = Date.now();
  const payload = `${dealerId}.${email.toLowerCase()}.${issuedAt}`;
  const signature = createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("hex");
  return Buffer.from(`${payload}.${signature}`).toString("base64url");
}

export function verifyDealerSessionToken(
  token: string,
  maxAgeMs = 1000 * 60 * 60 * 24 * 14,
): DealerSessionPayload | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const parts = decoded.split(".");
    if (parts.length !== 4) return null;
    const [dealerId, email, issuedAtRaw, signature] = parts;
    const issuedAt = Number(issuedAtRaw);
    if (!dealerId || !email || !Number.isFinite(issuedAt)) return null;
    if (Date.now() - issuedAt > maxAgeMs) return null;

    const payload = `${dealerId}.${email}.${issuedAtRaw}`;
    const expected = createHmac("sha256", getSessionSecret())
      .update(payload)
      .digest("hex");
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

    return { dealerId, email, issuedAt };
  } catch {
    return null;
  }
}
