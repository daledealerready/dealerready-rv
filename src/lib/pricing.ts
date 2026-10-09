export type LeadTier = "Qualified" | "Dealer Ready" | "Premier";

export type PriceBand =
  | "travel_trailer"
  | "fifth_wheel"
  | "class_b_c_gas_a"
  | "diesel_a_super_c"
  | "luxury_diesel";

const BAND_LABELS: Record<PriceBand, string> = {
  travel_trailer: "Travel Trailer / Pop-Up / Truck Camper",
  fifth_wheel: "Fifth Wheel / Toy Hauler",
  class_b_c_gas_a: "Class B / Class C / Gas Class A",
  diesel_a_super_c: "Diesel Class A / Super C",
  luxury_diesel: "Luxury / High-End Diesel",
};

/** Working pilot lead prices from the DealerReady blueprint. */
const PRICE_TABLE: Record<PriceBand, Record<LeadTier, number>> = {
  travel_trailer: { Qualified: 40, "Dealer Ready": 65, Premier: 95 },
  fifth_wheel: { Qualified: 60, "Dealer Ready": 95, Premier: 135 },
  class_b_c_gas_a: { Qualified: 75, "Dealer Ready": 125, Premier: 175 },
  diesel_a_super_c: { Qualified: 100, "Dealer Ready": 175, Premier: 250 },
  luxury_diesel: { Qualified: 125, "Dealer Ready": 225, Premier: 325 },
};

export const PILOT_MEMBERSHIP_MONTHLY = 499;

/** Pilot price for one header event ad. Runs from the start date through the end date. */
export const HEADER_AD_SLOT = 99;

export function categoryToTier(category: string): LeadTier | null {
  if (category === "Premier Buyer") return "Premier";
  if (category === "Dealer Ready") return "Dealer Ready";
  if (category === "Qualified Buyer") return "Qualified";
  return null;
}

export function pickPriceBand(
  rvTypes: string[] = [],
  maxPrice?: string | null,
): PriceBand {
  const types = rvTypes.map((t) => t.toLowerCase());
  const max = Number(String(maxPrice || "").replace(/[^0-9.]/g, ""));
  const hasDieselA = types.some((t) => t.includes("class a diesel"));
  const hasSuperC = types.some((t) => t.includes("super c"));
  const hasGasA = types.some((t) => t.includes("class a gas"));
  const hasB = types.some((t) => t.includes("class b"));
  const hasC = types.some((t) => t === "class c" || t.includes("class c"));
  const hasFifth = types.some((t) => t.includes("fifth"));
  const hasToy = types.some((t) => t.includes("toy hauler"));
  const hasTt = types.some(
    (t) =>
      t.includes("travel trailer") ||
      t.includes("pop-up") ||
      t.includes("truck camper") ||
      t.includes("destination"),
  );

  if ((hasDieselA || hasSuperC) && Number.isFinite(max) && max >= 500000) {
    return "luxury_diesel";
  }
  if (hasDieselA || hasSuperC) return "diesel_a_super_c";
  if (hasB || hasC || hasGasA) return "class_b_c_gas_a";
  if (hasFifth || hasToy) return "fifth_wheel";
  if (hasTt) return "travel_trailer";
  return "class_b_c_gas_a";
}

export function getLeadPrice(input: {
  category: string;
  rvTypes?: string[] | null;
  maxPrice?: string | null;
}) {
  const tier = categoryToTier(input.category);
  if (!tier) {
    return {
      sellable: false as const,
      tier: null,
      band: null as PriceBand | null,
      bandLabel: null,
      price: null as number | null,
    };
  }

  const band = pickPriceBand(input.rvTypes || [], input.maxPrice);
  const price = PRICE_TABLE[band][tier];
  return {
    sellable: true as const,
    tier,
    band,
    bandLabel: BAND_LABELS[band],
    price,
  };
}
