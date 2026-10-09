"use client";

import { useEffect, useState } from "react";

type Ad = {
  id: string;
  message: string;
  dealerName: string;
  logoUrl?: string | null;
};

function AdChip({ ad }: { ad: Ad }) {
  return (
    <span className="mx-10 inline-flex items-center gap-4 whitespace-nowrap">
      {ad.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={ad.logoUrl}
          alt=""
          className="h-14 w-auto max-w-[150px] rounded-md bg-white object-contain px-2 py-1 shadow-[0_0_18px_rgba(240,180,41,0.45)]"
        />
      ) : null}
      <span className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-wide text-white md:text-3xl">
        <span className="text-warm">{ad.dealerName}</span>
        <span className="mx-3 text-warm">✦</span>
        {ad.message}
      </span>
    </span>
  );
}

export function HeaderTicker() {
  const [ads, setAds] = useState<Ad[]>([]);

  useEffect(() => {
    void fetch("/api/ads/active", { cache: "no-store" })
      .then(async (response) => {
        const data = (await response.json()) as { ads?: Ad[] };
        setAds(data.ads || []);
      })
      .catch(() => setAds([]));
  }, []);

  if (ads.length === 0) return null;

  return (
    <div className="relative sticky top-0 z-50 overflow-hidden border-y-4 border-warm bg-ink shadow-[0_10px_30px_rgba(240,180,41,0.28)]">
      <div className="header-ticker-shine pointer-events-none absolute inset-0" />
      <div className="header-ticker-track relative items-center py-3">
        <div className="flex items-center">
          {ads.map((ad) => (
            <AdChip key={`${ad.id}-a`} ad={ad} />
          ))}
        </div>
        <div className="flex items-center" aria-hidden="true">
          {ads.map((ad) => (
            <AdChip key={`${ad.id}-b`} ad={ad} />
          ))}
        </div>
      </div>
    </div>
  );
}
