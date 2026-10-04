import Link from "next/link";

const timelines = [
  "This week",
  "Within 30 days",
  "31–60 days",
  "61–90 days",
  "3–6 months",
  "More than 6 months",
  "Just researching",
];

export default function ProfileStartPage() {
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
          <p className="text-sm font-medium text-ink/55">Step 1 of 12</p>
        </div>
        <div className="h-1 w-full bg-fog">
          <div className="h-full w-[8%] bg-signal" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-5 py-10 md:py-16">
        <p className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.16em] text-signal uppercase">
          Buyer profile
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-wide text-ink md:text-5xl">
          Let&apos;s find out what you&apos;re looking for.
        </h1>
        <p className="mt-4 text-lg text-ink/70">
          When are you hoping to purchase an RV?
        </p>

        <form className="mt-8 space-y-3">
          {timelines.map((option) => (
            <label
              key={option}
              className="flex cursor-pointer items-center gap-3 rounded-md border border-fog bg-white px-4 py-4 transition hover:border-signal/40 hover:bg-mist"
            >
              <input
                type="radio"
                name="purchaseTimeline"
                value={option}
                className="h-4 w-4 accent-[var(--signal)]"
              />
              <span className="text-base font-medium text-ink">{option}</span>
            </label>
          ))}

          <div className="flex items-center justify-between pt-6">
            <Link href="/" className="text-sm font-medium text-ink/60 hover:text-ink">
              Back
            </Link>
            <Link
              href="/profile/start"
              className="inline-flex rounded-md bg-signal px-6 py-3 text-sm font-bold tracking-wide text-white transition hover:bg-signal-deep"
            >
              CONTINUE
            </Link>
          </div>
        </form>

        <p className="mt-10 text-sm text-ink/50">
          Your progress will save automatically in a later step. This first
          question screen is the start of your buyer profile.
        </p>
      </main>
    </div>
  );
}
