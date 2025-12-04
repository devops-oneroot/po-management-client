import { QuantityUnit } from "./types";

export const CROPS = [
  "Tender Coconut",
  "Turmeric",
  "Banana",
  "Dry Coconut",
  "Maize",
  "Sunflower",
  "Jowar",
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
  { value: "Other", label: "Other" },
];

export const DEFAULT_COLUMN_SELECTION = {
  onboarded: true,
  name: true,
  number: true,
  state: true,
  district: true,
  taluk: true,
  village: true,
  experience: true,
  capacity: true,
  capacityUnit: true,
  tAndC: true,
  nextAction: true,
  interestTo: true,
  readyToSupply: true,
  tag: true,
  confidence: true,
  lastInteracted: true,
  interestedCompanies: true,
  interestsCompaniesIds: true,
  feVisited: true,
  hasStock: true,
  notes: true,
  radius: true,
  otherCrops: true,
  isVisited: true,
  cropName: true,
  buyerType: true,
  updatedAt: true,
};

