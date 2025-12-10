import { QuantityUnit } from "./types";

export const CROPS = [
  "Tender Coconut",
  "Turmeric",
  "Banana",
  "Dry Coconut",
  "Maize",
  "Sunflower",
  "Jowar",
  "Rice",
  "Soyabean",
  "Chilly",
];

export const CAPACITY_UNITS: QuantityUnit[] = [
  "QUINTAL",
  "TON",
  "PIECE",
  "KILOGRAM",
  "GRAM",
  "LITRE",
  "BAG",
  "BOX",
];

export const LOAD_FREQUENCIES = [
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "BIWEEKLY", label: "Biweekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "SEASONAL", label: "Seasonal" },
];

export const BUYER_TYPES = [
  { value: "VILLAGE_BUYER", label: "VILLAGE_BUYER" },
  { value: "MANDI_BUYER", label: "MANDI_BUYER" },
  { value: "MANDI_AND_VILLAGE_BUYER", label: "MANDI_AND_VILLAGE_BUYER" },
];

export const TAGS = [
  { value: "VLA", label: "VLA" },
  { value: "Potential Partner", label: "Potential Partner" },
  { value: "Interested in event", label: "Interested in event" },
  { value: "Other", label: "Other" },
];

export const DEFAULT_COLUMN_SELECTION = {
  onboarded: true,
  name: true,
  number: true,
  state: false,
  district: true,
  taluk: true,
  village: true,
  experience: true,
  capacity: true,
  capacityUnit: true,        // "Unit"
  tAndC: true,
  nextAction: true,
  interestTo: true,          // "Interested to collaborate"
  readyToSupply: true,
  tag: true,
  confidence: true,

  // all other columns default to false (hidden)
  lastInteracted: false,
  interestedCompanies: false,
  interestsCompaniesIds: false,
  feVisited: false,
  hasStock: false,
  notes: false,
  radius: false,
  otherCrops: false,
  isVisited: false,
  cropName: false,
  buyerType: false,
  updatedAt: false,
  upfrontPaymentNeedPercentage: false,
  interestedToWorkPercentage: false,
};


