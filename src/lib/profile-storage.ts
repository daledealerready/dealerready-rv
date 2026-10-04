"use client";

import type { BuyerProfile } from "@/lib/profile";
import { emptyProfile } from "@/lib/profile";

const STORAGE_KEY = "dealerready-buyer-profile-v1";

export function loadProfile(): BuyerProfile {
  if (typeof window === "undefined") return { ...emptyProfile };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...emptyProfile };
    return { ...emptyProfile, ...JSON.parse(raw) };
  } catch {
    return { ...emptyProfile };
  }
}

export function saveProfile(profile: BuyerProfile) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function clearProfile() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
