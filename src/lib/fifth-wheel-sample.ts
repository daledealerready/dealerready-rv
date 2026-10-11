import type { SketchBand } from "@/lib/floorplan-sample";

export type FifthWheelPlan = {
  id: string;
  year: number;
  make: string;
  model: string;
  floorplan: string;
  lengthInches: number | null;
  slides: number;
  frontBedroom: boolean;
  rearBedroom: boolean;
  loft: boolean;
  bathrooms: number;
  layout: string;
  sketch: SketchBand[];
};

/** 2022 fifth wheels only. Facts from published listings. No factory drawings. */
export const FIFTH_WHEEL_SAMPLE: readonly FifthWheelPlan[] = [
  {
    id: "sanibel-3602wb-2022",
    year: 2022,
    make: "Prime Time",
    model: "Sanibel",
    floorplan: "3602WB",
    lengthInches: 44 * 12 + 6,
    slides: 4,
    frontBedroom: true,
    rearBedroom: true,
    loft: true,
    bathrooms: 1.5,
    layout: "Four slides. King bedroom in front, full bedroom in the rear, and a loft over the rear bedroom.",
    sketch: [
      [{ label: "Bedroom" }],
      [{ label: "Bath" }],
      [{ label: "Living" }],
      [{ label: "Half bath" }],
      [{ label: "Loft" }, { label: "Bedroom" }],
    ],
  },
  {
    id: "arctic-wolf-3770-2022",
    year: 2022,
    make: "Forest River",
    model: "Arctic Wolf Suite",
    floorplan: "3770",
    lengthInches: null,
    slides: 3,
    frontBedroom: true,
    rearBedroom: true,
    loft: true,
    bathrooms: 1.5,
    layout: "Front bedroom, rear bedroom, and a loft over the rear bed. Three slides, not four.",
    sketch: [
      [{ label: "Bedroom" }],
      [{ label: "Living" }],
      [{ label: "Half bath" }],
      [{ label: "Loft" }, { label: "Bedroom" }],
    ],
  },
  {
    id: "arctic-wolf-3660-2022",
    year: 2022,
    make: "Forest River",
    model: "Arctic Wolf Suite",
    floorplan: "3660",
    lengthInches: 43 * 12 + 7,
    slides: 4,
    frontBedroom: true,
    rearBedroom: false,
    loft: true,
    bathrooms: 0,
    layout: "Four slides, front bedroom, mid bunk with a loft, and living at the rear.",
    sketch: [
      [{ label: "Bedroom" }],
      [{ label: "Loft" }, { label: "Bunks" }],
      [{ label: "Living" }],
    ],
  },
  {
    id: "sanibel-3902wb-2022",
    year: 2022,
    make: "Prime Time",
    model: "Sanibel",
    floorplan: "3902WB",
    lengthInches: 43 * 12 + 8,
    slides: 4,
    frontBedroom: true,
    rearBedroom: false,
    loft: true,
    bathrooms: 1.5,
    layout: "Four slides, front bedroom, a mid bunk room, a loft, and living at the rear.",
    sketch: [
      [{ label: "Bedroom" }],
      [{ label: "Bunks" }],
      [{ label: "Loft" }],
      [{ label: "Living" }],
    ],
  },
  {
    id: "columbus-378mbc-2022",
    year: 2022,
    make: "Palomino",
    model: "Columbus Compass",
    floorplan: "378MBC",
    lengthInches: 41 * 12 + 2,
    slides: 4,
    frontBedroom: false,
    rearBedroom: false,
    loft: true,
    bathrooms: 0,
    layout: "Four slides, one bedroom, a middle bunk room, a loft, and living at the rear.",
    sketch: [
      [{ label: "Bedroom" }],
      [{ label: "Bunks" }],
      [{ label: "Loft" }],
      [{ label: "Living" }],
    ],
  },
  {
    id: "durango-g356rlq-2022",
    year: 2022,
    make: "KZ",
    model: "Durango Gold",
    floorplan: "G356RLQ",
    lengthInches: 36 * 12 + 3,
    slides: 4,
    frontBedroom: true,
    rearBedroom: false,
    loft: false,
    bathrooms: 1,
    layout: "Four slides and a front bedroom, with the living area at the rear. No loft.",
    sketch: [
      [{ label: "Bedroom" }],
      [{ label: "Bath" }],
      [{ label: "Kitchen" }],
      [{ label: "Living" }],
    ],
  },
];

export type FifthWheelQuery = {
  year?: number | null;
  make?: string;
  model?: string;
  floorplan?: string;
  slides?: number | null;
  frontBedroom?: boolean | null;
  rearBedroom?: boolean | null;
  loft?: boolean | null;
};

function sameText(left: string, right: string) {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}

function matchesDescription(plan: FifthWheelPlan, query: FifthWheelQuery) {
  if (query.slides != null && plan.slides !== query.slides) return false;
  if (query.frontBedroom != null && plan.frontBedroom !== query.frontBedroom) return false;
  if (query.rearBedroom != null && plan.rearBedroom !== query.rearBedroom) return false;
  if (query.loft != null && plan.loft !== query.loft) return false;
  return true;
}

export function matchFifthWheels(query: FifthWheelQuery) {
  const make = query.make?.trim() || "";
  const model = query.model?.trim() || "";
  const floorplan = query.floorplan?.trim() || "";
  const hasIdentity = Boolean(make || model || floorplan);
  const exact = hasIdentity
    ? FIFTH_WHEEL_SAMPLE.filter((plan) => {
        if (query.year != null && plan.year !== query.year) return false;
        if (make && !sameText(plan.make, make)) return false;
        if (model && !sameText(plan.model, model)) return false;
        if (floorplan && !sameText(plan.floorplan, floorplan)) return false;
        return true;
      })
    : [];

  const hasDescription = Boolean(
    query.slides != null || query.frontBedroom != null || query.rearBedroom != null || query.loft != null,
  );
  const described = hasDescription
    ? FIFTH_WHEEL_SAMPLE.filter((plan) => matchesDescription(plan, query))
    : [];

  const similar =
    !hasDescription && exact.length > 0
      ? FIFTH_WHEEL_SAMPLE.filter((plan) => {
          const named = exact[0];
          if (exact.some((hit) => hit.id === plan.id)) return false;
          return plan.frontBedroom === named.frontBedroom && plan.rearBedroom === named.rearBedroom && plan.loft === named.loft;
        })
      : described.filter((plan) => !exact.some((hit) => hit.id === plan.id));

  return { exact, similar };
}

export function formatFeet(inches: number | null) {
  if (inches == null) return "";
  const feet = Math.floor(inches / 12);
  const rest = inches % 12;
  return rest === 0 ? `${feet} ft` : `${feet} ft ${rest} in`;
}
