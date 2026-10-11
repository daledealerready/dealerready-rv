export type FloorplanCategory =
  | "Class A Diesel"
  | "Class A Gas"
  | "Class C"
  | "Travel Trailer"
  | "Fifth Wheel";

export type SketchBand = { label: string }[];

export type SampleFloorplan = {
  id: string;
  year: number;
  make: string;
  model: string;
  floorplan: string;
  category: FloorplanCategory;
  lengthInches: number;
  bedrooms: number;
  bathrooms: number;
  bunks: boolean;
  layout: string;
  sketch: SketchBand[];
};

/** A few public floorplan facts for a search test. No photos and no copied pages. */
export const SAMPLE_FLOORPLANS: readonly SampleFloorplan[] = [
  {
    id: "tiffin-phaeton-40ih-2027",
    year: 2027,
    make: "Tiffin",
    model: "Phaeton",
    floorplan: "40 IH",
    category: "Class A Diesel",
    lengthInches: 41 * 12 + 4,
    bedrooms: 1,
    bathrooms: 1.5,
    bunks: false,
    layout: "Center bedroom, a half bath, and a full bath at the rear. No bunk room.",
    sketch: [
      [{ label: "Cab" }],
      [{ label: "Living" }],
      [{ label: "Bedroom" }],
      [{ label: "Half bath" }, { label: "Bath" }],
    ],
  },
  {
    id: "berkshire-40f-2026",
    year: 2026,
    make: "Forest River",
    model: "Berkshire",
    floorplan: "40F",
    category: "Class A Diesel",
    lengthInches: 41 * 12,
    bedrooms: 1,
    bathrooms: 2,
    bunks: true,
    layout: "Bunkhouse with two full baths, a king bed, and a drop-down bed over the cab.",
    sketch: [
      [{ label: "Cab" }, { label: "Drop-down" }],
      [{ label: "Living" }],
      [{ label: "Bunks" }],
      [{ label: "Bath" }],
      [{ label: "Bedroom" }],
      [{ label: "Bath" }],
    ],
  },
  {
    id: "berkshire-40e-2026",
    year: 2026,
    make: "Forest River",
    model: "Berkshire",
    floorplan: "40E",
    category: "Class A Diesel",
    lengthInches: 41 * 12,
    bedrooms: 1,
    bathrooms: 2,
    bunks: true,
    layout: "Bunk room across from a full bath, king bedroom, and a second full bath at the rear.",
    sketch: [
      [{ label: "Cab" }],
      [{ label: "Kitchen" }],
      [{ label: "Bunks" }, { label: "Bath" }],
      [{ label: "Bedroom" }],
      [{ label: "Bath" }],
    ],
  },
  {
    id: "discovery-38n-2027",
    year: 2027,
    make: "Fleetwood",
    model: "Discovery",
    floorplan: "38N",
    category: "Class A Diesel",
    lengthInches: 38 * 12 + 8,
    bedrooms: 1,
    bathrooms: 2,
    bunks: true,
    layout: "King bedroom toward the front, bunks in the middle, and two full baths at the rear.",
    sketch: [
      [{ label: "Cab" }],
      [{ label: "Bedroom" }],
      [{ label: "Living" }],
      [{ label: "Bunks" }],
      [{ label: "Bath" }, { label: "Bath" }],
    ],
  },
  {
    id: "sierra-41duplex-2026",
    year: 2026,
    make: "Forest River",
    model: "Sierra",
    floorplan: "41DUPLEX",
    category: "Travel Trailer",
    lengthInches: 40 * 12 + 1,
    bedrooms: 2,
    bathrooms: 2,
    bunks: false,
    layout: "A bedroom at each end, with a bathroom for each bedroom.",
    sketch: [
      [{ label: "Bedroom" }],
      [{ label: "Bath" }],
      [{ label: "Living" }],
      [{ label: "Bath" }],
      [{ label: "Bedroom" }],
    ],
  },
  {
    id: "imagine-2300mk-2027",
    year: 2027,
    make: "Grand Design",
    model: "Imagine",
    floorplan: "2300MK",
    category: "Travel Trailer",
    lengthInches: 26 * 12,
    bedrooms: 1,
    bathrooms: 1,
    bunks: false,
    layout: "One bedroom at the front and one bathroom.",
    sketch: [
      [{ label: "Bedroom" }],
      [{ label: "Living" }],
      [{ label: "Bath" }],
    ],
  },
];

const LENGTH_WINDOW_INCHES = 24;

export type FloorplanQuery = {
  year?: number | null;
  make?: string;
  model?: string;
  floorplan?: string;
  category?: FloorplanCategory | "";
  lengthFeet?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  bunks?: boolean | null;
};

function sameText(left: string, right: string) {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}

function matchesDescription(plan: SampleFloorplan, query: FloorplanQuery) {
  if (query.category && plan.category !== query.category) return false;
  if (query.bedrooms != null && plan.bedrooms !== query.bedrooms) return false;
  if (query.bathrooms != null && plan.bathrooms !== query.bathrooms) return false;
  if (query.bunks != null && plan.bunks !== query.bunks) return false;
  if (query.lengthFeet != null) {
    const target = query.lengthFeet * 12;
    if (Math.abs(plan.lengthInches - target) > LENGTH_WINDOW_INCHES) return false;
  }
  return true;
}

export function matchSampleFloorplans(query: FloorplanQuery) {
  const make = query.make?.trim() || "";
  const model = query.model?.trim() || "";
  const floorplan = query.floorplan?.trim() || "";
  const hasIdentity = Boolean(make || model || floorplan);

  const exact = hasIdentity
    ? SAMPLE_FLOORPLANS.filter((plan) => {
        if (query.year != null && plan.year !== query.year) return false;
        if (make && !sameText(plan.make, make)) return false;
        if (model && !sameText(plan.model, model)) return false;
        if (floorplan && !sameText(plan.floorplan, floorplan)) return false;
        return true;
      })
    : [];

  const hasDescription = Boolean(
    query.category || query.bedrooms != null || query.bathrooms != null || query.bunks != null || query.lengthFeet != null,
  );

  const similar = hasDescription
    ? SAMPLE_FLOORPLANS.filter((plan) => !exact.some((hit) => hit.id === plan.id) && matchesDescription(plan, query))
    : exact.length > 0
      ? SAMPLE_FLOORPLANS.filter((plan) => {
          const named = exact[0];
          if (exact.some((hit) => hit.id === plan.id)) return false;
          return (
            plan.category === named.category &&
            plan.bathrooms === named.bathrooms &&
            plan.bunks === named.bunks &&
            Math.abs(plan.lengthInches - named.lengthInches) <= LENGTH_WINDOW_INCHES
          );
        })
      : [];

  return { exact, similar };
}

export function formatLength(inches: number) {
  const feet = Math.floor(inches / 12);
  const rest = inches % 12;
  return rest === 0 ? `${feet} ft` : `${feet} ft ${rest} in`;
}

export function formatBathrooms(count: number) {
  if (count === 1.5) return "Bath and a half";
  if (count === 1) return "1 bathroom";
  return `${count} bathrooms`;
}
