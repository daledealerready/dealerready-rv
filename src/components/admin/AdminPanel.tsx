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
};

type DealerRow = {
  id: string;
  created_at: string;
  updated_at: string;
  status: string;
  legal_business_name: string;
  dba: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string;
  primary_contact: string;
  email: string;
  locations_count: string | null;
  rv_categories: string[] | null;
  brands_carried: string | null;
  inventory_type: string | null;
  typical_price_range: string | null;
  states_served: string | null;
  notes: string | null;
};

type Tab = "buyers" | "dealers";

const SESSION_KEY = "dealerready-admin-pass";

export function AdminPanel() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [tab, setTab] = useState<Tab>("buyers");
  const [buyers, setBuyers] = useState<BuyerRow[]>([]);
  const [dealers, setDealers] = useState<DealerRow[]>([]);
  const [selectedBuyerId, setSelectedBuyerId] = useState<string | null>(null);
  const [selectedDealerId, setSelectedDealerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [tempPasswordNotice, setTempPasswordNotice] = useState<{
    email: string;
    password: string;
    business: string;
  } | null>(null);

  const selectedBuyer = useMemo(
    () => buyers.find((buyer) => buyer.id === selectedBuyerId) ?? null,
    [buyers, selectedBuyerId],
  );
  const selectedDealer = useMemo(
    () => dealers.find((dealer) => dealer.id === selectedDealerId) ?? null,
    [dealers, selectedDealerId],
  );

  async function unlock(pass: string) {
    setLoading(true);
    setError("");
    try {
      const [buyersRes, dealersRes] = await Promise.all([
        fetch("/api/admin/buyers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: pass }),
        }),
        fetch("/api/admin/dealers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: pass }),
        }),
      ]);

      const buyersData = (await buyersRes.json()) as {
        ok?: boolean;
        buyers?: BuyerRow[];
        error?: string;
      };
      const dealersData = (await dealersRes.json()) as {
        ok?: boolean;
        dealers?: DealerRow[];
        error?: string;
      };

      if (!buyersRes.ok || !buyersData.ok) {
        setUnlocked(false);
        setError(buyersData.error || "Could not unlock admin view.");
        return;
      }

      window.sessionStorage.setItem(SESSION_KEY, pass);
      setUnlocked(true);
      setBuyers(buyersData.buyers ?? []);
      setSelectedBuyerId(null);

      if (dealersRes.ok && dealersData.ok) {
        setDealers(dealersData.dealers ?? []);
        setSelectedDealerId(null);
      } else {
        setDealers([]);
        if (dealersData.error) setError(dealersData.error);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function refresh() {
    const pass = window.sessionStorage.getItem(SESSION_KEY) || password;
    await unlock(pass);
  }

  async function updateDealerStatus(status: string) {
    if (!selectedDealer) return;
    const pass = window.sessionStorage.getItem(SESSION_KEY) || password;
    setUpdating(true);
    setError("");
    setTempPasswordNotice(null);
    try {
      const response = await fetch("/api/admin/dealers/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: pass,
          dealerId: selectedDealer.id,
          status,
        }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setError(data.error || "Could not update dealer status.");
        return;
      }
      await refresh();
      setSelectedDealerId(selectedDealer.id);
      setTab("dealers");
    } catch {
      setError("Network error while updating dealer.");
    } finally {
      setUpdating(false);
    }
  }

  async function approveWithLogin() {
    if (!selectedDealer) return;
    const pass = window.sessionStorage.getItem(SESSION_KEY) || password;
    setUpdating(true);
    setError("");
    setTempPasswordNotice(null);
    try {
      const response = await fetch("/api/admin/dealers/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: pass,
          dealerId: selectedDealer.id,
        }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        tempPassword?: string;
        error?: string;
      };
      if (!response.ok || !data.ok || !data.tempPassword) {
        setError(data.error || "Could not approve dealer.");
        return;
      }
      setTempPasswordNotice({
        email: selectedDealer.email,
        password: data.tempPassword,
        business: selectedDealer.legal_business_name,
      });
      await refresh();
      setSelectedDealerId(selectedDealer.id);
      setTab("dealers");
    } catch {
      setError("Network error while approving dealer.");
    } finally {
      setUpdating(false);
    }
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
          Enter your DealerReady admin password to view buyers and dealers.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void unlock(password.trim());
          }}
          className="mt-8 space-y-4"
        >
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink/70">
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-fog bg-white px-4 py-3 text-base text-ink outline-none focus:border-signal"
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
            {loading ? "CHECKING..." : "OPEN ADMIN"}
          </button>
        </form>
      </div>
    );
  }

  const pendingDealers = dealers.filter((d) => d.status === "pending").length;

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 md:py-14">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/" className="text-sm font-medium text-signal hover:underline">
            ← Back home
          </Link>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-wide text-ink">
            DealerReady Admin
          </h1>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => void refresh()}
            className="rounded-md border border-fog px-4 py-2 text-sm font-semibold text-ink hover:bg-mist"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={() => {
              window.sessionStorage.removeItem(SESSION_KEY);
              setUnlocked(false);
              setPassword("");
              setBuyers([]);
              setDealers([]);
              setError("");
            }}
            className="rounded-md border border-fog px-4 py-2 text-sm font-semibold text-ink hover:bg-mist"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={() => setTab("buyers")}
          className={`rounded-md px-4 py-2 text-sm font-semibold ${
            tab === "buyers"
              ? "bg-signal text-white"
              : "border border-fog bg-white text-ink"
          }`}
        >
          Buyers ({buyers.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("dealers")}
          className={`rounded-md px-4 py-2 text-sm font-semibold ${
            tab === "dealers"
              ? "bg-signal text-white"
              : "border border-fog bg-white text-ink"
          }`}
        >
          Dealers ({dealers.length}
          {pendingDealers ? ` · ${pendingDealers} pending` : ""})
        </button>
      </div>

      {error ? (
        <p className="mt-4 text-sm font-medium text-red-700">{error}</p>
      ) : null}

      {tempPasswordNotice ? (
        <div className="mt-4 rounded-md border border-signal/30 bg-mist p-4 text-sm text-ink">
          <p className="font-semibold">
            {tempPasswordNotice.business} approved — send these login details:
          </p>
          <p className="mt-2">
            Sign-in page:{" "}
            <span className="font-semibold">dealerreadyrv.com/sign-in</span>
          </p>
          <p>
            Email: <span className="font-semibold">{tempPasswordNotice.email}</span>
          </p>
          <p>
            Temporary password:{" "}
            <span className="font-semibold">{tempPasswordNotice.password}</span>
          </p>
          <p className="mt-2 text-ink/70">
            Copy this now. For security, it is only shown once here.
          </p>
        </div>
      ) : null}

      {tab === "buyers" ? (
        <BuyersSection
          buyers={buyers}
          selected={selectedBuyer}
          onSelect={setSelectedBuyerId}
        />
      ) : (
        <DealersSection
          dealers={dealers}
          selected={selectedDealer}
          updating={updating}
          onSelect={setSelectedDealerId}
          onUpdateStatus={(status) => void updateDealerStatus(status)}
          onApproveWithLogin={() => void approveWithLogin()}
        />
      )}
    </div>
  );
}

