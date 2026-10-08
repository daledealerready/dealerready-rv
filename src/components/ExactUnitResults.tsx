"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ExactUnitSearch } from "@/components/ExactUnitSearch";
import { parseExactUnit, type ExactUnit } from "@/lib/exact-unit";
import { emptyProfile } from "@/lib/profile";
import { loadProfile, saveProfile } from "@/lib/profile-storage";

type ListedUnit = {
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
  dealerName: string;
};

export function ExactUnitResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() || "";
  const [unit, setUnit] = useState<ExactUnit>(() => parseExactUnit(query));
  const [units, setUnits] = useState<ListedUnit[]>([]);
  const [inventoryReady, setInventoryReady] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const parsed = parseExactUnit(query);
    setUnit(parsed);
    const current = loadProfile();
    saveProfile({
      ...emptyProfile,
      ...current,
      exactUnitQuery: parsed.raw,
      preferredManufacturer: parsed.manufacturer || current.preferredManufacturer,
      preferredModel: parsed.model || current.preferredModel,
      preferredFloorplan: parsed.floorplan || current.preferredFloorplan,
      earliestYear: parsed.year || current.earliestYear,
      newestYear: parsed.year || current.newestYear,
      openToComparable: false,
      condition: current.condition || (parsed.year ? "New" : current.condition),
    });

    if (!parsed.raw) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    void fetch(`/api/inventory/search?q=${encodeURIComponent(parsed.raw)}`)
      .then(async (response) => {
        const data = (await response.json()) as {
          unit?: ExactUnit;
          units?: ListedUnit[];
          inventoryReady?: boolean;
          error?: string;
        };
        if (!response.ok) {
          setError(data.error || "Could not search right now.");
          setUnits([]);
          return;
        }
        if (data.unit) setUnit(data.unit);
        setUnits(data.units || []);
        setInventoryReady(data.inventoryReady !== false);
      })
      .catch(() => setError("Network error. Please try again."))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="min-h-full bg-paper">
      <header className="border-b border-fog bg-white">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-4">
          <Link
            href="/"
            className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-wide text-ink"
          >
            DealerReady <span className="text-signal">RV</span>
          </Link>
          <Link href="/" className="text-sm font-medium text-ink/60 hover:text-ink">
            Home
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-5 py-10">
        <p className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.16em] text-signal uppercase">
          Exact unit
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-wide text-ink">
          {unit.label || "Search a specific RV"}
        </h1>
        <p className="mt-3 text-ink/70">
          Showing units listed by participating DealerReady dealerships.
        </p>

        <div className="mt-6">
          <ExactUnitSearch initialQuery={query} variant="page" />
        </div>

        {unit.manufacturer || unit.model ? (
          <div className="mt-6 grid gap-3 rounded-md border border-fog bg-white p-5 text-sm text-ink/80 sm:grid-cols-2">
            <p>
              <span className="font-semibold text-ink">Year:</span> {unit.year || "Any"}
            </p>
            <p>
              <span className="font-semibold text-ink">Brand:</span>{" "}
              {unit.manufacturer || "—"}
            </p>
            <p>
              <span className="font-semibold text-ink">Model:</span> {unit.model || "—"}
            </p>
            <p>
              <span className="font-semibold text-ink">Floorplan:</span>{" "}
              {unit.floorplan || "—"}
            </p>
          </div>
        ) : null}

        {error ? <p className="mt-6 text-sm font-medium text-red-700">{error}</p> : null}

        {loading ? (
          <p className="mt-8 text-ink/60">Searching participating dealers...</p>
        ) : units.length > 0 ? (
          <ul className="mt-8 space-y-4">
            {units.map((item) => (
              <li key={item.id} className="rounded-md border border-fog bg-white p-5">
                <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-ink">
                  {[item.year, item.manufacturer, item.model, item.floorplan]
                    .filter(Boolean)
                    .join(" ")}
                </p>
                <p className="mt-2 text-sm text-ink/70">
                  {item.dealerName}
                  {item.city || item.state
                    ? ` · ${[item.city, item.state].filter(Boolean).join(", ")}`
                    : ""}
                </p>
                <p className="mt-2 text-sm font-semibold text-ink">
                  {item.price ? `$${item.price.toLocaleString()}` : "Price on request"}
                  {item.condition ? ` · ${item.condition}` : ""}
                  {item.stockNumber ? ` · Stock ${item.stockNumber}` : ""}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-8 rounded-md border border-fog bg-white p-6">
            <p className="text-lg font-semibold text-ink">
              No matching unit is listed yet.
            </p>
            <p className="mt-2 text-ink/70">
              {inventoryReady
                ? "Participating dealers have not listed this exact unit. Save it on your buyer profile so a dealer who has it can connect with you."
                : "Dealer inventory is not connected yet. Your search is saved on this device and will be part of your buyer profile."}
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/profile/start"
            className="inline-flex justify-center rounded-md bg-signal px-6 py-3 text-sm font-bold tracking-wide text-white hover:bg-signal-deep"
          >
            SAVE THIS & BUILD MY PROFILE
          </Link>
          <Link
            href="/profile/start?mode=return"
            className="inline-flex justify-center rounded-md border border-fog px-6 py-3 text-sm font-semibold text-ink hover:bg-mist"
          >
            UPDATE MY PROFILE
          </Link>
        </div>
      </main>
    </div>
  );
}
