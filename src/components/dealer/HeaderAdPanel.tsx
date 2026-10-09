"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HEADER_AD_SLOT } from "@/lib/pricing";

const SESSION_KEY = "dealerready-dealer-token";

type Ad = {
  id: string;
  message: string;
  startsOn: string;
  endsOn: string;
  price: number;
  status: string;
};

const inputClass =
  "w-full rounded-md border border-fog bg-white px-4 py-3 text-base text-ink outline-none focus:border-signal";

function labelFor(ad: Ad) {
  const today = new Date().toISOString().slice(0, 10);
  if (ad.status !== "active") return "Waiting for payment";
  if (ad.endsOn < today) return "Ended";
  if (ad.startsOn > today) return "Scheduled";
  return "Running";
}

export function HeaderAdPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [message, setMessage] = useState("");
  const [startsOn, setStartsOn] = useState("");
  const [endsOn, setEndsOn] = useState("");

  async function load(currentToken: string) {
    const response = await fetch("/api/dealer/ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: currentToken, action: "list" }),
    });
    const data = (await response.json()) as {
      ok?: boolean;
      ads?: Ad[];
      error?: string;
    };
    if (!response.ok || !data.ok) {
      throw new Error(data.error || "Could not load ads.");
    }
    setAds(data.ads || []);
  }

  useEffect(() => {
    const saved =
      window.localStorage.getItem(SESSION_KEY) ||
      window.sessionStorage.getItem(SESSION_KEY);
    if (!saved) {
      router.replace("/sign-in");
      return;
    }
    setToken(saved);

    void (async () => {
      try {
        const sessionId = searchParams.get("session_id");
        if (searchParams.get("ad") === "canceled") {
          setNotice("Header ad checkout was canceled.");
        }
        if (sessionId) {
          await fetch("/api/dealer/ads", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token: saved,
              action: "confirm",
              sessionId,
            }),
          });
          setNotice("Payment received. Your ad runs on the dates you chose.");
        }
        await load(saved);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load ads.");
      } finally {
        setLoading(false);
      }
    })();
  }, [router, searchParams]);

  async function buyAd(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/dealer/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          action: "create",
          message,
          startsOn,
          endsOn,
        }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        url?: string;
        error?: string;
      };
      if (!response.ok || !data.ok || !data.url) {
        setError(data.error || "Could not start checkout.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10">
      <Link href="/dealer/dashboard" className="text-sm font-medium text-ink/60 hover:text-ink">
        Back to dashboard
      </Link>
      <p className="mt-4 font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.16em] text-signal uppercase">
        Header ad
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-wide text-ink">
        Promote an event
      </h1>
      <p className="mt-3 text-ink/70">
        Your message scrolls across the top of DealerReady from the start date through the end date, then it stops. Pilot price is ${HEADER_AD_SLOT}.
      </p>

      <form onSubmit={(event) => void buyAd(event)} className="mt-8 grid gap-4 rounded-md border border-fog bg-white p-5">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink/70">Event message</span>
          <input
            className={inputClass}
            maxLength={140}
            placeholder="Open house Saturday — 2027 Tiffin Phaeton on display"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            required
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink/70">Starts</span>
            <input className={inputClass} type="date" value={startsOn} onChange={(event) => setStartsOn(event.target.value)} required />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink/70">Ends</span>
            <input className={inputClass} type="date" value={endsOn} onChange={(event) => setEndsOn(event.target.value)} required />
          </label>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-signal px-6 py-3 text-sm font-bold tracking-wide text-white hover:bg-signal-deep disabled:opacity-60"
        >
          {saving ? "LOADING..." : `PAY $${HEADER_AD_SLOT} AND RUN AD`}
        </button>
      </form>

      {notice ? <p className="mt-4 rounded-md bg-mist px-4 py-3 text-sm text-ink">{notice}</p> : null}
      {error ? <p className="mt-4 text-sm font-medium text-red-700">{error}</p> : null}

      <h2 className="mt-10 font-[family-name:var(--font-display)] text-2xl font-semibold text-ink">
        Your ads
      </h2>
      {loading ? (
        <p className="mt-4 text-ink/60">Loading ads...</p>
      ) : ads.length === 0 ? (
        <p className="mt-4 text-ink/70">No header ads yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {ads.map((ad) => (
            <li key={ad.id} className="rounded-md border border-fog bg-white p-4">
              <p className="font-semibold text-ink">{ad.message}</p>
              <p className="mt-1 text-sm text-ink/70">
                {labelFor(ad)} · {ad.startsOn} through {ad.endsOn} · ${ad.price}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
