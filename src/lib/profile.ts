export const TOTAL_QUESTIONS = 12;

export type BuyerProfile = {
  purchaseTimeline: string;
  rvTypes: string[];
  condition: string;
  earliestYear: string;
  newestYear: string;
  preferredManufacturer: string;
  preferredModel: string;
  preferredFloorplan: string;
  openToComparable: boolean;
  minPrice: string;
  maxPrice: string;
  desiredPayment: string;
  maxPayment: string;
  paymentNotSure: boolean;
  downPayment: string;
  customDownPayment: string;
  hasTrade: string;
  tradeYear: string;
  tradeMake: string;
  tradeModel: string;
  tradeMileage: string;
  tradeCondition: string;
  tradePayoff: string;
  tradeValue: string;
  tradeOwnership: string;
  creditRange: string;
  incomeRange: string;
  employment: string;
  coBuyer: string;
  features: string[];
  featuresOther: string;
  travelDistance: string;
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  zip: string;
  preferredContact: string;
  preferredTime: string;
  authAccurate: boolean;
  authNotLender: boolean;
  authMatch: boolean;
  authPrivacy: boolean;
};

export const emptyProfile: BuyerProfile = {
  purchaseTimeline: "",
  rvTypes: [],
  condition: "",
  earliestYear: "",
  newestYear: "",
  preferredManufacturer: "",
  preferredModel: "",
  preferredFloorplan: "",
  openToComparable: true,
  minPrice: "",
  maxPrice: "",
  desiredPayment: "",
  maxPayment: "",
  paymentNotSure: false,
  downPayment: "",
  customDownPayment: "",
  hasTrade: "",
  tradeYear: "",
  tradeMake: "",
  tradeModel: "",
  tradeMileage: "",
  tradeCondition: "",
  tradePayoff: "",
  tradeValue: "",
  tradeOwnership: "",
  creditRange: "",
  incomeRange: "",
  employment: "",
  coBuyer: "",
  features: [],
  featuresOther: "",
  travelDistance: "",
  firstName: "",
  lastName: "",
  mobile: "",
  email: "",
  zip: "",
  preferredContact: "",
  preferredTime: "",
  authAccurate: false,
  authNotLender: false,
  authMatch: false,
  authPrivacy: false,
};

export const TIMELINE_OPTIONS = [
  "This week",
  "Within 30 days",
  "31–60 days",
  "61–90 days",
  "3–6 months",
  "More than 6 months",
  "Just researching",
];

export const RV_TYPE_OPTIONS = [
  "Class A Diesel",
  "Class A Gas",
  "Super C",
  "Class B",
  "Class C",
  "Fifth Wheel",
  "Travel Trailer",
  "Toy Hauler",
  "Destination Trailer",
  "Truck Camper",
  "Pop-Up",
  "Not sure",
];

export const CONDITION_OPTIONS = ["New", "Used", "Either", "Not sure"];

export const BRAND_OPTIONS = [
  "Tiffin",
  "Entegra",
  "Newmar",
  "Grand Design",
  "Forest River",
  "Jayco",
  "Keystone",
  "Winnebago",
  "Thor",
  "American Coach",
  "Airstream",
  "Other",
  "Not sure yet",
];

export const DOWN_PAYMENT_OPTIONS = [
  "Under $5,000",
  "$5,000–$9,999",
  "$10,000–$24,999",
  "$25,000–$49,999",
  "$50,000–$99,999",
  "$100,000+",
  "Not sure",
];

export const TRADE_OPTIONS = ["Yes", "No", "Maybe"];

export const CREDIT_OPTIONS = [
  "740+",
  "700–739",
  "650–699",
  "600–649",
  "Below 600",
  "Not sure",
  "Prefer not to say",
];

export const INCOME_OPTIONS = [
  "Under $50K",
  "$50K–$75K",
  "$75K–$100K",
  "$100K–$150K",
  "$150K–$250K",
  "$250K–$500K",
  "$500K+",
  "Prefer not to say",
];

export const EMPLOYMENT_OPTIONS = [
  "Employed",
  "Self-employed",
  "Retired",
  "Military",
  "Other",
];

export const COBUYER_OPTIONS = ["Yes", "No", "Maybe"];

