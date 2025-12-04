"use client";

import React, { useEffect, useState } from "react";
import { Edit3, Save, Trash2 } from "lucide-react";

import type {
  AggregatorData,
  Company as CompanyType,
  QuantityUnit,
  LoadFrequency,
} from "../types";
import { Spinner } from "./Spinner";
import { toDisplayDateDDMMYYYY, getTimeAgo } from "../utils/dateHelpers";
import {
  CROPS,
  CAPACITY_UNITS,
  LOAD_FREQUENCIES,
  BUYER_TYPES,
} from "../constants";
import { fetchAllCompanies } from "../services/api"; // <-- adjust path if needed

interface ExpandedRowContentProps {
  selectedRowId: string | number | null;
  draft: AggregatorData | null;
  isEditing: boolean;
  savingLead: boolean;
  deletingLead: boolean;
  loadingCompanies: boolean;
  availableCompanies: (CompanyType & { displayName?: string })[];
  companySearch: string;
  setCompanySearch: (value: string) => void;
  startEdit: () => void;
  saveDraft: () => void;
  cancelEdit: () => void;
  deleteRow: (id: string | number) => void;
  updateDraftField: <K extends keyof AggregatorData>(
    key: K,
    value: AggregatorData[K]
  ) => void;
}

/**
 * ExpandedRowContent
 * ------------------
 * Inline, collapsible details view that appears directly under the
 * selected table row (instead of in a separate right-side panel).
 */
