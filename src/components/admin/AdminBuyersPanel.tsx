"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type BuyerRow = {
  id: string;
  created_at: string;
  buyer_code: string;
  score: number;
  category: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  mobile: string | null;
  zip: string | null;
  purchase_timeline: string | null;
  rv_types: string[] | null;
  condition: string | null;
  preferred_manufacturer: string | null;
  min_price: string | null;
  max_price: string | null;
  down_payment: string | null;
  has_trade: string | null;
  credit_range: string | null;
  income_range: string | null;
  travel_distance: string | null;
  preferred_contact: string | null;
  status: string | null;
  profile?: Record<string, unknown> | null;
};

const SESSION_KEY = "dealerready-admin-pass";

export function AdminBuyersPanel() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [buyers, setBuyers] = useState<BuyerRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selected = useMemo(
    () => buyers.find((buyer) => buyer.id === selectedId) ?? null,
    [buyers, selectedId],
  );

  async function loadBuyers(pass: string) {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/buyers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pass }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        buyers?: BuyerRow[];
        error?: string;
      };

      if (!response.ok || !data.ok) {
        setUnlocked(false);
        setBuyers([]);
        setError(data.error || "Could not unlock admin view.");
        return;
      }

      window.sessionStorage.setItem(SESSION_KEY, pass);
      setUnlocked(true);
      setBuyers(data.buyers ?? []);
      setSelectedId(null);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleUnlock(event: React.FormEvent) {
    event.preventDefault();
    void loadBuyers(password.trim());
  }

  function handleSignOut() {
    window.sessionStorage.removeItem(SESSION_KEY);
    setUnlocked(false);
    setPassword("");
    setBuyers([]);
    setSelectedId(null);
    setError("");
  }

  if (!unlocked) {
    return (
      <div className="mx-auto w-full max-w-md px-5 py-16">
        <Link href="/" className="text-sm font-medium text-signal hover:underline">
          ← Back home
        </Link>
        <h1 className="mt-6 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-wide text-ink">
          Admin Access
        </h1>
        <p className="mt-3 text-ink/70">
          Enter your DealerReady admin password to view submitted buyer
          profiles.
        </p>
        <form onSubmit={handleUnlock} className="mt-8 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink/70">
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-fog bg-white px-4 py-3 text-base text-ink outline-none focus:border-signal"
              autoComplete="current-password"
            />
          </label>
          {error ? (
            <p className="text-sm font-medium text-red-700">{error}</p>
          ) : null}
          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="inline-flex w-full justify-center rounded-md bg-signal px-6 py-3 text-sm font-bold tracking-wide text-white hover:bg-signal-deep disabled:opacity-60"
          >
            {loading ? "CHECKING..." : "VIEW BUYERS"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 md:py-14">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/" className="text-sm font-medium text-signal hover:underline">
            ← Back home
          </Link>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-wide text-ink">
            Submitted Buyers
          </h1>
          <p className="mt-2 text-ink/70">
            {buyers.length} profile{buyers.length === 1 ? "" : "s"} saved
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              const pass = window.sessionStorage.getItem(SESSION_KEY) || password;
              void loadBuyers(pass);
            }}
            className="rounded-md border border-fog px-4 py-2 text-sm font-semibold text-ink hover:bg-mist"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-md border border-fog px-4 py-2 text-sm font-semibold text-ink hover:bg-mist"
          >
            Sign out
          </button>
        </div>
      </div>

      {error ? (
        <p className="mt-4 text-sm font-medium text-red-700">{error}</p>
      ) : null}

      {buyers.length === 0 ? (
        <div className="mt-10 rounded-md border border-fog bg-white p-8 text-ink/70">
          No buyer profiles yet. When someone submits the form on the website,
          they will show up here.
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-3">
            {buyers.map((buyer) => {
              const active = buyer.id === selectedId;
              return (
                <button
                  key={buyer.id}
                  type="button"
                  onClick={() => setSelectedId(buyer.id)}
                  className={`w-full rounded-md border px-4 py-4 text-left transition ${
                    active
                      ? "border-signal bg-mist ring-2 ring-signal/20"
                      : "border-fog bg-white hover:border-signal/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">
                        {buyer.first_name} {buyer.last_name}
                      </p>
                      <p className="mt-1 text-sm text-ink/60">
                        {buyer.buyer_code} · {buyer.category} · Score{" "}
                        {buyer.score}
                      </p>
                    </div>
                    <p className="text-xs text-ink/50">
                      {new Date(buyer.created_at).toLocaleString()}
                    </p>
                  </div>
                  <p className="mt-3 text-sm text-ink/75">
                    {(buyer.rv_types || []).join(", ") || "RV type n/a"} ·{" "}
                    {buyer.purchase_timeline || "Timeline n/a"}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="rounded-md border border-fog bg-white p-5 lg:sticky lg:top-6 lg:self-start">
            {selected ? (
              <BuyerDetail buyer={selected} />
            ) : (
              <p className="text-ink/60">
                Tap a buyer on the left to see full details.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function BuyerDetail({ buyer }: { buyer: BuyerRow }) {
  const rows: [string, string][] = [
    ["Buyer ID", buyer.buyer_code],
    ["Status", buyer.category],
    ["Score", String(buyer.score)],
    ["Phone", buyer.mobile || "—"],
    ["Email", buyer.email || "—"],
    ["ZIP", buyer.zip || "—"],
    ["Preferred contact", buyer.preferred_contact || "—"],
    ["RV types", (buyer.rv_types || []).join(", ") || "—"],
    ["New / used", buyer.condition || "—"],
    ["Brand", buyer.preferred_manufacturer || "—"],
    [
      "Budget",
      buyer.min_price || buyer.max_price
        ? `$${buyer.min_price || "—"} – $${buyer.max_price || "—"}`
        : "—",
    ],
    ["Down payment", buyer.down_payment || "—"],
    ["Trade", buyer.has_trade || "—"],
    ["Credit", buyer.credit_range || "—"],
    ["Income", buyer.income_range || "—"],
    ["Timeline", buyer.purchase_timeline || "—"],
    ["Travel", buyer.travel_distance || "—"],
  ];

  return (
    <div>
      <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-wide text-ink">
        {buyer.first_name} {buyer.last_name}
      </h2>
      <p className="mt-1 text-sm text-ink/55">
        Submitted {new Date(buyer.created_at).toLocaleString()}
      </p>
      <dl className="mt-6 space-y-3">
        {rows.map(([label, value]) => (
          <div key={label} className="border-b border-fog pb-3">
            <dt className="text-xs font-semibold tracking-wide text-ink/50 uppercase">
              {label}
            </dt>
            <dd className="mt-1 text-ink">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-6 flex flex-wrap gap-3">
        {buyer.mobile ? (
          <a
            href={`tel:${buyer.mobile}`}
            className="rounded-md bg-signal px-4 py-2 text-sm font-bold text-white hover:bg-signal-deep"
          >
            Call
          </a>
        ) : null}
        {buyer.mobile ? (
          <a
            href={`sms:${buyer.mobile}`}
            className="rounded-md border border-fog px-4 py-2 text-sm font-semibold text-ink hover:bg-mist"
          >
            Text
          </a>
        ) : null}
        {buyer.email ? (
          <a
            href={`mailto:${buyer.email}`}
            className="rounded-md border border-fog px-4 py-2 text-sm font-semibold text-ink hover:bg-mist"
          >
            Email
          </a>
        ) : null}
      </div>
    </div>
  );
}
