export const RV_CATEGORY_OPTIONS = [
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
];

export const INVENTORY_TYPE_OPTIONS = ["New", "Used", "Both"];

export type DealerApplication = {
  legalBusinessName: string;
  dba: string;
  website: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  primaryContact: string;
  email: string;
  locationsCount: string;
  rvCategories: string[];
  brandsCarried: string;
  inventoryType: string;
  typicalPriceRange: string;
  statesServed: string;
  notes: string;
};

export const emptyDealerApplication: DealerApplication = {
  legalBusinessName: "",
  dba: "",
  website: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  phone: "",
  primaryContact: "",
  email: "",
  locationsCount: "1",
  rvCategories: [],
  brandsCarried: "",
  inventoryType: "",
  typicalPriceRange: "",
  statesServed: "",
  notes: "",
};
