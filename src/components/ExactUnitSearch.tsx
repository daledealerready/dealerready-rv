"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RvIdentityFields } from "@/components/RvIdentityFields";
import { parseExactUnit } from "@/lib/exact-unit";

const heroInputClass =
  "w-full rounded-md border border-white/30 bg-white px-4 py-4 text-base text-ink outline-none placeholder:text-ink/40 focus:border-signal";
const pageInputClass =
  "w-full rounded-md border border-fog bg-white px-4 py-3 text-base text-ink outline-none placeholder:text-ink/40 focus:border-signal";

export function ExactUnitSearch({
  initialQuery = "",
  variant = "hero",
}: {
  initialQuery?: string;
  variant?: "hero" | "page";
}) {
  const parsed = useMemo(() => parseExactUnit(initialQuery), [initialQuery]);
  return <ExactUnitSearchForm key={initialQuery} parsed={parsed} variant={variant} />;
}

function ExactUnitSearchForm({
  parsed,
  variant,
}: {
  parsed: ReturnType<typeof parseExactUnit>;
  variant: "hero" | "page";
}) {
  const router = useRouter();
  const [year, setYear] = useState(parsed.year);
  const [make, setMake] = useState(parsed.manufacturer);
  const [model, setModel] = useState(parsed.model);
  const [floorplan, setFloorplan] = useState(parsed.floorplan);
  const [error, setError] = useState("");
  const hero = variant === "hero";

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!make.trim() || !model.trim()) {
      setError("Select the make and model. Add the year if you know it.");
      return;
    }
    setError("");
    const query = [year, make, model, floorplan].filter((part) => part.trim()).join(" ");
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <form onSubmit={onSubmit} className={hero ? "mt-8 max-w-3xl" : "w-full"}>
      <p className={`mb-3 text-sm font-semibold ${hero ? "text-white" : "text-ink"}`}>
        Know the exact unit?
      </p>
      <RvIdentityFields
        year={year}
        make={make}
        model={model}
        requireMake
        requireModel
        labelClassName={`mb-2 block text-sm font-semibold ${hero ? "text-white" : "text-ink/70"}`}
        hintClassName={`text-sm ${hero ? "text-white/90" : "text-ink/70"}`}
        linkClassName={`font-semibold underline ${hero ? "text-warm" : "text-signal"}`}
        onChange={(next) => {
          setYear(next.year);
          setMake(next.make);
          setModel(next.model);
          setError("");
        }}
      />
      <label className="mt-3 block">
        <span className={`mb-2 block text-sm font-semibold ${hero ? "text-white" : "text-ink/70"}`}>
          Floorplan, optional
        </span>
        <input
          className={hero ? heroInputClass : pageInputClass}
          value={floorplan}
          placeholder="40 IH"
          onChange={(event) => setFloorplan(event.target.value)}
        />
      </label>
      <button
        type="submit"
        className="mt-3 rounded-md bg-signal px-6 py-4 text-sm font-bold tracking-wide text-white hover:bg-signal-deep"
      >
        SEARCH
      </button>
      <p className={`mt-2 text-sm ${hero ? "text-white/75" : "text-ink/60"}`}>
        Search units listed by dealerships on DealerReady.
      </p>
      {error ? (
        <p className={`mt-2 text-sm font-medium ${hero ? "text-warm" : "text-red-700"}`}>{error}</p>
      ) : null}
    </form>
  );
}
