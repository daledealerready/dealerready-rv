"use client";

import { useEffect, useState } from "react";

type Ad = {
  id: string;
  message: string;
  dealerName: string;
};

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

  const line = ads
    .map((ad) => `${ad.dealerName} — ${ad.message}`)
    .join("     •     ");
  const loop = `${line}     •     `;

  return (
    <div className="sticky top-0 z-50 overflow-hidden border-y border-warm/40 bg-ink text-white">
      <div className="header-ticker-track py-2">
        <p className="px-6 text-sm font-semibold tracking-wide whitespace-nowrap">
          {loop}
          {loop}
        </p>
      </div>
    </div>
  );
}
