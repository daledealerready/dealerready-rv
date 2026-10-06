"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const SESSION_KEY = "dealerready-dealer-token";

type PurchasedLead = {
  purchaseId: string;
  purchasedAt: string;
  price: number;
  paymentStatus: string;
  buyerCode: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  mobile: string | null;
  zip: string | null;
  preferredContact: string | null;
  score: number;
  category: string;
  purchaseTimeline: string | null;
  rvTypes: string[];
  minPrice: string | null;
  maxPrice: string | null;
  downPayment: string | null;
  hasTrade: string | null;
};

export function PurchasedLeadsPanel() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [leads, setLeads] = useState<PurchasedLead[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const token =
      window.localStorage.getItem(SESSION_KEY) ||
      window.sessionStorage.getItem(SESSION_KEY);
    if (!token) {
      router.replace("/sign-in");
      return;
    }

    void (async () => {
      try {
        const response = await fetch("/api/dealer/purchased", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = (await response.json()) as {
          ok?: boolean;
          leads?: PurchasedLead[];
          error?: string;
        };
        if (!response.ok || !data.ok) {
          setError(data.error || "Could not load purchased leads.");
          return;
        }
        setLeads(data.leads || []);
      } catch {
        setError("Network error loading purchased leads.");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const selected = leads.find((lead) => lead.purchaseId === selectedId) || null;

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-ink/60">
        Loading purchased leads...
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 md:py-14">
      <Link
        href="/dealer/marketplace"
        className="text-sm font-medium text-signal hover:underline"
      >
        ← Marketplace
      </Link>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-wide text-ink">
        Purchased Leads
      </h1>
      <p className="mt-2 text-ink/70">
        Unlocked buyer contact information for your dealership.
      </p>

      {error ? (
        <p className="mt-4 text-sm font-medium text-red-700">{error}</p>
      ) : null}

      {leads.length === 0 ? (
        <div className="mt-10 rounded-md border border-fog bg-white p-8 text-ink/70">
          No purchased leads yet.{" "}
          <Link href="/dealer/marketplace" className="font-semibold text-signal">
            Browse the marketplace
          </Link>
          .
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-3">
            {leads.map((lead) => (
              <button
                key={lead.purchaseId}
                type="button"
                onClick={() => setSelectedId(lead.purchaseId)}
                className={`w-full rounded-md border px-4 py-4 text-left ${
                  selected?.purchaseId === lead.purchaseId
                    ? "border-signal bg-mist"
                    : "border-fog bg-white hover:border-signal/40"
                }`}
              >
                <p className="font-semibold text-ink">
                  {lead.firstName} {lead.lastName}
                </p>
                <p className="mt-1 text-sm text-ink/65">
                  {lead.buyerCode} · {lead.category} · ${lead.price}
                </p>
              </button>
            ))}
          </div>
          <div className="rounded-md border border-fog bg-white p-5">
            {selected ? (
              <div className="space-y-3 text-sm text-ink/80">
                <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-ink">
                  {selected.firstName} {selected.lastName}
                </h2>
                <p>{selected.buyerCode}</p>
                <p>
                  {selected.mobile}
                  <br />
                  {selected.email}
                </p>
                <p>Preferred contact: {selected.preferredContact || "—"}</p>
                <p>ZIP: {selected.zip || "—"}</p>
                <p>Score: {selected.score}</p>
                <p>RV: {(selected.rvTypes || []).join(", ") || "—"}</p>
                <p>
                  Budget: ${selected.minPrice || "—"} – $
                  {selected.maxPrice || "—"}
                </p>
                <p>Down: {selected.downPayment || "—"}</p>
                <p>Trade: {selected.hasTrade || "—"}</p>
                <p>Timeline: {selected.purchaseTimeline || "—"}</p>
                <div className="flex flex-wrap gap-3 pt-2">
                  {selected.mobile ? (
                    <a
                      href={`tel:${selected.mobile}`}
                      className="rounded-md bg-signal px-4 py-2 text-sm font-bold text-white"
                    >
                      Call
                    </a>
                  ) : null}
                  {selected.mobile ? (
                    <a
                      href={`sms:${selected.mobile}`}
                      className="rounded-md border border-fog px-4 py-2 text-sm font-semibold"
                    >
                      Text
                    </a>
                  ) : null}
                  {selected.email ? (
                    <a
                      href={`mailto:${selected.email}`}
                      className="rounded-md border border-fog px-4 py-2 text-sm font-semibold"
                    >
                      Email
                    </a>
                  ) : null}
                </div>
              </div>
            ) : (
              <p className="text-ink/60">Tap a purchased lead to view details.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
