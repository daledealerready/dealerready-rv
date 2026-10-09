"use client";

import { useState } from "react";

const CATEGORIES = [
  "Class A Diesel",
  "Class A Gas",
  "Class C",
  "High-end Fifth Wheel",
];

const inputClass =
  "w-full rounded-md border border-fog bg-white px-4 py-3 text-base text-ink outline-none focus:border-signal";

export function WeBuyForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [zip, setZip] = useState("");
  const [rvCategory, setRvCategory] = useState("");
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/we-buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          mobile,
          zip,
          rvCategory,
          year,
          make,
          model,
          notes,
        }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setError(data.error || "Could not send your request.");
        return;
      }
      setDone(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-md border border-fog bg-white p-6">
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-ink">
          Request received.
        </h2>
        <p className="mt-3 text-ink/75">
          DealerReady will review your unit and follow up for the photos and video needed to prepare a purchase offer. This is not a financing application.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="grid gap-4 rounded-md border border-fog bg-white p-6">
      <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-wide text-ink">
        Request a purchase offer
      </h2>
      <p className="text-sm leading-relaxed text-ink/70">
        Have 15 to 20 photos ready, and a walk-around video if you can. We will ask for them after this request. Complete photos keep the offer from changing on pickup day.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink/70">First name</span>
          <input className={inputClass} value={firstName} onChange={(event) => setFirstName(event.target.value)} required />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink/70">Last name</span>
          <input className={inputClass} value={lastName} onChange={(event) => setLastName(event.target.value)} required />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink/70">Email</span>
          <input className={inputClass} type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink/70">Mobile</span>
          <input className={inputClass} type="tel" value={mobile} onChange={(event) => setMobile(event.target.value)} required />
        </label>
      </div>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-ink/70">What are you selling?</span>
        <select className={inputClass} value={rvCategory} onChange={(event) => setRvCategory(event.target.value)} required>
          <option value="">Select one</option>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink/70">Year</span>
          <input className={inputClass} inputMode="numeric" value={year} onChange={(event) => setYear(event.target.value)} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink/70">Make</span>
          <input className={inputClass} value={make} onChange={(event) => setMake(event.target.value)} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-ink/70">Model</span>
          <input className={inputClass} value={model} onChange={(event) => setModel(event.target.value)} />
        </label>
      </div>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-ink/70">ZIP code</span>
        <input className={inputClass} value={zip} onChange={(event) => setZip(event.target.value)} />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-ink/70">Anything we should know</span>
        <textarea className={inputClass} rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} />
      </label>
      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
      <button
        type="submit"
        disabled={saving}
        className="rounded-md bg-signal px-6 py-3 text-sm font-bold tracking-wide text-white hover:bg-signal-deep disabled:opacity-60"
      >
        {saving ? "SENDING..." : "REQUEST A PURCHASE OFFER"}
      </button>
    </form>
  );
}
