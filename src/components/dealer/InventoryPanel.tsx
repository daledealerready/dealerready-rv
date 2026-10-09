"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RvIdentityFields } from "@/components/RvIdentityFields";

const SESSION_KEY = "dealerready-dealer-token";

type Unit = {
  id: string;
  year: number | null;
  manufacturer: string;
  model: string;
  floorplan: string | null;
  condition: string | null;
  price: number | null;
  city: string | null;
  state: string | null;
  stockNumber: string | null;
};

const inputClass =
  "w-full rounded-md border border-fog bg-white px-4 py-3 text-base text-ink outline-none focus:border-signal";

export function InventoryPanel() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [year, setYear] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [formVersion, setFormVersion] = useState(0);
  const [floorplan, setFloorplan] = useState("");
  const [condition, setCondition] = useState("New");
  const [price, setPrice] = useState("");
  const [stockNumber, setStockNumber] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  async function load(currentToken: string) {
    const response = await fetch("/api/dealer/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: currentToken, action: "list" }),
    });
    const data = (await response.json()) as {
      ok?: boolean;
      units?: Unit[];
      error?: string;
    };
    if (!response.ok || !data.ok) {
      throw new Error(data.error || "Could not load inventory.");
    }
    setUnits(data.units || []);
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
        const me = await fetch("/api/dealer/me", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: saved }),
        });
        const meData = (await me.json()) as {
          ok?: boolean;
          dealer?: { city?: string | null; state?: string | null };
        };
        if (meData.ok && meData.dealer) {
          setCity(meData.dealer.city || "");
          setState(meData.dealer.state || "");
        }
        await load(saved);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load inventory.");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  async function addUnit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/dealer/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          action: "add",
          year,
          manufacturer,
          model,
          floorplan,
          condition,
          price,
          stockNumber,
          city,
          state,
        }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        units?: Unit[];
        error?: string;
      };
      if (!response.ok || !data.ok) {
        setError(data.error || "Could not add unit.");
        return;
      }
      setUnits(data.units || []);
      setYear("");
      setManufacturer("");
      setModel("");
      setFormVersion((current) => current + 1);
      setFloorplan("");
      setPrice("");
      setStockNumber("");
      setNotice("Unit added. Shoppers can now find it in exact-unit search.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function removeUnit(id: string) {
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/dealer/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, action: "remove", id }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setError(data.error || "Could not remove unit.");
        return;
      }
      setUnits((current) => current.filter((unit) => unit.id !== id));
      setNotice("Unit removed from search.");
    } catch {
      setError("Network error. Please try again.");
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10">
      <Link href="/dealer/dashboard" className="text-sm font-medium text-ink/60 hover:text-ink">
        Back to dashboard
      </Link>
      <p className="mt-4 font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.16em] text-signal uppercase">
        Inventory
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-wide text-ink">
        Add a unit shoppers can find
      </h1>
      <p className="mt-3 text-ink/70">
        When someone searches this year, brand, model, and floorplan on DealerReady, your unit shows up.
      </p>

      <form onSubmit={(event) => void addUnit(event)} className="mt-8 grid gap-4 rounded-md border border-fog bg-white p-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <RvIdentityFields
            key={formVersion}
            year={year}
            make={manufacturer}
            model={model}
            requireYear
            requireMake
            requireModel
            onChange={(next) => {
              setYear(next.year);
              setManufacturer(next.make);
              setModel(next.model);
            }}
          />
        </div>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink/70">Floorplan</span>
          <input className={inputClass} placeholder="40 IH" value={floorplan} onChange={(e) => setFloorplan(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink/70">Condition</span>
          <select className={inputClass} value={condition} onChange={(e) => setCondition(e.target.value)}>
            <option>New</option>
            <option>Used</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink/70">Price</span>
          <input className={inputClass} inputMode="decimal" placeholder="450000" value={price} onChange={(e) => setPrice(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink/70">Stock number</span>
          <input className={inputClass} placeholder="Optional" value={stockNumber} onChange={(e) => setStockNumber(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink/70">City</span>
          <input className={inputClass} value={city} onChange={(e) => setCity(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink/70">State</span>
          <input className={inputClass} value={state} onChange={(e) => setState(e.target.value)} />
        </label>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-signal px-6 py-3 text-sm font-bold tracking-wide text-white hover:bg-signal-deep disabled:opacity-60"
          >
            {saving ? "SAVING..." : "ADD UNIT"}
          </button>
        </div>
      </form>

      {notice ? <p className="mt-4 rounded-md bg-mist px-4 py-3 text-sm text-ink">{notice}</p> : null}
      {error ? <p className="mt-4 text-sm font-medium text-red-700">{error}</p> : null}

      <h2 className="mt-10 font-[family-name:var(--font-display)] text-2xl font-semibold text-ink">
        Your listed units
      </h2>
      {loading ? (
        <p className="mt-4 text-ink/60">Loading inventory...</p>
      ) : units.length === 0 ? (
        <p className="mt-4 text-ink/70">No units listed yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {units.map((unit) => (
            <li key={unit.id} className="rounded-md border border-fog bg-white p-4">
              <p className="font-semibold text-ink">
                {[unit.year, unit.manufacturer, unit.model, unit.floorplan].filter(Boolean).join(" ")}
              </p>
              <p className="mt-1 text-sm text-ink/70">
                {[unit.condition, unit.price ? `$${unit.price.toLocaleString()}` : null, unit.stockNumber ? `Stock ${unit.stockNumber}` : null, [unit.city, unit.state].filter(Boolean).join(", ") || null]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <button
                type="button"
                onClick={() => void removeUnit(unit.id)}
                className="mt-3 text-sm font-semibold text-red-700"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
