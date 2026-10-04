import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 md:px-8">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-[0.04em] text-white md:text-3xl"
        >
          DealerReady <span className="text-warm">RV</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-white/90 md:flex">
          <Link href="/#how-it-works" className="transition hover:text-white">
            How It Works
          </Link>
          <Link href="/for-dealers" className="transition hover:text-white">
            For Dealers
          </Link>
          <Link href="/faq" className="transition hover:text-white">
            FAQ
          </Link>
          <Link
            href="/sign-in"
            className="rounded-md border border-white/35 px-4 py-2 transition hover:bg-white/10"
          >
            Sign In
          </Link>
        </nav>

        <Link
          href="/sign-in"
          className="rounded-md border border-white/35 px-3 py-1.5 text-sm font-medium text-white md:hidden"
        >
          Sign In
        </Link>
      </div>
    </header>
  );
}
