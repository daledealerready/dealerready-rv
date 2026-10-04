"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BRAND_OPTIONS,
  COBUYER_OPTIONS,
  CONDITION_OPTIONS,
  CONTACT_PREF_OPTIONS,
  CONTACT_TIME_OPTIONS,
  CREDIT_OPTIONS,
  DOWN_PAYMENT_OPTIONS,
  EMPLOYMENT_OPTIONS,
  FEATURE_OPTIONS,
  INCOME_OPTIONS,
  RV_TYPE_OPTIONS,
  TIMELINE_OPTIONS,
  TOTAL_QUESTIONS,
  TRADE_OPTIONS,
  TRAVEL_OPTIONS,
  scoreProfile,
  type BuyerProfile,
} from "@/lib/profile";
import { loadProfile, saveProfile } from "@/lib/profile-storage";

type Phase = "questions" | "review" | "complete";

function OptionButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-md border px-4 py-4 text-left text-base font-medium transition ${
        selected
          ? "border-signal bg-mist text-ink ring-2 ring-signal/30"
          : "border-fog bg-white text-ink hover:border-signal/40 hover:bg-mist"
      }`}
    >
      {children}
    </button>
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

const inputClass =
  "w-full rounded-md border border-fog bg-white px-4 py-3 text-base text-ink outline-none transition focus:border-signal";

export function ProfileWizard() {
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState(1);
  const [phase, setPhase] = useState<Phase>("questions");
  const [profile, setProfile] = useState<BuyerProfile>(loadProfile());
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = loadProfile();
    setProfile(saved);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveProfile(profile);
  }, [profile, ready]);

  const result = useMemo(() => scoreProfile(profile), [profile]);

  function update<K extends keyof BuyerProfile>(key: K, value: BuyerProfile[K]) {
    setProfile((prev) => ({ ...prev, [key]: value }));
    setError("");
  }

  function toggleList(key: "rvTypes" | "features", value: string) {
    setProfile((prev) => {
      const list = prev[key];
      const exists = list.includes(value);
      return {
        ...prev,
        [key]: exists ? list.filter((item) => item !== value) : [...list, value],
      };
    });
    setError("");
  }

  function validateStep(current: number): boolean {
    switch (current) {
      case 1:
        return !!profile.purchaseTimeline;
      case 2:
        return profile.rvTypes.length > 0;
      case 3:
        return !!profile.condition;
      case 4:
        return true;
      case 5:
        return !!profile.maxPrice.trim() || !!profile.minPrice.trim();
      case 6:
        return !!profile.downPayment;
      case 7:
        return !!profile.hasTrade;
      case 8:
        return !!profile.creditRange;
      case 9:
        return !!profile.incomeRange && !!profile.employment;
      case 10:
        return true;
      case 11:
        return !!profile.travelDistance;
      case 12:
        return !!(
          profile.firstName.trim() &&
          profile.lastName.trim() &&
          profile.mobile.trim() &&
          profile.email.trim() &&
          profile.zip.trim() &&
          profile.preferredContact &&
          profile.preferredTime
        );
      default:
        return true;
    }
  }

  function goNext() {
    if (phase === "questions") {
      if (!validateStep(step)) {
        setError("Please complete this step before continuing.");
        return;
      }
      if (step < TOTAL_QUESTIONS) {
        setStep((s) => s + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      setPhase("review");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (phase === "review") {
      if (
        !profile.authAccurate ||
        !profile.authNotLender ||
        !profile.authMatch ||
        !profile.authPrivacy
      ) {
        setError("Please check all boxes to submit your buyer profile.");
        return;
      }
      setPhase("complete");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function goBack() {
    setError("");
    if (phase === "review") {
      setPhase("questions");
      setStep(TOTAL_QUESTIONS);
      return;
    }
    if (step > 1) setStep((s) => s - 1);
  }

  const progress =
    phase === "complete"
      ? 100
      : phase === "review"
        ? 96
        : Math.round((step / TOTAL_QUESTIONS) * 90);

  if (!ready) {
    return (
      <div className="flex min-h-full items-center justify-center bg-paper text-ink/60">
        Loading your buyer profile...
      </div>
    );
  }

  if (phase === "complete") {
    const showCategory =
      result.category === "Premier Buyer" ||
      result.category === "Dealer Ready" ||
      result.category === "Qualified Buyer";

    return (
      <div className="min-h-full bg-paper">
        <WizardHeader
          label="Complete"
          progress={100}
        />
        <main className="mx-auto w-full max-w-3xl px-5 py-10 md:py-16">
          <p className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.16em] text-signal uppercase">
            Buyer profile
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-wide text-ink md:text-5xl">
            Your Buyer Profile is complete.
          </h1>

          <div className="mt-8 rounded-md border border-fog bg-white p-6">
            <p className="text-sm font-semibold tracking-wide text-ink/55 uppercase">
              DealerReady Status
            </p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-pine">
              {showCategory ? result.category : "We're reviewing your profile"}
            </p>
            <div className="mt-6 grid gap-3 text-ink/80 sm:grid-cols-2">
              <p>
                <span className="font-semibold text-ink">Vehicle:</span>{" "}
                {profile.rvTypes.join(", ") || "Not specified"}
              </p>
              <p>
                <span className="font-semibold text-ink">Budget:</span>{" "}
                {profile.minPrice || profile.maxPrice
                  ? `$${profile.minPrice || "—"} – $${profile.maxPrice || "—"}`
                  : "Not specified"}
              </p>
              <p>
                <span className="font-semibold text-ink">Timeline:</span>{" "}
                {profile.purchaseTimeline}
              </p>
              <p>
                <span className="font-semibold text-ink">Travel:</span>{" "}
                {profile.travelDistance}
              </p>
            </div>
          </div>

          <p className="mt-6 text-ink/70">
            We&apos;re reviewing your profile for matching opportunities.
            DealerReady is not a lender and does not approve financing.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                setPhase("questions");
                setStep(1);
              }}
              className="inline-flex justify-center rounded-md bg-signal px-6 py-3 text-sm font-bold tracking-wide text-white hover:bg-signal-deep"
            >
              UPDATE MY PROFILE
            </button>
            <Link
              href="/"
              className="inline-flex justify-center rounded-md border border-fog px-6 py-3 text-sm font-semibold tracking-wide text-ink hover:bg-mist"
            >
              BACK TO HOME
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-paper">
      <WizardHeader
        label={
          phase === "review"
            ? "Review"
            : `Step ${step} of ${TOTAL_QUESTIONS}`
        }
        progress={progress}
      />

      <main className="mx-auto w-full max-w-3xl px-5 py-10 md:py-16">
        <p className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.16em] text-signal uppercase">
          Buyer profile
        </p>

        {phase === "review" ? (
          <ReviewStep profile={profile} update={update} />
        ) : (
          <QuestionStep
            step={step}
            profile={profile}
            update={update}
            toggleList={toggleList}
          />
        )}

        {error ? (
          <p className="mt-6 text-sm font-medium text-red-700">{error}</p>
        ) : null}

        <div className="mt-8 flex items-center justify-between gap-4">
          {step === 1 && phase === "questions" ? (
            <Link href="/" className="text-sm font-medium text-ink/60 hover:text-ink">
              Back
            </Link>
          ) : (
            <button
              type="button"
              onClick={goBack}
              className="text-sm font-medium text-ink/60 hover:text-ink"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={goNext}
            className="inline-flex rounded-md bg-signal px-6 py-3 text-sm font-bold tracking-wide text-white transition hover:bg-signal-deep"
          >
            {phase === "review" ? "SUBMIT MY BUYER PROFILE" : "CONTINUE"}
          </button>
        </div>

        <p className="mt-8 text-sm text-ink/50">
          Progress saves automatically on this device.
        </p>
      </main>
    </div>
  );
}

function WizardHeader({ label, progress }: { label: string; progress: number }) {
  return (
    <header className="border-b border-fog bg-white">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-4">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-wide text-ink"
        >
          DealerReady <span className="text-signal">RV</span>
        </Link>
        <p className="text-sm font-medium text-ink/55">{label}</p>
      </div>
      <div className="h-1 w-full bg-fog">
        <div className="h-full bg-signal transition-all" style={{ width: `${progress}%` }} />
      </div>
    </header>
  );
}

function QuestionStep({
  step,
  profile,
  update,
  toggleList,
}: {
  step: number;
  profile: BuyerProfile;
  update: <K extends keyof BuyerProfile>(key: K, value: BuyerProfile[K]) => void;
  toggleList: (key: "rvTypes" | "features", value: string) => void;
}) {
  switch (step) {
    case 1:
      return (
        <>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-wide text-ink md:text-5xl">
            Let&apos;s find out what you&apos;re looking for.
          </h1>
          <p className="mt-4 text-lg text-ink/70">
            When are you hoping to purchase an RV?
          </p>
          <div className="mt-8 space-y-3">
            {TIMELINE_OPTIONS.map((option) => (
              <OptionButton
                key={option}
                selected={profile.purchaseTimeline === option}
                onClick={() => update("purchaseTimeline", option)}
              >
                {option}
              </OptionButton>
            ))}
          </div>
        </>
      );
    case 2:
      return (
        <>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-wide text-ink md:text-5xl">
            What type of RV are you considering?
          </h1>
          <p className="mt-4 text-lg text-ink/70">Select all that apply.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {RV_TYPE_OPTIONS.map((option) => (
              <OptionButton
                key={option}
                selected={profile.rvTypes.includes(option)}
                onClick={() => toggleList("rvTypes", option)}
              >
                {option}
              </OptionButton>
            ))}
          </div>
        </>
      );
    case 3:
      return (
        <>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-wide text-ink md:text-5xl">
            Are you shopping new, used, or either?
          </h1>
          <div className="mt-8 space-y-3">
            {CONDITION_OPTIONS.map((option) => (
              <OptionButton
                key={option}
                selected={profile.condition === option}
                onClick={() => update("condition", option)}
              >
                {option}
              </OptionButton>
            ))}
          </div>
          {(profile.condition === "Used" || profile.condition === "Either") && (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Field label="Earliest year">
                <input
                  className={inputClass}
                  inputMode="numeric"
                  placeholder="2018"
                  value={profile.earliestYear}
                  onChange={(e) => update("earliestYear", e.target.value)}
                />
              </Field>
              <Field label="Newest year">
                <input
                  className={inputClass}
                  inputMode="numeric"
                  placeholder="2026"
                  value={profile.newestYear}
                  onChange={(e) => update("newestYear", e.target.value)}
                />
              </Field>
            </div>
          )}
        </>
      );
    case 4:
      return (
        <>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-wide text-ink md:text-5xl">
            Do you have a brand or model in mind?
          </h1>
          <div className="mt-8 space-y-4">
            <Field label="Preferred manufacturer">
              <select
                className={inputClass}
                value={profile.preferredManufacturer}
                onChange={(e) => update("preferredManufacturer", e.target.value)}
              >
                <option value="">Select one</option>
                {BRAND_OPTIONS.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Preferred model">
              <input
                className={inputClass}
                placeholder="Optional"
                value={profile.preferredModel}
                onChange={(e) => update("preferredModel", e.target.value)}
              />
            </Field>
            <Field label="Preferred floorplan">
              <input
                className={inputClass}
                placeholder="Optional"
                value={profile.preferredFloorplan}
                onChange={(e) => update("preferredFloorplan", e.target.value)}
              />
            </Field>
            <label className="flex items-center gap-3 rounded-md border border-fog bg-white px-4 py-4">
              <input
                type="checkbox"
                checked={profile.openToComparable}
                onChange={(e) => update("openToComparable", e.target.checked)}
                className="h-4 w-4 accent-[var(--signal)]"
              />
              <span className="font-medium text-ink">
                I&apos;m open to comparable brands or models.
              </span>
            </label>
          </div>
        </>
      );
    case 5:
      return (
        <>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-wide text-ink md:text-5xl">
            What price range are you considering?
          </h1>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Field label="Minimum ($)">
              <input
                className={inputClass}
                inputMode="numeric"
                placeholder="150000"
                value={profile.minPrice}
                onChange={(e) => update("minPrice", e.target.value)}
              />
            </Field>
            <Field label="Maximum ($)">
              <input
                className={inputClass}
                inputMode="numeric"
                placeholder="300000"
                value={profile.maxPrice}
                onChange={(e) => update("maxPrice", e.target.value)}
              />
            </Field>
          </div>
          <div className="mt-8 space-y-4">
            <p className="text-base font-semibold text-ink">
              Optional monthly payment goal
            </p>
            <Field label="Desired payment ($)">
              <input
                className={inputClass}
                inputMode="numeric"
                value={profile.desiredPayment}
                onChange={(e) => update("desiredPayment", e.target.value)}
              />
            </Field>
            <Field label="Maximum monthly payment ($)">
              <input
                className={inputClass}
                inputMode="numeric"
                value={profile.maxPayment}
                onChange={(e) => update("maxPayment", e.target.value)}
              />
            </Field>
            <p className="rounded-md bg-mist px-4 py-3 text-sm text-ink/70">
              DealerReady does not provide financing approvals. Actual payments
              depend on financing terms and dealer/lender review.
            </p>
          </div>
        </>
      );
    case 6:
      return (
        <>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-wide text-ink md:text-5xl">
            About how much do you expect to put down?
          </h1>
          <div className="mt-8 space-y-3">
            {DOWN_PAYMENT_OPTIONS.map((option) => (
              <OptionButton
                key={option}
                selected={profile.downPayment === option}
                onClick={() => update("downPayment", option)}
              >
                {option}
              </OptionButton>
            ))}
          </div>
          <div className="mt-6">
            <Field label="Optional custom amount ($)">
              <input
                className={inputClass}
                inputMode="numeric"
                value={profile.customDownPayment}
                onChange={(e) => update("customDownPayment", e.target.value)}
              />
            </Field>
          </div>
        </>
      );
    case 7:
      return (
        <>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-wide text-ink md:text-5xl">
            Do you have an RV or vehicle to trade?
          </h1>
          <div className="mt-8 space-y-3">
            {TRADE_OPTIONS.map((option) => (
              <OptionButton
                key={option}
                selected={profile.hasTrade === option}
                onClick={() => update("hasTrade", option)}
              >
                {option}
              </OptionButton>
            ))}
          </div>
          {(profile.hasTrade === "Yes" || profile.hasTrade === "Maybe") && (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Field label="Year">
                <input
                  className={inputClass}
                  value={profile.tradeYear}
                  onChange={(e) => update("tradeYear", e.target.value)}
                />
              </Field>
              <Field label="Manufacturer">
                <input
                  className={inputClass}
                  value={profile.tradeMake}
                  onChange={(e) => update("tradeMake", e.target.value)}
                />
              </Field>
              <Field label="Model">
                <input
                  className={inputClass}
                  value={profile.tradeModel}
                  onChange={(e) => update("tradeModel", e.target.value)}
                />
              </Field>
              <Field label="Mileage">
                <input
                  className={inputClass}
                  value={profile.tradeMileage}
                  onChange={(e) => update("tradeMileage", e.target.value)}
                />
              </Field>
              <Field label="Condition">
                <input
                  className={inputClass}
                  value={profile.tradeCondition}
                  onChange={(e) => update("tradeCondition", e.target.value)}
                />
              </Field>
              <Field label="Estimated payoff ($)">
                <input
                  className={inputClass}
                  value={profile.tradePayoff}
                  onChange={(e) => update("tradePayoff", e.target.value)}
                />
              </Field>
              <Field label="Estimated value ($)">
                <input
                  className={inputClass}
                  value={profile.tradeValue}
                  onChange={(e) => update("tradeValue", e.target.value)}
                />
              </Field>
              <Field label="Ownership status">
                <input
                  className={inputClass}
                  placeholder="Owned / financing / leasing"
                  value={profile.tradeOwnership}
                  onChange={(e) => update("tradeOwnership", e.target.value)}
                />
              </Field>
            </div>
          )}
        </>
      );
    case 8:
      return (
        <>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-wide text-ink md:text-5xl">
            About where would you place your credit?
          </h1>
          <p className="mt-4 rounded-md bg-mist px-4 py-3 text-sm font-medium text-ink/80">
            This does not pull your credit. This information is self-reported and
            is not a loan application or financing decision.
          </p>
          <div className="mt-8 space-y-3">
            {CREDIT_OPTIONS.map((option) => (
              <OptionButton
                key={option}
                selected={profile.creditRange === option}
                onClick={() => update("creditRange", option)}
              >
                {option}
              </OptionButton>
            ))}
          </div>
        </>
      );
    case 9:
      return (
        <>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-wide text-ink md:text-5xl">
            Tell us a little about your household income.
          </h1>
          <div className="mt-8 space-y-3">
            {INCOME_OPTIONS.map((option) => (
              <OptionButton
                key={option}
                selected={profile.incomeRange === option}
                onClick={() => update("incomeRange", option)}
              >
                {option}
              </OptionButton>
            ))}
          </div>
          <p className="mt-8 text-lg font-semibold text-ink">Employment</p>
          <div className="mt-4 space-y-3">
            {EMPLOYMENT_OPTIONS.map((option) => (
              <OptionButton
                key={option}
                selected={profile.employment === option}
                onClick={() => update("employment", option)}
              >
                {option}
              </OptionButton>
            ))}
          </div>
          <p className="mt-8 text-lg font-semibold text-ink">
            Will there likely be a co-buyer?
          </p>
          <div className="mt-4 space-y-3">
            {COBUYER_OPTIONS.map((option) => (
              <OptionButton
                key={option}
                selected={profile.coBuyer === option}
                onClick={() => update("coBuyer", option)}
              >
                {option}
              </OptionButton>
            ))}
          </div>
        </>
      );
    case 10:
      return (
        <>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-wide text-ink md:text-5xl">
            What features matter most?
          </h1>
          <p className="mt-4 text-lg text-ink/70">Select all that apply.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {FEATURE_OPTIONS.map((option) => (
              <OptionButton
                key={option}
                selected={profile.features.includes(option)}
                onClick={() => toggleList("features", option)}
              >
                {option}
              </OptionButton>
            ))}
          </div>
          <div className="mt-6">
            <Field label="Anything else we should know?">
              <textarea
                className={`${inputClass} min-h-28`}
                value={profile.featuresOther}
                onChange={(e) => update("featuresOther", e.target.value)}
              />
            </Field>
          </div>
        </>
      );
    case 11:
      return (
        <>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-wide text-ink md:text-5xl">
            How far would you travel for the right RV?
          </h1>
          <div className="mt-8 space-y-3">
            {TRAVEL_OPTIONS.map((option) => (
              <OptionButton
                key={option}
                selected={profile.travelDistance === option}
                onClick={() => update("travelDistance", option)}
              >
                {option}
              </OptionButton>
            ))}
          </div>
        </>
      );
    case 12:
      return (
        <>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-wide text-ink md:text-5xl">
            Where should we send your buyer profile?
          </h1>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Field label="First name">
              <input
                className={inputClass}
                value={profile.firstName}
                onChange={(e) => update("firstName", e.target.value)}
              />
            </Field>
            <Field label="Last name">
              <input
                className={inputClass}
                value={profile.lastName}
                onChange={(e) => update("lastName", e.target.value)}
              />
            </Field>
            <Field label="Mobile number">
              <input
                className={inputClass}
                inputMode="tel"
                value={profile.mobile}
                onChange={(e) => update("mobile", e.target.value)}
              />
            </Field>
            <Field label="Email">
              <input
                className={inputClass}
                type="email"
                value={profile.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </Field>
            <Field label="ZIP code">
              <input
                className={inputClass}
                inputMode="numeric"
                value={profile.zip}
                onChange={(e) => update("zip", e.target.value)}
              />
            </Field>
          </div>
          <p className="mt-8 text-lg font-semibold text-ink">Preferred contact</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {CONTACT_PREF_OPTIONS.map((option) => (
              <OptionButton
                key={option}
                selected={profile.preferredContact === option}
                onClick={() => update("preferredContact", option)}
              >
                {option}
              </OptionButton>
            ))}
          </div>
          <p className="mt-8 text-lg font-semibold text-ink">Preferred time</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {CONTACT_TIME_OPTIONS.map((option) => (
              <OptionButton
                key={option}
                selected={profile.preferredTime === option}
                onClick={() => update("preferredTime", option)}
              >
                {option}
              </OptionButton>
            ))}
          </div>
        </>
      );
    default:
      return null;
  }
}

function ReviewStep({
  profile,
  update,
}: {
  profile: BuyerProfile;
  update: <K extends keyof BuyerProfile>(key: K, value: BuyerProfile[K]) => void;
}) {
  const rows = [
    ["RV type", profile.rvTypes.join(", ") || "—"],
    ["New / used", profile.condition || "—"],
    [
      "Brand / model",
      [profile.preferredManufacturer, profile.preferredModel]
        .filter(Boolean)
        .join(" ") || "—",
    ],
    [
      "Budget",
      profile.minPrice || profile.maxPrice
        ? `$${profile.minPrice || "—"} – $${profile.maxPrice || "—"}`
        : "—",
    ],
    ["Down payment", profile.downPayment || "—"],
    ["Trade", profile.hasTrade || "—"],
    ["Credit range", profile.creditRange || "—"],
    ["Income", profile.incomeRange || "—"],
    ["Purchase timeline", profile.purchaseTimeline || "—"],
    ["Travel range", profile.travelDistance || "—"],
    ["Features", profile.features.join(", ") || "—"],
    [
      "Contact",
      `${profile.firstName} ${profile.lastName} · ${profile.preferredContact}`,
    ],
  ];

  return (
    <>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-wide text-ink md:text-5xl">
        Review your information.
      </h1>
      <p className="mt-4 text-lg text-ink/70">
        Make sure everything looks right before you submit.
      </p>

      <div className="mt-8 divide-y divide-fog overflow-hidden rounded-md border border-fog bg-white">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-4 px-4 py-4">
            <div>
              <p className="text-sm font-semibold text-ink/55">{label}</p>
              <p className="mt-1 text-ink">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-3">
        {[
          ["authAccurate", "Information is accurate to the best of my knowledge."],
          ["authNotLender", "I understand DealerReady is not a lender."],
          [
            "authMatch",
            "I authorize DealerReady to match me with participating dealers.",
          ],
          ["authPrivacy", "I agree to the privacy and communication terms."],
        ].map(([key, label]) => (
          <label
            key={key}
            className="flex items-start gap-3 rounded-md border border-fog bg-white px-4 py-4"
          >
            <input
              type="checkbox"
              checked={Boolean(profile[key as keyof BuyerProfile])}
              onChange={(e) =>
                update(key as keyof BuyerProfile, e.target.checked as never)
              }
              className="mt-1 h-4 w-4 accent-[var(--signal)]"
            />
            <span className="text-sm font-medium text-ink">{label}</span>
          </label>
        ))}
      </div>
    </>
  );
}
