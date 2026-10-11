import Link from "next/link";
import { FloorplanSample } from "@/components/FloorplanSample";

export default function FloorplanSamplePage() {
  return (
    <div className="min-h-full bg-paper">
      <header className="border-b border-fog bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/" className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-wide text-ink">
            DealerReady <span className="text-signal">RV</span>
          </Link>
          <Link href="/" className="text-sm font-semibold text-signal">
            Home
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-5 py-14">
        <p className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.16em] text-signal uppercase">
          Sample test
        </p>
        <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-5xl font-semibold tracking-wide text-ink">
          Match a floorplan before asking a manufacturer.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink/75">
          Six coaches only. Each match shows a small layout sketch and a short description. Tap a sketch to enlarge it. These sketches are not the factory drawings. A separate{" "}
          <Link href="/floorplan-sample-fifth-wheel" className="font-semibold text-signal underline">
            2022 fifth wheel test
          </Link>{" "}
          uses bedrooms front and rear, four slides, and a loft.
        </p>
        <div className="mt-10">
          <FloorplanSample />
        </div>
      </main>
    </div>
  );
}
