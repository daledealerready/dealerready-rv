import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="min-h-full bg-paper px-5 py-16 md:px-8">
      <div className="mx-auto max-w-md">
        <Link href="/" className="text-sm font-medium text-signal hover:underline">
          ← Back home
        </Link>
        <h1 className="mt-6 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-wide text-ink">
          Sign In
        </h1>
        <p className="mt-4 text-ink/75">
          Account login comes in the next build step. For now, start your buyer
          profile from the homepage.
        </p>
        <Link
          href="/profile/start"
          className="mt-8 inline-flex rounded-md bg-signal px-6 py-3 text-sm font-bold tracking-wide text-white hover:bg-signal-deep"
        >
          BUILD MY BUYER PROFILE
        </Link>
      </div>
    </div>
  );
}
