import { AggregatorData } from "../types";

export function mapLeadToRow(lead: any): AggregatorData {
  const user = lead?.user || lead?.userId || null;
  const interestedCompanies = Array.isArray(lead?.interestsCompanies)
    ? lead.interestsCompanies
        .map((c: any) => c.name || c.title || c.companyName || c.id)
        .join(", ")
    : lead?.interestsCompanies || "";

  const interestsCompaniesIds = Array.isArray(lead?.interestsCompanies)
    ? lead.interestsCompanies.map((c: any) => c.id).filter(Boolean)
    : [];

  return {
    id: lead.id,
    userId: lead.userId ?? lead.user?.id ?? null,
    onboarded: lead.createdAt
      ? new Date(lead.createdAt).toLocaleDateString()
      : lead.onboarded ?? null,
    updatedAt: lead.updatedAt ?? null,
    name: lead.user?.name ?? lead.name ?? (user?.name || null),
    number: lead.user?.mobileNumber ?? lead.mobileNumber ?? null,
    // keep location in UI for display but DO NOT send to backend
    village: lead.user?.village ?? lead.village ?? null,
    district: lead.user?.district ?? lead.district ?? null,
    state: lead.user?.state ?? lead.state ?? null,
    taluk: lead.user?.taluk ?? lead.taluk ?? null,
    buyerType: lead.user?.buyerType ?? user?.buyerType ?? null,
    experience:
      lead.experience != null ? String(lead.experience) : lead.experience,
    capacity: lead.capacity != null ? String(lead.capacity) : null,
    capacityUnit: lead.capacityUnit ?? null,
    tAndC:
      lead.isTcCompliant === true
        ? "Yes"
        : lead.isTcCompliant === false
        ? "No"
        : null,
    nextAction: lead.nextAction ?? null,
    nextActionDueDate: lead.nextActionDueDate
      ? new Date(lead.nextActionDueDate).toISOString().split("T")[0]
      : null,
    interestTo:
      lead.isInterestedToWork === true
        ? "Yes"
        : lead.isInterestedToWork === false
        ? "No"
        : null,
    readyToSupply: lead.nextReadyDate
      ? new Date(lead.nextReadyDate).toISOString().split("T")[0]
      : null,
    tag: lead.label ?? null,
    confidence: lead.operationScore != null ? `${lead.operationScore}` : null,
    lastInteracted: lead.lastInteractedAt
      ? new Date(lead.lastInteractedAt).toISOString().split("T")[0]
      : null,
    interestedCompanies,
    interestsCompaniesIds,
    feVisited:
      lead.feVisited === true ? "Yes" : lead.feVisited === false ? "No" : null,

    hasStock:
      lead.hasStock === true ? "Yes" : lead.hasStock === false ? "No" : null,
    notes: lead.notes ?? null,
    radius: lead.accurateRadius != null ? String(lead.accurateRadius) : null,
    accurateRadius: lead.accurateRadius ?? null,
    otherCrops: lead.otherCrop ?? [],
    isVisited: !!lead.isVisited,
    cropName: lead.cropName ?? null,
    frequency: lead.frequency ?? null,
    currentStock: lead.currentStock ?? null,
    currentStockUnit: lead.currentStockUnit ?? null,
    upfrontPaymentNeedPercentage: lead.upfrontPaymentNeedPercentage ?? null,
    interestedToWorkPercentage: lead.interestedToWorkPercentage ?? null,
    __raw: lead,
  };
}

