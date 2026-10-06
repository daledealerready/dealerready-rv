"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const SESSION_KEY = "dealerready-dealer-token";

export function DealerSignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/dealer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        token?: string;
        error?: string;
      };
      if (!response.ok || !data.ok || !data.token) {
        setError(data.error || "Could not sign in.");
        return;
      }
      window.sessionStorage.setItem(SESSION_KEY, data.token);
      router.push("/dealer/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-ink/70">
          Dealer email
        </span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-fog bg-white px-4 py-3 text-base text-ink outline-none focus:border-signal"
          required
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-ink/70">
          Temporary password
        </span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-fog bg-white px-4 py-3 text-base text-ink outline-none focus:border-signal"
          required
        />
      </label>
      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full justify-center rounded-md bg-signal px-6 py-3 text-sm font-bold tracking-wide text-white hover:bg-signal-deep disabled:opacity-60"
      >
        {loading ? "SIGNING IN..." : "DEALER SIGN IN"}
      </button>
      <p className="text-sm text-ink/60">
        Shoppers:{" "}
        <Link href="/profile/start" className="font-semibold text-signal">
          build your buyer profile
        </Link>
      </p>
    </form>
  );
}
