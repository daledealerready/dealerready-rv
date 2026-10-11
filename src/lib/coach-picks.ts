import type { BuyerProfile } from "@/lib/profile";

export type CoachSearchKind = "" | "exact" | "description";

const MAX_PICKS = 12;

export type NamedPlan = {
  year: number;
  make: string;
  model: string;
  floorplan: string;
  category?: string;
};

export type CoachSearchInput = {
  kind: "exact" | "description";
  picks: string[];
  manufacturer?: string;
  model?: string;
  floorplan?: string;
  year?: string;
  rvType?: string;
};

export function cleanCoachPicks(picks: unknown): string[] {
  const source = Array.isArray(picks)
    ? picks
    : typeof picks === "string"
      ? picks.split("\n")
      : [];
  const seen = new Set<string>();
  const cleaned: string[] = [];
  for (const item of source) {
    const label = String(item ?? "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 140);
    const key = label.toLowerCase();
    if (!label || seen.has(key)) continue;
    seen.add(key);
    cleaned.push(label);
    if (cleaned.length >= MAX_PICKS) break;
  }
  return cleaned;
}

export function coachPickLines(value: unknown): string[] {
  return cleanCoachPicks(value);
}

export function planLabel(plan: NamedPlan) {
  return [plan.year, plan.make, plan.model, plan.floorplan].filter(Boolean).join(" ");
}

function uniqueText(values: Array<string | undefined>) {
  const seen = new Set<string>();
  const labels: string[] = [];
  for (const value of values) {
    const label = (value || "").trim();
    const key = label.toLowerCase();
    if (!label || seen.has(key)) continue;
    seen.add(key);
    labels.push(label);
  }
  return labels;
}

export function coachSearchFromResults(input: {
  kind: "exact" | "description";
  exact: NamedPlan[];
  similar: NamedPlan[];
  typed?: {
    year?: number | null;
    make?: string;
    model?: string;
    floorplan?: string;
  };
  rvType?: string;
}): CoachSearchInput {
  const typed = input.typed;
  const typedLabel = [typed?.year, typed?.make, typed?.model, typed?.floorplan]
    .filter((part) => part != null && String(part).trim() !== "")
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (input.kind === "exact") {
    const named = input.exact[0];
    const exactLabel = named ? planLabel(named) : typedLabel;
    const rest = input.similar
      .map(planLabel)
      .filter((label) => label.toLowerCase() !== exactLabel.toLowerCase());
    return {
      kind: "exact",
      picks: cleanCoachPicks(exactLabel ? [exactLabel, ...rest] : rest),
      manufacturer: (named?.make || typed?.make || "").trim(),
      model: (named?.model || typed?.model || "").trim(),
      floorplan: (named?.floorplan || typed?.floorplan || "").trim(),
      year: named ? String(named.year) : typed?.year ? String(typed.year) : "",
      rvType: (named?.category || input.rvType || "").trim(),
    };
  }

  const plans = input.similar.length > 0 ? input.similar : input.exact;
  const makes = uniqueText(plans.map((plan) => plan.make));
  const categories = uniqueText(plans.map((plan) => plan.category));
  return {
    kind: "description",
    picks: cleanCoachPicks(plans.map(planLabel)),
    manufacturer: makes.length === 1 ? makes[0] : "",
    model: "",
    floorplan: "",
    year: "",
    rvType: (categories.length === 1 ? categories[0] : input.rvType || "").trim(),
  };
}

export function applyCoachSearch(
  profile: BuyerProfile,
  input: CoachSearchInput,
): BuyerProfile {
  const picks = cleanCoachPicks(input.picks);
  if (picks.length === 0) {
    const previousLineup = cleanCoachPicks(profile.coachPicks).join("; ");
    return {
      ...profile,
      coachSearchKind: "",
      coachPicks: [],
      preferredManufacturer:
        previousLineup && profile.preferredManufacturer === previousLineup
          ? ""
          : profile.preferredManufacturer,
    };
  }

  const next: BuyerProfile = {
    ...profile,
    coachSearchKind: input.kind,
    coachPicks: picks,
  };

  if (input.rvType && !next.rvTypes.includes(input.rvType)) {
    next.rvTypes = [
      ...next.rvTypes.filter((item) => item !== "Not sure"),
      input.rvType,
    ];
  }

  if (input.kind === "exact") {
    if (input.manufacturer?.trim()) next.preferredManufacturer = input.manufacturer.trim();
    if (input.model?.trim()) next.preferredModel = input.model.trim();
    next.preferredFloorplan = input.floorplan?.trim() || "";
    if (input.year?.trim()) {
      next.earliestYear = input.year.trim();
      next.newestYear = input.year.trim();
    }
    next.exactUnitQuery = picks[0];
    next.openToComparable = false;
    return next;
  }

  next.preferredManufacturer = input.manufacturer?.trim() || picks.join("; ");
  next.preferredModel = "";
  next.preferredFloorplan = "";
  next.exactUnitQuery = "";
  next.openToComparable = true;
  return next;
}

export function coachPickGroups(kind: string, picks: unknown) {
  const list = cleanCoachPicks(picks);
  if (list.length === 0) return [];
  if (kind === "exact" && list.length > 1) {
    return [
      { heading: "Exact coach", items: [list[0]] },
      { heading: "Same layout, other brands", items: list.slice(1) },
    ];
  }
  if (kind === "exact") return [{ heading: "Exact coach", items: list }];
  if (kind === "description") {
    return [{ heading: "Coaches that matched the search", items: list }];
  }
  return [{ heading: "What they picked", items: list }];
}

export function coachPickSummary(kind: string, picks: unknown) {
  const groups = coachPickGroups(kind, picks);
  if (groups.length === 0) return "";
  if (kind === "exact" && groups.length === 1) return `Exact coach: ${groups[0].items[0]}`;
  if (kind === "exact") {
    return `Exact coach: ${groups[0].items[0]}. Same layout: ${groups[1].items.join("; ")}`;
  }
  return groups[0].items.join("; ");
}

export function coachSearchSavedMessage(
  kind: "exact" | "description",
  picks: string[],
) {
  const list = cleanCoachPicks(picks);
  if (list.length === 0) {
    return "Nothing matched, so this search was not added to your lead.";
  }
  if (kind === "exact" && list.length === 1) {
    return `Saved on your profile. A dealer who opens your lead will see you are looking for ${list[0]}. This search also adds to your readiness score.`;
  }
  if (kind === "exact") {
    return `Saved on your profile. A dealer who opens your lead will see you asked for ${list[0]}, plus the other brands with the same layout. This search also adds to your readiness score.`;
  }
  if (list.length === 1) {
    return `Saved on your profile. A dealer who opens your lead will see you are looking for ${list[0]}. This search also adds to your readiness score.`;
  }
  return "Saved on your profile. A dealer who opens your lead will see every coach this search found. This search also adds to your readiness score.";
}