export function mapRowToBackendPayload(row: AggregatorData) {
  const payload: any = {};

  // only include fields that exist on AggregatorLeads entity
  if (row.userId) payload.userId = row.userId;
  if (row.cropName) {
  if (Array.isArray(row.cropName)) {
    payload.cropName = row.cropName;
  } else if (typeof row.cropName === 'string') {
    // Convert comma-separated string to array
    payload.cropName = row.cropName
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);
  } else {
    payload.cropName = null;
  }
} else {
  payload.cropName = null;
}

  payload.label = row.tag ?? null;
  payload.notes = row.notes ?? null;

  // experience numeric
  if (
    row.experience !== undefined &&
    row.experience !== null &&
    row.experience !== ""
  ) {
    const n = Number(String(row.experience).replace(/[^\d.-]/g, ""));
    payload.experience = Number.isFinite(n) ? n : null;
  } else {
    payload.experience = null;
  }

  // capacity numeric
  if (
    row.capacity !== undefined &&
    row.capacity !== null &&
    row.capacity !== ""
  ) {
    const clean = String(row.capacity).replace(/[^0-9.]/g, "");
    const num = Number(clean);
    payload.capacity = Number.isFinite(num) ? num : null;
  } else {
    payload.capacity = null;
  }

  payload.capacityUnit = row.capacityUnit ?? null;

  // hasStock boolean or null
  if (
    row.hasStock !== undefined &&
    row.hasStock !== null &&
    row.hasStock !== ""
  ) {
    payload.hasStock = String(row.hasStock).toLowerCase() === "yes";
  } else {
    payload.hasStock = null;
  }

  // currentStock must be number or null
  if (row.currentStock !== undefined && row.currentStock !== null) {
    const cs = Number(row.currentStock);
    payload.currentStock = Number.isFinite(cs) ? cs : null;
  } else {
    payload.currentStock = null;
  }

  payload.currentStockUnit = row.currentStockUnit ?? null;

  // frequency
  payload.frequency = row.frequency ?? null;

  // nextAction
  payload.nextAction = row.nextAction ?? null;

  // nextActionDueDate (convert to ISO)
  if (row.nextActionDueDate) {
    const d = new Date(row.nextActionDueDate);
    payload.nextActionDueDate = !Number.isNaN(d.getTime())
      ? d.toISOString()
      : null;
  } else {
    payload.nextActionDueDate = null;
  }

  // lastInteracted
  if (row.lastInteracted) {
    const d = new Date(row.lastInteracted);
    payload.lastInteractedAt = !Number.isNaN(d.getTime())
      ? d.toISOString()
      : null;
  } else {
    payload.lastInteractedAt = null;
  }

  // readyToSupply -> nextReadyDate
  if (row.readyToSupply) {
    const d = new Date(row.readyToSupply);
    payload.nextReadyDate = !Number.isNaN(d.getTime()) ? d.toISOString() : null;
  } else {
    payload.nextReadyDate = null;
  }

  // confidence -> operationScore
  if (row.confidence !== undefined && row.confidence !== "") {
    const n = parseInt(String(row.confidence).replace(/\D/g, ""), 10);
    payload.operationScore = !Number.isNaN(n) ? n : null;
  } else {
    payload.operationScore = null;
  }

  // accurateRadius numeric -> accurateRadius
  if (row.radius !== undefined && row.radius !== null && row.radius !== "") {
    const r = Number(String(row.radius).replace(/[^\d.]/g, ""));
    payload.accurateRadius = Number.isFinite(r) ? r : null;
  } else if (row.accurateRadius !== undefined) {
    payload.accurateRadius = row.accurateRadius ?? null;
  } else {
    payload.accurateRadius = null;
  }

  // isInterestedToWork
  if (
    row.interestTo !== undefined &&
    row.interestTo !== null &&
    row.interestTo !== ""
  ) {
    payload.isInterestedToWork = String(row.interestTo).toLowerCase() === "yes";
  } else {
    payload.isInterestedToWork = null;
  }

  // isTcCompliant from tAndC
  if (row.tAndC !== undefined && row.tAndC !== null && row.tAndC !== "") {
    payload.isTcCompliant = String(row.tAndC).toLowerCase() === "yes";
  } else {
    payload.isTcCompliant = null;
  }

  // otherCrop
  payload.otherCrop = Array.isArray(row.otherCrops) ? row.otherCrops : [];

  // interestsCompaniesIds -> send array (or empty array)
  payload.interestsCompaniesIds = Array.isArray(row.interestsCompaniesIds)
    ? row.interestsCompaniesIds
    : [];

  payload.upfrontPaymentNeedPercentage =
    row.upfrontPaymentNeedPercentage ?? null;
  payload.interestedToWorkPercentage = row.interestedToWorkPercentage ?? null;

  return payload;
}
