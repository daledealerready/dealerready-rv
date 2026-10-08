"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ExactUnitSearch({
  initialQuery = "",
  variant = "hero",
}: {
  initialQuery?: string;
  variant?: "hero" | "page";
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [error, setError] = useState("");

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length < 3) {
      setError("Enter the year, brand, and model. Example: 2027 Tiffin Phaeton 40 IH");
      return;
    }
    setError("");
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  const hero = variant === "hero";

  return (
    <form onSubmit={onSubmit} className={hero ? "mt-8 max-w-xl" : "w-full"}>
      <label className="block">
        <span
          className={`mb-2 block text-sm font-semibold ${
            hero ? "text-white" : "text-ink"
          }`}
        >
          Know the exact unit?
        </span>
        <span className="flex flex-col gap-2 sm:flex-row">
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setError("");
            }}
            placeholder="2027 Tiffin Phaeton 40 IH"
            className="w-full rounded-md border border-white/30 bg-white px-4 py-4 text-base text-ink outline-none placeholder:text-ink/40 focus:border-signal"
          />
          <button
            type="submit"
            className="rounded-md bg-signal px-6 py-4 text-sm font-bold tracking-wide text-white hover:bg-signal-deep"
          >
            SEARCH
          </button>
        </span>
      </label>
      <p className={`mt-2 text-sm ${hero ? "text-white/75" : "text-ink/60"}`}>
        Search units listed by dealerships on DealerReady.
      </p>
      {error ? <p className="mt-2 text-sm font-medium text-warm">{error}</p> : null}
    </form>
  );
}
