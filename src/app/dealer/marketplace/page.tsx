import Link from "next/link";
import { MarketplacePanel } from "@/components/dealer/MarketplacePanel";

export default function MarketplacePage() {
  return (
    <div className="min-h-full bg-paper">
      <header className="border-b border-fog bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4">
          <Link
            href="/"
            className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-wide text-ink"
          >
            DealerReady <span className="text-signal">RV</span>
          </Link>
          <p className="text-sm font-medium text-ink/55">Marketplace</p>
        </div>
      </header>
      <MarketplacePanel />
    </div>
  );
}
