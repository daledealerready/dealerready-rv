import Link from "next/link";

export default function FaqPage() {
  return (
    <div className="min-h-full bg-paper px-5 py-16 md:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-medium text-signal hover:underline">
          ← Back home
        </Link>
        <h1 className="mt-6 font-[family-name:var(--font-display)] text-5xl font-semibold tracking-wide text-ink">
          FAQ
        </h1>
        <div className="mt-8 space-y-6 text-ink/80">
          <div>
            <h2 className="text-xl font-semibold text-ink">Is DealerReady a lender?</h2>
            <p className="mt-2">
              No. DealerReady does not finance vehicles, approve loans, set rates,
              or guarantee financing.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-ink">Is it free for shoppers?</h2>
            <p className="mt-2">Yes. Building a buyer profile is free for RV shoppers.</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-ink">Do you pull my credit?</h2>
            <p className="mt-2">
              No. Any credit range you share is self-reported. We do not pull your
              credit during this process.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
