import Link from "next/link";
import { DealerApplyForm } from "@/components/dealer/DealerApplyForm";

export default function DealerApplyPage() {
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
          <Link href="/for-dealers" className="text-sm font-medium text-ink/60">
            Dealer info
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-5 py-10 md:py-16">
        <p className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.16em] text-signal uppercase">
          For dealers
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-wide text-ink md:text-5xl">
          Apply as a dealer
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-ink/70">
          Tell us about your dealership. Applications start as Pending Approval
          until DealerReady reviews them.
        </p>
        <div className="mt-10">
          <DealerApplyForm />
        </div>
      </main>
    </div>
  );
}
