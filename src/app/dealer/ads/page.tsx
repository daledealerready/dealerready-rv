import { Suspense } from "react";
import Link from "next/link";
import { HeaderAdPanel } from "@/components/dealer/HeaderAdPanel";

export default function DealerAdsPage() {
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
          <p className="text-sm font-medium text-ink/55">Header ad</p>
        </div>
      </header>
      <Suspense
        fallback={
          <div className="flex min-h-[40vh] items-center justify-center text-ink/60">
            Loading header ads...
          </div>
        }
      >
        <HeaderAdPanel />
      </Suspense>
    </div>
  );
}
