import Image from "next/image";
import Link from "next/link";
import { ExactUnitSearch } from "@/components/ExactUnitSearch";
import { SiteHeader } from "@/components/SiteHeader";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-paper">
      <section className="relative isolate min-h-[100svh] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-rv.jpg"
            alt="RV parked under open sky on a scenic route"
            fill
            priority
            className="hero-zoom object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/78 via-black/52 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25" />
        </div>

        <SiteHeader />

        <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col justify-end px-5 pb-16 pt-28 md:justify-center md:px-8 md:pb-24 md:pt-24">
          <div className="max-w-2xl">
            <p className="animate-rise font-[family-name:var(--font-display)] text-5xl font-bold leading-none tracking-[0.03em] text-white sm:text-6xl md:text-7xl lg:text-8xl">
              DealerReady <span className="text-warm">RV</span>
            </p>

            <h1 className="animate-rise-delay-1 mt-6 max-w-xl font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight tracking-wide text-white sm:text-4xl md:text-5xl">
              Find the RV that fits your buying goals.
            </h1>

            <p className="animate-rise-delay-2 mt-5 max-w-lg text-base leading-relaxed text-white/88 sm:text-lg">
              Tell us what you&apos;re looking for, what you plan to spend,
              whether you have a trade, and when you want to buy. We help match
              serious RV shoppers with participating dealerships.
            </p>

            <div className="animate-rise-delay-3">
              <ExactUnitSearch />
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/profile/start"
                className="cta-pulse inline-flex items-center justify-center rounded-md bg-signal px-7 py-4 text-center text-sm font-bold tracking-wide text-white transition hover:bg-signal-deep sm:text-base"
              >
                BUILD MY BUYER PROFILE
              </Link>
              <Link
                href="/profile/start?mode=return"
                className="inline-flex items-center justify-center rounded-md border border-white/40 px-7 py-4 text-center text-sm font-semibold tracking-wide text-white transition hover:bg-white/10 sm:text-base"
              >
                UPDATE MY PROFILE
              </Link>
              <Link
                href="/we-buy"
                className="inline-flex items-center justify-center rounded-md border border-warm/80 px-7 py-4 text-center text-sm font-semibold tracking-wide text-warm transition hover:bg-white/10 sm:text-base"
              >
                WE BUY YOUR RV
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-fog bg-mist px-5 py-10 md:px-8">
        <div className="mx-auto grid w-full max-w-7xl gap-4 text-sm text-ink/80 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
          <p>Free for consumers</p>
          <p>No obligation to purchase</p>
          <p>DealerReady is not a lender</p>
          <p>We do not approve or deny financing</p>
          <p className="sm:col-span-2 lg:col-span-1">
            Shared only with your authorization
          </p>
        </div>
      </section>

      <section id="how-it-works" className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto w-full max-w-7xl">
          <p className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.18em] text-signal uppercase">
            How it works
          </p>
          <h2 className="mt-3 max-w-2xl font-[family-name:var(--font-display)] text-4xl font-semibold tracking-wide text-ink md:text-5xl">
            We qualify before we connect.
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink/75">
            Complete a short buyer profile. DealerReady scores your readiness.
            Participating dealers can then connect with serious shoppers — not
            tire-kickers.
          </p>

          <ol className="mt-12 grid gap-10 md:grid-cols-3">
            <li>
              <p className="font-[family-name:var(--font-display)] text-5xl font-bold text-pine/20">
                01
              </p>
              <h3 className="mt-2 text-xl font-semibold text-ink">
                Build your profile
              </h3>
              <p className="mt-2 text-ink/70">
                Answer simple questions about timeline, RV type, budget, trade,
                and preferences.
              </p>
            </li>
            <li>
              <p className="font-[family-name:var(--font-display)] text-5xl font-bold text-pine/20">
                02
              </p>
              <h3 className="mt-2 text-xl font-semibold text-ink">
                Get your readiness status
              </h3>
              <p className="mt-2 text-ink/70">
                We organize your information and place you in a buyer category —
                without pulling your credit.
              </p>
            </li>
            <li>
              <p className="font-[family-name:var(--font-display)] text-5xl font-bold text-pine/20">
                03
              </p>
              <h3 className="mt-2 text-xl font-semibold text-ink">
                Connect with dealers
              </h3>
              <p className="mt-2 text-ink/70">
                When you authorize it, participating dealerships can reach out
                based on your preferences.
              </p>
            </li>
          </ol>
        </div>
      </section>

      <footer className="mt-auto border-t border-fog bg-ink px-5 py-10 text-white/75 md:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-wide text-white">
              DealerReady <span className="text-warm">RV</span>
            </p>
            <p className="mt-2 max-w-md text-sm">
              DealerReady RV is not a lender and does not make credit decisions.
            </p>
          </div>
          <p className="text-sm">dealerreadyrv.com</p>
        </div>
      </footer>
    </div>
  );
}
