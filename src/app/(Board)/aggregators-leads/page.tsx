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

<style jsx>{`
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
`}</style>;

/* ----------------------
   Types / Interfaces
   ---------------------- */
type QuantityUnit =
  | "QUINTAL"
  | "TON"
  | "PIECE"
  | "KILOGRAM"
  | "GRAM"
  | "LITRE"
  | "BAG"
  | "BOX"
  | "";

type LoadFrequency =
  | "DAILY"
  | "WEEKLY"
  | "BIWEEKLY"
  | "MONTHLY"
  | "SEASONAL"
  | string;

type ToastType = "success" | "error" | "info";

interface ToastProps {
  show: boolean;
  message: string;
  type: ToastType;
  onClose: () => void;
}
/* ----------------------
   Confirmation Modal Component
   ---------------------- */
interface ConfirmModalProps {
  show: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

interface AggregatorData {
  id: string | number | null;
  userId?: string | null;
  onboarded?: string | null;
  name?: string | null;
  number?: string | null;
  // location fields kept in UI context but NOT sent to backend
  state?: string | null;
  district?: string | null;
  taluk?: string | null;
  village?: string | null;

  experience?: string | null;
  capacity?: string | null;
  capacityUnit?: QuantityUnit | null;
  tAndC?: string | null; // maps to isTcCompliant
  nextAction?: string | null;
  nextActionDueDate?: string | null;
  interestTo?: string | null; // maps to isInterestedToWork
  readyToSupply?: string | null; // UI date, maps to nextReadyDate
  tag?: string | null;
  confidence?: string | null; // maps to operationScore
  lastInteracted?: string | null; // UI date -> lastInteractedAt
  interestedCompanies?: string | null; // Display string for table
  interestsCompaniesIds?: string[];
  // feVisited is UI-only: DO NOT send to backend
  feVisited?: string | null;
  hasStock?: "Yes" | "No" | null;
  notes?: string | null;
  radius?: string | null; // display string; accurateRadius will be numeric in payload
  otherCrops?: string[];
  isVisited?: boolean;
  cropName?: string | null;
  buyerType?: string | null;
  updatedAt?: string | null;
  frequency?: LoadFrequency | null;
  currentStock?: number | null;
  currentStockUnit?: QuantityUnit | null;
  // new entity fields
  accurateRadius?: number | null;
  isInterestedToWork?: boolean | null;
  nextActionDueDateRaw?: string | null;

  // raw backend object can be stored if needed
  __raw?: any;
  __rawUserFromLookup?: any;
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

/* ----------------------
   Small Spinner component
   ---------------------- */
function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg
      className="animate-spin inline-block"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.2"
      ></circle>
      <path
        d="M22 12a10 10 0 00-10-10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      ></path>
    </svg>
  );
}

