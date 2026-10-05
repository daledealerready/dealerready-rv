import { createHmac, timingSafeEqual } from "crypto";

export function normalizeUsPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (input.trim().startsWith("+") && digits.length >= 10) return `+${digits}`;
  return null;
}

function getVerifySecret() {
  return (
    process.env.PHONE_VERIFY_SECRET ||
    process.env.TWILIO_AUTH_TOKEN ||
    process.env.ADMIN_PASSWORD ||
    ""
  );
}

export function isTwilioConfigured() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_VERIFY_SERVICE_SID,
  );
}

export function createPhoneVerificationToken(phoneE164: string) {
  const secret = getVerifySecret();
  if (!secret) {
    throw new Error("Verification secret is not configured.");
  }
  const issuedAt = Date.now().toString();
  const payload = `${phoneE164}.${issuedAt}`;
  const signature = createHmac("sha256", secret).update(payload).digest("hex");
  return Buffer.from(`${payload}.${signature}`).toString("base64url");
}

export function verifyPhoneVerificationToken(
  token: string,
  phoneE164: string,
  maxAgeMs = 60 * 60 * 1000,
) {
  const secret = getVerifySecret();
  if (!secret || !token) return false;

  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const parts = decoded.split(".");
    if (parts.length !== 3) return false;
    const [phone, issuedAt, signature] = parts;
    if (phone !== phoneE164) return false;

    const issued = Number(issuedAt);
    if (!Number.isFinite(issued) || Date.now() - issued > maxAgeMs) return false;

    const payload = `${phone}.${issuedAt}`;
    const expected = createHmac("sha256", secret).update(payload).digest("hex");
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function twilioSendVerification(phoneE164: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID!;
  const authToken = process.env.TWILIO_AUTH_TOKEN!;
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID!;

  const url = `https://verify.twilio.com/v2/Services/${serviceSid}/Verifications`;
  const body = new URLSearchParams({
    To: phoneE164,
    Channel: "sms",
  });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization:
        "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const data = (await response.json()) as {
    status?: string;
    message?: string;
    code?: number;
  };

  if (!response.ok) {
    throw new Error(data.message || "Could not send verification text.");
  }

  return data;
}

export async function twilioCheckVerification(phoneE164: string, code: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID!;
  const authToken = process.env.TWILIO_AUTH_TOKEN!;
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID!;

  const url = `https://verify.twilio.com/v2/Services/${serviceSid}/VerificationCheck`;
  const body = new URLSearchParams({
    To: phoneE164,
    Code: code,
  });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization:
        "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const data = (await response.json()) as {
    status?: string;
    message?: string;
    valid?: boolean;
  };

  if (!response.ok) {
    throw new Error(data.message || "Could not check verification code.");
  }

  return data;
}