function BuyersSection({
  buyers,
  selected,
  onSelect,
}: {
  buyers: BuyerRow[];
  selected: BuyerRow | null;
  onSelect: (id: string) => void;
}) {
  if (buyers.length === 0) {
    return (
      <div className="mt-10 rounded-md border border-fog bg-white p-8 text-ink/70">
        No buyer profiles yet.
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-3">
        {buyers.map((buyer) => (
          <button
            key={buyer.id}
            type="button"
            onClick={() => onSelect(buyer.id)}
            className={`w-full rounded-md border px-4 py-4 text-left ${
              selected?.id === buyer.id
                ? "border-signal bg-mist"
                : "border-fog bg-white hover:border-signal/40"
            }`}
          >
            <p className="font-semibold text-ink">
              {buyer.first_name} {buyer.last_name}
            </p>
            <p className="mt-1 text-sm text-ink/60">
              {buyer.buyer_code} · {buyer.category} · Score {buyer.score}
            </p>
          </button>
        ))}
      </div>
      <div className="rounded-md border border-fog bg-white p-5">
        {selected ? (
          <div className="space-y-3 text-sm text-ink/80">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-ink">
              {selected.first_name} {selected.last_name}
            </h2>
            <p>{selected.buyer_code}</p>
            <p>
              {selected.mobile} · {selected.email}
            </p>
            <p>
              {(selected.rv_types || []).join(", ")} ·{" "}
              {selected.purchase_timeline}
            </p>
            <p>
              Budget: ${selected.min_price || "—"} – $
              {selected.max_price || "—"}
            </p>
            <div className="flex gap-3 pt-2">
              {selected.mobile ? (
                <a href={`tel:${selected.mobile}`} className="font-semibold text-signal">
                  Call
                </a>
              ) : null}
              {selected.mobile ? (
                <a href={`sms:${selected.mobile}`} className="font-semibold text-signal">
                  Text
                </a>
              ) : null}
              {selected.email ? (
                <a href={`mailto:${selected.email}`} className="font-semibold text-signal">
                  Email
                </a>
              ) : null}
            </div>
          </div>
        ) : (
          <p className="text-ink/60">Tap a buyer to see details.</p>
        )}
      </div>
    </div>
  );
}

function DealersSection({
  dealers,
  selected,
  updating,
  onSelect,
  onUpdateStatus,
  onApproveWithLogin,
}: {
  dealers: DealerRow[];
  selected: DealerRow | null;
  updating: boolean;
  onSelect: (id: string) => void;
  onUpdateStatus: (status: string) => void;
  onApproveWithLogin: () => void;
}) {
  if (dealers.length === 0) {
    return (
      <div className="mt-10 rounded-md border border-fog bg-white p-8 text-ink/70">
        No dealer applications yet. Share{" "}
        <span className="font-semibold text-ink">/for-dealers/apply</span> with
        dealerships.
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-3">
        {dealers.map((dealer) => (
          <button
            key={dealer.id}
            type="button"
            onClick={() => onSelect(dealer.id)}
            className={`w-full rounded-md border px-4 py-4 text-left ${
              selected?.id === dealer.id
                ? "border-signal bg-mist"
                : "border-fog bg-white hover:border-signal/40"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-ink">
                  {dealer.legal_business_name}
                </p>
                <p className="mt-1 text-sm text-ink/60">
                  {dealer.primary_contact} · {dealer.city}, {dealer.state}
                </p>
              </div>
              <span className="rounded-full bg-fog px-2 py-1 text-xs font-semibold uppercase tracking-wide text-ink/70">
                {dealer.status}
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="rounded-md border border-fog bg-white p-5">
        {selected ? (
          <div className="space-y-3 text-sm text-ink/80">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-ink">
              {selected.legal_business_name}
            </h2>
            <p className="font-semibold uppercase tracking-wide text-signal">
              {selected.status}
            </p>
            <p>
              {selected.primary_contact}
              <br />
              {selected.phone}
              <br />
              {selected.email}
            </p>
            <p>
              {selected.address}
              <br />
              {selected.city}, {selected.state} {selected.zip}
            </p>
            <p>Categories: {(selected.rv_categories || []).join(", ") || "—"}</p>
            <p>Brands: {selected.brands_carried || "—"}</p>
            <p>Inventory: {selected.inventory_type || "—"}</p>
            <p>Price range: {selected.typical_price_range || "—"}</p>
            <p>Areas: {selected.states_served || "—"}</p>
            {selected.notes ? <p>Notes: {selected.notes}</p> : null}

            <div className="flex flex-wrap gap-2 pt-4">
              <button
                type="button"
                disabled={updating}
                onClick={onApproveWithLogin}
                className="rounded-md bg-signal px-4 py-2 text-xs font-bold tracking-wide text-white disabled:opacity-60"
              >
                APPROVE + CREATE LOGIN
              </button>
              <button
                type="button"
                disabled={updating}
                onClick={() => onUpdateStatus("approved")}
                className="rounded-md border border-fog px-4 py-2 text-xs font-bold tracking-wide text-ink disabled:opacity-60"
              >
                APPROVE ONLY
              </button>
              <button
                type="button"
                disabled={updating}
                onClick={() => onUpdateStatus("pending")}
                className="rounded-md border border-fog px-4 py-2 text-xs font-bold tracking-wide text-ink disabled:opacity-60"
              >
                PENDING
              </button>
              <button
                type="button"
                disabled={updating}
                onClick={() => onUpdateStatus("rejected")}
                className="rounded-md border border-fog px-4 py-2 text-xs font-bold tracking-wide text-ink disabled:opacity-60"
              >
                REJECT
              </button>
              <button
                type="button"
                disabled={updating}
                onClick={() => onUpdateStatus("suspended")}
                className="rounded-md border border-fog px-4 py-2 text-xs font-bold tracking-wide text-ink disabled:opacity-60"
              >
                SUSPEND
              </button>
            </div>
          </div>
        ) : (
          <p className="text-ink/60">Tap a dealer to review and approve.</p>
        )}
      </div>
    </div>
  );
}
