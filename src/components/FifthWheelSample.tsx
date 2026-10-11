"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CoachPicksList } from "@/components/CoachPicksList";
import { FloorplanSketch } from "@/components/FloorplanSketch";
import {
  applyCoachSearch,
  coachSearchFromResults,
  coachSearchSavedMessage,
} from "@/lib/coach-picks";
import { formatBathrooms } from "@/lib/floorplan-sample";
import {
  formatFeet,
  matchFifthWheels,
  type FifthWheelPlan,
  type FifthWheelQuery,
} from "@/lib/fifth-wheel-sample";
import { loadProfile, saveProfile } from "@/lib/profile-storage";

const inputClass =
  "w-full rounded-md border border-fog bg-white px-4 py-3 text-base text-ink outline-none focus:border-signal";

function facts(plan: FifthWheelPlan) {
  return [
    "Fifth wheel",
    formatFeet(plan.lengthInches),
    `${plan.slides} slides`,
    plan.frontBedroom ? "Front bedroom" : "",
    plan.rearBedroom ? "Rear bedroom" : "",
    plan.loft ? "Loft" : "No loft",
    plan.bathrooms > 0 ? formatBathrooms(plan.bathrooms) : "",
  ]
    .filter(Boolean)
    .join(" · ");
}

function PlanCard({ plan, onOpen }: { plan: FifthWheelPlan; onOpen: (plan: FifthWheelPlan) => void }) {
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
      <p className="mt-2 text-sm text-ink/60">{facts(plan)}</p>
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
  plans: FifthWheelPlan[];
  onOpen: (plan: FifthWheelPlan) => void;
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

export function FifthWheelSample() {
  const [year, setYear] = useState("2022");
  const [make, setMake] = useState("Prime Time");
  const [model, setModel] = useState("Sanibel");
  const [floorplan, setFloorplan] = useState("3602WB");
  const [slides, setSlides] = useState("");
  const [frontBedroom, setFrontBedroom] = useState("yes");
  const [rearBedroom, setRearBedroom] = useState("yes");
  const [loft, setLoft] = useState("yes");
  const [exact, setExact] = useState<FifthWheelPlan[]>([]);
  const [similar, setSimilar] = useState<FifthWheelPlan[]>([]);
  const [mode, setMode] = useState<"exact" | "describe" | "">("");
  const [ran, setRan] = useState(false);
  const [openPlan, setOpenPlan] = useState<FifthWheelPlan | null>(null);
  const [leadKind, setLeadKind] = useState("");
  const [leadPicks, setLeadPicks] = useState<string[]>([]);
  const [leadNote, setLeadNote] = useState("");

  useEffect(() => {
    if (!openPlan) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenPlan(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openPlan]);

  function run(query: FifthWheelQuery, nextMode: "exact" | "describe") {
    const result = matchFifthWheels(query);
    const exactPlans = nextMode === "exact" ? result.exact : [];
    const similarPlans = result.similar;
    setExact(exactPlans);
    setSimilar(similarPlans);
    setMode(nextMode);
    setRan(true);
    const search = coachSearchFromResults({
      kind: nextMode === "exact" ? "exact" : "description",
      exact: exactPlans,
      similar: nextMode === "exact" ? similarPlans : similarPlans,
      typed: {
        year: query.year,
        make: query.make,
        model: query.model,
        floorplan: query.floorplan,
      },
      rvType: "Fifth Wheel",
    });
    const saved = applyCoachSearch(loadProfile(), search);
    saveProfile(saved);
    setLeadKind(saved.coachSearchKind);
    setLeadPicks(saved.coachPicks);
    setLeadNote(coachSearchSavedMessage(search.kind, search.picks));
  }

  function yesNo(value: string) {
    if (value === "yes") return true;
    if (value === "no") return false;
    return null;
  }

  return (
    <div className="grid gap-10">
      <form
        onSubmit={(event) => {
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
        }}
        className="rounded-md border border-fog bg-white p-6"
      >
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-ink">Know the coach</h2>
        <p className="mt-2 text-ink/70">Try 2022 Prime Time Sanibel 3602WB.</p>
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

      <form
        onSubmit={(event) => {
          event.preventDefault();
          const parsedSlides = Number(slides);
          run(
            {
              slides: Number.isInteger(parsedSlides) && parsedSlides > 0 ? parsedSlides : null,
              frontBedroom: yesNo(frontBedroom),
              rearBedroom: yesNo(rearBedroom),
              loft: yesNo(loft),
            },
            "describe",
          );
        }}
        className="rounded-md border border-fog bg-white p-6"
      >
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-ink">Describe the layout</h2>
        <p className="mt-2 text-ink/70">
          Set for a bedroom in front, a bedroom in the rear, and a loft. Slides is Any, so the lineup includes the four-slide Sanibel and the three-slide Arctic Wolf. Choose 4 slides to keep only the Sanibel.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink/70">Slides</span>
            <select className={inputClass} value={slides} onChange={(event) => setSlides(event.target.value)}>
              <option value="">Any</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink/70">Loft</span>
            <select className={inputClass} value={loft} onChange={(event) => setLoft(event.target.value)}>
              <option value="">Any</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink/70">Front bedroom</span>
            <select className={inputClass} value={frontBedroom} onChange={(event) => setFrontBedroom(event.target.value)}>
              <option value="">Any</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink/70">Rear bedroom</span>
            <select className={inputClass} value={rearBedroom} onChange={(event) => setRearBedroom(event.target.value)}>
              <option value="">Any</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
        </div>
        <button type="submit" className="mt-4 rounded-md bg-signal px-6 py-3 text-sm font-bold tracking-wide text-white">
          FIND MATCHES
        </button>
      </form>

      {ran && mode === "exact" && exact.length === 0 ? (
        <p className="text-ink/75">That exact coach is not in this 2022 fifth-wheel sample.</p>
      ) : null}
      {ran && mode === "describe" && similar.length === 0 ? (
        <p className="text-ink/75">Nothing in this sample matches that description.</p>
      ) : null}
      <ResultList title="That coach" plans={exact} onOpen={setOpenPlan} />
      <ResultList
        title={mode === "describe" ? "Matches in the sample" : "Same bedrooms and loft"}
        plans={similar}
        onOpen={setOpenPlan}
      />
      {leadNote ? (
        <div className="rounded-md border border-signal/30 bg-white p-5">
          <p className="text-sm font-semibold tracking-wide text-signal uppercase">On the dealer lead</p>
          <div className="mt-3">
            <CoachPicksList kind={leadKind} picks={leadPicks} />
          </div>
          <p className="mt-3 text-sm text-ink/75">{leadNote}</p>
          <Link
            href="/profile/start"
            className="mt-4 inline-flex rounded-md bg-signal px-5 py-3 text-sm font-bold tracking-wide text-white"
          >
            BUILD MY PROFILE
          </Link>
        </div>
      ) : null}
      {openPlan ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center" onClick={() => setOpenPlan(null)}>
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
