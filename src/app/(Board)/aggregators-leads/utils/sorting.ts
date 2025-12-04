import { AggregatorData } from "../types";

export function sortData(
  data: AggregatorData[],
  sortBy: string,
  sortOrder: "asc" | "desc"
): AggregatorData[] {
  if (!sortBy) return data;

  const sorted = [...data].sort((a, b) => {
    let aVal: any;
    let bVal: any;

    switch (sortBy) {
      case "createdAt":
      case "onboarded":
        aVal = new Date(a.onboarded || 0).getTime();
        bVal = new Date(b.onboarded || 0).getTime();
        break;

      case "updatedAt":
        aVal = new Date(a.updatedAt || 0).getTime();
        bVal = new Date(b.updatedAt || 0).getTime();
        break;

      case "operationScore":
      case "confidence":
        aVal = parseInt(String(a.confidence || "0").replace(/\D/g, ""), 10);
        bVal = parseInt(String(b.confidence || "0").replace(/\D/g, ""), 10);
        break;

      case "capacity":
        aVal = parseInt(String(a.capacity || "0").replace(/\D/g, ""), 10);
        bVal = parseInt(String(b.capacity || "0").replace(/\D/g, ""), 10);
        break;

      case "name":
        aVal = (a.name || "").toLowerCase();
        bVal = (b.name || "").toLowerCase();
        break;

      case "lastInteracted":
        aVal = new Date(a.lastInteracted || 0).getTime();
        bVal = new Date(b.lastInteracted || 0).getTime();
        break;

      case "nextActionDueDate":
        aVal = new Date(a.nextActionDueDate || 0).getTime();
        bVal = new Date(b.nextActionDueDate || 0).getTime();
        break;

      case "readyToSupply":
        aVal = new Date(a.readyToSupply || 0).getTime();
        bVal = new Date(b.readyToSupply || 0).getTime();
        break;

      default:
        return 0;
    }

    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  return sorted;
}

