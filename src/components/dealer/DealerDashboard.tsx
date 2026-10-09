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
  membershipStatus?: string;
  membershipCurrentPeriodEnd?: string | null;
};

export function DealerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [billingBusy, setBillingBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [dealer, setDealer] = useState<DealerInfo | null>(null);
  const [stripeConfigured, setStripeConfigured] = useState(false);

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
          stripeConfigured?: boolean;
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
        setStripeConfigured(Boolean(data.stripeConfigured));
        const params = new URLSearchParams(window.location.search);
        if (params.get("membership") === "success") {
          setNotice("Membership checkout completed. Refresh if status is still updating.");
        }
        if (params.get("membership") === "canceled") {
          setNotice("Membership checkout was canceled.");
        }
      } catch {
        setError("Network error loading dashboard.");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  async function startMembershipCheckout() {
    const token =
      window.localStorage.getItem(SESSION_KEY) ||
      window.sessionStorage.getItem(SESSION_KEY);
    if (!token) {
      router.replace("/sign-in");
      return;
    }
    setBillingBusy(true);
    setError("");
    try {
      const response = await fetch("/api/dealer/billing/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        url?: string;
        alreadyActive?: boolean;
        error?: string;
      };
      if (!response.ok || !data.ok) {
        setError(data.error || "Could not start membership checkout.");
        return;
      }
      if (data.alreadyActive) {
        setNotice("Membership is already active.");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Network error starting membership checkout.");
    } finally {
      setBillingBusy(false);
    }
  }

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
          href="/dealer/inventory"
          className="rounded-md border border-signal px-5 py-3 text-sm font-bold tracking-wide text-signal hover:bg-mist"
        >
          MY INVENTORY
        </Link>
        <Link
          href="/dealer/purchased"
          className="rounded-md border border-fog px-5 py-3 text-sm font-semibold text-ink hover:bg-mist"
        >
          Purchased leads
        </Link>
        {stripeConfigured && dealer.membershipStatus !== "active" ? (
          <button
            type="button"
            disabled={billingBusy}
            onClick={() => void startMembershipCheckout()}
            className="rounded-md border border-signal px-5 py-3 text-sm font-bold tracking-wide text-signal hover:bg-mist disabled:opacity-60"
          >
            {billingBusy ? "LOADING..." : "ACTIVATE $499 MEMBERSHIP"}
          </button>
        ) : null}
      </div>

      {notice ? (
        <p className="mt-4 rounded-md bg-mist px-4 py-3 text-sm text-ink">{notice}</p>
      ) : null}
      {error ? (
        <p className="mt-4 text-sm font-medium text-red-700">{error}</p>
      ) : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["New Opportunities", "Open market"],
          ["Leads Purchased", "View list"],
          ["Appointments", "Soon"],
          ["Sales", "Soon"],
          ["Monthly Lead Spend", "Per lead"],
          [
            "Membership",
            dealer.membershipStatus === "active"
              ? "Active $499"
              : stripeConfigured
                ? "Inactive"
                : "Pilot $499",
          ],
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
        <p className="font-semibold text-ink">Billing plan</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          <li>$499/month pilot membership</li>
          <li>Plus category-based lead fees at unlock</li>
          <li>No success fee during the pilot</li>
        </ul>
      </div>
    </div>
  );
}
