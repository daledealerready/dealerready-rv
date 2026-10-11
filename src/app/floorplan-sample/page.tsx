import Link from "next/link";
import { FloorplanSample } from "@/components/FloorplanSample";

export default function FloorplanSamplePage() {
  return (
    <div className="min-h-full bg-paper">
      <header className="border-b border-fog bg-white">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/" className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-wide text-ink">
            DealerReady <span className="text-signal">RV</span>
          </Link>
          <Link href="/" className="text-sm font-semibold text-signal">
            Home
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-5 py-14">
        <p className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.16em] text-signal uppercase">
          Sample test
        </p>
        <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-5xl font-semibold tracking-wide text-ink">
          Match a floorplan before asking a manufacturer.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink/75">
          Six coaches only. No manufacturer website is copied, and there are no photos. This checks whether an exact model and a plain description can find the right layout.
        </p>
        <div className="mt-10">
          <FloorplanSample />
        </div>
      </main>
    </div>
  );
}
