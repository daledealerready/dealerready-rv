"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const SESSION_KEY = "dealerready-dealer-token";

type Opportunity = {
  buyerId: string;
  buyerCode: string;
  createdAt: string;
  score: number;
  category: string;
  purchaseTimeline: string | null;
  rvTypes: string[];
  condition: string | null;
  preferredManufacturer: string | null;
  minPrice: string | null;
  maxPrice: string | null;
  downPayment: string | null;
  hasTrade: string | null;
  creditRange: string | null;
  travelDistance: string | null;
  preferredContact: string | null;
  zip: string | null;
  spotsLeft: number;
  price: number | null;
  priceBandLabel: string | null;
};

export function MarketplacePanel() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [minScore, setMinScore] = useState(70);

  const selected = useMemo(
    () => opportunities.find((item) => item.buyerId === selectedId) ?? null,
    [opportunities, selectedId],
  );

  const filtered = useMemo(
    () => opportunities.filter((item) => item.score >= minScore),
    [opportunities, minScore],
  );

  async function loadMarketplace() {
    const token =
      window.localStorage.getItem(SESSION_KEY) ||
      window.sessionStorage.getItem(SESSION_KEY);
    if (!token) {
      router.replace("/sign-in");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/dealer/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        opportunities?: Opportunity[];
        error?: string;
      };
      if (!response.ok || !data.ok) {
        setError(data.error || "Could not load marketplace.");
        return;
      }
      setOpportunities(data.opportunities || []);
    } catch {
      setError("Network error loading marketplace.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadMarketplace();
  }, [router]);

  async function purchaseLead(buyerId: string) {
    const token =
      window.localStorage.getItem(SESSION_KEY) ||
      window.sessionStorage.getItem(SESSION_KEY);
    if (!token) {
      router.replace("/sign-in");
      return;
    }

    setBusyId(buyerId);
    setError("");
    try {
      const response = await fetch("/api/dealer/marketplace/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, buyerId }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        mode?: string;
        url?: string;
        needsMembership?: boolean;
        error?: string;
      };
      if (!response.ok || !data.ok) {
        if (data.needsMembership) {
          setError(
            "Activate your $499/month membership on the dashboard before unlocking leads.",
          );
        } else {
          setError(data.error || "Could not unlock this lead.");
        }
        return;
      }
      if (data.mode === "stripe" && data.url) {
        window.location.href = data.url;
        return;
      }
      router.push("/dealer/purchased");
    } catch {
      setError("Network error while unlocking lead.");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-ink/60">
        Loading buyer marketplace...
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 md:py-14">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/dealer/dashboard"
            className="text-sm font-medium text-signal hover:underline"
          >
            ← Dashboard
          </Link>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-wide text-ink">
            Buyer Marketplace
          </h1>
          <p className="mt-2 max-w-2xl text-ink/70">
            Browse anonymous qualified opportunities. Contact details unlock
            after payment. Active $499 membership is required once Stripe is
            connected.
          </p>
        </div>
        <Link
          href="/dealer/purchased"
          className="rounded-md border border-fog px-4 py-2 text-sm font-semibold text-ink hover:bg-mist"
        >
          Purchased leads
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <label className="text-sm font-semibold text-ink/70">
          Minimum score
          <select
            className="ml-2 rounded-md border border-fog bg-white px-3 py-2"
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
          >
            <option value={70}>70+</option>
            <option value={80}>80+</option>
            <option value={90}>90+</option>
          </select>
        </label>
        <button
          type="button"
          onClick={() => void loadMarketplace()}
          className="rounded-md border border-fog px-4 py-2 text-sm font-semibold text-ink hover:bg-mist"
        >
          Refresh
        </button>
      </div>

      {error ? (
        <p className="mt-4 text-sm font-medium text-red-700">{error}</p>
      ) : null}

      {filtered.length === 0 ? (
        <div className="mt-10 rounded-md border border-fog bg-white p-8 text-ink/70">
          No matching opportunities right now. When shoppers complete profiles
          with score 70+, they appear here.
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-3">
            {filtered.map((item) => (
              <button
                key={item.buyerId}
                type="button"
                onClick={() => setSelectedId(item.buyerId)}
                className={`w-full rounded-md border px-4 py-4 text-left ${
                  selected?.buyerId === item.buyerId
                    ? "border-signal bg-mist"
                    : "border-fog bg-white hover:border-signal/40"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">
                      {item.category} #{item.buyerCode}
                    </p>
                    <p className="mt-1 text-sm text-ink/65">
                      {(item.rvTypes || []).join(", ") || "RV type n/a"} · Score{" "}
                      {item.score}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-signal">
                    {item.price != null ? `$${item.price}` : "—"}
                  </p>
                </div>
                <p className="mt-3 text-sm text-ink/75">
                  {item.purchaseTimeline || "Timeline n/a"} · Trade:{" "}
                  {item.hasTrade || "—"} · {item.spotsLeft} of 3 spots left
                </p>
              </button>
            ))}
          </div>

          <div className="rounded-md border border-fog bg-white p-5 lg:sticky lg:top-6 lg:self-start">
            {selected ? (
              <div className="space-y-3 text-sm text-ink/80">
                <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-ink">
                  {selected.category}
                </h2>
                <p className="font-semibold text-signal">{selected.buyerCode}</p>
                <p>Score: {selected.score}</p>
                <p>RV: {(selected.rvTypes || []).join(", ") || "—"}</p>
                <p>Condition: {selected.condition || "—"}</p>
                <p>Brand: {selected.preferredManufacturer || "—"}</p>
                <p>
                  Budget: ${selected.minPrice || "—"} – $
                  {selected.maxPrice || "—"}
                </p>
                <p>Down payment: {selected.downPayment || "—"}</p>
                <p>Trade: {selected.hasTrade || "—"}</p>
                <p>Credit range: {selected.creditRange || "—"}</p>
                <p>Timeline: {selected.purchaseTimeline || "—"}</p>
                <p>Travel: {selected.travelDistance || "—"}</p>
                <p>Preferred contact method: {selected.preferredContact || "—"}</p>
                <p>ZIP: {selected.zip || "—"}</p>
                <p className="rounded-md bg-mist px-3 py-2 text-ink">
                  Price:{" "}
                  <span className="font-bold">
                    {selected.price != null ? `$${selected.price}` : "—"}
                  </span>
                  {selected.priceBandLabel
                    ? ` · ${selected.priceBandLabel}`
                    : ""}
                </p>
                <p className="text-xs text-ink/55">
                  Name, phone, and email stay hidden until payment unlock.
                </p>
                <button
                  type="button"
                  disabled={busyId === selected.buyerId}
                  onClick={() => void purchaseLead(selected.buyerId)}
                  className="mt-2 inline-flex w-full justify-center rounded-md bg-signal px-4 py-3 text-sm font-bold tracking-wide text-white hover:bg-signal-deep disabled:opacity-60"
                >
                  {busyId === selected.buyerId
                    ? "STARTING CHECKOUT..."
                    : `PURCHASE LEAD${selected.price != null ? ` — $${selected.price}` : ""}`}
                </button>
              </div>
            ) : (
              <p className="text-ink/60">Tap an opportunity to preview it.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
