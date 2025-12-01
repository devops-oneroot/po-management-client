"use client";
import React, { useEffect, useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Search,
  Edit3,
  Save,
  Trash2,
} from "lucide-react";

interface AggregatorData {
  id: string | number | null;
  userId?: string | null;
  onboarded?: string | null;
  name?: string | null;
  number?: string | null;
  state?: string | null;
  district?: string | null;
  taluk?: string | null;
  village?: string | null;
  experience?: string | null;
  capacity?: string | null;
  capacityUnit?: string | null;
  tAndC?: string | null;
  nextAction?: string | null;
  interestTo?: string | null;
  readyToSupply?: string | null;
  tag?: string | null;
  confidence?: string | null;
  lastInteracted?: string | null;
  interestedCompanies?: string | null; // Display string for table
  interestsCompaniesIds?: string[];
  feVisited?: string | null;
  hasStock?: string | null;
  notes?: string | null;
  radius?: string | null;
  otherCrops?: string[];
  isVisited?: boolean;
  cropName?: string | null;
  buyerType?: string | null;
  updatedAt?: string | null;
  // raw backend object can be stored if needed
  __raw?: any;
}

interface ColumnSelection {
  onboarded: boolean;
  name: boolean;
  number: boolean;
  state: boolean;
  district: boolean;
  taluk: boolean;
  village: boolean;
  experience: boolean;
  capacity: boolean;
  capacityUnit: boolean;
  tAndC: boolean;
  nextAction: boolean;
  interestTo: boolean;
  readyToSupply: boolean;
  tag: boolean;
  confidence: boolean;
  lastInteracted: boolean;
  interestedCompanies: boolean;
  interestsCompaniesIds: boolean;
  feVisited: boolean;
  hasStock: boolean;
  notes: boolean;
  radius: boolean;
  otherCrops: boolean;
  isVisited: boolean;
  cropName: boolean;
  buyerType: boolean;
  updatedAt: boolean;
}

/* ===================================================================
   NewAggregatorModal - moved outside of AggregatorTable to avoid
   remounts (fixes caret / focus jumping)
   =================================================================== */
type NewAggregatorModalProps = {
  show: boolean;
  draft: AggregatorData | null;
  availableCompanies: Array<{ id: string; name: string }>;
  crops: string[];
  isEditing: boolean;
  updateDraftField: <K extends keyof AggregatorData>(
    key: K,
    value: AggregatorData[K]
  ) => void;
  cancelNewAggregator: () => void;
  saveDraft: () => Promise<void> | void;

  loadDistricts: (state: string | null) => Promise<void>;
  loadTaluks: (state: string | null, district: string | null) => Promise<void>;
  loadVillages: (
    state: string | null,
    district: string | null,
    taluk: string | null
  ) => Promise<void>;
};