export function ExpandedRowContent({
  selectedRowId,
  draft,
  isEditing,
  savingLead,
  deletingLead,
  companySearch,
  setCompanySearch,
  startEdit,
  saveDraft,
  cancelEdit,
  deleteRow,
  updateDraftField,
}: ExpandedRowContentProps) {
  const [availableCompanies, setAvailableCompanies] = useState<
    (CompanyType & { displayName?: string })[]
  >([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [companiesError, setCompaniesError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadCompanies() {
      try {
        setLoadingCompanies(true);
        setCompaniesError(null);
        const companies = await fetchAllCompanies();
        if (!mounted) return;
        // fetchAllCompanies already returns displayName, but normalize just in case
        const normalized = companies.map((c: any) => ({
          id: c.id,
          name: c.name || c.displayName || "",
          displayName: c.displayName || c.name || "",
        }));
        setAvailableCompanies(normalized);
      } catch (err) {
        console.error("Failed to fetch companies:", err);
        if (!mounted) return;
        setCompaniesError("Failed to load companies");
      } finally {
        if (!mounted) return;
        setLoadingCompanies(false);
      }
    }

    loadCompanies();

    return () => {
      mounted = false;
    };
  }, []);

  if (!draft || !selectedRowId) {
    return null;
  }

  return (
    <div className="bg-blue-50 rounded-lg border border-blue-100 p-4 mt-2">
      {/* Header actions */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="text-sm font-semibold text-gray-700">
            Aggregator details
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            Full profile, business details and interaction history
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              onClick={startEdit}
              className="px-3 py-1 bg-blue-600 text-white text-xs rounded flex items-center gap-2 hover:bg-blue-700"
            >
              <Edit3 size={14} /> Edit
            </button>
          ) : (
            <>
              <button
                onClick={saveDraft}
                disabled={savingLead}
                className="px-3 py-1 bg-green-600 text-white text-xs rounded flex items-center gap-2 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
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
                className="px-3 py-1 bg-gray-200 text-xs rounded flex items-center gap-2 hover:bg-gray-300"
              >
                Cancel
              </button>
            </>
          )}
          <button
            onClick={() => deleteRow(selectedRowId)}
            disabled={deletingLead}
            className="p-1 rounded text-red-600 hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed"
            title="Delete"
          >
            {deletingLead ? <Spinner size={16} /> : <Trash2 size={16} />}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-3 gap-4 text-sm">
        {/* Ready to Supply */}
        <div className="bg-white rounded-lg p-3 shadow-xs border border-gray-100">
          <div className="text-xs font-semibold text-gray-500 mb-2">
            Ready to Supply
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="text-[11px] font-semibold text-gray-500">
                Ready by
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
                  className="w-full px-2 py-1 border rounded text-[11px]"
                />
              )}
            </div>

            <div>
              <div className="text-[11px] font-semibold text-gray-500">
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
                  onChange={(e) => updateDraftField("radius", e.target.value)}
                  className="w-full px-2 py-1 border rounded text-[11px]"
                  placeholder="25"
                />
              )}
            </div>

            <div className="col-span-2">
              <div className="text-[11px] font-semibold text-gray-500">
                Crop
              </div>
              {!isEditing ? (
                <div className="font-medium">{draft.cropName || "-"}</div>
              ) : (
                <select
                  value={draft.cropName || ""}
                  onChange={(e) => updateDraftField("cropName", e.target.value)}
                  className="w-full px-2 py-1 border rounded text-[11px]"
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
              <div className="text-[11px] font-semibold text-gray-500">
                Other crops
              </div>
              {!isEditing ? (
                <div className="flex flex-wrap gap-1 mt-1">
                  {(draft.otherCrops || []).length === 0 ? (
                    <span className="text-[11px] text-gray-400">None</span>
                  ) : (
                    (draft.otherCrops || []).map((c, i) => (
                      <span
                        key={i}
                        className="text-[11px] bg-gray-50 px-2 py-0.5 rounded border border-gray-200"
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
                  className="w-full px-2 py-1 border rounded text-[11px]"
                  placeholder="Tomato, Onion, ..."
                />
              )}
            </div>

            <div className="col-span-2">
              <div className="text-[11px] font-semibold text-gray-500">
                Has stock
              </div>
              {!isEditing ? (
                <div className="font-medium">
                  {draft.hasStock || "-"}
                  {draft.hasStock === "Yes" && draft.currentStock != null
                    ? ` — ${draft.currentStock} ${draft.currentStockUnit || ""}`
                    : ""}
                </div>
              ) : (
                <div className="flex gap-2 mt-1 items-center">
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
                    className="w-20 px-2 py-1 border rounded text-[11px]"
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
                        className="w-20 px-2 py-1 border rounded text-[11px]"
                        placeholder="25"
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
                        className="w-24 px-2 py-1 border rounded text-[11px]"
                      >
                        <option value="">Unit</option>
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

        {/* Qualifying / Business */}
        <div className="bg-white rounded-lg p-3 shadow-xs border border-gray-100">
          <div className="text-xs font-semibold text-gray-500 mb-2">
            Qualifying / Business
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="text-[11px] font-semibold text-gray-500">
                Capacity
              </div>
              {!isEditing ? (
                <div className="font-medium">{draft.capacity || "-"}</div>
              ) : (
                <input
                  value={draft.capacity || ""}
                  onChange={(e) => updateDraftField("capacity", e.target.value)}
                  className="w-full px-2 py-1 border rounded text-[11px]"
                  placeholder="25.00"
                />
              )}
            </div>

            <div>
              <div className="text-[11px] font-semibold text-gray-500">
                Unit
              </div>
              {!isEditing ? (
                <div className="font-medium">{draft.capacityUnit || "-"}</div>
              ) : (
                <select
                  value={draft.capacityUnit || ""}
                  onChange={(e) =>
                    updateDraftField(
                      "capacityUnit",
                      e.target.value as QuantityUnit
                    )
                  }
                  className="w-full px-2 py-1 border rounded text-[11px]"
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
              <div className="text-[11px] font-semibold text-gray-500">
                Load frequency
              </div>
              {!isEditing ? (
                <div className="font-medium">{draft.frequency || "-"}</div>
              ) : (
                <select
                  value={draft.frequency || ""}
                  onChange={(e) =>
                    updateDraftField(
                      "frequency",
                      e.target.value as LoadFrequency
                    )
                  }
                  className="w-full px-2 py-1 border rounded text-[11px]"
                >
                  <option value="">Select frequency</option>
                  {LOAD_FREQUENCIES.map((freq) => (
                    <option key={freq.value} value={freq.value}>
                      {freq.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <div className="text-[11px] font-semibold text-gray-500">
                Experience
              </div>
              {!isEditing ? (
                <div className="font-medium">{draft.experience || "-"}</div>
              ) : (
                <input
                  value={draft.experience || ""}
                  onChange={(e) =>
                    updateDraftField("experience", e.target.value)
                  }
                  className="w-full px-2 py-1 border rounded text-[11px]"
                  placeholder="2 yrs"
                />
              )}
            </div>

            <div>
              <div className="text-[11px] font-semibold text-gray-500">
                Confidence score
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
                  className="w-full px-2 py-1 border rounded text-[11px]"
                  placeholder="60"
                  min={0}
                  max={100}
                />
              )}
            </div>

            <div>
              <div className="text-[11px] font-semibold text-gray-500">
                T & C agreed?
              </div>
              {!isEditing ? (
                <div className="font-medium">{draft.tAndC || "-"}</div>
              ) : (
                <select
                  value={draft.tAndC || ""}
                  onChange={(e) => updateDraftField("tAndC", e.target.value)}
                  className="w-full px-2 py-1 border rounded text-[11px]"
                >
                  <option value="">Select...</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              )}
            </div>

            <div>
              <div className="text-[11px] font-semibold text-gray-500">
                Interested to work?
              </div>
              {!isEditing ? (
                <div className="font-medium">{draft.interestTo || "-"}</div>
              ) : (
                <select
                  value={draft.interestTo ?? ""}
                  onChange={(e) =>
                    updateDraftField(
                      "interestTo",
                      e.target.value === "" ? null : e.target.value
                    )
                  }
                  className="w-full px-2 py-1 border rounded text-[11px]"
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              )}
            </div>

            <div>
              <div className="text-[11px] font-semibold text-gray-500">
                FE visited
              </div>
              {!isEditing ? (
                <div className="font-medium">{draft.feVisited || "-"}</div>
              ) : (
                <select
                  value={draft.feVisited ?? ""}
                  onChange={(e) =>
                    updateDraftField(
                      "feVisited",
                      e.target.value === "" ? null : e.target.value
                    )
                  }
                  className="w-full px-2 py-1 border rounded text-[11px]"
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              )}
            </div>

            <div>
              <div className="text-[11px] font-semibold text-gray-500">
                Buyer type
              </div>
              {!isEditing ? (
                <div className="font-medium">{draft.buyerType || "-"}</div>
              ) : (
                <select
                  value={draft.buyerType || ""}
                  onChange={(e) =>
                    updateDraftField("buyerType", e.target.value)
                  }
                  className="w-full px-2 py-1 border rounded text-[11px]"
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

          {/* Tag (Details panel) */}
          <div>
            <div className="text-base font-bold text-black-400">Tag</div>

            {!isEditing ? (
              <div className="font-medium">{draft.tag || "-"}</div>
            ) : (
              <div className="space-y-2 mt-1">
                {(() => {
                  const option = ["VLA", "Potential Partner", "Other"].includes(
                    draft.tag || ""
                  )
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
        </div>

        {/* Interaction & Notes */}
        <div className="bg-white rounded-lg p-3 shadow-xs border border-gray-100">
          <div className="text-xs font-semibold text-gray-500 mb-2">
            Interaction & Notes
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="text-[11px] font-semibold text-gray-500">
                Last updated
              </div>
              <div className="font-medium text-gray-600">
                {getTimeAgo(draft.updatedAt)}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-gray-500">
                Last interacted
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
                  className="w-full px-2 py-1 border rounded text-[11px]"
                />
              )}
            </div>

            <div>
              <div className="text-[11px] font-semibold text-gray-500">
                Next action
              </div>
              {!isEditing ? (
                <div className="font-medium">{draft.nextAction || "-"}</div>
              ) : (
                <input
                  type="text"
                  value={draft.nextAction || ""}
                  onChange={(e) =>
                    updateDraftField("nextAction", e.target.value)
                  }
                  className="w-full px-2 py-1 border rounded text-[11px]"
                  placeholder="Verify once in person"
                />
              )}
            </div>

            <div>
              <div className="text-[11px] font-semibold text-gray-500">
                Next action due
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
                    updateDraftField("nextActionDueDate", e.target.value)
                  }
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-2 py-1 border rounded text-[11px]"
                />
              )}
            </div>
          </div>

          <div className="mt-3">
            <div className="text-[11px] font-semibold text-gray-500 mb-1">
              Notes
            </div>
            {!isEditing ? (
              <div className="text-[11px] text-gray-700 leading-snug">
                {draft.notes || "No notes yet."}
              </div>
            ) : (
              <textarea
                value={draft.notes || ""}
                onChange={(e) => updateDraftField("notes", e.target.value)}
                className="w-full px-2 py-1 border rounded text-[11px]"
                rows={3}
                placeholder="Add any notes about this aggregator..."
              />
            )}
          </div>

          {/* Companies list */}
          <div className="mt-3">
            <div className="text-[11px] font-semibold text-gray-500 mb-1">
              Interested companies
            </div>
            <input
              type="text"
              value={companySearch}
              onChange={(e) => setCompanySearch(e.target.value)}
              placeholder={
                isEditing
                  ? "Search companies..."
                  : "Search selected companies..."
              }
              className="w-full mb-2 px-2 py-1 text-[11px] border rounded"
            />
            <div className="border rounded p-2 max-h-32 overflow-y-auto bg-gray-50">
              {loadingCompanies ? (
                <div className="text-[11px] text-gray-400 flex items-center gap-2">
                  <Spinner size={12} /> Loading companies...
                </div>
              ) : companiesError ? (
                <div className="text-[11px] text-red-500 px-2">
                  {companiesError}
                </div>
              ) : isEditing ? (
                (() => {
                  const filtered = availableCompanies.filter((company) =>
                    (company.displayName || company.name || "")
                      .toLowerCase()
                      .includes(companySearch.toLowerCase())
                  );

                  return filtered.length > 0 ? (
                    filtered.map((company) => (
                      <label
                        key={company.id}
                        className="flex items-center gap-2 py-1 px-2 hover:bg-white rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={(draft.interestsCompaniesIds || []).some(
                            (id) => String(id) === String(company.id)
                          )}
                          onChange={(e) => {
                            const currentIds = draft.interestsCompaniesIds || [];
                            if (e.target.checked)
                              updateDraftField("interestsCompaniesIds", [
                                ...currentIds,
                                company.id,
                              ]);
                            else
                              updateDraftField(
                                "interestsCompaniesIds",
                                currentIds.filter((id) => String(id) !== String(company.id))
                              );
                          }}
                          className="w-3 h-3 text-blue-600"
                        />
                        <span className="text-[11px]">
                          {company.displayName || company.name}
                        </span>
                      </label>
                    ))
                  ) : (
                    <div className="text-[11px] text-gray-400 px-2">
                      No companies found
                    </div>
                  );
                })()
              ) : (
                (() => {
                  const selectedIds = draft.interestsCompaniesIds || [];
                  const selectedCompanies = selectedIds
                    .map((id) =>
                      availableCompanies.find((c) => String(c.id) === String(id))
                    )
                    .filter((c): c is CompanyType & { displayName?: string } => c !== undefined && c !== null);

                  const filtered = selectedCompanies.filter((c) =>
                    (c.displayName || c.name || "")
                      .toLowerCase()
                      .includes(companySearch.toLowerCase())
                  );

                  return filtered.length > 0 ? (
                    <ul className="list-disc ml-5">
                      {filtered.map((company) => (
                        <li key={company.id} className="text-[11px]">
                          {company.displayName || company.name}
                        </li>
                      ))}
                    </ul>
                  ) : selectedCompanies.length > 0 ? (
                    <div className="text-[11px] text-gray-400 px-2">
                      No matches
                    </div>
                  ) : (
                    <div className="text-[11px] text-gray-400 px-2">-</div>
                  );
                })()
              )}
            </div>
            <div className="text-[11px] text-gray-500 mt-1">
              {(draft.interestsCompaniesIds || []).length} selected
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
