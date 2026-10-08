import { BRAND_OPTIONS } from "@/lib/profile";

export type ExactUnit = {
  raw: string;
  year: string;
  manufacturer: string;
  model: string;
  floorplan: string;
  label: string;
};

const MULTI_WORD_BRANDS = [...BRAND_OPTIONS]
  .filter((brand) => brand !== "Other" && brand !== "Not sure yet")
  .sort((a, b) => b.length - a.length);

export function parseExactUnit(rawQuery: string): ExactUnit {
  const raw = rawQuery.replace(/\s+/g, " ").trim();
  let rest = raw;
  let year = "";

  const yearMatch = rest.match(/^(19|20)\d{2}\b/);
  if (yearMatch) {
    year = yearMatch[0];
    rest = rest.slice(year.length).trim();
  }

  let manufacturer = "";
  const lowerRest = rest.toLowerCase();
  for (const brand of MULTI_WORD_BRANDS) {
    const lowerBrand = brand.toLowerCase();
    if (
      lowerRest === lowerBrand ||
      lowerRest.startsWith(`${lowerBrand} `)
    ) {
      manufacturer = brand;
      rest = rest.slice(brand.length).trim();
      break;
    }
  }

  if (!manufacturer && rest) {
    const [first, ...tail] = rest.split(" ");
    manufacturer = first;
    rest = tail.join(" ");
  }

  let floorplan = "";
  const floorMatch = rest.match(/^(.*?)(?:\s+)?(\d{2,4}(?:\s*[A-Za-z]{1,4})?)$/);
  if (floorMatch && floorMatch[2] && /\d/.test(floorMatch[2])) {
    const maybeModel = floorMatch[1].trim();
    floorplan = floorMatch[2].replace(/\s+/g, " ").trim();
    rest = maybeModel;
  }

  const model = rest.trim();
  const label = [year, manufacturer, model, floorplan].filter(Boolean).join(" ");

  return {
    raw,
    year,
    manufacturer,
    model,
    floorplan,
    label: label || raw,
  };
}