function Toast({ show, message, type, onClose }: ToastProps) {
  if (!show) return null;

  const bgColor =
    type === "success"
      ? "bg-green-500"
      : type === "error"
      ? "bg-red-500"
      : "bg-blue-500";

  return (
    <div className="fixed top-4 right-4 z-[100] animate-fadeIn">
      <div
        className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]`}
      >
        <div className="flex-1">
          <p className="font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

function ConfirmModal({
  show,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "info",
}: ConfirmModalProps) {
  if (!show) return null;

  const confirmButtonColor =
    type === "danger"
      ? "bg-red-600 hover:bg-red-700"
      : type === "warning"
      ? "bg-yellow-600 hover:bg-yellow-700"
      : "bg-blue-600 hover:bg-blue-700";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[90]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-fadeIn">
        <h3 className="text-xl font-semibold mb-3">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded transition-colors ${confirmButtonColor}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
/* ============================
   Date helpers
   ============================ */
function toDisplayDateDDMMYYYY(isoOrYmd: string | null | undefined) {
  if (!isoOrYmd) return null;
  const d = new Date(isoOrYmd);
  if (Number.isNaN(d.getTime())) return isoOrYmd;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/* ===================================================================
   NewAggregatorModal
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

  findUserByPhone: (phone: string) => Promise<any | null>;

  // location lists from parent
  states: string[];
  districts: string[];
  taluks: string[];
  villages: string[];
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
  findUserByPhone,
  states,
  districts,
  taluks,
  villages,
}: NewAggregatorModalProps) {
  if (!show || !draft) return null;

  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [editingLocation, setEditingLocation] = useState(false);
  const [locLoading, setLocLoading] = useState({
    districts: false,
    taluks: false,
    villages: false,
  });
  const [companySearch, setCompanySearch] = useState("");
  const [localCompaniesLoading, setLocalCompaniesLoading] = useState(false);

  // whenever a user is fetched from lookup, default to read-only location view
  useEffect(() => {
    if (draft?.__rawUserFromLookup) {
      setEditingLocation(false);
    }
  }, [draft?.__rawUserFromLookup]);

  // Helper to map user object returned from /users to draft fields
  const applyUserToDraft = (user: any) => {
    if (!user) return;

    // common mappings - tolerant to snake_case or camelCase
    updateDraftField("userId", (user.id ?? draft?.userId ?? null) as any);
    updateDraftField("name", (user.name ?? draft?.name ?? "") as any);
    updateDraftField(
      "number",
      (user.mobileNumber ?? user.phone ?? draft?.number ?? "") as any
    );

    // store raw user so you can submit additional fields if needed
    updateDraftField("__raw", { ...(draft?.__raw || {}), ...user } as any);
    updateDraftField("__rawUserFromLookup", user as any);

    // set location in draft for display only (we will NOT send these to backend)
    updateDraftField("village", (user.village ?? draft?.village ?? "") as any);
    updateDraftField("taluk", (user.taluk ?? draft?.taluk ?? "") as any);
    updateDraftField(
      "district",
      (user.district ?? draft?.district ?? "") as any
    );
    updateDraftField("state", (user.state ?? draft?.state ?? "") as any);

    // map user-provided capacity and frequency into draft if present
    const capacityVal =
      user.loadingCapacity ??
      user.loading_capacity ??
      user.capacity ??
      user.loadingCapacityValue ??
      user.loading_capacity_value ??
      null;
    if (capacityVal !== null && capacityVal !== undefined) {
      updateDraftField("capacity", String(capacityVal) as any);
    }

    const capacityUnitVal =
      user.loadingCapacityMeasure ??
      user.loading_capacity_measure ??
      user.capacityUnit ??
      user.loadingCapacityUnit ??
      user.loading_capacity_unit ??
      null;
    if (capacityUnitVal) {
      updateDraftField("capacityUnit", String(capacityUnitVal) as any);
    }

    if (user.experience !== undefined && user.experience !== null) {
      updateDraftField("experience", String(user.experience) as any);
    } else if (user.yearsExperience) {
      updateDraftField("experience", String(user.yearsExperience) as any);
    }

    const freq =
      user.loadingFrequency ?? user.frequency ?? user.loadFrequency ?? null;
    if (freq) updateDraftField("frequency", String(freq) as any);
  };

  const lookupUser = async () => {
    setLookupError(null);
    if (!draft?.number) {
      setLookupError("Enter phone number first");
      return;
    }
    try {
      setLookupLoading(true);
      const user = await findUserByPhone(String(draft.number));
      if (!user) {
        setLookupError("No user found for this number");
        return;
      }
      applyUserToDraft(user);

      // preload locations lists if available on user
      try {
        if (user.state) {
          setLocLoading((s) => ({ ...s, districts: true }));
          await loadDistricts(user.state);
          setLocLoading((s) => ({ ...s, districts: false }));
          if (user.district) {
            setLocLoading((s) => ({ ...s, taluks: true }));
            await loadTaluks(user.state, user.district);
            setLocLoading((s) => ({ ...s, taluks: false }));
            if (user.taluk) {
              setLocLoading((s) => ({ ...s, villages: true }));
              await loadVillages(user.state, user.district, user.taluk);
              setLocLoading((s) => ({ ...s, villages: false }));
            }
          }
        }
      } catch (err) {
        setLocLoading({ districts: false, taluks: false, villages: false });
      }
      // Default to read-only location UI
      setEditingLocation(false);
    } catch (err: any) {
      console.error("Lookup failed:", err);
      setLookupError(err?.message || "Lookup failed");
    } finally {
      setLookupLoading(false);
    }
  };

  // local wrapper to call loadDistricts and set loading flag
  const onSelectState = async (s: string) => {
    updateDraftField("state", s || "");
    updateDraftField("district", "");
    updateDraftField("taluk", "");
    updateDraftField("village", "");
    if (s) {
      try {
        setLocLoading((x) => ({ ...x, districts: true }));
        await loadDistricts(s);
      } finally {
        setLocLoading((x) => ({ ...x, districts: false }));
      }
    }
  };

  const onSelectDistrict = async (d: string) => {
    updateDraftField("district", d || "");
    updateDraftField("taluk", "");
    updateDraftField("village", "");
    if (d && draft?.state) {
      try {
        setLocLoading((x) => ({ ...x, taluks: true }));
        await loadTaluks(draft.state, d);
      } finally {
        setLocLoading((x) => ({ ...x, taluks: false }));
      }
    }
  };

  const onSelectTaluk = async (t: string) => {
    updateDraftField("taluk", t || "");
    updateDraftField("village", "");
    if (t && draft?.state && draft?.district) {
      try {
        setLocLoading((x) => ({ ...x, villages: true }));
        await loadVillages(draft.state, draft.district, t);
      } finally {
        setLocLoading((x) => ({ ...x, villages: false }));
      }
    }
  };

  const capacityUnits: QuantityUnit[] = [
    "QUINTAL",
    "TON",
    "PIECE",
    "KILOGRAM",
    "GRAM",
    "LITRE",
    "BAG",
    "BOX",
  ];

  // filtered companies list for the search bar in modal
  const filteredCompanies = useMemo(() => {
    if (!companySearch) return availableCompanies;
    const s = companySearch.toLowerCase();
    return availableCompanies.filter((c) => c.name.toLowerCase().includes(s));
  }, [availableCompanies, companySearch]);

  return (
    //create aggregator modal 
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Create Aggregator Lead
          </h2>
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
                <div className="flex gap-2 mt-1">
                  <input
                    value={draft.number || ""}
                    onChange={(e) => updateDraftField("number", e.target.value)}
                    className="flex-1 px-3 py-2 border rounded text-sm"
                    placeholder="Enter phone number"
                  />
                  <button
                    onClick={lookupUser}
                    disabled={lookupLoading}
                    className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2"
                    title="Lookup user by phone"
                  >
                    {lookupLoading ? (
                      <Spinner size={14} />
                    ) : (
                      <Search size={14} />
                    )}
                    <span>{lookupLoading ? "Looking..." : "Lookup"}</span>
                  </button>
                </div>
                {lookupError && (
                  <div className="text-xs text-red-600 mt-1">{lookupError}</div>
                )}
              </div>
            </div>

            {/* Location block: read-only when lookup provided, else selects */}
            <div className="grid grid-cols-1 gap-2 mt-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-700">
                  Location (display only)
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => setEditingLocation((s) => !s)}
                    className="text-xs px-2 py-1 border rounded text-gray-600 hover:bg-gray-100"
                  >
                    {editingLocation ? "View" : "Edit"}
                  </button>
                </div>
              </div>

              {!editingLocation && draft.__rawUserFromLookup ? (
                <div className="bg-white border rounded p-3 text-sm space-y-2">
                  <div>
                    <div className="text-xs text-gray-500">Village</div>
                    <div className="font-medium">{draft.village || "-"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Taluk</div>
                    <div className="font-medium">{draft.taluk || "-"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">District</div>
                    <div className="font-medium">{draft.district || "-"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">State</div>
                    <div className="font-medium">{draft.state || "-"}</div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500">State</label>
                    <select
                      value={draft.state || ""}
                      onChange={(e) => onSelectState(e.target.value)}
                      className="w-full px-3 py-2 border rounded text-sm mt-1"
                    >
                      <option value="">Select State</option>
                      {states.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                    {locLoading.districts && (
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                        <Spinner size={12} /> Loading districts...
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">District</label>
                    <select
                      value={draft.district || ""}
                      onChange={(e) => onSelectDistrict(e.target.value)}
                      className="w-full px-3 py-2 border rounded text-sm mt-1"
                    >
                      <option value="">Select District</option>
                      {districts.map((dt) => (
                        <option key={dt} value={dt}>
                          {dt}
                        </option>
                      ))}
                    </select>
                    {locLoading.taluks && (
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                        <Spinner size={12} /> Loading taluks...
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">Taluk</label>
                    <select
                      value={draft.taluk || ""}
                      onChange={(e) => onSelectTaluk(e.target.value)}
                      className="w-full px-3 py-2 border rounded text-sm mt-1"
                    >
                      <option value="">Select Taluk</option>
                      {taluks.map((ta) => (
                        <option key={ta} value={ta}>
                          {ta}
                        </option>
                      ))}
                    </select>
                    {locLoading.villages && (
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                        <Spinner size={12} /> Loading villages...
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">Village</label>
                    <select
                      value={draft.village || ""}
                      onChange={(e) =>
                        updateDraftField("village", e.target.value)
                      }
                      className="w-full px-3 py-2 border rounded text-sm mt-1"
                    >
                      <option value="">Select Village</option>
                      {villages.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
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
                      updateDraftField(
                        "capacityUnit",
                        e.target.value as QuantityUnit
                      )
                    }
                    className="w-full px-3 py-2 border rounded text-sm mt-1"
                  >
                    <option value="">Unit</option>
                    {capacityUnits.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
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
                  <label className="text-xs text-gray-500">
                    Load Frequency
                  </label>
                  <select
                    value={draft.frequency || ""}
                    onChange={(e) =>
                      updateDraftField(
                        "frequency",
                        e.target.value as LoadFrequency
                      )
                    }
                    className="w-full px-3 py-2 border rounded text-sm mt-1"
                  >
                    <option value="">Select Frequency</option>
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="BIWEEKLY">Biweekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="SEASONAL">Seasonal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">
                    T & C Compliant?
                  </label>
                  <select
                    value={draft.tAndC ?? ""}
                    onChange={(e) =>
                      updateDraftField(
                        "tAndC",
                        e.target.value === "" ? null : e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border rounded text-sm mt-1"
                  >
                    <option value="">Select</option>
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

              {/* Has stock boolean + conditional currentStock + unit */}
              <div className="grid grid-cols-3 gap-3 items-end">
                <div>
                  <label className="text-xs text-gray-500">Has Stock?</label>
                  <select
                    value={draft.hasStock ?? ""}
                    onChange={(e) =>
                      updateDraftField(
                        "hasStock",
                        e.target.value === ""
                          ? null
                          : (e.target.value as "Yes" | "No")
                      )
                    }
                    className="w-full px-3 py-2 border rounded text-sm mt-1"
                  >
                    <option value="">Select</option>
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-500">Current Stock</label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={draft.currentStock ?? ""}
                    onChange={(e) =>
                      updateDraftField(
                        "currentStock",
                        e.target.value === "" ? null : Number(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 border rounded text-sm mt-1"
                    placeholder="0"
                    disabled={draft.hasStock !== "Yes"}
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500">
                    Current Stock Unit
                  </label>
                  <select
                    value={draft.currentStockUnit || ""}
                    onChange={(e) =>
                      updateDraftField(
                        "currentStockUnit",
                        e.target.value === ""
                          ? null
                          : (e.target.value as QuantityUnit)
                      )
                    }
                    className="w-full px-3 py-2 border rounded text-sm mt-1"
                    disabled={draft.hasStock !== "Yes"}
                  >
                    <option value="">Select Unit</option>
                    {capacityUnits.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tag input */}
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
                      : draft.tag
                      ? "Other"
                      : "";
                    return (
                      <>
                        <select
                          value={option || ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (v === "") {
                              updateDraftField("tag", null);
                            } else if (v === "Other") {
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
                          <option value="">Select</option>
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
              </div>
            </div>
          </div>

          {/* Additional Details: interested companies with search, notes, other crops */}
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Additional Details
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {/* Interested Companies: search + list when editing; bullet points when not editing */}
              <div>
                <div className="flex justify-between items-baseline">
                  <label className="text-xs text-gray-500">
                    Interested Companies
                  </label>
                  <div className="text-xs text-gray-400">
                    {(draft.interestsCompaniesIds || []).length} selected
                  </div>
                </div>

                {!isEditing ? (
                  // show bullet points when not editing
                  <div className="mt-2 text-sm">
                    {draft.interestsCompaniesIds &&
                    draft.interestsCompaniesIds.length > 0 ? (
                      <ul className="list-disc ml-5">
                        {draft.interestsCompaniesIds.map((id) => {
                          const c = availableCompanies.find((x) => x.id === id);
                          return <li key={id}>{c ? c.name : id}</li>;
                        })}
                      </ul>
                    ) : (
                      <div className="text-xs text-gray-400 mt-1">None</div>
                    )}
                  </div>
                ) : (
                  <div className="mt-2">
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Search companies..."
                        value={companySearch}
                        onChange={(e) => setCompanySearch(e.target.value)}
                        className="flex-1 px-3 py-2 border rounded text-sm"
                      />
                      {localCompaniesLoading ? (
                        <div className="px-3 py-2 border rounded flex items-center gap-2 text-sm text-gray-600">
                          <Spinner size={14} /> Loading
                        </div>
                      ) : null}
                    </div>

                    <div className="border rounded p-2 max-h-40 overflow-y-auto bg-white">
                      {filteredCompanies.length === 0 ? (
                        <div className="text-xs text-gray-400">
                          No companies
                        </div>
                      ) : (
                        filteredCompanies.map((company) => (
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
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">
                    Ready to Supply
                  </label>
                  <input
                    type="date"
                    value={draft.readyToSupply || ""}
                    onChange={(e) =>
                      updateDraftField("readyToSupply", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded text-sm mt-1"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {draft.readyToSupply
                      ? toDisplayDateDDMMYYYY(draft.readyToSupply)
                      : "-"}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500">Next Action</label>
                  <input
                    type="text"
                    value={draft.nextAction || ""}
                    onChange={(e) =>
                      updateDraftField("nextAction", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded text-sm mt-1"
                    placeholder="Enter next action"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500">
                    Next Action Due
                  </label>
                  <input
                    type="date"
                    value={draft.nextActionDueDate || ""}
                    onChange={(e) =>
                      updateDraftField("nextActionDueDate", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded text-sm mt-1"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {draft.nextActionDueDate
                      ? toDisplayDateDDMMYYYY(draft.nextActionDueDate)
                      : "-"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">
                    Is Interested To Work?
                  </label>
                  <select
                    value={
                      draft.interestTo ??
                      (draft.isInterestedToWork === true
                        ? "Yes"
                        : draft.isInterestedToWork === false
                        ? "No"
                        : "")
                    }
                    onChange={(e) =>
                      updateDraftField(
                        "interestTo",
                        e.target.value === ""
                          ? null
                          : (e.target.value as AggregatorData["interestTo"])
                      )
                    }
                    className="w-full px-3 py-2 border rounded text-sm mt-1"
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Radius (km)</label>
                  <input
                    value={draft.radius ?? ""}
                    onChange={(e) => updateDraftField("radius", e.target.value)}
                    className="w-full px-3 py-2 border rounded text-sm mt-1"
                    placeholder="Radius in km"
                  />
                </div>
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
            <Save size={16} /> Create / Save
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
    let payload: any = null;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = text;
    }

    if (!res.ok) {
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

  // loading flags for interactivity
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

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

  // Filters (UI)
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

  const crops = [
    "Tender Coconut",
    "Turmeric",
    "Banana",
    "Dry Coconut",
    "Maize",
    "Sunflower",
    "Jowar",
  ];

  // Toast/Alert states
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: ToastType;
  }>({
    show: false,
    message: "",
    type: "success",
  });

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: "danger" | "warning" | "info";
  }>({
    show: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "info",
  });

  // Helper function to show toast
  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  /* ======= UTILS: mapping backend AggregatorLeads -> UI row ======= */
  function mapLeadToRow(lead: any): AggregatorData {
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
        lead.feVisited === true
          ? "Yes"
          : lead.feVisited === false
          ? "No"
          : null,

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
      // isInterestedToWork:
      //   lead.isInterestedToWork === true
      //     ? true
      //     : lead.isInterestedToWork === false
      //     ? false
      //     : null,
      __raw: lead,
    };
  }

  // Reverse mapper: take UI draft and produce payload for backend create/update
  function mapRowToBackendPayload(row: AggregatorData) {
    const payload: any = {};

    // only include fields that exist on AggregatorLeads entity
    if (row.userId) payload.userId = row.userId;

    // crop & label & notes
    payload.cropName = row.cropName ?? null;
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
    if (row.hasStock !== undefined && row.hasStock !== null) {
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
      payload.nextReadyDate = !Number.isNaN(d.getTime())
        ? d.toISOString()
        : null;
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

    // isInterestedToWork - FIXED (removed else-if block)
    if (
      row.interestTo !== undefined &&
      row.interestTo !== null &&
      row.interestTo !== ""
    ) {
      payload.isInterestedToWork =
        String(row.interestTo).toLowerCase() === "yes";
    } else {
      payload.isInterestedToWork = null;
    }

    // isTcCompliant from tAndC - FIXED (added empty string check)
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

    return payload;
  }

  // ======= API FUNCTIONS =======
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
      setLoadingLeads(true);
      const params = buildListParams();
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

      const rows = Array.isArray(res.data)
        ? res.data.map((lead: any) => mapLeadToRow(lead))
        : (res as any).map((lead: any) => mapLeadToRow(lead));
      setData(rows);
      setTotal(res.total ?? rows.length);
    } catch (err: any) {
      console.error("Failed to fetch aggregator leads:", err);
    } finally {
      setLoadingLeads(false);
    }
  }

  async function findUserByPhone(phone: string) {
    try {
      const res = await callApi(`/users?search=${encodeURIComponent(phone)}`, {
        method: "GET",
      });
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

async function fetchAllCompanies() {
  try {
    setLoadingCompanies(true);
    const res = await callApi(`/po-companies`, { method: "GET" });
    const companies = Array.isArray(res) ? res : res.data || [];
    
    // Transform companies to include concatenated name + address
    return companies.map((company: any) => ({
      ...company,
      name: company.taluk && company.district 
        ? `${company.name} - ${company.taluk}, ${company.district}`
        : company.name
    }));
  } catch (err) {
    console.error("Failed to fetch companies:", err);
    return [];
  } finally {
    setLoadingCompanies(false);
  }
}

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

  useEffect(() => {
    const load = async () => {
      const companies = await fetchAllCompanies();
      setAvailableCompanies(companies);
      await loadStates();
    };
    load();
  }, []);

  // When draft changes, preload location lists as before
  useEffect(() => {
    if (!draft) return;
    (async () => {
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
    setSelectedColumns((prev) => ({ ...prev, [key]: !prev[key] }));
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
    if (!row) {
      setDraft(null);
      return;
    }

    // Make sure draft contains all entity fields (so inputs are editable)
    const fullDraft: AggregatorData = {
      ...row,
      userId: row.userId ?? null,
      cropName: row.cropName ?? null,
      notes: row.notes ?? null,
      isVisited: row.isVisited ?? false,
      tAndC: row.tAndC ?? null,
      nextAction: row.nextAction ?? null,
      nextActionDueDate: row.nextActionDueDate ?? null,
      readyToSupply: row.readyToSupply ?? null,
      tag: row.tag ?? null,
      experience: row.experience ?? null,
      capacity: row.capacity ?? null,
      capacityUnit: row.capacityUnit ?? null,
      frequency: row.frequency ?? null,
      currentStock: row.currentStock ?? null,
      currentStockUnit: row.currentStockUnit ?? null,
      accurateRadius: row.accurateRadius ?? null,
      otherCrops: row.otherCrops ?? [],
      isInterestedToWork: row.isInterestedToWork ?? null,
      interestsCompaniesIds: row.interestsCompaniesIds ?? [],
      confidence: row.confidence ?? null,
      lastInteracted: row.lastInteracted ?? null,
      // keep UI-only location for display but won't be sent
      state: row.state ?? null,
      district: row.district ?? null,
      taluk: row.taluk ?? null,
      village: row.village ?? null,
      __raw: row.__raw ?? null,
      __rawUserFromLookup: row.__rawUserFromLookup ?? null,
    };

    setDraft(fullDraft);
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
      const payload = mapRowToBackendPayload(draft);

      if (!draft.id) {
        // create
        if (!draft.number) {
          showToast("Mobile number is required", "error");
          return;
        }
        const user = await findUserByPhone(draft.number);
        if (!user?.id) {
          showToast(
            "User not found! Please create user on Markhet dashboard first.",
            "error"
          );
          return;
        }

        // update buyer type if needed
        if (
          draft.buyerType !== undefined &&
          draft.buyerType !== user.buyerType
        ) {
          await updateBuyerType(user.id, { buyerType: draft.buyerType });
        }

        payload.userId = user.id;
        await createAggregatorLead(payload);

        await fetchLeads();
        setIsEditing(false);
        setShowNewAggregatorModal(false);
        setDraft(null);
        showToast("Aggregator created successfully!", "success");
        return;
      }

      // update existing
      await patchAggregatorLead(String(draft.id), payload);

      if (draft.userId && draft.buyerType !== undefined) {
        const originalRow = data.find((r) => r.id === draft.id);
        if (originalRow && draft.buyerType !== originalRow.buyerType) {
          await updateBuyerType(draft.userId, { buyerType: draft.buyerType });
        }
      }

      await fetchLeads();
      setIsEditing(false);
      showToast("Aggregator updated successfully!", "success");
    } catch (err) {
      console.error("Save failed:", err);
      showToast(
        "Failed to save: " + ((err as any)?.message ?? "Unknown error"),
        "error"
      );
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
    setConfirmModal({
      show: true,
      title: "Delete Aggregator",
      message:
        "Are you sure you want to delete this aggregator? This action cannot be undone.",
      type: "danger",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, show: false }));
        try {
          await deleteAggregatorLead(String(id));
          setData((prev) => prev.filter((r) => r.id !== id));
          if (selectedRowId === id) closeDetails();
          showToast("Aggregator deleted successfully!", "success");
        } catch (err: any) {
          console.error("Delete failed:", err);
          showToast(
            "Failed to delete: " + (err.message || "Unknown error"),
            "error"
          );
        }
      },
    });
  };

  // Helpers to update draft fields
  const updateDraftField = <K extends keyof AggregatorData>(
    key: K,
    value: AggregatorData[K]
  ) => {
    setDraft((d) => (d ? { ...d, [key]: value } : d));
  };

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
      userId: null,
      name: "",
      number: "",
      state: "",
      district: "",
      taluk: "",
      village: "",
      buyerType: null,
      cropName: null,
      experience: null,
      capacity: null,
      capacityUnit: null,
      tAndC: null,
      nextAction: null,
      nextActionDueDate: null,
      interestTo: null,
      readyToSupply: null,
      tag: null,
      confidence: null,
      lastInteracted: null,
      interestedCompanies: "",
      interestsCompaniesIds: [],
      feVisited: null,
      hasStock: null,
      currentStock: null,
      currentStockUnit: null,
      notes: null,
      radius: null,
      accurateRadius: null,
      otherCrops: [],
      isVisited: false,
      isInterestedToWork: null,
      frequency: null,
      __raw: null,
      __rawUserFromLookup: null,
      updatedAt: null,
    };
    setDraft(empty);
    setSelectedRowId(null);
    setIsEditing(true);
    setShowNewAggregatorModal(true);
    setDistricts([]);
    setTaluks([]);
    setVillages([]);
  };

  // Pagination controls
  const onPrevPage = () => {
    setPage((p) => Math.max(1, p - 1));
  };
  const onNextPage = () => {
    const lastPage = Math.max(1, Math.ceil((total || 0) / limit));
    setPage((p) => Math.min(lastPage, p + 1));
  };

  // ========== RENDER ==========
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1600px] mx-auto flex gap-6">
        {/* Left: Table + Controls */}
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
              <input
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                placeholder="State"
                className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                placeholder="District"
                className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                value={selectedTaluk}
                onChange={(e) => setSelectedTaluk(e.target.value)}
                placeholder="Taluk"
                className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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

          {/* Column Selector */}
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

          {/* Results count + loading */}
          <div className="mb-3 text-sm text-gray-600 flex items-center gap-3">
            {loadingLeads ? (
              <>
                <Spinner size={14} /> Loading aggregators...
              </>
            ) : (
              `Showing ${filteredData.length} of ${total} aggregators`
            )}
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
                              <div>{row.nextAction || "-"}</div>
                              <div className="text-xs text-gray-500">
                                {row.nextActionDueDate
                                  ? toDisplayDateDDMMYYYY(row.nextActionDueDate)
                                  : ""}
                              </div>
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
                              {row.readyToSupply
                                ? toDisplayDateDDMMYYYY(row.readyToSupply)
                                : "-"}
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

          {/* Pagination controls */}
          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {page} • {total} results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onPrevPage}
                disabled={page <= 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Prev
              </button>
              <button
                onClick={onNextPage}
                disabled={page >= Math.ceil((total || 0) / limit)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="px-2 py-1 border rounded"
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={40}>40 / page</option>
                <option value={100}>100 / page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right: Details Panel */}
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
                  {/* 1. Primary Info */}
                  <div className="bg-green-50 p-3 rounded">
                    <div className="text-base text-blue-600 mb-3 font-semibold">
                      Primary Info
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="col-span-2">
                        <div className="text-xs font-semibold text-teal-600">
                          Name
                        </div>
                        <div className="font-medium">{draft.name}</div>
                      </div>

                      <div>
                        <div className="text-xs font-semibold text-teal-600">
                          Phone
                        </div>
                        <div className="font-medium">{draft.number}</div>
                      </div>

                      <div>
                        <div className="text-xs font-semibold text-teal-600">
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

                      <div>
                        <div className="text-xs font-semibold text-teal-600">
                          Location
                        </div>
                        <div className="font-medium text-xs">
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

                      <div>
                        <div className="text-xs font-semibold text-teal-600">
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

                      <div className="col-span-2">
                        <div className="text-xs font-semibold text-teal-600">
                          Other Crops
                        </div>
                        {!isEditing ? (
                          <div className="flex gap-1 flex-wrap mt-1">
                            {(draft.otherCrops || []).length === 0 ? (
                              <div className="text-xs text-gray-500">None</div>
                            ) : (
                              (draft.otherCrops || []).map((c, i) => (
                                <span
                                  key={i}
                                  className="text-xs bg-white px-2 py-0.5 rounded border border-gray-200"
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
                            placeholder="Rice, Wheat, Corn"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 2. Interested Companies */}
                  <div className="bg-green-50 p-3 rounded">
                    <div className="text-base text-blue-600 mb-3 font-semibold">
                      Companies
                    </div>
                    <div className="text-sm">
                      <div className="text-xs font-semibold text-teal-600 mb-1">
                        Interested Companies
                      </div>
                      {!isEditing ? (
                        <div className="font-medium">
                          {draft.interestsCompaniesIds &&
                          draft.interestsCompaniesIds.length > 0 ? (
                            <ul className="list-disc ml-5">
                              {draft.interestsCompaniesIds.map((id) => {
                                const c = availableCompanies.find(
                                  (x) => x.id === id
                                );
                                return (
                                  <li key={id} className="text-xs">
                                    {c ? c.name : id}
                                  </li>
                                );
                              })}
                            </ul>
                          ) : (
                            "-"
                          )}
                        </div>
                      ) : (
                        <div>
                          <div className="border rounded p-2 max-h-32 overflow-y-auto bg-white">
                            {loadingCompanies ? (
                              <div className="text-xs text-gray-400 flex items-center gap-2">
                                <Spinner size={12} /> Loading companies...
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
                                      if (e.target.checked)
                                        updateDraftField(
                                          "interestsCompaniesIds",
                                          [...currentIds, company.id]
                                        );
                                      else
                                        updateDraftField(
                                          "interestsCompaniesIds",
                                          currentIds.filter(
                                            (id) => id !== company.id
                                          )
                                        );
                                    }}
                                    className="w-3 h-3 text-blue-600"
                                  />
                                  <span className="text-xs">
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
                  </div>

                  {/* 3. Supply Information */}
                  <div className="bg-green-50 p-3 rounded">
                    <div className="text-base text-blue-600 mb-3 font-semibold">
                      Ready to Supply
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-xs font-semibold text-teal-600">
                          Ready to Supply
                        </div>
                        {!isEditing ? (
                          <div className="font-medium">
                            {draft.readyToSupply
                              ? toDisplayDateDDMMYYYY(draft.readyToSupply)
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
                            className="w-full px-2 py-1 border rounded text-xs"
                          />
                        )}
                      </div>

                      <div>
                        <div className="text-xs font-semibold text-teal-600">
                          Radius (km)
                        </div>
                        {!isEditing ? (
                          <div className="font-medium">
                            {draft.radius ? `${draft.radius} km` : "-"}
                          </div>
                        ) : (
                          <input
                            type="number"
                            value={draft.radius || ""}
                            onChange={(e) =>
                              updateDraftField("radius", e.target.value)
                            }
                            className="w-full px-2 py-1 border rounded text-xs"
                            placeholder="50"
                          />
                        )}
                      </div>

                      <div className="col-span-2">
                        <div className="text-xs font-semibold text-teal-600">
                          Has Stock
                        </div>
                        {!isEditing ? (
                          <div className="font-medium">
                            {draft.hasStock || "-"}
                            {draft.hasStock === "Yes" &&
                            draft.currentStock != null
                              ? ` — ${draft.currentStock} ${
                                  draft.currentStockUnit || ""
                                }`
                              : ""}
                          </div>
                        ) : (
                          <div className="flex gap-2 mt-1">
                            <select
                              value={draft.hasStock || ""}
                              onChange={(e) =>
                                updateDraftField(
                                  "hasStock",
                                  e.target.value === ""
                                    ? null
                                    : (e.target.value as "Yes" | "No")
                                )
                              }
                              className="w-20 px-2 py-1 border rounded text-xs"
                            >
                              <option value="">Select</option>
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                            {draft.hasStock === "Yes" && (
                              <>
                                <input
                                  type="number"
                                  value={draft.currentStock || ""}
                                  onChange={(e) =>
                                    updateDraftField(
                                      "currentStock",
                                      e.target.value === ""
                                        ? null
                                        : Number(e.target.value)
                                    )
                                  }
                                  className="w-24 px-2 py-1 border rounded text-xs"
                                  placeholder="100"
                                />
                                <select
                                  value={draft.currentStockUnit || ""}
                                  onChange={(e) =>
                                    updateDraftField(
                                      "currentStockUnit",
                                      e.target.value === ""
                                        ? null
                                        : (e.target.value as QuantityUnit)
                                    )
                                  }
                                  className="w-24 px-2 py-1 border rounded text-xs"
                                >
                                  <option value="">Select Unit</option>
                                  {[
                                    "QUINTAL",
                                    "TON",
                                    "PIECE",
                                    "KILOGRAM",
                                    "GRAM",
                                    "LITRE",
                                    "BAG",
                                    "BOX",
                                  ].map((u) => (
                                    <option key={u} value={u}>
                                      {u}
                                    </option>
                                  ))}
                                </select>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="col-span-2">
                        <div className="text-xs font-semibold text-teal-600">
                          Load Frequency
                        </div>
                        {!isEditing ? (
                          <div className="font-medium">
                            {draft.frequency || "-"}
                          </div>
                        ) : (
                          <select
                            value={draft.frequency || ""}
                            onChange={(e) =>
                              updateDraftField(
                                "frequency",
                                e.target.value as LoadFrequency
                              )
                            }
                            className="w-full px-2 py-1 border rounded text-xs"
                          >
                            <option value="">Select Frequency</option>
                            <option value="DAILY">Daily</option>
                            <option value="WEEKLY">Weekly</option>
                            <option value="BIWEEKLY">Biweekly</option>
                            <option value="MONTHLY">Monthly</option>
                            <option value="SEASONAL">Seasonal</option>
                          </select>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 4. Business Details */}
                  <div className="bg-green-50 p-3 rounded">
                    <div className="text-base text-blue-600 mb-3 font-semibold">
                      Qualifying / Business Details
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-xs font-semibold text-teal-600">
                          Capacity
                        </div>
                        {!isEditing ? (
                          <div className="font-medium">
                            {draft.capacity || "-"}
                          </div>
                        ) : (
                          <input
                            value={draft.capacity || ""}
                            onChange={(e) =>
                              updateDraftField("capacity", e.target.value)
                            }
                            className="w-full px-2 py-1 border rounded text-xs"
                            placeholder="500"
                          />
                        )}
                      </div>

                      <div>
                        <div className="text-xs font-semibold text-teal-600">
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
                              updateDraftField(
                                "capacityUnit",
                                e.target.value as QuantityUnit
                              )
                            }
                            className="w-full px-2 py-1 border rounded text-xs"
                          >
                            <option value="">Unit</option>
                            {[
                              "QUINTAL",
                              "TON",
                              "PIECE",
                              "KILOGRAM",
                              "GRAM",
                              "LITRE",
                              "BAG",
                              "BOX",
                            ].map((u) => (
                              <option key={u} value={u}>
                                {u}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      <div>
                        <div className="text-xs font-semibold text-teal-600">
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
                            className="w-full px-2 py-1 border rounded text-xs"
                            placeholder="5 years"
                          />
                        )}
                      </div>

                      <div>
                        <div className="text-xs font-semibold text-teal-600">
                          Confidence Score
                        </div>
                        {!isEditing ? (
                          <div className="font-medium">
                            {draft.confidence ? `${draft.confidence}%` : "-"}
                          </div>
                        ) : (
                          <input
                            type="number"
                            value={draft.confidence || ""}
                            onChange={(e) =>
                              updateDraftField("confidence", e.target.value)
                            }
                            className="w-full px-2 py-1 border rounded text-xs"
                            placeholder="85"
                            min="0"
                            max="100"
                          />
                        )}
                      </div>

                      <div>
                        <div className="text-xs font-semibold text-teal-600">
                          T & C Compliant?
                        </div>
                        {!isEditing ? (
                          <div className="font-medium">
                            {draft.tAndC || "-"}
                          </div>
                        ) : (
                          <select
                            value={draft.tAndC || ""}
                            onChange={(e) =>
                              updateDraftField("tAndC", e.target.value)
                            }
                            className="w-full px-2 py-1 border rounded text-xs"
                          >
                            <option value="">Select...</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        )}
                      </div>

                      <div>
                        <div className="text-xs font-semibold text-teal-600">
                          Interested to Work?
                        </div>
                        {!isEditing ? (
                          <div className="font-medium">
                            {draft.interestTo || "-"}
                          </div>
                        ) : (
                          <select
                            value={draft.interestTo ?? ""}
                            onChange={(e) =>
                              updateDraftField(
                                "interestTo",
                                e.target.value === "" ? null : e.target.value
                              )
                            }
                            className="w-full px-2 py-1 border rounded text-xs"
                          >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        )}
                      </div>

                      <div>
                        <div className="text-xs font-semibold text-teal-600">
                          FE Visited
                        </div>
                        {!isEditing ? (
                          <div className="font-medium">
                            {draft.feVisited || "-"}
                          </div>
                        ) : (
                          <select
                            value={draft.feVisited || ""}
                            onChange={(e) =>
                              updateDraftField("feVisited", e.target.value)
                            }
                            className="w-full px-2 py-1 border rounded text-xs"
                          >
                            <option value="">Select...</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        )}
                      </div>

                      <div>
                        <div className="text-xs font-semibold text-teal-600">
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
                            className="w-full px-2 py-1 border rounded text-xs"
                          >
                            <option value="">Select</option>
                            <option value="VILLAGE_BUYER">VILLAGE_BUYER</option>
                            <option value="MANDI_BUYER">MANDI_BUYER</option>
                            <option value="MANDI_AND_VILLAGE_BUYER">
                              MANDI_AND_VILLAGE_BUYER
                            </option>
                          </select>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 5. Interaction Details */}
                  <div className="bg-green-50 p-3 rounded">
                    <div className="text-base text-blue-600 mb-3 font-semibold">
                      Interaction Details
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-xs font-semibold text-teal-600">
                          Last Updated
                        </div>
                        <div className="font-medium text-gray-600">
                          {getTimeAgo(draft.updatedAt)}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs font-semibold text-teal-600">
                          Last Interacted
                        </div>
                        {!isEditing ? (
                          <div className="font-medium">
                            {draft.lastInteracted
                              ? toDisplayDateDDMMYYYY(draft.lastInteracted)
                              : "-"}
                          </div>
                        ) : (
                          <input
                            type="date"
                            value={draft.lastInteracted || ""}
                            onChange={(e) =>
                              updateDraftField("lastInteracted", e.target.value)
                            }
                            className="w-full px-2 py-1 border rounded text-xs"
                          />
                        )}
                      </div>

                      <div>
                        <div className="text-xs font-semibold text-teal-600">
                          Next Action
                        </div>
                        {!isEditing ? (
                          <div className="font-medium">
                            {draft.nextAction || " "}
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={draft.nextAction || ""}
                            onChange={(e) =>
                              updateDraftField("nextAction", e.target.value)
                            }
                            className="w-full px-2 py-1 border rounded text-xs"
                            placeholder="Enter next action"
                          />
                        )}
                      </div>

                      <div>
                        <div className="text-xs font-semibold text-teal-600">
                          Next Action Due
                        </div>
                        {!isEditing ? (
                          <div className="font-medium">
                            {draft.nextActionDueDate
                              ? toDisplayDateDDMMYYYY(draft.nextActionDueDate)
                              : "-"}
                          </div>
                        ) : (
                          <input
                            type="date"
                            value={draft.nextActionDueDate || ""}
                            onChange={(e) =>
                              updateDraftField(
                                "nextActionDueDate",
                                e.target.value
                              )
                            }
                            className="w-full px-2 py-1 border rounded text-xs"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 6. Notes */}
                  <div className="bg-green-50 p-3 rounded">
                    <div className="text-base font-semibold text-blue-600 mb-3">
                      Notes
                    </div>
                    {!isEditing ? (
                      <div className="text-xs text-gray-700">
                        {draft.notes || "-"}
                      </div>
                    ) : (
                      <textarea
                        value={draft.notes || ""}
                        onChange={(e) =>
                          updateDraftField("notes", e.target.value)
                        }
                        className="w-full px-2 py-1 border rounded text-xs"
                        rows={3}
                        placeholder="Add any notes..."
                      />
                    )}
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
        findUserByPhone={findUserByPhone}
        states={states}
        districts={districts}
        taluks={taluks}
        villages={villages}
      />

      {/* Toast Alert */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: "", type: "success" })}
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        show={confirmModal.show}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, show: false }))}
        confirmText="Delete"
        cancelText="Cancel"
        type={confirmModal.type}
      />
    </div>
  );
};

export default AggregatorTable;
