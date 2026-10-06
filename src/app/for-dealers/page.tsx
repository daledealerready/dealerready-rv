import Link from "next/link";

export default function ForDealersPage() {
  return (
    <div className="min-h-full bg-paper">
      <header className="border-b border-fog bg-white">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-4">
          <Link
            href="/"
            className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-wide text-ink"
          >
            DealerReady <span className="text-signal">RV</span>
          </Link>
          <Link
            href="/for-dealers/apply"
            className="rounded-md bg-signal px-4 py-2 text-sm font-bold tracking-wide text-white hover:bg-signal-deep"
          >
            APPLY AS A DEALER
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-5 py-14 md:py-20">
        <p className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.16em] text-signal uppercase">
          For dealers
        </p>
        <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-5xl font-semibold tracking-wide text-ink md:text-6xl">
          Better information before the first call.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink/75">
          DealerReady RV qualifies shoppers before your sales team pays for the
          opportunity. We collect timeline, budget, trade, and preferences first
          — then connect serious buyers with participating dealerships.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/for-dealers/apply"
            className="inline-flex justify-center rounded-md bg-signal px-7 py-4 text-sm font-bold tracking-wide text-white hover:bg-signal-deep"
          >
            APPLY AS A DEALER
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex justify-center rounded-md border border-fog px-7 py-4 text-sm font-semibold tracking-wide text-ink hover:bg-mist"
          >
            SEE HOW IT WORKS
          </a>
        </div>

        <section id="how-it-works" className="mt-16 grid gap-8 md:grid-cols-3">
          <div>
            <p className="font-[family-name:var(--font-display)] text-4xl font-bold text-pine/20">
              01
            </p>
            <h2 className="mt-2 text-xl font-semibold text-ink">Apply</h2>
            <p className="mt-2 text-ink/70">
              Submit your dealership information. Your account starts as Pending
              Approval.
            </p>
          </div>
          <div>
            <p className="font-[family-name:var(--font-display)] text-4xl font-bold text-pine/20">
              02
            </p>
            <h2 className="mt-2 text-xl font-semibold text-ink">Get approved</h2>
            <p className="mt-2 text-ink/70">
              DealerReady reviews your application. Pilot dealers join at
              $499/month.
            </p>
          </div>
          <div>
            <p className="font-[family-name:var(--font-display)] text-4xl font-bold text-pine/20">
              03
            </p>
            <h2 className="mt-2 text-xl font-semibold text-ink">
              Buy qualified leads
            </h2>
            <p className="mt-2 text-ink/70">
              Browse anonymous buyer opportunities, purchase matches, and track
              appointments and sales.
            </p>
          </div>
        </section>

        <section className="mt-16 rounded-md border border-fog bg-white p-6 md:p-8">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-wide text-ink">
            90-day Founding Dealer Pilot
          </h2>
          <ul className="mt-4 space-y-2 text-ink/75">
            <li>$499/month membership</li>
            <li>Plus category-based lead fees</li>
            <li>No mandatory success fee during the pilot</li>
            <li>We qualify before we connect</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
