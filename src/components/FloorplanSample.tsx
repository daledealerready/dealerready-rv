"use client";

import { useEffect, useState } from "react";
import { FloorplanSketch } from "@/components/FloorplanSketch";
import {
  formatBathrooms,
  formatLength,
  matchSampleFloorplans,
  type FloorplanCategory,
  type FloorplanQuery,
  type SampleFloorplan,
} from "@/lib/floorplan-sample";

const CATEGORIES: FloorplanCategory[] = [
  "Class A Diesel",
  "Class A Gas",
  "Class C",
  "Fifth Wheel",
  "Travel Trailer",
];

const inputClass =
  "w-full rounded-md border border-fog bg-white px-4 py-3 text-base text-ink outline-none focus:border-signal";

function PlanCard({ plan, onOpen }: { plan: SampleFloorplan; onOpen: (plan: SampleFloorplan) => void }) {
  const name = `${plan.year} ${plan.make} ${plan.model} ${plan.floorplan}`;
  return (
    <article className="flex flex-col rounded-md border border-fog bg-white p-4">
      <button
        type="button"
        onClick={() => onOpen(plan)}
        className="block w-full rounded-md text-left focus:outline-none focus:ring-2 focus:ring-signal"
        aria-label={`Enlarge layout for ${name}`}
      >
        <FloorplanSketch plan={plan} />
      </button>
      <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold text-ink">{name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink/80">{plan.layout}</p>
      <p className="mt-2 text-sm text-ink/60">
        {plan.category} · {formatLength(plan.lengthInches)} · {plan.bedrooms} bedroom
        {plan.bedrooms === 1 ? "" : "s"} · {formatBathrooms(plan.bathrooms)} · {plan.bunks ? "Bunks" : "No bunks"}
      </p>
      <button type="button" onClick={() => onOpen(plan)} className="mt-3 text-left text-sm font-bold text-signal">
        Tap to enlarge
      </button>
    </article>
  );
}

function ResultList({
  title,
  plans,
  onOpen,
}: {
  title: string;
  plans: SampleFloorplan[];
  onOpen: (plan: SampleFloorplan) => void;
}) {
  if (plans.length === 0) return null;
  return (
    <section className="mt-8">
      <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-ink">{title}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} onOpen={onOpen} />
        ))}
      </div>
    </section>
  );
}

