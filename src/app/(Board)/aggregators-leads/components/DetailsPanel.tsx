"use client";
import React, { useState } from "react";
import { X, Edit3, Save, Trash2 } from "lucide-react";
import { AggregatorData, ColumnSelection, QuantityUnit, LoadFrequency, Company } from "../types";
import { Spinner } from "./Spinner";
import { toDisplayDateDDMMYYYY, getTimeAgo } from "../utils/dateHelpers";
import { CROPS, CAPACITY_UNITS, LOAD_FREQUENCIES, BUYER_TYPES } from "../constants";

interface DetailsPanelProps {
  selectedRowId: string | number | null;
  draft: AggregatorData | null;
  isEditing: boolean;
  savingLead: boolean;
  deletingLead: boolean;
  loadingCompanies: boolean;
  companySearch: string;
  setCompanySearch: (value: string) => void;
  availableCompanies: Company[];
  startEdit: () => void;
  saveDraft: () => void;
  cancelEdit: () => void;
  deleteRow: (id: string | number) => void;
  closeDetails: () => void;
  updateDraftField: <K extends keyof AggregatorData>(
    key: K,
    value: AggregatorData[K]
  ) => void;
}

export function DetailsPanel({
  selectedRowId,
  draft,
  isEditing,
  savingLead,
  deletingLead,
  loadingCompanies,
  companySearch,
  setCompanySearch,
  availableCompanies,
  startEdit,
  saveDraft,
  cancelEdit,
  deleteRow,
  closeDetails,
  updateDraftField,
}: DetailsPanelProps) {
  return (
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
                      disabled={savingLead}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded flex items-center gap-2 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {savingLead ? (
                        <>
                          <Spinner size={14} /> Saving...
                        </>
                      ) : (
                        <>
                          <Save size={14} /> Save
                        </>
                      )}
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
                    disabled={deletingLead}
                    className="p-1 rounded text-red-600 hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed"
                    title="Delete"
                  >
                    {deletingLead ? (
                      <Spinner size={16} />
                    ) : (
                      <Trash2 size={16} />
                    )}
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
              Click any row on the left to view full details and edit or click
              "New Aggregator".
            </div>
          )}

          {draft && (
            <div className="space-y-4">
              {/* 1. Primary Info */}
              <div className="bg-green-50 p-3 rounded">
                <div className="text-base text-blue-600 mb-3 font-semibold">
                  Primary Info
                </div>
                <div className="grid grid-cols-2 gap-5 text-sm">
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
                        {CROPS.map((crop) => (
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
              <div>
                <input
                  type="text"
                  value={companySearch}
                  onChange={(e) => setCompanySearch(e.target.value)}
                  placeholder={
                    isEditing
                      ? "Search companies..."
                      : "Search selected companies..."
                  }
                  className="w-full mb-2 px-2 py-1 text-xs border rounded"
                />

                <div className="border rounded p-2 max-h-32 overflow-y-auto bg-white">
                  {loadingCompanies ? (
                    <div className="text-xs text-gray-400 flex items-center gap-2">
                      <Spinner size={12} /> Loading companies...
                    </div>
                  ) : isEditing ? (
                    (() => {
                      const filtered = availableCompanies.filter((company) =>
                        company.name
                          .toLowerCase()
                          .includes(companySearch.toLowerCase())
                      );

                      return filtered.length > 0 ? (
                        filtered.map((company) => (
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
                                  updateDraftField("interestsCompaniesIds", [
                                    ...currentIds,
                                    company.id,
                                  ]);
                                else
                                  updateDraftField(
                                    "interestsCompaniesIds",
                                    currentIds.filter((id) => id !== company.id)
                                  );
                              }}
                              className="w-3 h-3 text-blue-600"
                            />
                            <span className="text-xs">{company.name}</span>
                          </label>
                        ))
                      ) : (
                        <div className="text-xs text-gray-400 px-2">
                          No companies found
                        </div>
                      );
                    })()
                  ) : (
                    (() => {
                      const selectedIds = draft.interestsCompaniesIds || [];
                      const selectedCompanies = selectedIds
                        .map((id) =>
                          availableCompanies.find((c) => c.id === id)
                        )
                        .filter(
                          (c): c is Company =>
                            c !== undefined && c !== null
                        );

                      const filtered = selectedCompanies.filter((c) =>
                        c.name
                          .toLowerCase()
                          .includes(companySearch.toLowerCase())
                      );

                      return filtered.length > 0 ? (
                        <ul className="list-disc ml-5">
                          {filtered.map((company) => (
                            <li key={company.id} className="text-xs">
                              {company.name}
                            </li>
                          ))}
                        </ul>
                      ) : selectedCompanies.length > 0 ? (
                        <div className="text-xs text-gray-400 px-2">
                          No matches
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 px-2">-</div>
                      );
                    })()
                  )}
                </div>

                <div className="text-xs text-gray-500 mt-1">
                  {(draft.interestsCompaniesIds || []).length} selected
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
                              {CAPACITY_UNITS.map((u) => (
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
                        {CAPACITY_UNITS.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
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
                        {LOAD_FREQUENCIES.map((freq) => (
                          <option key={freq.value} value={freq.value}>
                            {freq.label}
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
                      <div className="font-medium">{draft.tAndC || "-"}</div>
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
                        value={draft.feVisited ?? ""}
                        onChange={(e) =>
                          updateDraftField(
                            "feVisited",
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
                        {BUYER_TYPES.map((bt) => (
                          <option key={bt.value} value={bt.value}>
                            {bt.label}
                          </option>
                        ))}
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
                        min={new Date().toISOString().split("T")[0]}
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
  );
}

