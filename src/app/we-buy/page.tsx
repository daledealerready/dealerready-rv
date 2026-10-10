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

        <section className="mt-14 max-w-3xl">
          <h2 className="font-[family-name:var(--font-display)] text-4xl font-semibold tracking-wide text-ink">
            What we need before we buy
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink/75">
            Nearly every purchase is agreed from your photos and video. The unit is usually not seen in person until the transport driver arrives for pickup. Send complete information up front so the offer stays firm and pickup is not delayed.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-ink/75">
            Add 15 to 20 clear photos in the form below:
          </p>
          <ul className="mt-4 space-y-2 text-ink/80">
            <li>Exterior: front, back, and both sides</li>
            <li>Interior: living area, kitchen, bedroom, and bathroom</li>
            <li>Close-ups of any damage to furniture, cabinetry, or the outside</li>
            <li>Windshield, including any chips or cracks</li>
            <li>Tires, including the date stamp on each sidewall</li>
            <li>Odometer, if the motorhome is drivable</li>
            <li>Generator hour meter</li>
            <li>Batteries, including any date labels</li>
            <li>Roof, if you can photograph it safely</li>
            <li>Awning fully open, if it works</li>
            <li>VIN or serial number, usually on a sticker in a cabinet, behind the driver seat, or on the dashboard</li>
          </ul>
          <p className="mt-4 text-lg leading-relaxed text-ink/75">
            A walk-around video of the whole unit is helpful. If you can, film the same items in the list above. The more complete the information, the stronger and more reliable your purchase number will be.
          </p>
        </section>

        <div className="mt-12 max-w-3xl">
          <WeBuyForm />
        </div>
      </main>
    </div>
  );
}