export function FloorplanSample() {
  const [year, setYear] = useState("2027");
  const [make, setMake] = useState("Tiffin");
  const [model, setModel] = useState("Phaeton");
  const [floorplan, setFloorplan] = useState("40 IH");
  const [category, setCategory] = useState<FloorplanCategory | "">("Class A Diesel");
  const [lengthFeet, setLengthFeet] = useState("40");
  const [bathrooms, setBathrooms] = useState("2");
  const [bunks, setBunks] = useState("yes");
  const [bedrooms, setBedrooms] = useState("");
  const [exact, setExact] = useState<SampleFloorplan[]>([]);
  const [similar, setSimilar] = useState<SampleFloorplan[]>([]);
  const [mode, setMode] = useState<"exact" | "describe" | "">("");
  const [ran, setRan] = useState(false);
  const [openPlan, setOpenPlan] = useState<SampleFloorplan | null>(null);

  useEffect(() => {
    if (!openPlan) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenPlan(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openPlan]);

  function run(query: FloorplanQuery, nextMode: "exact" | "describe") {
    const result = matchSampleFloorplans(query);
    setExact(nextMode === "exact" ? result.exact : []);
    setSimilar(nextMode === "exact" ? result.similar : result.similar);
    setMode(nextMode);
    setRan(true);
  }

  function searchExact(event: React.FormEvent) {
    event.preventDefault();
    const parsedYear = Number(year);
    run(
      {
        year: Number.isInteger(parsedYear) && parsedYear > 1900 ? parsedYear : null,
        make,
        model,
        floorplan,
      },
      "exact",
    );
  }

  function searchDescribed(event: React.FormEvent) {
    event.preventDefault();
    const parsedLength = Number(lengthFeet);
    run(
      {
        category,
        lengthFeet: Number.isFinite(parsedLength) && parsedLength > 0 ? parsedLength : null,
        bathrooms: bathrooms === "" ? null : Number(bathrooms),
        bunks: bunks === "" ? null : bunks === "yes",
        bedrooms: bedrooms === "" ? null : Number(bedrooms),
      },
      "describe",
    );
  }

  const exactMiss = ran && mode === "exact" && exact.length === 0;
  const describeMiss = ran && mode === "describe" && similar.length === 0;

  return (
    <div className="grid gap-10">
      <form onSubmit={searchExact} className="rounded-md border border-fog bg-white p-6">
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-ink">Know the coach</h2>
        <p className="mt-2 text-ink/70">Try 2027 Tiffin Phaeton 40 IH.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink/70">Year</span>
            <input className={inputClass} value={year} onChange={(event) => setYear(event.target.value)} />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink/70">Make</span>
            <input className={inputClass} value={make} onChange={(event) => setMake(event.target.value)} />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink/70">Model</span>
            <input className={inputClass} value={model} onChange={(event) => setModel(event.target.value)} />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink/70">Floorplan</span>
            <input className={inputClass} value={floorplan} onChange={(event) => setFloorplan(event.target.value)} />
          </label>
        </div>
        <button type="submit" className="mt-4 rounded-md bg-signal px-6 py-3 text-sm font-bold tracking-wide text-white">
          FIND THAT COACH
        </button>
      </form>

      <form onSubmit={searchDescribed} className="rounded-md border border-fog bg-white p-6">
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-ink">Describe the layout</h2>
        <p className="mt-2 text-ink/70">
          The sample below is set for a diesel motorhome, about 40 feet, two bathrooms, with bunks.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink/70">Type</span>
            <select className={inputClass} value={category} onChange={(event) => setCategory(event.target.value as FloorplanCategory | "")}>
              <option value="">Any type</option>
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink/70">About this many feet</span>
            <input className={inputClass} inputMode="numeric" value={lengthFeet} onChange={(event) => setLengthFeet(event.target.value)} />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink/70">Bathrooms</span>
            <select className={inputClass} value={bathrooms} onChange={(event) => setBathrooms(event.target.value)}>
              <option value="">Any</option>
              <option value="1">1</option>
              <option value="1.5">Bath and a half</option>
              <option value="2">2</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink/70">Bunks</span>
            <select className={inputClass} value={bunks} onChange={(event) => setBunks(event.target.value)}>
              <option value="">Any</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-ink/70">Bedrooms</span>
            <select className={inputClass} value={bedrooms} onChange={(event) => setBedrooms(event.target.value)}>
              <option value="">Any</option>
              <option value="1">1</option>
              <option value="2">2</option>
            </select>
          </label>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button type="submit" className="rounded-md bg-signal px-6 py-3 text-sm font-bold tracking-wide text-white">
            FIND MATCHES
          </button>
          <button
            type="button"
            className="rounded-md border border-fog px-6 py-3 text-sm font-bold tracking-wide text-ink"
            onClick={() => {
              setCategory("Travel Trailer");
              setLengthFeet("");
              setBathrooms("");
              setBunks("");
              setBedrooms("2");
              run({ category: "Travel Trailer", bedrooms: 2 }, "describe");
            }}
          >
            TWO-BEDROOM TRAVEL TRAILER
          </button>
        </div>
      </form>

      {exactMiss ? <p className="text-ink/75">That exact coach is not in this six-coach sample.</p> : null}
      {ran && mode === "exact" && exact.length > 0 && similar.length === 0 ? (
        <p className="text-ink/75">No other coach in this sample has the same layout.</p>
      ) : null}
      {describeMiss ? <p className="text-ink/75">Nothing in this sample matches that description.</p> : null}
      <ResultList title={mode === "describe" ? "Matches in the sample" : "That coach"} plans={exact} onOpen={setOpenPlan} />
      <ResultList
        title={mode === "describe" ? "Matches in the sample" : "Similar layout in the sample"}
        plans={similar}
        onOpen={setOpenPlan}
      />
      {openPlan ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
          onClick={() => setOpenPlan(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${openPlan.year} ${openPlan.make} ${openPlan.model} ${openPlan.floorplan}`}
            className="max-h-[90svh] w-full max-w-3xl overflow-auto rounded-md bg-white p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-ink">
                {openPlan.year} {openPlan.make} {openPlan.model} {openPlan.floorplan}
              </h2>
              <button type="button" onClick={() => setOpenPlan(null)} className="text-sm font-bold text-signal">
                Close
              </button>
            </div>
            <p className="mt-3 text-ink/80">{openPlan.layout}</p>
            <div className="mt-4">
              <FloorplanSketch plan={openPlan} large />
            </div>
            <p className="mt-3 text-sm text-ink/55">Sample sketch of the layout. This is not the factory drawing.</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
