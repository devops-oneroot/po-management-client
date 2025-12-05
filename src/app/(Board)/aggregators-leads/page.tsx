"use client";
import React, { useEffect, useState, useMemo } from "react";
import { ChevronDown, ChevronUp, Plus, Search } from "lucide-react";
import CreateBuyerButton from "@/components/CreateBuyerButton";

// Import types
import type {
  AggregatorData,
  ColumnSelection,
  ToastType,
  Company,
  QuantityUnit,
  LoadFrequency,
} from "./types";

// Import constants
import {
  CROPS,
  DEFAULT_COLUMN_SELECTION,
  LOAD_FREQUENCIES,
  TAGS,
} from "./constants";

// Import utilities
import { toDisplayDateDDMMYYYY, getTimeAgo } from "./utils/dateHelpers";
import { mapLeadToRow, mapRowToBackendPayload } from "./utils/mappers";
import { sortData } from "./utils/sorting";
import { ALL_COLUMNS } from "./utils/columnDefinitions";
import { createEmptyAggregatorDraft } from "./utils/createEmptyDraft";

// Import components
import { Spinner } from "./components/Spinner";
import { Toast } from "./components/Toast";
import { ConfirmModal } from "./components/ConfirmModal";
import { NewAggregatorModal } from "./components/NewAggregatorModal";
import { ExpandedRowContent } from "./components/ExpandedRowContent";

// Import API services
import {
  callApi,
  findUserByPhone,
  createAggregatorLead,
  patchAggregatorLead,
  deleteAggregatorLead,
  fetchAllCompanies,
  updateBuyerType,
  loadStates,
  loadDistricts,
  loadTaluks,
  loadVillages,
  fetchLeads as fetchLeadsApi,
} from "./services/api";

// Import styles
import styles from "./styles.module.css";

/* ===================================================================
   AggregatorTable - main component
   =================================================================== */