export const FEATURE_OPTIONS = [
  "Bath and a half",
  "Two full bathrooms",
  "King bed",
  "Bunkhouse",
  "Washer/dryer",
  "Residential refrigerator",
  "Dishwasher",
  "Outside kitchen",
  "Toy garage",
  "Tag axle",
  "Diesel engine",
  "Solar",
  "Generator",
  "Four-season package",
  "High towing capacity",
  "Accessibility requirements",
  "Other",
];

export const TRAVEL_OPTIONS = [
  "25 miles",
  "50 miles",
  "100 miles",
  "250 miles",
  "500 miles",
  "1,000 miles",
  "Nationwide",
];

export const CONTACT_PREF_OPTIONS = ["Text", "Phone", "Email", "Any"];
export const CONTACT_TIME_OPTIONS = ["Morning", "Afternoon", "Evening", "Anytime"];

export type BuyerCategory =
  | "Premier Buyer"
  | "Dealer Ready"
  | "Qualified Buyer"
  | "Developing Buyer"
  | "Nurture";

export function scoreProfile(profile: BuyerProfile): {
  score: number;
  category: BuyerCategory;
} {
  let score = 0;

  const timelinePoints: Record<string, number> = {
    "This week": 25,
    "Within 30 days": 23,
    "31–60 days": 18,
    "61–90 days": 14,
    "3–6 months": 8,
    "More than 6 months": 4,
    "Just researching": 2,
  };
  score += timelinePoints[profile.purchaseTimeline] ?? 0;

  if (profile.minPrice.trim() && profile.maxPrice.trim()) score += 15;
  else if (profile.minPrice.trim() || profile.maxPrice.trim()) score += 8;

  if (profile.downPayment && profile.downPayment !== "Not sure") score += 15;
  else if (profile.downPayment === "Not sure") score += 5;

  if (profile.rvTypes.length > 0 && !profile.rvTypes.includes("Not sure")) score += 6;
  else if (profile.rvTypes.length > 0) score += 3;
  if (profile.condition && profile.condition !== "Not sure") score += 2;
  if (
    profile.preferredManufacturer &&
    profile.preferredManufacturer !== "Not sure yet"
  ) {
    score += 2;
  }

  if (
    profile.creditRange &&
    profile.creditRange !== "Prefer not to say" &&
    profile.creditRange !== "Not sure"
  ) {
    score += 10;
  } else if (profile.creditRange === "Not sure") {
    score += 4;
  }

  if (
    profile.incomeRange &&
    profile.incomeRange !== "Prefer not to say"
  ) {
    score += 10;
  }

  if (profile.hasTrade === "Yes") {
    const tradeFilled = [
      profile.tradeYear,
      profile.tradeMake,
      profile.tradeModel,
    ].filter(Boolean).length;
    score += tradeFilled >= 2 ? 5 : 3;
  } else if (profile.hasTrade === "No" || profile.hasTrade === "Maybe") {
    score += 2;
  }

  // Contact verified later with Twilio; for now award partial for complete contact
  if (
    profile.firstName &&
    profile.lastName &&
    profile.mobile &&
    profile.email &&
    profile.zip
  ) {
    score += 3;
  }

  const travelPoints: Record<string, number> = {
    "25 miles": 1,
    "50 miles": 1,
    "100 miles": 2,
    "250 miles": 2,
    "500 miles": 3,
    "1,000 miles": 3,
    Nationwide: 3,
  };
  score += travelPoints[profile.travelDistance] ?? 0;

  if (
    profile.purchaseTimeline &&
    profile.rvTypes.length > 0 &&
    profile.condition &&
    profile.maxPrice &&
    profile.downPayment &&
    profile.creditRange &&
    profile.incomeRange &&
    profile.travelDistance &&
    profile.firstName &&
    profile.mobile &&
    profile.email
  ) {
    score += 2;
  }

  score = Math.min(100, score);

  let category: BuyerCategory = "Nurture";
  if (score >= 90) category = "Premier Buyer";
  else if (score >= 80) category = "Dealer Ready";
  else if (score >= 70) category = "Qualified Buyer";
  else if (score >= 55) category = "Developing Buyer";

  return { score, category };
}
