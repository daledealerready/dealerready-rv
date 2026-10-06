import Link from "next/link";
import { DealerSignInForm } from "@/components/dealer/DealerSignInForm";

export default function SignInPage() {
  return (
    <div className="min-h-full bg-paper px-5 py-16 md:px-8">
      <div className="mx-auto max-w-md">
        <Link href="/" className="text-sm font-medium text-signal hover:underline">
          ← Back home
        </Link>
        <h1 className="mt-6 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-wide text-ink">
          Dealer Sign In
        </h1>
        <p className="mt-4 text-ink/75">
          Approved dealers can sign in with the email from their application and
          the temporary password from DealerReady.
        </p>
        <DealerSignInForm />
      </div>
    </div>
  );
}
