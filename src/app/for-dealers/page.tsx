import Link from "next/link";

export default function ForDealersPage() {
  return (
    <div className="min-h-full bg-paper px-5 py-16 md:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-medium text-signal hover:underline">
          ← Back home
        </Link>
        <h1 className="mt-6 font-[family-name:var(--font-display)] text-5xl font-semibold tracking-wide text-ink">
          Better information before the first call.
        </h1>
        <p className="mt-4 text-lg text-ink/75">
          DealerReady RV qualifies shoppers before your sales team pays for the
          opportunity. Dealer application and membership signup come next.
        </p>
      </div>
    </div>
  );
}
