"use client";
import React, { useEffect, useState, useMemo } from "react";
import { X, Search, Save } from "lucide-react";
import { AggregatorData, QuantityUnit, LoadFrequency, Company } from "../types";
import { Spinner } from "./Spinner";
import { toDisplayDateDDMMYYYY } from "../utils/dateHelpers";
import {
  CAPACITY_UNITS,
  LOAD_FREQUENCIES,
  BUYER_TYPES,
  CROPS,
} from "../constants";

interface NewAggregatorModalProps {
  show: boolean;
  draft: AggregatorData | null;
  availableCompanies: Company[];
  isEditing: boolean;
  savingLead: boolean;
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
  states: string[];
  districts: string[];
  taluks: string[];
  villages: string[];
}

export function NewAggregatorModal({
  show,
  draft,
  availableCompanies,
  isEditing,
  savingLead,
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

  useEffect(() => {
    if (draft?.__rawUserFromLookup) {
      setEditingLocation(false);
    }
  }, [draft?.__rawUserFromLookup]);

  const applyUserToDraft = (user: any) => {
    if (!user) return;

    updateDraftField("userId", (user.id ?? draft?.userId ?? null) as any);
    updateDraftField("name", (user.name ?? draft?.name ?? "") as any);
    updateDraftField(
      "number",
      (user.mobileNumber ?? user.phone ?? draft?.number ?? "") as any
    );

    updateDraftField("__raw", { ...(draft?.__raw || {}), ...user } as any);
    updateDraftField("__rawUserFromLookup", user as any);

    updateDraftField("village", (user.village ?? draft?.village ?? "") as any);
    updateDraftField("taluk", (user.taluk ?? draft?.taluk ?? "") as any);
    updateDraftField(
      "district",
      (user.district ?? draft?.district ?? "") as any
    );
    updateDraftField("state", (user.state ?? draft?.state ?? "") as any);

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
      setEditingLocation(false);
    } catch (err: any) {
      console.error("Lookup failed:", err);
      setLookupError(err?.message || "Lookup failed");
    } finally {
      setLookupLoading(false);
    }
  };

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

  const filteredCompanies = useMemo(() => {
    if (!companySearch) return availableCompanies;
    const s = companySearch.toLowerCase();
    return availableCompanies.filter((c) => c.name.toLowerCase().includes(s));
  }, [availableCompanies, companySearch]);

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Create Aggregator Lead</h2>
          <button
            onClick={cancelNewAggregator}
            className="p-1 rounded hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

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

            {/* Location */}
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
                  {CROPS.map((crop) => (
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
                        e.target.value === ""
                          ? null
                          : (e.target.value as QuantityUnit)
                      )
                    }
                    className="w-full px-3 py-2 border rounded text-sm mt-1"
                  >
                    <option value="">Unit</option>
                    {CAPACITY_UNITS.map((u) => (
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
                        e.target.value === ""
                          ? null
                          : (e.target.value as LoadFrequency)
                      )
                    }
                    className="w-full px-3 py-2 border rounded text-sm mt-1"
                  >
                    <option value="">Select Frequency</option>
                    {LOAD_FREQUENCIES.map((freq) => (
                      <option key={freq.value} value={freq.value}>
                        {freq.label}
                      </option>
                    ))}
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
                      updateDraftField(
                        "buyerType",
                        e.target.value === "" ? null : e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border rounded text-sm mt-1"
                  >
                    <option value="">Select Buyer Type</option>
                    {BUYER_TYPES.map((bt) => (
                      <option key={bt.value} value={bt.value}>
                        {bt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

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
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
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
                    {CAPACITY_UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

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
                              updateDraftField("tag", e.target.value || null)
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
                <div className="flex justify-between items-baseline">
                  <label className="text-xs text-gray-500">
                    Interested Companies
                  </label>
                  <div className="text-xs text-gray-400">
                    {(draft.interestsCompaniesIds || []).length} selected
                  </div>
                </div>

                {!isEditing ? (
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
                    <input
                      type="text"
                      placeholder="Search companies..."
                      value={companySearch}
                      onChange={(e) => setCompanySearch(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded text-sm mb-2 w-full"
                    />

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
                  <label className="text-xs text-gray-500">
                    Last Interacted At *
                  </label>
                  <input
                    type="date"
                    value={draft.lastInteracted || ""}
                    onChange={(e) =>
                      updateDraftField("lastInteracted", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded text-sm mt-1"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {draft.lastInteracted
                      ? toDisplayDateDDMMYYYY(draft.lastInteracted)
                      : "-"}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500">Next Action *</label>
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
                    Next Action Due *
                  </label>
                  <input
                    type="date"
                    value={draft.nextActionDueDate || ""}
                    onChange={(e) =>
                      updateDraftField("nextActionDueDate", e.target.value)
                    }
                    min={new Date().toISOString().split("T")[0]}
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
                    value={draft.interestTo ?? ""}
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

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex justify-end gap-3">
          <button
            onClick={cancelNewAggregator}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={saveDraft}
            disabled={savingLead}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {savingLead ? (
              <>
                <Spinner size={16} /> Saving...
              </>
            ) : (
              <>
                <Save size={16} /> Create / Save
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

