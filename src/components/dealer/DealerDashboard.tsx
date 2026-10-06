"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const SESSION_KEY = "dealerready-dealer-token";

type DealerInfo = {
  id: string;
  legalBusinessName: string;
  dba: string | null;
  email: string;
  primaryContact: string;
  status: string;
  phone: string;
  city: string | null;
  state: string | null;
  rvCategories: string[];
  brandsCarried: string | null;
  inventoryType: string | null;
};

export function DealerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dealer, setDealer] = useState<DealerInfo | null>(null);

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
        const response = await fetch("/api/dealer/me", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = (await response.json()) as {
          ok?: boolean;
          dealer?: DealerInfo;
          error?: string;
        };
        if (!response.ok || !data.ok || !data.dealer) {
          window.localStorage.removeItem(SESSION_KEY);
          window.sessionStorage.removeItem(SESSION_KEY);
          setError(data.error || "Please sign in again.");
          setLoading(false);
          router.replace("/sign-in");
          return;
        }
        setDealer(data.dealer);
      } catch {
        setError("Network error loading dashboard.");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-ink/60">
        Loading dealer dashboard...
      </div>
    );
  }

  if (!dealer) {
    return (
      <div className="mx-auto max-w-lg px-5 py-16">
        <p className="text-ink/70">{error || "Please sign in."}</p>
        <Link href="/sign-in" className="mt-4 inline-block text-signal">
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 md:py-14">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.16em] text-signal uppercase">
            Dealer dashboard
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-wide text-ink">
            {dealer.legalBusinessName}
          </h1>
          <p className="mt-2 text-ink/70">
            Welcome, {dealer.primaryContact}. Status:{" "}
            <span className="font-semibold text-ink">{dealer.status}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            window.localStorage.removeItem(SESSION_KEY);
            window.sessionStorage.removeItem(SESSION_KEY);
            router.push("/sign-in");
          }}
          className="rounded-md border border-fog px-4 py-2 text-sm font-semibold text-ink hover:bg-mist"
        >
          Sign out
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/dealer/marketplace"
          className="rounded-md bg-signal px-5 py-3 text-sm font-bold tracking-wide text-white hover:bg-signal-deep"
        >
          BUYER MARKETPLACE
        </Link>
        <Link
          href="/dealer/purchased"
          className="rounded-md border border-fog px-5 py-3 text-sm font-semibold text-ink hover:bg-mist"
        >
          Purchased leads
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["New Opportunities", "Open market"],
          ["Leads Purchased", "View list"],
          ["Appointments", "Soon"],
          ["Sales", "Soon"],
          ["Monthly Lead Spend", "Pilot mode"],
          ["Membership", "Pilot $499"],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-md border border-fog bg-white px-4 py-5"
          >
            <p className="text-xs font-semibold tracking-wide text-ink/50 uppercase">
              {label}
            </p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-ink">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-md border border-fog bg-white p-6">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-ink">
          Your dealership profile
        </h2>
        <div className="mt-4 grid gap-3 text-sm text-ink/80 sm:grid-cols-2">
          <p>
            <span className="font-semibold text-ink">Contact:</span>{" "}
            {dealer.primaryContact}
          </p>
          <p>
            <span className="font-semibold text-ink">Email:</span> {dealer.email}
          </p>
          <p>
            <span className="font-semibold text-ink">Phone:</span> {dealer.phone}
          </p>
          <p>
            <span className="font-semibold text-ink">Location:</span>{" "}
            {[dealer.city, dealer.state].filter(Boolean).join(", ") || "—"}
          </p>
          <p>
            <span className="font-semibold text-ink">Categories:</span>{" "}
            {dealer.rvCategories.join(", ") || "—"}
          </p>
          <p>
            <span className="font-semibold text-ink">Brands:</span>{" "}
            {dealer.brandsCarried || "—"}
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-md bg-mist px-5 py-5 text-ink/80">
        <p className="font-semibold text-ink">Still coming in the pilot build</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          <li>Stripe membership + lead billing ($499/month pilot)</li>
          <li>Appointment and sales tracking</li>
          <li>Dealer filters and auto-buy rules</li>
        </ul>
      </div>
    </div>
  );
}
