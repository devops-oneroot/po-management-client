import { ColumnSelection } from "../types";

export const ALL_COLUMNS = [
  { key: "onboarded" as keyof ColumnSelection, label: "Onboarded" },
  { key: "name" as keyof ColumnSelection, label: "Name" },
  { key: "number" as keyof ColumnSelection, label: "Number" },
  { key: "state" as keyof ColumnSelection, label: "State" },
  { key: "district" as keyof ColumnSelection, label: "District" },
  { key: "taluk" as keyof ColumnSelection, label: "Taluk" },
  { key: "village" as keyof ColumnSelection, label: "Village" },
  { key: "experience" as keyof ColumnSelection, label: "Experience" },
  { key: "capacity" as keyof ColumnSelection, label: "Capacity" },
  { key: "capacityUnit" as keyof ColumnSelection, label: "Unit" },
  { key: "tAndC" as keyof ColumnSelection, label: "T & C?" },
  { key: "nextAction" as keyof ColumnSelection, label: "Next Action" },
  {
    key: "interestTo" as keyof ColumnSelection,
    label: "Interested to collaborate",
  },
  { key: "readyToSupply" as keyof ColumnSelection, label: "Ready to Supply" },
  { key: "tag" as keyof ColumnSelection, label: "Tag" },
  { key: "confidence" as keyof ColumnSelection, label: "Confidence" },
  {
    key: "lastInteracted" as keyof ColumnSelection,
    label: "Last Interacted",
  },
  {
    key: "interestedCompanies" as keyof ColumnSelection,
    label: "Interested Companies",
  },
  {
    key: "interestsCompaniesIds" as keyof ColumnSelection,
    label: "Companies (IDs)",
  },
  { key: "feVisited" as keyof ColumnSelection, label: "FE Visited" },
  { key: "hasStock" as keyof ColumnSelection, label: "Has Stock" },
  { key: "notes" as keyof ColumnSelection, label: "Notes" },
  { key: "radius" as keyof ColumnSelection, label: "Radius" },
  { key: "otherCrops" as keyof ColumnSelection, label: "Other Crops" },
  { key: "isVisited" as keyof ColumnSelection, label: "Is Visited" },
  { key: "cropName" as keyof ColumnSelection, label: "Primary Crop" },
  { key: "buyerType" as keyof ColumnSelection, label: "Buyer Type" },
  { key: "updatedAt" as keyof ColumnSelection, label: "Last Updated" },
  {key:"upfrontPaymentNeedPercentage" as keyof ColumnSelection, label: "Upfront Payment Need (%)"},
  {key:"interestedToWorkPercentage" as keyof ColumnSelection, label: "Interested to Work (%)"},
];