function NewAggregatorModal({
  show,
  draft,
  availableCompanies,
  crops,
  isEditing,
  updateDraftField,
  cancelNewAggregator,
  saveDraft,
  loadDistricts,
  loadTaluks,
  loadVillages,
}: NewAggregatorModalProps) {
  if (!show || !draft) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Create New Aggregator Lead</h2>
          <button
            onClick={cancelNewAggregator}
            className="p-1 rounded hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          {/* Basic Info */}
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Basic Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500">Name *</label>
                <input
                  value={draft.name || ""}
                  onChange={(e) => updateDraftField("name", e.target.value)}
                  className="w-full px-3 py-2 border rounded text-sm mt-1"
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Phone Number *</label>
                <input
                  value={draft.number || ""}
                  onChange={(e) => updateDraftField("number", e.target.value)}
                  className="w-full px-3 py-2 border rounded text-sm mt-1"
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Business Details
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-xs text-gray-500">Crop *</label>
                <select
                  value={draft.cropName || ""}
                  onChange={(e) => updateDraftField("cropName", e.target.value)}
                  className="w-full px-3 py-2 border rounded text-sm mt-1"
                  required
                >
                  <option value="">Select Crop</option>
                  {crops.map((crop) => (
                    <option key={crop} value={crop}>
                      {crop}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Capacity</label>
                  <input
                    value={draft.capacity || ""}
                    onChange={(e) =>
                      updateDraftField("capacity", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded text-sm mt-1"
                    placeholder="500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Unit</label>
                  <select
                    value={draft.capacityUnit || ""}
                    onChange={(e) =>
                      updateDraftField("capacityUnit", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded text-sm mt-1"
                  >
                    <option value="">Unit</option>
                    <option value="QUINTAL">Qtl</option>
                    <option value="TON">Ton</option>
                    <option value="PIECE">Pc</option>
                    <option value="KILOGRAM">Kg</option>
                    <option value="GRAM">Gm</option>
                    <option value="LITRE">Ltr</option>
                    <option value="BAG">Bag</option>
                    <option value="BOX">Box</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500">
                    Confidence score
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={draft.confidence || ""}
                    onChange={(e) =>
                      updateDraftField("confidence", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded text-sm mt-1"
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">
                    Experience (years)
                  </label>
                  <input
                    value={draft.experience || ""}
                    onChange={(e) =>
                      updateDraftField("experience", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded text-sm mt-1"
                    placeholder="Enter years"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Radius (km)</label>
                  <input
                    type="number"
                    min="0"
                    value={draft.radius || ""}
                    onChange={(e) => updateDraftField("radius", e.target.value)}
                    className="w-full px-3 py-2 border rounded text-sm mt-1"
                    placeholder="Enter radius"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">
                    T & C Compliant?
                  </label>
                  <select
                    value={draft.tAndC || "No"}
                    onChange={(e) => updateDraftField("tAndC", e.target.value)}
                    className="w-full px-3 py-2 border rounded text-sm mt-1"
                  >
                    <option value="Yes">Yes - Compliant</option>
                    <option value="No">No - Not Compliant</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Buyer Type</label>
                  <select
                    value={draft.buyerType || ""}
                    onChange={(e) =>
                      updateDraftField("buyerType", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded text-sm mt-1"
                  >
                    <option value="">Select Buyer Type</option>
                    <option value="VILLAGE_BUYER">VILLAGE_BUYER</option>
                    <option value="MANDI_BUYER">MANDI_BUYER</option>
                    <option value="MANDI_AND_VILLAGE_BUYER">
                      MANDI_AND_VILLAGE_BUYER
                    </option>
                  </select>
                </div>
              </div>

              {/* Tag (NewAggregatorModal) */}
              <div>
                <label className="text-xs text-gray-500">Tag</label>
                <div className="space-y-2 mt-1">
                  {(() => {
                    const option = [
                      "VLA",
                      "Potential Partner",
                      "Other",
                    ].includes(draft.tag || "")
                      ? draft.tag
                      : "Other";
                    return (
                      <>
                        <select
                          value={option || ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (v === "Other") {
                              if (
                                !["VLA", "Potential Partner", "Other"].includes(
                                  draft.tag || ""
                                )
                              ) {
                                updateDraftField("tag", draft.tag || "");
                              } else {
                                updateDraftField("tag", "");
                              }
                            } else {
                              updateDraftField("tag", v);
                            }
                          }}
                          className="w-full px-2 py-1 border rounded text-sm"
                        >
                          <option value="VLA">VLA</option>
                          <option value="Potential Partner">
                            Potential Partner
                          </option>
                          <option value="Other">Other</option>
                        </select>

                        {/* show textbox when select is Other (covers both blank custom and existing custom tag) */}
                        {option === "Other" && (
                          <input
                            type="text"
                            placeholder="Enter custom tag"
                            value={draft.tag || ""}
                            onChange={(e) =>
                              updateDraftField("tag", e.target.value)
                            }
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Additional Details
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-xs text-gray-500">
                  Interested Companies
                </label>
                <div className="border rounded p-2 max-h-32 overflow-y-auto bg-white mt-1">
                  {availableCompanies.length === 0 ? (
                    <div className="text-xs text-gray-400">
                      Loading companies...
                    </div>
                  ) : (
                    availableCompanies.map((company) => (
                      <label
                        key={company.id}
                        className="flex items-center gap-2 py-1 px-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={(draft.interestsCompaniesIds || []).includes(
                            company.id
                          )}
                          onChange={(e) => {
                            const currentIds =
                              draft.interestsCompaniesIds || [];
                            if (e.target.checked) {
                              updateDraftField("interestsCompaniesIds", [
                                ...currentIds,
                                company.id,
                              ]);
                            } else {
                              updateDraftField(
                                "interestsCompaniesIds",
                                currentIds.filter((id) => id !== company.id)
                              );
                            }
                          }}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm">{company.name}</span>
                      </label>
                    ))
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {(draft.interestsCompaniesIds || []).length} selected
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500">Notes</label>
                <textarea
                  value={draft.notes || ""}
                  onChange={(e) => updateDraftField("notes", e.target.value)}
                  className="w-full px-3 py-2 border rounded text-sm mt-1"
                  rows={3}
                  placeholder="Add any notes..."
                />
              </div>

              <div>
                <label className="text-xs text-gray-500">
                  Other Crops (comma separated)
                </label>
                <input
                  value={(draft.otherCrops || []).join(", ")}
                  onChange={(e) =>
                    updateDraftField(
                      "otherCrops",
                      e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                    )
                  }
                  className="w-full px-3 py-2 border rounded text-sm mt-1"
                  placeholder="Rice, Wheat, Corn"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex justify-end gap-3">
          <button
            onClick={cancelNewAggregator}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={saveDraft}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
          >
            <Save size={16} />
            Create Aggregator
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===================================================================
   AggregatorTable - main component 
   =================================================================== */
const AggregatorTable = () => {
  // ======== API CONFIGURATION =========
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

  // Generic API caller
  const callApi = async (path: string, options: RequestInit = {}) => {
    const url = `${API_BASE_URL.replace(/\/$/, "")}${
      path.startsWith("/") ? path : `/${path}`
    }`;

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const headers: Record<string, string> = {
      Accept: "application/json",
      ...(options.headers as Record<string, string>),
    };

    // If body is JSON and content-type not set, set it
    if (
      options.body &&
      !(options.body instanceof FormData) &&
      !headers["Content-Type"]
    ) {
      headers["Content-Type"] = "application/json";
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(url, {
      credentials: "same-origin",
      ...options,
      headers,
    });

    const text = await res.text().catch(() => "");
    // Try parse JSON if any
    let payload: any = null;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = text;
    }

    if (!res.ok) {
      // Try to provide useful error message
      const message =
        payload?.message || payload?.error || res.statusText || "API error";
      const err: any = new Error(message);
      err.status = res.status;
      err.body = payload;
      throw err;
    }

    return payload;
  };

  // Add this helper function to format "time ago"
  const getTimeAgo = (date: string | null | undefined): string => {
    if (!date) return "-";

    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSecs < 60) return "Just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    if (diffWeeks < 4)
      return `${diffWeeks} week${diffWeeks > 1 ? "s" : ""} ago`;
    if (diffMonths < 12)
      return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
    return `${diffYears} year${diffYears > 1 ? "s" : ""} ago`;
  };
  // ======== DATA STATE =========
  const [data, setData] = useState<AggregatorData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(40);
  // Companies list for multi-select
  const [availableCompanies, setAvailableCompanies] = useState<
    Array<{ id: string; name: string }>
  >([]);

  // UI selection/editing
  const [selectedRowId, setSelectedRowId] = useState<string | number | null>(
    null
  );
  const selectedRow = data.find((r) => r.id === selectedRowId);

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<AggregatorData | null>(null);

  // location lists (shared)
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [taluks, setTaluks] = useState<string[]>([]);
  const [villages, setVillages] = useState<string[]>([]);

  // column selector
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<ColumnSelection>({
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
  });

  // Filters (UI). We'll map these to backend query params when fetching.
  const [searchName, setSearchName] = useState("");
  const [searchCompany, setSearchCompany] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("");
  const [selectedCapacity, setSelectedCapacity] = useState("");
  const [selectedScore, setSelectedScore] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedTaluk, setSelectedTaluk] = useState("");
  const [selectedVillage, setSelectedVillage] = useState("");
  const [showNewAggregatorModal, setShowNewAggregatorModal] = useState(false);
  const cancelNewAggregator = () => {
    setShowNewAggregatorModal(false);
    setDraft(null);
    setIsEditing(false);
  };
  const allColumns = [
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
  ];

  // kept crops list as before
  const crops = [
    "Tender Coconut",
    "Turmeric",
    "Banana",
    "Dry Coconut",
    "Maize",
    "Sunflower",
    "Jowar",
  ];

  // ======= UTILS: mapping backend AggregatorLeads -> UI row =======
  function mapLeadToRow(lead: any): AggregatorData {
    const user = lead?.user || lead?.userId || null;
    // Extract company names for display
    const interestedCompanies = Array.isArray(lead?.interestsCompanies)
      ? lead.interestsCompanies
          .map((c: any) => c.name || c.title || c.companyName || c.id)
          .join(", ")
      : lead?.interestsCompanies || "";

    // Extract company IDs for editing
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
      village: lead.user?.village ?? lead.village ?? null,
      district: lead.user?.district ?? lead.district ?? null,
      state: lead.user?.state ?? lead.state ?? null,
      taluk: lead.user?.taluk ?? lead.taluk ?? null,
      // ✅ Extract buyerType from user
      buyerType: lead.user?.buyerType ?? user?.buyerType ?? null,
      experience:
        lead.experience != null ? String(lead.experience) : lead.experience,
      capacity: lead.capacity != null ? String(lead.capacity) : null,
      capacityUnit: lead.capacityUnit ?? null,
      tAndC: lead.isTcCompliant ? "Yes" : "No",
      nextAction: lead.nextAction ?? null,
      interestTo: lead.isInterestedToWork ? "Yes" : "No",
      readyToSupply: lead.nextReadyDate
        ? new Date(lead.nextReadyDate).toISOString().split("T")[0] // YYYY-MM-DD format for date input
        : null,
      tag: lead.label ?? null,
      confidence: lead.operationScore != null ? `${lead.operationScore}` : null,
      lastInteracted: lead.lastInteractedAt
        ? new Date(lead.lastInteractedAt).toISOString().split("T")[0]
        : null,
      interestedCompanies, // Display string
      interestsCompaniesIds,
      feVisited: lead.feVisited ? "Yes" : "No",
      hasStock:
        lead.hasStock === true
          ? lead.currentStock != null
            ? `Yes, ${lead.currentStock} ${lead.currentStockUnit ?? ""}`
            : "Yes"
          : "No",
      notes: lead.notes ?? null,
      radius: lead.accurateRadius != null ? `${lead.accurateRadius}` : null,
      otherCrops: lead.otherCrop ?? [],
      isVisited: !!lead.isVisited,
      cropName: lead.cropName ?? null,
      __raw: lead,
    };
  }

  // Reverse mapper: take UI draft and produce payload for backend create/update
  function mapRowToBackendPayload(row: AggregatorData) {
    const payload: any = {};
    if (row.userId) payload.userId = row.userId;
    if (row.cropName) payload.cropName = row.cropName;
    if (row.otherCrops) payload.otherCrop = row.otherCrops;
    if (row.notes !== undefined) payload.notes = row.notes;
    if (row.tag !== undefined) payload.label = row.tag;
    if (row.experience !== undefined)
      payload.experience = row.experience
        ? Number(String(row.experience).replace(/\D/g, ""))
        : 0;

    if (row.capacity) {
      const clean = String(row.capacity).replace(/[^0-9.]/g, "");
      const num = Number(clean);
      if (!Number.isNaN(num)) payload.capacity = num;
    }

    if (row.capacityUnit) {
      payload.capacityUnit = row.capacityUnit;
    }

    if (row.hasStock) {
      payload.hasStock = String(row.hasStock).toLowerCase().startsWith("yes");
      const m = String(row.hasStock).match(/(\d+)/);
      if (m) payload.currentStock = Number(m[1]);
    }
    if (row.nextAction) payload.nextAction = row.nextAction;
    if (row.lastInteracted) {
      const d = new Date(row.lastInteracted);
      if (!Number.isNaN(d.getTime()))
        payload.lastInteractedAt = d.toISOString();
    }
    if (row.readyToSupply) {
      const d = new Date(row.readyToSupply);
      if (!Number.isNaN(d.getTime())) payload.nextReadyDate = d.toISOString();
    }
    if (row.confidence) {
      const n = parseInt(String(row.confidence).replace(/\D/g, ""), 10);
      if (!Number.isNaN(n)) payload.operationScore = n;
    }
    if (row.radius) {
      const m = String(row.radius).match(/(\d+)/);
      if (m) payload.accurateRadius = Number(m[1]);
    }
    if (row.interestTo !== undefined) {
      payload.isInterestedToWork =
        String(row.interestTo).toLowerCase() === "yes";
    }

    // ✅ FIX: Map tAndC to isTcCompliant as boolean
    if (row.tAndC !== undefined) {
      payload.isTcCompliant = String(row.tAndC).toLowerCase() === "yes";
    }
    if (row.interestsCompaniesIds && row.interestsCompaniesIds.length > 0) {
      payload.interestsCompaniesIds = row.interestsCompaniesIds;
    }

    return payload;
  }

  // ======= API FUNCTIONS (inline) =======
  // Build query params based on UI filters
  function buildListParams() {
    const params: Record<string, any> = {
      page,
      limit,
    };

    if (searchName) params.search = searchName;
    if (searchCompany) params.search = searchCompany;
    if (selectedCrop) params.cropName = selectedCrop;
    if (selectedState) params.state = selectedState;
    if (selectedDistrict) params.district = selectedDistrict;
    if (selectedVillage) params.village = selectedVillage;
    if (selectedTaluk) params.taluk = selectedTaluk;
    return params;
  }

  async function fetchLeads() {
    try {
      const params = buildListParams();
      // Convert params object to query string
      const qp = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v === undefined || v === null || v === "") return;
        if (Array.isArray(v)) {
          v.forEach((x) => qp.append(k, String(x)));
        } else qp.append(k, String(v));
      });

      const path = `/aggregator-leads${
        qp.toString() ? `?${qp.toString()}` : ""
      }`;
      const res = await callApi(path, { method: "GET" });

      // map backend leads to UI rows
      const rows = Array.isArray(res.data)
        ? res.data.map((lead: any) => mapLeadToRow(lead))
        : (res as any).map((lead: any) => mapLeadToRow(lead));
      setData(rows);
      setTotal(res.total ?? rows.length);
    } catch (err: any) {
      console.error("Failed to fetch aggregator leads:", err);
    }
  }

  async function findUserByPhone(phone: string) {
    try {
      const res = await callApi(`/users?search=${phone}`, { method: "GET" });
      if (Array.isArray(res) && res.length > 0) return res[0];
      if (res?.data?.length) return res.data[0];
      return null;
    } catch (err) {
      console.error("Failed to find user by phone:", err);
      return null;
    }
  }

  async function createAggregatorLead(body: Record<string, any>) {
    return await callApi(`/aggregator-leads`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async function patchAggregatorLead(id: string, body: Record<string, any>) {
    return await callApi(`/aggregator-leads/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  async function deleteAggregatorLead(id: string) {
    return await callApi(`/aggregator-leads/${id}`, { method: "DELETE" });
  }

  // Add this near your other API functions
  async function fetchAllCompanies() {
    try {
      const res = await callApi(`/po-companies`, { method: "GET" });
      // Adjust based on your actual response structure
      return Array.isArray(res) ? res : res.data || [];
    } catch (err) {
      console.error("Failed to fetch companies:", err);
      return [];
    }
  }

  // Add this near your other API functions
  async function updateBuyerType(
    userId: string,
    buyerType: string | { buyerType?: string | null }
  ) {
    const payload =
      typeof buyerType === "string"
        ? { buyerType }
        : buyerType ?? { buyerType: null };

    return await callApi(`/users/update-buyer/${userId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  // ---- location loaders ----
  const loadStates = async () => {
    try {
      const res = await callApi(`/newlocations/states`, { method: "GET" });
      // expecting an array of strings or objects; normalize to strings
      if (Array.isArray(res)) {
        setStates(
          res.map((s: any) =>
            typeof s === "string" ? s : s.name || s.state || s.id
          )
        );
      } else if (Array.isArray(res.data)) {
        setStates(
          res.data.map((s: any) =>
            typeof s === "string" ? s : s.name || s.state || s.id
          )
        );
      } else {
        setStates([]);
      }
    } catch (err) {
      console.error("Failed to load states:", err);
      setStates([]);
    }
  };

  const loadDistricts = async (state: string | null) => {
    if (!state) {
      setDistricts([]);
      return;
    }
    try {
      const res = await callApi(
        `/newlocations/districts?state=${encodeURIComponent(state)}`,
        { method: "GET" }
      );
      if (Array.isArray(res)) {
        setDistricts(
          res.map((d: any) =>
            typeof d === "string" ? d : d.name || d.district || d.id
          )
        );
      } else if (Array.isArray(res.data)) {
        setDistricts(
          res.data.map((d: any) =>
            typeof d === "string" ? d : d.name || d.district || d.id
          )
        );
      } else {
        setDistricts([]);
      }
    } catch (err) {
      console.error("Failed to load districts:", err);
      setDistricts([]);
    }
  };

  const loadTaluks = async (state: string | null, district: string | null) => {
    if (!state || !district) {
      setTaluks([]);
      return;
    }
    try {
      const res = await callApi(
        `/newlocations/taluks?state=${encodeURIComponent(
          state
        )}&district=${encodeURIComponent(district)}`,
        { method: "GET" }
      );
      if (Array.isArray(res)) {
        setTaluks(
          res.map((t: any) =>
            typeof t === "string" ? t : t.name || t.taluk || t.id
          )
        );
      } else if (Array.isArray(res.data)) {
        setTaluks(
          res.data.map((t: any) =>
            typeof t === "string" ? t : t.name || t.taluk || t.id
          )
        );
      } else {
        setTaluks([]);
      }
    } catch (err) {
      console.error("Failed to load taluks:", err);
      setTaluks([]);
    }
  };

  const loadVillages = async (
    state: string | null,
    district: string | null,
    taluk: string | null
  ) => {
    if (!state || !district || !taluk) {
      setVillages([]);
      return;
    }
    try {
      const res = await callApi(
        `/newlocations/villages?state=${encodeURIComponent(
          state
        )}&district=${encodeURIComponent(district)}&taluk=${encodeURIComponent(
          taluk
        )}`,
        { method: "GET" }
      );
      if (Array.isArray(res)) {
        setVillages(
          res.map((v: any) =>
            typeof v === "string" ? v : v.name || v.village || v.id
          )
        );
      } else if (Array.isArray(res.data)) {
        setVillages(
          res.data.map((v: any) =>
            typeof v === "string" ? v : v.name || v.village || v.id
          )
        );
      } else {
        setVillages([]);
      }
    } catch (err) {
      console.error("Failed to load villages:", err);
      setVillages([]);
    }
  };

  // Initial load + reload when filters / pagination change
  useEffect(() => {
    fetchLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page,
    limit,
    searchName,
    searchCompany,
    selectedCrop,
    selectedState,
    selectedDistrict,
    selectedTaluk,
    selectedVillage,
  ]);

  // Add this useEffect to load companies and location states on mount
  useEffect(() => {
    const load = async () => {
      const companies = await fetchAllCompanies();
      setAvailableCompanies(companies);
      await loadStates();
    };
    load();
  }, []);

  // NOTE: Removed the automatic fetching effects that triggered when
  // selectedState/selectedDistrict/selectedTaluk filter inputs changed.
  // Those behaviors are retained for draft/modal flows only (see draft useEffect below).

  // When draft changes (openDetails / create), preload location lists based on draft values.
  useEffect(() => {
    if (!draft) return;
    (async () => {
      // ensure states loaded (they usually are), but call to be safe
      if (states.length === 0) await loadStates();
      if (draft.state) {
        await loadDistricts(draft.state);
      }
      if (draft.state && draft.district) {
        await loadTaluks(draft.state, draft.district);
      }
      if (draft.state && draft.district && draft.taluk) {
        await loadVillages(draft.state, draft.district, draft.taluk);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  // ======= Column helper & filters =======
  const toggleColumn = (key: keyof ColumnSelection) => {
    setSelectedColumns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const clearAllFilters = () => {
    setSearchName("");
    setSearchCompany("");
    setSelectedCrop("");
    setSelectedCapacity("");
    setSelectedScore("");
    setSelectedState("");
    setSelectedDistrict("");
    setSelectedTaluk("");
    setSelectedVillage("");
  };

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const matchesName =
        searchName === "" ||
        (row.name || "").toLowerCase().includes(searchName.toLowerCase()) ||
        (row.number || "").includes(searchName);
      const matchesCompany =
        searchCompany === "" ||
        (Array.isArray(row.interestedCompanies)
          ? row.interestedCompanies.join(", ").toLowerCase()
          : (row.interestedCompanies || "").toLowerCase()
        ).includes(searchCompany.toLowerCase());

      // --- changed matching to case-insensitive substring matching ---
      const matchesState =
        selectedState === "" ||
        (row.state || "").toLowerCase().includes(selectedState.toLowerCase());
      const matchesDistrict =
        selectedDistrict === "" ||
        (row.district || "")
          .toLowerCase()
          .includes(selectedDistrict.toLowerCase());
      const matchesTaluk =
        selectedTaluk === "" ||
        (row.taluk || "").toLowerCase().includes(selectedTaluk.toLowerCase());
      const matchesVillage =
        selectedVillage === "" ||
        (row.village || "")
          .toLowerCase()
          .includes(selectedVillage.toLowerCase());

      let matchesCapacity = true;
      if (selectedCapacity) {
        const numeric = parseInt(selectedCapacity, 10);
        const rowNum =
          parseInt(String(row.capacity || "").replace(/\D/g, ""), 10) || 0;
        matchesCapacity = rowNum >= numeric;
      }

      let matchesScore = true;
      if (selectedScore) {
        const numeric = parseInt(selectedScore, 10);
        const rowScore =
          parseInt(String(row.confidence || "").replace(/\D/g, ""), 10) || 0;
        matchesScore = rowScore <= numeric;
      }

      const matchesCrop =
        selectedCrop === "" ||
        (row.cropName || "").toLowerCase() === selectedCrop.toLowerCase() ||
        (row.otherCrops || []).some(
          (c) => c.toLowerCase() === selectedCrop.toLowerCase()
        );

      return (
        matchesName &&
        matchesCompany &&
        matchesState &&
        matchesDistrict &&
        matchesTaluk &&
        matchesVillage &&
        matchesCapacity &&
        matchesScore &&
        matchesCrop
      );
    });
  }, [
    data,
    searchName,
    searchCompany,
    selectedCapacity,
    selectedScore,
    selectedState,
    selectedDistrict,
    selectedTaluk,
    selectedVillage,
    selectedCrop,
  ]);

  const activeFiltersCount = [
    searchName,
    searchCompany,
    selectedCrop,
    selectedCapacity,
    selectedScore,
    selectedState,
    selectedDistrict,
    selectedTaluk,
    selectedVillage,
  ].filter((f) => f !== "").length;

  // ======= ROW SELECTION / EDIT / SAVE / DELETE handlers =======
  const openDetails = (id: string | number) => {
    setSelectedRowId(id);
    setIsEditing(false);
    const row = data.find((r) => r.id === id) || null;
    setDraft(row ? { ...row } : null);
  };

  const closeDetails = () => {
    setSelectedRowId(null);
    setIsEditing(false);
    setDraft(null);
  };

  const startEdit = () => {
    if (selectedRowId == null) return;
    setIsEditing(true);
  };

  // Save: If draft.id exists -> update; else -> create
  const saveDraft = async () => {
    if (!draft) return;

    try {
      // ✅ CREATE MODE
      if (!draft.id) {
        if (!draft.number) {
          alert("Mobile number is required");
          return;
        }

        const user = await findUserByPhone(draft.number);

        if (!user?.id) {
          alert(
            "User not found! Please first create user on Markhet dashboard, then come here."
          );
          return;
        }

        if (
          draft.buyerType !== undefined &&
          draft.buyerType !== user.buyerType
        ) {
          await updateBuyerType(user.id, { buyerType: draft.buyerType });
        }

        const payload = mapRowToBackendPayload(draft);
        payload.userId = user.id;

        await createAggregatorLead(payload);

        await fetchLeads();
        setIsEditing(false);
        setShowNewAggregatorModal(false); // ✅ Close modal
        setDraft(null);
        return;
      }

      // ====== UPDATE MODE ======
      const payload = mapRowToBackendPayload(draft);
      await patchAggregatorLead(String(draft.id), payload);

      if (draft.userId && draft.buyerType !== undefined) {
        const originalRow = data.find((r) => r.id === draft.id);
        if (originalRow && draft.buyerType !== originalRow.buyerType) {
          await updateBuyerType(draft.userId, { buyerType: draft.buyerType });
        }
      }

      await fetchLeads();
      setIsEditing(false);
    } catch (err) {
      console.error("Save failed:", err);
      alert("Save failed");
    }
  };

  const cancelEdit = () => {
    if (selectedRowId == null) {
      setDraft(null);
      setIsEditing(false);
      return;
    }
    const row = data.find((r) => r.id === selectedRowId) || null;
    setDraft(row ? { ...row } : null);
    setIsEditing(false);
  };

  const deleteRow = async (id: string | number) => {
    if (!confirm("Delete this aggregator? This action cannot be undone."))
      return;
    try {
      await deleteAggregatorLead(String(id));
      // optimistic UI: remove locally
      setData((prev) => prev.filter((r) => r.id !== id));
      if (selectedRowId === id) closeDetails();
    } catch (err: any) {
      console.error("Delete failed:", err);
      alert(err.message || "Delete failed");
    }
  };

  // Helpers to update draft fields
  const updateDraftField = <K extends keyof AggregatorData>(
    key: K,
    value: AggregatorData[K]
  ) => {
    setDraft((d) => (d ? { ...d, [key]: value } : d));
  };

  // column visibility helpers
  const isColumnVisible = (key: keyof ColumnSelection) => {
    if (selectedRowId == null) return true;
    return !!selectedColumns[key];
  };

  const visibleColumnsCount = Object.keys(selectedColumns).reduce((acc, k) => {
    const key = k as keyof ColumnSelection;
    return acc + (isColumnVisible(key) ? 1 : 0);
  }, 0);
  const effectiveVisibleCount =
    selectedRowId == null
      ? Object.keys(selectedColumns).length
      : visibleColumnsCount;

  // Create new aggregator flow: open empty draft for creation
  const createNewAggregator = () => {
    const empty: AggregatorData = {
      id: null,
      userId: undefined,
      name: "",
      number: "",
      state: "",
      district: "",
      taluk: "",
      village: "",
      buyerType: "",
      cropName: "",
      experience: "",
      capacity: "",
      capacityUnit: "",
      tAndC: "Yes",
      nextAction: "",
      interestTo: "",
      readyToSupply: "",
      tag: "VLA",
      confidence: "",
      lastInteracted: "",
      interestedCompanies: "",
      interestsCompaniesIds: [],
      feVisited: "No",
      hasStock: "No",
      notes: "",
      radius: "",
      otherCrops: [],
      isVisited: false,
    };
    setDraft(empty);
    setSelectedRowId(null);
    setIsEditing(true);
    setShowNewAggregatorModal(true);
    // preload states (already loaded on mount) and clear dependent lists
    setDistricts([]);
    setTaluks([]);
    setVillages([]);
  };

  // ========== RENDER ==========
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1600px] mx-auto flex gap-6">
        {/* Left: Table + Controls (flex-grow) */}
        <div className="flex-1">
          {/* Header Controls */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search Name or Number"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="relative flex-1 min-w-[200px]">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search by Company"
                  value={searchCompany}
                  onChange={(e) => setSearchCompany(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Crops</option>
                {crops.map((crop) => (
                  <option key={crop} value={crop}>
                    {crop}
                  </option>
                ))}
              </select>
              <select
                value={selectedCapacity}
                onChange={(e) => setSelectedCapacity(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">&gt; Capacity</option>
                <option value="30">&gt; 30 capacity</option>
                <option value="20">&gt; 20 capacity</option>
                <option value="10">&gt; 10 capacity</option>
              </select>
              <select
                value={selectedScore}
                onChange={(e) => setSelectedScore(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">&lt; Score</option>
                <option value="50">&lt; 50% Score</option>
                <option value="70">&lt; 70% Score</option>
                <option value="90">&lt; 90% Score</option>
              </select>
              <button
                onClick={createNewAggregator}
                className="px-4 py-2 bg-black text-white rounded-md text-sm flex items-center gap-2 ml-auto hover:bg-gray-800 transition-colors"
              >
                <Plus size={16} />
                New Aggregator
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              {/* STATE filter : now a free text input */}
              <input
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                placeholder="State"
                className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* DISTRICT filter : now a free text input */}
              <input
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                placeholder="District"
                className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* TALUK filter : now a free text input */}
              <input
                value={selectedTaluk}
                onChange={(e) => setSelectedTaluk(e.target.value)}
                placeholder="Taluk"
                className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* VILLAGE filter : now a free text input */}
              <input
                value={selectedVillage}
                onChange={(e) => setSelectedVillage(e.target.value)}
                placeholder="Village"
                className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                onClick={() => setShowColumnSelector(!showColumnSelector)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm ml-auto hover:bg-blue-600 transition-colors"
              >
                {showColumnSelector ? "Hide" : "Select"} Columns
              </button>
            </div>

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap items-center">
                {searchName && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    Search: {searchName}
                    <X
                      size={14}
                      className="cursor-pointer hover:text-blue-900"
                      onClick={() => setSearchName("")}
                    />
                  </span>
                )}
                {searchCompany && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    Company: {searchCompany}
                    <X
                      size={14}
                      className="cursor-pointer hover:text-blue-900"
                      onClick={() => setSearchCompany("")}
                    />
                  </span>
                )}
                {selectedState && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {selectedState}
                    <X
                      size={14}
                      className="cursor-pointer hover:text-blue-900"
                      onClick={() => setSelectedState("")}
                    />
                  </span>
                )}
                {selectedDistrict && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {selectedDistrict}
                    <X
                      size={14}
                      className="cursor-pointer hover:text-blue-900"
                      onClick={() => setSelectedDistrict("")}
                    />
                  </span>
                )}
                {selectedTaluk && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {selectedTaluk}
                    <X
                      size={14}
                      className="cursor-pointer hover:text-blue-900"
                      onClick={() => setSelectedTaluk("")}
                    />
                  </span>
                )}
                {selectedVillage && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {selectedVillage}
                    <X
                      size={14}
                      className="cursor-pointer hover:text-blue-900"
                      onClick={() => setSelectedVillage("")}
                    />
                  </span>
                )}
                {selectedCrop && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    Crop: {selectedCrop}
                    <X
                      size={14}
                      className="cursor-pointer hover:text-blue-900"
                      onClick={() => setSelectedCrop("")}
                    />
                  </span>
                )}
                <button
                  onClick={clearAllFilters}
                  className="text-blue-600 text-sm underline hover:text-blue-800"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>

          {/* Column Selector Modal */}
          {showColumnSelector && (
            <div className="bg-white rounded-lg shadow-lg p-4 mb-4 border border-gray-200 animate-fadeIn">
              <h3 className="font-semibold mb-3">Select Columns to Display</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {allColumns.map((col) => (
                  <label
                    key={col.key}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedColumns[col.key]}
                      onChange={() => toggleColumn(col.key)}
                      className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm">{col.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Results count */}
          <div className="mb-3 text-sm text-gray-600">
            Showing {filteredData.length} of {total} aggregators
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase w-8"></th>
                    {isColumnVisible("onboarded") && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Onboarded
                      </th>
                    )}
                    {isColumnVisible("name") && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Name
                      </th>
                    )}
                    {isColumnVisible("number") && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Number
                      </th>
                    )}
                    {isColumnVisible("village") && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Location
                      </th>
                    )}
                    {isColumnVisible("experience") && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Experience
                      </th>
                    )}
                    {isColumnVisible("capacity") && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Capacity
                      </th>
                    )}

                    {isColumnVisible("tAndC") && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        T & C agreed?
                      </th>
                    )}
                    {isColumnVisible("nextAction") && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Next Action
                      </th>
                    )}
                    {isColumnVisible("interestTo") && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Interested to collaborate
                      </th>
                    )}
                    {isColumnVisible("readyToSupply") && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Ready to Supply
                      </th>
                    )}
                    {isColumnVisible("tag") && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Tag
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={effectiveVisibleCount + 1}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        No aggregators found matching your filters
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((row) => {
                      const isSelected = selectedRowId === row.id;
                      return (
                        <tr
                          key={String(row.id)}
                          className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                            isSelected ? "bg-blue-50" : ""
                          }`}
                          onClick={() => openDetails(row.id as any)}
                        >
                          <td className="px-4 py-3">
                            {isSelected ? (
                              <ChevronUp size={16} className="text-gray-600" />
                            ) : (
                              <ChevronDown
                                size={16}
                                className="text-gray-600"
                              />
                            )}
                          </td>
                          {isColumnVisible("onboarded") && (
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {row.onboarded}
                            </td>
                          )}
                          {isColumnVisible("name") && (
                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                              {row.name}
                            </td>
                          )}
                          {isColumnVisible("number") && (
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {row.number}
                            </td>
                          )}
                          {isColumnVisible("village") && (
                            <td className="px-4 py-3 text-sm text-gray-900">
                              <div>{row.village}</div>
                              <div className="text-gray-500 text-xs">
                                {row.taluk ? `${row.taluk}, ` : ""}
                                {row.district ? `${row.district}, ` : ""}
                                {row.state || ""}
                              </div>
                            </td>
                          )}
                          {isColumnVisible("experience") && (
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {row.experience}
                            </td>
                          )}
                          {isColumnVisible("capacity") && (
                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                              {row.capacity && row.capacityUnit
                                ? `${row.capacity} ${row.capacityUnit}`
                                : row.capacity || "-"}
                            </td>
                          )}
                          {isColumnVisible("tAndC") && (
                            <td className="px-4 py-3 text-sm text-gray-900">
                              <span className="flex items-center gap-1">
                                {row.tAndC}
                                <ChevronDown
                                  size={14}
                                  className="text-gray-400"
                                />
                              </span>
                            </td>
                          )}
                          {isColumnVisible("nextAction") && (
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {row.nextAction}
                            </td>
                          )}
                          {isColumnVisible("interestTo") && (
                            <td className="px-4 py-3 text-sm text-gray-900">
                              <span className="flex items-center gap-1">
                                {row.interestTo}
                                <ChevronDown
                                  size={14}
                                  className="text-gray-400"
                                />
                              </span>
                            </td>
                          )}
                          {isColumnVisible("readyToSupply") && (
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {row.readyToSupply}
                            </td>
                          )}
                          {isColumnVisible("tag") && (
                            <td className="px-4 py-3 text-sm">
                              <span
                                className={`px-3 py-1 rounded-md text-xs font-medium ${
                                  row.tag === "VLA"
                                    ? "bg-gray-100 text-gray-700 border border-gray-300"
                                    : "bg-blue-50 text-blue-700 border border-blue-200"
                                }`}
                              >
                                {row.tag}
                              </span>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Details Panel (REARRANGED, Primary Crop next to Location + read-only Name/Phone) */}
        <aside className="w-[420px]">
          <div className="bg-blue-50 rounded-lg shadow-sm p-4 sticky top-6 max-h-[calc(100vh-96px)] overflow-y-auto">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-2xl font-bold text-green-500">Details</div>
              </div>
              <div className="flex items-center gap-2">
                {(selectedRowId || draft?.id === null) && (
                  <>
                    {!isEditing ? (
                      <button
                        onClick={startEdit}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded flex items-center gap-2 hover:bg-blue-700"
                      >
                        <Edit3 size={14} /> Edit
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={saveDraft}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded flex items-center gap-2 hover:bg-green-700"
                        >
                          <Save size={14} /> Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1 bg-gray-200 text-sm rounded flex items-center gap-2 hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {selectedRowId && (
                      <button
                        onClick={() => deleteRow(selectedRowId)}
                        className="p-1 rounded text-red-600 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </>
                )}
                <button
                  onClick={closeDetails}
                  className="p-1 rounded hover:bg-gray-50"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="mt-4 border-t border-gray-100 pt-4 space-y-4">
              {!draft && !selectedRowId && (
                <div className="text-sm text-gray-500">
                  Click any row on the left to view full details and edit or
                  click "New Aggregator".
                </div>
              )}

              {draft && (
                <div className="space-y-4">
                  {/* 1) HEADER: Primary info (Name, Onboarded date, Location + Primary Crop, Phone) */}
                  <div className="bg-green-100 p-3 rounded">
                    <div className="text-base text-blue-500 mb-2 font-bold">
                      Primary Info
                    </div>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div>
                        <div className="text-base font-bold text-black-400">
                          Name
                        </div>
                        {/* Name is now read-only always */}
                        <div className="font-medium">{draft.name}</div>
                      </div>

                      <div className="flex gap-2">
                        <div className="flex-1">
                          <div className="text-base font-bold text-black-400">
                            Phone
                          </div>
                          {/* Phone is read-only always */}
                          <div className="font-medium">{draft.number}</div>
                        </div>

                        <div className="w-36">
                          <div className="text-base font-bold text-black-400">
                            Onboarded
                          </div>
                          {!isEditing ? (
                            <div className="font-medium">{draft.onboarded}</div>
                          ) : (
                            <input
                              value={draft.onboarded || ""}
                              onChange={(e) =>
                                updateDraftField("onboarded", e.target.value)
                              }
                              className="w-full px-2 py-1 border rounded text-sm"
                            />
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 items-start">
                        <div className="flex-1">
                          <div className="text-base font-bold text-black-400">
                            Location
                          </div>

                          <div className="font-medium">
                            {[
                              draft.village,
                              draft.taluk,
                              draft.district,
                              draft.state,
                            ]
                              .filter(Boolean)
                              .join(", ") || "-"}
                          </div>
                        </div>

                        <div className="w-36">
                          <div className="text-base font-bold text-black-400">
                            Primary Crop
                          </div>
                          {!isEditing ? (
                            <div className="font-medium">
                              {draft.cropName || "-"}
                            </div>
                          ) : (
                            <select
                              value={draft.cropName || ""}
                              onChange={(e) =>
                                updateDraftField("cropName", e.target.value)
                              }
                              className="w-full px-2 py-1 border rounded text-sm"
                            >
                              <option value="">Select Crop</option>
                              {crops.map((crop) => (
                                <option key={crop} value={crop}>
                                  {crop}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2) COMPANIES DETAILS: Interested Companies + Ready to Supply */}
                  <div className="bg-green-100 p-3 rounded">
                    <div className="text-base text-blue-500 mb-2 font-bold">
                      Companies
                    </div>
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div>
                        <div className="text-base font-bold text-black-400">
                          Interested Companies
                        </div>
                        {!isEditing ? (
                          <div className="font-medium">
                            {draft.interestedCompanies || "-"}
                          </div>
                        ) : (
                          <div>
                            <div className="border rounded p-2 max-h-40 overflow-y-auto bg-white">
                              {availableCompanies.length === 0 ? (
                                <div className="text-xs text-gray-400">
                                  Loading companies...
                                </div>
                              ) : (
                                availableCompanies.map((company) => (
                                  <label
                                    key={company.id}
                                    className="flex items-center gap-2 py-1 px-2 hover:bg-gray-50 rounded cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={(
                                        draft.interestsCompaniesIds || []
                                      ).includes(company.id)}
                                      onChange={(e) => {
                                        const currentIds =
                                          draft.interestsCompaniesIds || [];
                                        if (e.target.checked) {
                                          updateDraftField(
                                            "interestsCompaniesIds",
                                            [...currentIds, company.id]
                                          );
                                        } else {
                                          updateDraftField(
                                            "interestsCompaniesIds",
                                            currentIds.filter(
                                              (id) => id !== company.id
                                            )
                                          );
                                        }
                                      }}
                                      className="w-4 h-4 text-blue-600"
                                    />
                                    <span className="text-sm">
                                      {company.name}
                                    </span>
                                  </label>
                                ))
                              )}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {(draft.interestsCompaniesIds || []).length}{" "}
                              selected
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="text-base font-bold text-black-400">
                          Ready to Supply
                        </div>
                        {!isEditing ? (
                          <div className="font-medium">
                            {draft.readyToSupply
                              ? new Date(
                                  draft.readyToSupply
                                ).toLocaleDateString()
                              : "-"}
                          </div>
                        ) : (
                          <input
                            type="date"
                            value={draft.readyToSupply || ""}
                            onChange={(e) =>
                              updateDraftField("readyToSupply", e.target.value)
                            }
                            min={new Date().toISOString().split("T")[0]}
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 3) QUALIFYING QUESTIONS / BUSINESS DETAILS */}
                  <div className="bg-green-100 p-3 rounded">
                    <div className="text-base text-blue-500 mb-2 font-bold">
                      Qualifying / Business Details
                    </div>
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <div className="text-base font-bold text-black-400">
                            Capacity
                          </div>
                          {!isEditing ? (
                            <div className="font-medium">
                              {draft.capacity && draft.capacityUnit
                                ? `${draft.capacity} ${draft.capacityUnit}`
                                : draft.capacity || "-"}
                            </div>
                          ) : (
                            <input
                              value={draft.capacity || ""}
                              onChange={(e) =>
                                updateDraftField("capacity", e.target.value)
                              }
                              className="w-full h-8 px-2 py-1 border rounded text-sm"
                              placeholder="500"
                            />
                          )}
                        </div>

                        <div className="w-24">
                          <div className="text-base font-bold text-black-400">
                            Unit
                          </div>
                          {!isEditing ? (
                            <div className="font-medium">
                              {draft.capacityUnit || "-"}
                            </div>
                          ) : (
                            <select
                              value={draft.capacityUnit || ""}
                              onChange={(e) =>
                                updateDraftField("capacityUnit", e.target.value)
                              }
                              className="w-full h-8 px-2 border rounded text-sm"
                            >
                              <option value="">Unit</option>
                              <option value="QUINTAL">Qtl</option>
                              <option value="TON">Ton</option>
                              <option value="PIECE">Pc</option>
                              <option value="KILOGRAM">Kg</option>
                              <option value="GRAM">Gm</option>
                              <option value="LITRE">Ltr</option>
                              <option value="BAG">Bag</option>
                              <option value="BOX">Box</option>
                            </select>
                          )}
                        </div>

                        <div className="w-28">
                          <div className="text-base font-bold text-black-400">
                            Confidence
                          </div>
                          {!isEditing ? (
                            <div className="font-medium">
                              {draft.confidence ? `${draft.confidence}%` : "-"}
                            </div>
                          ) : (
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={draft.confidence || ""}
                              onChange={(e) =>
                                updateDraftField("confidence", e.target.value)
                              }
                              className="w-full h-8 px-2 border rounded text-sm"
                              placeholder="100%"
                            />
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="text-base font-bold text-black-400">
                          Experience
                        </div>
                        {!isEditing ? (
                          <div className="font-medium">
                            {draft.experience || "-"}
                          </div>
                        ) : (
                          <input
                            value={draft.experience || ""}
                            onChange={(e) =>
                              updateDraftField("experience", e.target.value)
                            }
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        )}
                      </div>

                      <div>
                        <div className="text-base font-bold text-black-400">
                          T & C Compliant?
                        </div>
                        {!isEditing ? (
                          <div className="font-medium">
                            {draft.tAndC || "-"}
                          </div>
                        ) : (
                          <select
                            value={draft.tAndC || "No"}
                            onChange={(e) =>
                              updateDraftField("tAndC", e.target.value)
                            }
                            className="w-full px-2 py-1 border rounded text-sm"
                          >
                            <option value="Yes">Yes - Compliant</option>
                            <option value="No">No - Not Compliant</option>
                          </select>
                        )}
                      </div>

                      <div>
                        <div className="text-base font-bold text-black-400">
                          Buyer Type
                        </div>
                        {!isEditing ? (
                          <div className="font-medium">
                            {draft.buyerType || "-"}
                          </div>
                        ) : (
                          <select
                            value={draft.buyerType || ""}
                            onChange={(e) =>
                              updateDraftField("buyerType", e.target.value)
                            }
                            className="w-full px-2 py-1 border rounded text-sm"
                          >
                            <option value="">Select Buyer Type</option>
                            <option value="VILLAGE_BUYER">VILLAGE_BUYER</option>
                            <option value="MANDI_BUYER">MANDI_BUYER</option>
                            <option value="MANDI_AND_VILLAGE_BUYER">
                              MANDI_AND_VILLAGE_BUYER
                            </option>
                          </select>
                        )}
                      </div>

                      <div>
                        <div className="text-base font-bold text-black-400">
                          Interested to work with us
                        </div>
                        {!isEditing ? (
                          <div className="font-medium">
                            {draft.interestTo || "-"}
                          </div>
                        ) : (
                          <select
                            value={draft.interestTo || "No"}
                            onChange={(e) =>
                              updateDraftField("interestTo", e.target.value)
                            }
                            className="w-full px-2 py-1 border rounded text-sm"
                          >
                            <option>Yes</option>
                            <option>No</option>
                          </select>
                        )}
                      </div>

                      <div>
                        <div className="text-base font-bold text-black-400">
                          Radius (km)
                        </div>
                        {!isEditing ? (
                          <div className="font-medium">
                            {draft.radius ? `${draft.radius} km` : "-"}
                          </div>
                        ) : (
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={draft.radius || ""}
                            onChange={(e) =>
                              updateDraftField("radius", e.target.value)
                            }
                            className="w-full px-2 py-1 border rounded text-sm"
                            placeholder="Enter radius in km"
                          />
                        )}
                      </div>

                      <div>
                        <div className="text-base font-bold text-black-400">
                          FE Visited
                        </div>
                        {!isEditing ? (
                          <div className="font-medium">
                            {draft.feVisited || "-"}
                          </div>
                        ) : (
                          <select
                            value={draft.feVisited || "No"}
                            onChange={(e) =>
                              updateDraftField("feVisited", e.target.value)
                            }
                            className="w-full px-2 py-1 border rounded text-sm"
                          >
                            <option>Yes</option>
                            <option>No</option>
                          </select>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 4) INTERACTION DETAILS */}
                  <div className="bg-green-100 p-3 rounded">
                    <div className="text-base text-blue-500 mb-2 font-bold">
                      Interaction
                    </div>
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      {/* First row with two fields - one left, one right */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-base font-bold text-black-400">
                            Last Interacted
                          </div>
                          {!isEditing ? (
                            <div className="font-medium">
                              {draft.lastInteracted
                                ? new Date(
                                    draft.lastInteracted
                                  ).toLocaleDateString()
                                : "-"}
                            </div>
                          ) : (
                            <input
                              type="date"
                              value={draft.lastInteracted || ""}
                              onChange={(e) =>
                                updateDraftField(
                                  "lastInteracted",
                                  e.target.value
                                )
                              }
                              className="w-full px-2 py-1 border rounded text-sm"
                            />
                          )}
                        </div>

                        <div>
                          <div className="text-base font-bold text-black-400">
                            Next Action
                          </div>
                          {!isEditing ? (
                            <div className="font-medium">
                              {draft.nextAction || "-"}
                            </div>
                          ) : (
                            <input
                              value={draft.nextAction || ""}
                              onChange={(e) =>
                                updateDraftField("nextAction", e.target.value)
                              }
                              className="w-full px-2 py-1 border rounded text-sm"
                            />
                          )}
                        </div>
                      </div>

                      {/* Second row with one field */}
                      <div>
                        <div className="text-base font-bold text-black-400">
                          Last Updated
                        </div>
                        <div className="font-medium text-gray-600">
                          {getTimeAgo(draft.updatedAt)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 5) OTHER CROPS */}
                  <div className="bg-green-100 p-3 rounded">
                    <div className="text-base font-bold text-blue-500">
                      Other Crops
                    </div>
                    {!isEditing ? (
                      <div className="flex gap-1 flex-wrap mt-1">
                        {(draft.otherCrops || []).length === 0 ? (
                          <div className="text-base text-gray-500">None</div>
                        ) : (
                          (draft.otherCrops || []).map((c, i) => (
                            <span
                              key={i}
                              className="text-base bg-green px-2 py-1 rounded border border-gray-200"
                            >
                              {c}
                            </span>
                          ))
                        )}
                      </div>
                    ) : (
                      <input
                        value={(draft.otherCrops || []).join(", ")}
                        onChange={(e) =>
                          updateDraftField(
                            "otherCrops",
                            e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean)
                          )
                        }
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                    )}
                  </div>

                  {/* 6) NOTES */}
                  <div className="bg-green-100 p-3 rounded">
                    <div className="text-base font-bold text-blue-500">
                      Notes
                    </div>
                    {!isEditing ? (
                      <div className="text-sm text-gray-700">
                        {draft.notes || "-"}
                      </div>
                    ) : (
                      <textarea
                        value={draft.notes || ""}
                        onChange={(e) =>
                          updateDraftField("notes", e.target.value)
                        }
                        className="w-full px-2 py-1 border rounded text-sm"
                        rows={4}
                      />
                    )}
                  </div>

                  {/* Any leftover fields: tag, hasStock displayed sensibly */}
                  <div className="bg-green-100 p-3 rounded">
                    <div className="text-base text-blue-500 mb-2 font-bold">
                      Misc
                    </div>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      {/* Tag (Details panel) */}
                      <div>
                        <div className="text-base font-bold text-black-400">
                          Tag
                        </div>

                        {!isEditing ? (
                          <div className="font-medium">{draft.tag || "-"}</div>
                        ) : (
                          <div className="space-y-2 mt-1">
                            {(() => {
                              const option = [
                                "VLA",
                                "Potential Partner",
                                "Other",
                              ].includes(draft.tag || "")
                                ? draft.tag
                                : "Other";
                              return (
                                <>
                                  <select
                                    value={option || ""}
                                    onChange={(e) => {
                                      const v = e.target.value;
                                      if (v === "Other") {
                                        if (
                                          ![
                                            "VLA",
                                            "Potential Partner",
                                            "Other",
                                          ].includes(draft.tag || "")
                                        ) {
                                          updateDraftField(
                                            "tag",
                                            draft.tag || ""
                                          );
                                        } else {
                                          updateDraftField("tag", "");
                                        }
                                      } else {
                                        updateDraftField("tag", v);
                                      }
                                    }}
                                    className="w-full px-2 py-1 border rounded text-sm"
                                  >
                                    <option value="VLA">VLA</option>
                                    <option value="Potential Partner">
                                      Potential Partner
                                    </option>
                                    <option value="Other">Other</option>
                                  </select>

                                  {option === "Other" && (
                                    <input
                                      type="text"
                                      placeholder="Enter custom tag"
                                      value={draft.tag || ""}
                                      onChange={(e) =>
                                        updateDraftField("tag", e.target.value)
                                      }
                                      className="w-full px-2 py-1 border rounded text-sm"
                                    />
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="text-base font-bold text-black-400">
                          Has Stock
                        </div>
                        {!isEditing ? (
                          <div className="font-medium">
                            {draft.hasStock || "No"}
                          </div>
                        ) : (
                          <select
                            value={draft.hasStock || "No"}
                            onChange={(e) =>
                              updateDraftField("hasStock", e.target.value)
                            }
                            className="w-full px-2 py-1 border rounded text-sm"
                          >
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                          </select>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
      {/* New Aggregator Modal */}
      <NewAggregatorModal
        show={showNewAggregatorModal}
        draft={draft}
        availableCompanies={availableCompanies}
        crops={crops}
        isEditing={isEditing}
        updateDraftField={updateDraftField}
        cancelNewAggregator={cancelNewAggregator}
        saveDraft={saveDraft}
        loadDistricts={loadDistricts}
        loadTaluks={loadTaluks}
        loadVillages={loadVillages}
      />
    </div>
  );
};

export default AggregatorTable;
