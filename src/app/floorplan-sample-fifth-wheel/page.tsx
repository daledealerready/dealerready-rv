import Link from "next/link";
import { FifthWheelSample } from "@/components/FifthWheelSample";

export default function FifthWheelSamplePage() {
  return (
    <div className="min-h-full bg-paper">
      <header className="border-b border-fog bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/" className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-wide text-ink">
            DealerReady <span className="text-signal">RV</span>
          </Link>
          <Link href="/floorplan-sample" className="text-sm font-semibold text-signal">
            Motorhome sample
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-5 py-14">
        <p className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.16em] text-signal uppercase">
          2022 fifth wheel test
        </p>
        <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-5xl font-semibold tracking-wide text-ink">
          Four slides, bedrooms front and rear, with a loft.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink/75">
          Six fifth wheels from 2022. The exact coach is the Prime Time Sanibel 3602WB. A description finds every coach in the sample that fits. Tap a sketch to enlarge it. These sketches are not the factory drawings.
        </p>
        <div className="mt-10">
          <FifthWheelSample />
        </div>
      </main>
    </div>
  );
}