const AggregatorTable = () => {
  // ======== DATA STATE =========
  const [data, setData] = useState<AggregatorData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(40);

  // loading flags for interactivity
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [savingLead, setSavingLead] = useState(false);
  const [deletingLead, setDeletingLead] = useState(false);

  // local search state used in the Details panel (same UX as modal)
  const [companySearch, setCompanySearch] = useState<string>("");

  // Companies list for multi-select
  const [availableCompanies, setAvailableCompanies] = useState<Company[]>([]);

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
  const [selectedColumns, setSelectedColumns] = useState<ColumnSelection>(
    DEFAULT_COLUMN_SELECTION
  );

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
  const [selectedHasStock, setSelectedHasStock] = useState<string>("");
  const [selectedIsVisited, setSelectedIsVisited] = useState<string>("");
  const [selectedIsTcCompliant, setSelectedIsTcCompliant] =
    useState<string>("");
  const [selectedFrequency, setSelectedFrequency] = useState<string>("");
  const [selectedAccurateRadius, setSelectedAccurateRadius] =
    useState<string>("");
  const [selectedOtherCrops, setSelectedOtherCrops] = useState<string[]>([]);
  const [selectedIsInterestedToWork, setSelectedIsInterestedToWork] =
    useState<string>("");
  const [showNewAggregatorModal, setShowNewAggregatorModal] = useState(false);
  const cancelNewAggregator = () => {
    setShowNewAggregatorModal(false);
    setDraft(null);
    setIsEditing(false);
  };
  const [selectedTag, setSelectedTag] = useState("");
  const [sortBy, setSortBy] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

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

  // ======= API FUNCTIONS =======
  function buildListParams() {
    const params: Record<string, any> = {
      page,
      limit,
    };

    // Only use searchName for general search
    if (searchName) params.search = searchName;

    // Add company filter - send company NAME not ID
    // Add company filter - send company NAME not ID
    if (searchCompany) {
      params.companyName = searchCompany; // This is now the actual name like "SKM"
    }

    if (selectedCrop) params.cropName = selectedCrop;
    if (selectedDistrict) params.district = selectedDistrict;
    if (selectedVillage) params.village = selectedVillage;
    if (selectedTaluk) params.taluk = selectedTaluk;
    if (selectedTag) params.label = selectedTag;

    if (selectedHasStock) params.hasStock = selectedHasStock === "true";
    if (selectedIsVisited) params.isVisited = selectedIsVisited === "true";
    if (selectedIsTcCompliant)
      params.isTcCompliant = selectedIsTcCompliant === "true";
    if (selectedFrequency) params.frequency = selectedFrequency;
    if (selectedAccurateRadius)
      params.accurateRadius = Number(selectedAccurateRadius);
    if (selectedOtherCrops.length > 0) params.otherCrop = selectedOtherCrops;
    if (selectedIsInterestedToWork)
      params.isInterestedToWork = selectedIsInterestedToWork === "true";

    return params;
  }
  const sortedData = useMemo(() => {
    return sortData(data, sortBy, sortOrder);
  }, [data, sortBy, sortOrder]);

  // Wrapper functions for location loading that update state
  const loadDistrictsWrapper = async (state: string | null) => {
    if (!state) {
      setDistricts([]);
      return;
    }
    const districtsList = await loadDistricts(state);
    setDistricts(districtsList);
  };

  const loadTaluksWrapper = async (
    state: string | null,
    district: string | null
  ) => {
    if (!state || !district) {
      setTaluks([]);
      return;
    }
    const taluksList = await loadTaluks(state, district);
    setTaluks(taluksList);
  };

  const loadVillagesWrapper = async (
    state: string | null,
    district: string | null,
    taluk: string | null
  ) => {
    if (!state || !district || !taluk) {
      setVillages([]);
      return;
    }
    const villagesList = await loadVillages(state, district, taluk);
    setVillages(villagesList);
  };

  async function fetchLeads() {
    try {
      setLoadingLeads(true);
      const params = buildListParams();
      const res = await fetchLeadsApi(params);

      // Handle different response structures
      let rows = [];
      if (res.data && Array.isArray(res.data)) {
        rows = res.data.map((lead: any) => mapLeadToRow(lead));
      } else if (Array.isArray(res)) {
        rows = res.map((lead: any) => mapLeadToRow(lead));
      }

      setData(rows);
      setTotal(res.total ?? res.count ?? rows.length);
    } catch (err: any) {
      console.error("Failed to fetch aggregator leads:", err);
      showToast(
        "Failed to load aggregators: " + (err?.message || "Unknown error"),
        "error"
      );
      setData([]);
      setTotal(0);
    } finally {
      setLoadingLeads(false);
    }
  }

  async function loadCompanies() {
    try {
      setLoadingCompanies(true);
      const companies = await fetchAllCompanies();
      setAvailableCompanies(companies);
    } catch (err) {
      console.error("Failed to fetch companies:", err);
      setAvailableCompanies([]);
    } finally {
      setLoadingCompanies(false);
    }
  }

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
    selectedDistrict,
    selectedTaluk,
    selectedVillage,
    selectedTag, // ADD THIS
    selectedHasStock,
    selectedIsVisited,
    selectedIsTcCompliant,
    selectedFrequency,
    selectedAccurateRadius,
    selectedOtherCrops,
    selectedIsInterestedToWork,
  ]);

  useEffect(() => {
    const load = async () => {
      await loadCompanies();
      await loadDistrictsWrapper("Karnataka");
    };
    load();
  }, []);

  // When draft changes, preload location lists as before
  useEffect(() => {
    if (!draft) return;
    (async () => {
      if (states.length === 0) {
        const statesList = await loadStates();
        setStates(statesList);
      }
      if (draft.state) {
        await loadDistrictsWrapper(draft.state);
      }
      if (draft.state && draft.district) {
        await loadTaluksWrapper(draft.state, draft.district);
      }
      if (draft.state && draft.district && draft.taluk) {
        await loadVillagesWrapper(draft.state, draft.district, draft.taluk);
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
    setSelectedTag("");
    setSelectedHasStock("");
    setSelectedIsVisited("");
    setSelectedIsTcCompliant("");
    setSelectedFrequency("");
    setSelectedAccurateRadius("");
    setSelectedOtherCrops([]);
    setSelectedIsInterestedToWork("");
  };

  // Use data directly from backend - it's already filtered
  const filteredData = data;

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
      selectedTag,
  selectedHasStock,
  selectedIsVisited,
  selectedIsTcCompliant,
  selectedFrequency,
  selectedAccurateRadius,
  selectedIsInterestedToWork,
  ].filter((f) => f !== "").length + (selectedOtherCrops.length > 0 ? 1 : 0);;

  // ======= ROW SELECTION / EDIT / SAVE / DELETE handlers =======
  const openDetails = (id: string | number) => {
    const isSameRow = selectedRowId === id;
    // Clicking the same row collapses it
    if (isSameRow) {
      setSelectedRowId(null);
      setIsEditing(false);
      setDraft(null);
      return;
    }

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
      upfrontPaymentNeedPercentage: row.upfrontPaymentNeedPercentage ?? null,
      interestedToWorkPercentage: row.interestedToWorkPercentage ?? null,
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

    // Validation for mandatory fields
    const errors = [];

    if (!draft.name?.trim()) errors.push("Name is required");
    if (!draft.number?.trim()) errors.push("Phone Number is required");
    if (!draft.cropName) errors.push("Crop is required");
    if (!draft.lastInteracted) errors.push("Last Interacted At is required");
    if (!draft.nextAction?.trim()) errors.push("Next Action is required");
    if (!draft.nextActionDueDate)
      errors.push("Next Action Due Date is required");

    if (errors.length > 0) {
      showToast(
        "Please fill in all mandatory fields:\n\n• " + errors.join("\n• "),
        "error"
      );
      return;
    }

    try {
      setSavingLead(true);
      // Clean up fields - set to null if empty
      const cleanedDraft = {
        ...draft,
        hasStock: draft.hasStock === "" ? null : draft.hasStock,
        tAndC: draft.tAndC === "" ? null : draft.tAndC,
        buyerType: draft.buyerType === "" ? null : draft.buyerType,
        tag: draft.tag === "" ? null : draft.tag,
        interestTo: draft.interestTo === "" ? null : draft.interestTo,
        frequency: draft.frequency === "" ? null : draft.frequency,
        capacityUnit: draft.capacityUnit === "" ? null : draft.capacityUnit,
        currentStock: draft.hasStock === "Yes" ? draft.currentStock : null,
        currentStockUnit:
          draft.hasStock === "Yes" ? draft.currentStockUnit : null,
      };

      const payload = mapRowToBackendPayload(cleanedDraft);

      if (!cleanedDraft.id) {
        // create
        if (!cleanedDraft.number) {
          showToast("Mobile number is required", "error");
          return;
        }
        const user = await findUserByPhone(cleanedDraft.number);
        if (!user?.id) {
          showToast(
            "User not found! Please create user on Markhet dashboard first.",
            "error"
          );
          return;
        }

        // update buyer type if needed
        if (
          cleanedDraft.buyerType !== undefined &&
          cleanedDraft.buyerType !== null &&
          cleanedDraft.buyerType !== user.buyerType
        ) {
          await updateBuyerType(user.id, { buyerType: cleanedDraft.buyerType });
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
      await patchAggregatorLead(String(cleanedDraft.id), payload);

      if (
        cleanedDraft.userId &&
        cleanedDraft.buyerType !== undefined &&
        cleanedDraft.buyerType !== null
      ) {
        const originalRow = data.find((r) => r.id === cleanedDraft.id);
        if (originalRow && cleanedDraft.buyerType !== originalRow.buyerType) {
          await updateBuyerType(cleanedDraft.userId, {
            buyerType: cleanedDraft.buyerType,
          });
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
    } finally {
      setSavingLead(false); // ADD THIS
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
          setDeletingLead(true);
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
        } finally {
          setDeletingLead(false); // ADD THIS
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
    const empty = createEmptyAggregatorDraft();
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
        {/* Full-width: Table + Controls with inline expanded rows */}
        <div className="flex-1">
          {/* Header Controls */}
          {/* Header Controls */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            {/* First Row */}
            <div className="grid grid-cols-6 gap-3 mb-3">
              <div className="relative col-span-1">
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

              <select
                value={searchCompany}
                onChange={(e) => setSearchCompany(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Companies</option>
                {availableCompanies.map((company) => (
                  <option key={company.id} value={company.name}>
                    {company.displayName || company.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Crops</option>
                {CROPS.map((crop) => (
                  <option key={crop} value={crop}>
                    {crop}
                  </option>
                ))}
              </select>

              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Tags</option>
                {TAGS.map((tag) => (
                  <option key={tag.value} value={tag.value}>
                    {tag.label}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sort By</option>
                <option value="createdAt">Onboarded Date</option>
                <option value="updatedAt">Last Updated</option>
                <option value="operationScore">Confidence Score</option>
                <option value="capacity">Capacity</option>
                <option value="name">Name</option>
                <option value="lastInteracted">Last Interacted</option>
                <option value="nextActionDueDate">Next Action Due Date</option>
                <option value="readyToSupply">Ready to Supply Date</option>
              </select>

              <button
                onClick={createNewAggregator}
                className="px-4 py-2 bg-black text-white rounded-md text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
              >
                <Plus size={16} />
                New Aggregator
              </button>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-6 gap-3">
              <select
                value={selectedDistrict}
                onChange={async (e) => {
                  setSelectedDistrict(e.target.value);
                  setSelectedTaluk("");
                  setSelectedVillage("");
                  if (e.target.value) {
                    await loadTaluksWrapper("Karnataka", e.target.value);
                  } else {
                    setTaluks([]);
                    setVillages([]);
                  }
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select District</option>
                {districts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>

              <select
                value={selectedTaluk}
                onChange={async (e) => {
                  setSelectedTaluk(e.target.value);
                  setSelectedVillage("");
                  if (e.target.value && selectedDistrict) {
                    await loadVillagesWrapper(
                      "Karnataka",
                      selectedDistrict,
                      e.target.value
                    );
                  } else {
                    setVillages([]);
                  }
                }}
                disabled={!selectedDistrict}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Select Taluk</option>
                {taluks.map((taluk) => (
                  <option key={taluk} value={taluk}>
                    {taluk}
                  </option>
                ))}
              </select>

              <select
                value={selectedVillage}
                onChange={(e) => setSelectedVillage(e.target.value)}
                disabled={!selectedTaluk}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Select Village</option>
                {villages.map((village) => (
                  <option key={village} value={village}>
                    {village}
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

              <CreateBuyerButton className="ml-2" />

              <div className="flex items-center justify-center text-sm text-gray-500">
                {/* Empty space for alignment */}
              </div>
            </div>

            {/* Third Row - Additional Filters */}
            <div className="grid grid-cols-6 gap-3">
              <select
                value={selectedHasStock}
                onChange={(e) => setSelectedHasStock(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Has Stock?</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>

              <select
                value={selectedIsVisited}
                onChange={(e) => setSelectedIsVisited(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Is Visited?</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>

              <select
                value={selectedIsTcCompliant}
                onChange={(e) => setSelectedIsTcCompliant(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">T&C Compliant?</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>

              <select
                value={selectedFrequency}
                onChange={(e) => setSelectedFrequency(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Load Frequency</option>
                {LOAD_FREQUENCIES.map((freq) => (
                  <option key={freq.value} value={freq.value}>
                    {freq.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedIsInterestedToWork}
                onChange={(e) => setSelectedIsInterestedToWork(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Interested to Work?</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>

              <input
                type="number"
                placeholder="Accurate Radius (km)"
                value={selectedAccurateRadius}
                onChange={(e) => setSelectedAccurateRadius(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>
          </div>

          {/* Column Selector */}
          {showColumnSelector && (
            <div
              className={`bg-white rounded-lg shadow-lg p-4 mb-4 border border-gray-200 ${styles.animateFadeIn}`}
            >
              <h3 className="font-semibold mb-3">Select Columns to Display</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {ALL_COLUMNS.map((col) => (
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
              `Showing ${sortedData.length} of ${total} aggregators`
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
                  {sortedData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={effectiveVisibleCount + 1}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        No aggregators found matching your filters
                      </td>
                    </tr>
                  ) : (
                    sortedData.map((row) => {
                      const isSelected = selectedRowId === row.id;
                      return (
                        <React.Fragment key={String(row.id)}>
                          <tr
                            className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                              isSelected ? "bg-blue-50" : ""
                            }`}
                            onClick={() => openDetails(row.id as any)}
                          >
                            <td className="px-4 py-3">
                              {isSelected ? (
                                <ChevronUp
                                  size={16}
                                  className="text-gray-600"
                                />
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
                                    ? toDisplayDateDDMMYYYY(
                                        row.nextActionDueDate
                                      )
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
                          {isSelected && (
                            <tr>
                              <td
                                colSpan={effectiveVisibleCount + 1}
                                className="px-4 pb-4 bg-gray-50"
                              >
                                <ExpandedRowContent
                                  selectedRowId={selectedRowId}
                                  draft={draft}
                                  isEditing={isEditing}
                                  savingLead={savingLead}
                                  deletingLead={deletingLead}
                                  loadingCompanies={loadingCompanies}
                                  companySearch={companySearch}
                                  setCompanySearch={setCompanySearch}
                                  availableCompanies={availableCompanies}
                                  startEdit={startEdit}
                                  saveDraft={saveDraft}
                                  cancelEdit={cancelEdit}
                                  deleteRow={deleteRow}
                                  updateDraftField={updateDraftField}
                                />
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
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
      </div>

      {/* New Aggregator Modal */}
      <NewAggregatorModal
        show={showNewAggregatorModal}
        draft={draft}
        availableCompanies={availableCompanies}
        isEditing={isEditing}
        savingLead={savingLead}
        updateDraftField={updateDraftField}
        cancelNewAggregator={cancelNewAggregator}
        saveDraft={saveDraft}
        loadDistricts={loadDistrictsWrapper}
        loadTaluks={loadTaluksWrapper}
        loadVillages={loadVillagesWrapper}
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
