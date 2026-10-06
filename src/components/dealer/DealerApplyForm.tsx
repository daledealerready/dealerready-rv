"use client";

import Link from "next/link";
import { useState } from "react";
import {
  emptyDealerApplication,
  INVENTORY_TYPE_OPTIONS,
  RV_CATEGORY_OPTIONS,
  type DealerApplication,
} from "@/lib/dealer";

const inputClass =
  "w-full rounded-md border border-fog bg-white px-4 py-3 text-base text-ink outline-none focus:border-signal";

export function DealerApplyForm() {
  const [form, setForm] = useState<DealerApplication>(emptyDealerApplication);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function update<K extends keyof DealerApplication>(
    key: K,
    value: DealerApplication[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  }

  function toggleCategory(value: string) {
    setForm((prev) => {
      const exists = prev.rvCategories.includes(value);
      return {
        ...prev,
        rvCategories: exists
          ? prev.rvCategories.filter((item) => item !== value)
          : [...prev.rvCategories, value],
      };
    });
    setError("");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/dealer/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ application: form }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setError(data.error || "Could not submit application.");
        return;
      }
      setDone(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-md border border-fog bg-white p-6 md:p-8">
        <p className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.16em] text-signal uppercase">
          Application received
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-wide text-ink">
          Application Pending Review
        </h2>
        <p className="mt-4 text-ink/75">
          Thanks for applying. DealerReady will review your dealership and
          follow up by email. During the pilot, approved dealers pay $499/month
          plus purchased-lead fees.
        </p>
        <Link
          href="/for-dealers"
          className="mt-8 inline-flex rounded-md bg-signal px-6 py-3 text-sm font-bold tracking-wide text-white hover:bg-signal-deep"
        >
          BACK TO DEALER INFO
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-ink">
          Dealership information
        </h2>
        <Field label="Legal business name *">
          <input
            className={inputClass}
            value={form.legalBusinessName}
            onChange={(e) => update("legalBusinessName", e.target.value)}
            required
          />
        </Field>
        <Field label="DBA (if different)">
          <input
            className={inputClass}
            value={form.dba}
            onChange={(e) => update("dba", e.target.value)}
          />
        </Field>
        <Field label="Website">
          <input
            className={inputClass}
            value={form.website}
            onChange={(e) => update("website", e.target.value)}
            placeholder="https://"
          />
        </Field>
        <Field label="Business address *">
          <input
            className={inputClass}
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            required
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="City *">
            <input
              className={inputClass}
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
              required
            />
          </Field>
          <Field label="State *">
            <input
              className={inputClass}
              value={form.state}
              onChange={(e) => update("state", e.target.value)}
              required
            />
          </Field>
          <Field label="ZIP *">
            <input
              className={inputClass}
              value={form.zip}
              onChange={(e) => update("zip", e.target.value)}
              required
            />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-ink">
          Primary contact
        </h2>
        <Field label="Primary contact name *">
          <input
            className={inputClass}
            value={form.primaryContact}
            onChange={(e) => update("primaryContact", e.target.value)}
            required
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone *">
            <input
              className={inputClass}
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              required
            />
          </Field>
          <Field label="Email *">
            <input
              className={inputClass}
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
            />
          </Field>
        </div>
        <Field label="Number of locations">
          <input
            className={inputClass}
            value={form.locationsCount}
            onChange={(e) => update("locationsCount", e.target.value)}
          />
        </Field>
      </section>

      <section className="space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-ink">
          Inventory focus
        </h2>
        <p className="text-sm text-ink/65">RV categories sold *</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {RV_CATEGORY_OPTIONS.map((option) => {
            const selected = form.rvCategories.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => toggleCategory(option)}
                className={`rounded-md border px-4 py-3 text-left text-sm font-medium ${
                  selected
                    ? "border-signal bg-mist text-ink"
                    : "border-fog bg-white text-ink hover:border-signal/40"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
        <Field label="Brands carried">
          <input
            className={inputClass}
            value={form.brandsCarried}
            onChange={(e) => update("brandsCarried", e.target.value)}
            placeholder="Tiffin, Entegra, Grand Design..."
          />
        </Field>
        <p className="text-sm text-ink/65">New / used / both</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {INVENTORY_TYPE_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => update("inventoryType", option)}
              className={`rounded-md border px-4 py-3 text-sm font-medium ${
                form.inventoryType === option
                  ? "border-signal bg-mist"
                  : "border-fog bg-white hover:border-signal/40"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        <Field label="Typical transaction price range">
          <input
            className={inputClass}
            value={form.typicalPriceRange}
            onChange={(e) => update("typicalPriceRange", e.target.value)}
            placeholder="$150K–$400K"
          />
        </Field>
        <Field label="States / areas served">
          <input
            className={inputClass}
            value={form.statesServed}
            onChange={(e) => update("statesServed", e.target.value)}
            placeholder="TX, OK, LA"
          />
        </Field>
        <Field label="Anything else we should know?">
          <textarea
            className={`${inputClass} min-h-28`}
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
          />
        </Field>
      </section>

      <div className="rounded-md bg-mist px-4 py-3 text-sm text-ink/75">
        Pilot membership is $499/month plus purchased-lead fees. No success fee
        during the 90-day pilot. DealerReady is not a lender.
      </div>

      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex rounded-md bg-signal px-6 py-3 text-sm font-bold tracking-wide text-white hover:bg-signal-deep disabled:opacity-60"
      >
        {submitting ? "SUBMITTING..." : "SUBMIT DEALER APPLICATION"}
      </button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-ink/70">{label}</span>
      {children}
    </label>
  );
}
