import Link from "next/link";
import { WeBuyForm } from "@/components/WeBuyForm";

const BOUGHT = [
  "Class A diesel motorhomes",
  "Class A gas motorhomes",
  "Class C motorhomes",
  "High-end fifth wheels",
];

export default function WeBuyPage() {
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
          <Link href="/profile/start" className="text-sm font-semibold text-signal">
            Shop for an RV
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-5 py-14 md:py-20">
        <p className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.16em] text-signal uppercase">
          We buy
        </p>
        <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-5xl font-semibold tracking-wide text-ink md:text-6xl">
          We buy your RV.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink/75">
          Ready to sell your motorhome outright? DealerReady purchases select RVs directly, with a clear offer and a simple process.
        </p>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {BOUGHT.map((item) => (
            <li key={item} className="rounded-md border border-fog bg-white px-4 py-4 font-semibold text-ink">
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-10 max-w-3xl space-y-4 text-lg leading-relaxed text-ink/75">
          <p>
            You get a straightforward purchase offer and a cleaner way out of the unit. No listing it yourself. No waiting on a private buyer. When the offer is right, we handle the purchase so you can move on with ease.
          </p>
          <p>
            If you would rather shop for your next RV, we can connect you with a participating dealer. If you want to sell the one you have, we can buy it.
          </p>
          <p className="text-base text-ink/60">
            DealerReady is not a lender and does not guarantee financing or a specific purchase price.
          </p>
        </div>

        <div className="mt-12 max-w-3xl">
          <WeBuyForm />
        </div>
      </main>
    </div>
  );
}
