"use client";
import React, { useEffect, useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Search,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react";
import CreateBuyerButton from "../../../components/CreateBuyerButton";
import * as XLSX from "xlsx";

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
import { toDisplayDateDDMMYYYY } from "./utils/dateHelpers";
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

type AggregatorTableProps = {
  // default false to avoid duplicate headers. Parent can pass true if they want the local title.
  showPageTitle?: boolean;
};

const AggregatorTable: React.FC<AggregatorTableProps> = ({
  showPageTitle = false,
}) => {
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

  // filter card collapsed state
  const [filtersCollapsed, setFiltersCollapsed] = useState<boolean>(false);

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

  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      3000
    );
  };

  // columns we always want frozen
  // frozen config
  const FROZEN_KEYS = ["onboarded", "name", "number"] as const;
  const FROZEN_WIDTHS: Record<string, number> = {
    onboarded: 120,
    name: 180,
    number: 150,
  };
  // expand/arrow column width
  const EXPAND_COL_WIDTH = 56; // px

  // stacking & visuals
  const HEADER_STICKY_Z = 300;
  const BODY_STICKY_Z = 250;
  const EXPAND_COL_Z = 340; // expand column on top of everything
  const FROZEN_BACKGROUND = "#ffffff";
  const FROZEN_BORDER_RIGHT = "1px solid rgba(224,228,233,0.9)";
  const FROZEN_SHADOW = "2px 0 6px rgba(15,23,42,0.06)";

  // ======= API FUNCTIONS =======
  function buildListParams() {
    const params: Record<string, any> = { page, limit };
    if (searchName) params.search = searchName;
    if (searchCompany) params.companyName = searchCompany;
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

  const sortedData = useMemo(
    () => sortData(data, sortBy, sortOrder),
    [data, sortBy, sortOrder]
  );

  const loadDistrictsWrapper = async (state: string | null) => {
    if (!state) {
      setDistricts([]);
      return;
    }
    const list = await loadDistricts(state);
    setDistricts(list);
  };
  const loadTaluksWrapper = async (
    state: string | null,
    district: string | null
  ) => {
    if (!state || !district) {
      setTaluks([]);
      return;
    }
    const list = await loadTaluks(state, district);
    setTaluks(list);
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
    const list = await loadVillages(state, district, taluk);
    setVillages(list);
  };

  async function fetchLeads() {
    try {
      setLoadingLeads(true);
      const params = buildListParams();
      const res = await fetchLeadsApi(params);
      let rows: any[] = [];
      if (res.data && Array.isArray(res.data))
        rows = res.data.map((l: any) => mapLeadToRow(l));
      else if (Array.isArray(res)) rows = res.map((l: any) => mapLeadToRow(l));
      setData(rows);
      setTotal(res.total ?? res.count ?? rows.length);
    } catch (err: any) {
      console.error("fetchLeads error", err);
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
      console.error("loadCompanies", err);
      setAvailableCompanies([]);
    } finally {
      setLoadingCompanies(false);
    }
  }

  useEffect(() => {
    fetchLeads(); /* eslint-disable-next-line */
  }, [
    page,
    limit,
    searchName,
    searchCompany,
    selectedCrop,
    selectedDistrict,
    selectedTaluk,
    selectedVillage,
    selectedTag,
    selectedHasStock,
    selectedIsVisited,
    selectedIsTcCompliant,
    selectedFrequency,
    selectedAccurateRadius,
    selectedOtherCrops,
    selectedIsInterestedToWork,
  ]);

  useEffect(() => {
    (async () => {
      await loadCompanies();
      await loadDistrictsWrapper("Karnataka");
    })();
  }, []);

  useEffect(() => {
    if (!draft) return;
    (async () => {
      if (states.length === 0) {
        const s = await loadStates();
        setStates(s);
      }
      if (draft.state) await loadDistrictsWrapper(draft.state);
      if (draft.state && draft.district)
        await loadTaluksWrapper(draft.state, draft.district);
      if (draft.state && draft.district && draft.taluk)
        await loadVillagesWrapper(draft.state, draft.district, draft.taluk);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  // Column helpers
  const toggleColumn = (key: keyof ColumnSelection) =>
    setSelectedColumns((prev) => ({ ...prev, [key]: !prev[key] }));
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

  // Clear last active filter (rightmost active according to order below)
  const activeFilterOrder: { key: string; clear: () => void }[] = [
    { key: "AccurateRadius", clear: () => setSelectedAccurateRadius("") },
    {
      key: "IsInterestedToWork",
      clear: () => setSelectedIsInterestedToWork(""),
    },
    { key: "Frequency", clear: () => setSelectedFrequency("") },
    { key: "IsTcCompliant", clear: () => setSelectedIsTcCompliant("") },
    { key: "IsVisited", clear: () => setSelectedIsVisited("") },
    { key: "HasStock", clear: () => setSelectedHasStock("") },
    { key: "Score", clear: () => setSelectedScore("") },
    { key: "Capacity", clear: () => setSelectedCapacity("") },
    { key: "Village", clear: () => setSelectedVillage("") },
    { key: "Taluk", clear: () => setSelectedTaluk("") },
    { key: "District", clear: () => setSelectedDistrict("") },
    { key: "Tag", clear: () => setSelectedTag("") },
    { key: "Crop", clear: () => setSelectedCrop("") },
    { key: "Company", clear: () => setSearchCompany("") },
    { key: "Search", clear: () => setSearchName("") },
  ];

  const clearLastActiveFilter = () => {
    for (let i = 0; i < activeFilterOrder.length; i++) {
      const item = activeFilterOrder[i];
      // find first non-empty from left? we want rightmost active -> iterate from start? activeFilterOrder is right-to-left
    }
    // iterate right-to-left to clear the RIGHTMOST active filter
    for (let i = 0; i < activeFilterOrder.length; i++) {
      const item = activeFilterOrder[i];
      // check current value for emptiness by key mapping
      const k = item.key;
      const value =
        k === "AccurateRadius"
          ? selectedAccurateRadius
          : k === "IsInterestedToWork"
          ? selectedIsInterestedToWork
          : k === "Frequency"
          ? selectedFrequency
          : k === "IsTcCompliant"
          ? selectedIsTcCompliant
          : k === "IsVisited"
          ? selectedIsVisited
          : k === "HasStock"
          ? selectedHasStock
          : k === "Score"
          ? selectedScore
          : k === "Capacity"
          ? selectedCapacity
          : k === "Village"
          ? selectedVillage
          : k === "Taluk"
          ? selectedTaluk
          : k === "District"
          ? selectedDistrict
          : k === "Tag"
          ? selectedTag
          : k === "Crop"
          ? selectedCrop
          : k === "Company"
          ? searchCompany
          : k === "Search"
          ? searchName
          : "";

      if (
        value !== "" &&
        value !== undefined &&
        !(Array.isArray(value) && value.length === 0)
      ) {
        item.clear();
        return;
      }
    }
    // nothing to clear
    showToast("No active filters to clear", "info");
  };

  // ---------- EXPORT HELPERS ----------

  // map columns to friendly headers and accessor function
  const EXPORT_COLUMNS: {
    key: string;
    header: string;
    accessor: (r: AggregatorData) => any;
  }[] = [
    {
      key: "onboarded",
      header: "Onboarded",
      accessor: (r) => r.onboarded ?? "",
    },
    { key: "name", header: "Name", accessor: (r) => r.name ?? "" },
    { key: "number", header: "Phone Number", accessor: (r) => r.number ?? "" },
    { key: "village", header: "Village", accessor: (r) => r.village ?? "" },
    { key: "taluk", header: "Taluk", accessor: (r) => r.taluk ?? "" },
    { key: "district", header: "District", accessor: (r) => r.district ?? "" },
    { key: "state", header: "State", accessor: (r) => r.state ?? "" },
    {
      key: "experience",
      header: "Experience (yrs)",
      accessor: (r) => r.experience ?? "",
    },
    {
      key: "capacity",
      header: "Capacity",
      accessor: (r) =>
        r.capacity ? `${r.capacity} ${r.capacityUnit ?? ""}` : "",
    },
    { key: "tAndC", header: "T&C Agreed", accessor: (r) => r.tAndC ?? "" },
    {
      key: "nextAction",
      header: "Next Action",
      accessor: (r) => r.nextAction ?? "",
    },
    {
      key: "nextActionDueDate",
      header: "Next Action Due Date",
      accessor: (r) => r.nextActionDueDate ?? "",
    },
    {
      key: "interestTo",
      header: "Interested To Collaborate",
      accessor: (r) => r.interestTo ?? "",
    },
    {
      key: "readyToSupply",
      header: "Ready To Supply",
      accessor: (r) => r.readyToSupply ?? "",
    },
    { key: "tag", header: "Tag", accessor: (r) => r.tag ?? "" },
  ];

  // CSV exporter (no dependency)
  function downloadCsvFromData(
    rows: AggregatorData[],
    filename = "aggregators.csv"
  ) {
    if (!rows || rows.length === 0) {
      showToast("No rows to export", "info");
      return;
    }

    // Build header
    const headers = EXPORT_COLUMNS.map((c) => c.header);
    // Build rows
    const csvRows = rows.map((r) =>
      EXPORT_COLUMNS.map((c) => {
        let cell = c.accessor(r);
        if (cell === null || cell === undefined) cell = "";
        // Convert arrays or objects to string
        if (Array.isArray(cell)) cell = cell.join("; ");
        else if (typeof cell === "object") cell = JSON.stringify(cell);
        // escape quotes
        const escaped = String(cell).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(",")
    );

    const csv = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // XLSX exporter using sheetjs (optional). Install with: npm i xlsx
  async function downloadXlsxFromData(
    rows: AggregatorData[],
    filename = "aggregators.xlsx"
  ) {
    // lazy import so app bundle isn't forced to include sheetjs unless user uses this function
    try {
      const XLSX = await import("xlsx");
      const data = rows.map((r) => {
        const obj: Record<string, any> = {};
        EXPORT_COLUMNS.forEach((c) => {
          let val = c.accessor(r);
          if (val === null || val === undefined) val = "";
          if (Array.isArray(val)) val = val.join("; ");
          if (typeof val === "object") val = JSON.stringify(val);
          obj[c.header] = val;
        });
        return obj;
      });
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Aggregators");
      XLSX.writeFile(wb, filename);
    } catch (err) {
      console.error("XLSX export failed:", err);
      showToast("XLSX export failed. Make sure 'xlsx' is installed.", "error");
    }
  }

  // ROW handlers (openDetails, save, delete) - same as before, unchanged logic
  const openDetails = (id: string | number) => {
    const isSameRow = selectedRowId === id;
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

  const saveDraft = async () => {
    if (!draft) return;
    const errors: string[] = [];
    if (!draft.name?.trim()) errors.push("Name is required");
    if (!draft.number?.trim()) errors.push("Phone Number is required");
    if (!draft.cropName) errors.push("Crop is required");
    if (!draft.lastInteracted) errors.push("Last Interacted At is required");
    if (!draft.nextAction?.trim()) errors.push("Next Action is required");
    if (!draft.nextActionDueDate)
      errors.push("Next Action Due Date is required");
    if (errors.length > 0) {
      showToast(
        "Please fill in mandatory fields:\n• " + errors.join("\n• "),
        "error"
      );
      return;
    }
    try {
      setSavingLead(true);
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
      setSavingLead(false);
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
          setDeletingLead(false);
        }
      },
    });
  };

  // hoisted helper so it can be referenced anywhere above/below
  function updateDraftField<K extends keyof AggregatorData>(
    key: K,
    value: AggregatorData[K]
  ) {
    setDraft((d) => (d ? { ...d, [key]: value } : d));
  }

  /**
   * Helper to apply user object fields into an aggregator draft.
   * Similar mapping as NewAggregatorModal.applyUserToDraft.
   */
  const applyUserToDraftLocal = (user: any) => {
    if (!user) return;
    setDraft((d) => {
      const base = d ?? createEmptyAggregatorDraft();
      const capacityVal =
        user.loadingCapacity ??
        user.loading_capacity ??
        user.capacity ??
        user.loadingCapacityValue ??
        user.loading_capacity_value ??
        null;
      const capacityUnitVal =
        user.loadingCapacityMeasure ??
        user.loading_capacity_measure ??
        user.capacityUnit ??
        user.loadingCapacityUnit ??
        user.loading_capacity_unit ??
        null;

      const experienceVal =
        user.experience ?? (user.yearsExperience ?? undefined) ?? undefined;

      const freq =
        user.loadingFrequency ?? user.frequency ?? user.loadFrequency ?? null;

      return {
        ...base,
        userId: user.id ?? base.userId ?? null,
        name: user.name ?? base.name ?? "",
        number:
          user.mobileNumber ?? user.phone ?? (base.number as string | null) ?? "",
        __raw: { ...(base.__raw || {}), ...user },
        __rawUserFromLookup: user,
        village: user.village ?? base.village ?? "",
        taluk: user.taluk ?? base.taluk ?? "",
        district: user.district ?? base.district ?? "",
        state: user.state ?? base.state ?? "",
        capacity: capacityVal !== null && capacityVal !== undefined ? String(capacityVal) : base.capacity ?? null,
        capacityUnit: capacityUnitVal ? String(capacityUnitVal) : base.capacityUnit ?? null,
        experience: experienceVal !== undefined && experienceVal !== null ? String(experienceVal) : base.experience ?? null,
        frequency: freq ? String(freq) : base.frequency ?? null,
      } as AggregatorData;
    });
  };

  // ========== NEW: handle buyer created from CreateBuyerForm ==========
  const handleBuyerCreated = async (phone: string, user?: any) => {
    try {
      // start with an empty draft and prefill phone
      const empty = createEmptyAggregatorDraft();
      const prefill: AggregatorData = {
        ...empty,
        number: phone,
      };

      setDraft(prefill);
      setSelectedRowId(null);
      setIsEditing(true);
      setShowNewAggregatorModal(true);

      // If user object provided by createBuyer, apply immediately and load location lists
      if (user && user.id) {
        applyUserToDraftLocal(user);

        // load location lists for selects if user has state/district/taluk
        if (user.state) {
          await loadDistrictsWrapper(user.state);
          if (user.district) {
            await loadTaluksWrapper(user.state, user.district);
            if (user.taluk) {
              await loadVillagesWrapper(user.state, user.district, user.taluk);
            }
          }
        }
        return;
      }

      // If no user was returned, attempt a lookup by phone to populate more fields
      const lookedUp = await findUserByPhone(phone);
      if (lookedUp && lookedUp.id) {
        applyUserToDraftLocal(lookedUp);
        if (lookedUp.state) {
          await loadDistrictsWrapper(lookedUp.state);
          if (lookedUp.district) {
            await loadTaluksWrapper(lookedUp.state, lookedUp.district);
            if (lookedUp.taluk) {
              await loadVillagesWrapper(
                lookedUp.state,
                lookedUp.district,
                lookedUp.taluk
              );
            }
          }
        }
      }
    } catch (err) {
      console.error("handleBuyerCreated error:", err);
      showToast("Failed to open aggregator form from created buyer", "error");
    }
  };

  const renderCellForKey = (key: string, row: AggregatorData) => {
    // provide conservative fallbacks; extend this switch if you want custom formatting
    switch (key) {
      case "onboarded":
        return row.onboarded ?? "";
      case "name":
        return <span className="font-medium text-sm">{row.name}</span>;
      case "number":
        return row.number ?? "";
      case "state":
        return row.state ?? "-";
      case "district":
        return row.district ?? "-";
      case "taluk":
        return row.taluk ?? "-";
      case "village":
        return (
          <div>
            <div className="text-sm text-gray-900">{row.village ?? "-"}</div>
          </div>
        );

      case "experience":
        return row.experience ?? "-";
      case "capacity":
        return row.capacity ?? "-";
      case "capacityUnit":
        return row.capacityUnit ?? "-";
      case "tAndC":
        return (
          <span className="flex items-center gap-1">
            {row.tAndC ?? "-"}
            <ChevronDown size={14} className="text-gray-400" />
          </span>
        );
      case "nextAction":
        return (
          <div>
            <div>{row.nextAction || "-"}</div>
            <div className="text-xs text-gray-400">
              {row.nextActionDueDate
                ? toDisplayDateDDMMYYYY(row.nextActionDueDate)
                : ""}
            </div>
          </div>
        );
      case "interestTo":
        return (
          <span className="flex items-center gap-1">
            {(row as any).interestTo ?? "-"}
            <ChevronDown size={14} className="text-gray-400" />
          </span>
        );
      case "readyToSupply":
        return row.readyToSupply
          ? toDisplayDateDDMMYYYY(row.readyToSupply)
          : "-";
      case "tag":
        return (
          <span
            className={`px-3 py-1 rounded-md text-xs font-medium ${
              row.tag === "VLA"
                ? "bg-gray-100 text-gray-700 border border-gray-300"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
            }`}
          >
            {row.tag ?? ""}
          </span>
        );
      case "confidence":
        return (row as any).confidence ?? "-";
      case "lastInteracted":
        return (row as any).lastInteracted
          ? toDisplayDateDDMMYYYY((row as any).lastInteracted)
          : "-";
      case "interestedCompanies":
        return Array.isArray((row as any).interestedCompanies)
          ? (row as any).interestedCompanies.join(", ")
          : (row as any).interestedCompanies ?? "-";
      case "interestsCompaniesIds":
        return Array.isArray((row as any).interestsCompaniesIds)
          ? (row as any).interestsCompaniesIds.join(", ")
          : (row as any).interestsCompaniesIds ?? "-";
      case "feVisited":
        return (row as any).feVisited
          ? "Yes"
          : (row as any).feVisited === false
          ? "No"
          : "-";
      case "hasStock":
        return (row as any).hasStock ?? "-";
      case "notes":
        return (row as any).notes ?? "-";
      case "radius":
        // you earlier used accurateRadius; try both fallbacks
        return (row as any).accurateRadius ?? (row as any).radius ?? "-";
      case "otherCrops":
        return Array.isArray((row as any).otherCrops)
          ? (row as any).otherCrops.join(", ")
          : (row as any).otherCrops ?? "-";
      case "isVisited":
        return (row as any).isVisited
          ? "Yes"
          : (row as any).isVisited === false
          ? "No"
          : "-";
      case "cropName":
        return row.cropName ?? "-";
      case "buyerType":
        return (row as any).buyerType ?? "-";
      case "updatedAt":
        return (row as any).updatedAt
          ? toDisplayDateDDMMYYYY((row as any).updatedAt)
          : "-";
      case "upfrontPaymentNeedPercentage":
        return (row as any).upfrontPaymentNeedPercentage ?? "-";
      case "interestedToWorkPercentage":
        return (row as any).interestedToWorkPercentage ?? "-";
      default:
        // fallback: return the raw value if present
        const v = (row as any)[key];
        if (v === null || v === undefined) return "-";
        if (Array.isArray(v)) return v.join(", ");
        if (typeof v === "object") return JSON.stringify(v);
        return String(v);
    }
  };

  // helper: whether any filters active
  const activeFiltersCount =
    [
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
    ].filter((f) => (Array.isArray(f) ? f.length > 0 : f !== "")).length +
    (selectedOtherCrops.length > 0 ? 1 : 0);

  const isColumnVisible = (key: keyof ColumnSelection) => {
    // Always respect selectedColumns state (default true if missing)
    return selectedColumns[key] ?? true;
  };
  // Visible columns array derived from ALL_COLUMNS + selectedColumns
  const visibleColumns = useMemo(() => {
    return ALL_COLUMNS.filter((c) => !!selectedColumns[c.key]);
  }, [ALL_COLUMNS, selectedColumns]);

  // compute left offsets for each visible column key (only needed for frozen ones)
  // compute left offsets; start after expand col width
  const leftOffsetMap: Record<string, number> = {};
  (() => {
    let acc = EXPAND_COL_WIDTH; // left offset starts after expand column
    for (const col of visibleColumns) {
      if (FROZEN_KEYS.includes(col.key as any)) {
        leftOffsetMap[col.key] = acc;
        acc += FROZEN_WIDTHS[col.key] ?? 160;
      } else {
        acc += 200; // approximate for non-frozen columns
      }
    }
  })();

  const visibleColumnsCount = visibleColumns.length;
  // +1 accounts for the expand/collapse icon column at start of each row
  const effectiveVisibleCount = visibleColumnsCount + 1;

  useEffect(() => {
    console.log(
      "ALL_COLUMNS:",
      ALL_COLUMNS.map((c) => c.key)
    );
    console.log("DEFAULT_COLUMN_SELECTION keys:", Object.keys(selectedColumns));
  }, []);

  // Create new aggregator flow
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

  const onPrevPage = () => setPage((p) => Math.max(1, p - 1));
  const onNextPage = () =>
    setPage((p) => {
      const last = Math.max(1, Math.ceil((total || 0) / limit));
      return Math.min(last, p + 1);
    });

  // ========== RENDER ==========
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1400px] mx-auto">
        {/* Top header: title left + buttons right (showPageTitle default false so parent header wins) */}
        <div className="flex items-start justify-between mb-4 gap-4">
          {showPageTitle ? (
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Aggregators leads
              </h1>
              <p className="text-sm text-gray-500">
                Manage your orders efficiently
              </p>
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            <div className="relative inline-block">
              <button
                onClick={() =>
                  downloadCsvFromData(
                    sortedData,
                    `aggregators-${new Date().toISOString().slice(0, 10)}.csv`
                  )
                }
                className="px-4 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50"
              >
                Export CSV
              </button>
              {/* optional dropdown for XLSX */}
              <button
                onClick={() =>
                  downloadXlsxFromData(
                    sortedData,
                    `aggregators-${new Date().toISOString().slice(0, 10)}.xlsx`
                  )
                }
                className="ml-2 px-4 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50"
              >
                Export XLSX
              </button>
            </div>

            {/* Create Buyer moved to top and reusing CreateBuyerButton component */}
            <CreateBuyerButton className="!px-4 !py-2" onCreated={handleBuyerCreated} />

            <button
              onClick={createNewAggregator}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm flex items-center gap-2 hover:bg-emerald-700 transition"
            >
              <Plus size={16} /> New Aggregator
            </button>
          </div>
        </div>

        {/* FILTER CARD - collapsible */}
        <div
          className={`bg-white rounded-2xl shadow p-4 mb-6 border border-gray-100 transition-all ${
            filtersCollapsed ? "h-12 overflow-hidden" : ""
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-medium text-gray-800">Filters</h3>
              <span className="text-sm text-gray-500">
                {activeFiltersCount} active
              </span>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearLastActiveFilter}
                  title="Clear last active filter"
                  className="ml-2 px-2 py-1 rounded-md border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-1"
                >
                  <X size={14} />
                  <span className="hidden md:inline">Clear last</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFiltersCollapsed((prev) => !prev)}
                className="px-3 py-1 rounded-md border border-gray-200 bg-white hover:bg-gray-50 flex items-center gap-2 text-sm"
              >
                {filtersCollapsed ? (
                  <>
                    <ChevronRight size={16} /> Expand
                  </>
                ) : (
                  <>
                    <ChevronLeft size={16} /> Collapse
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Filter content - collapsible body */}
          <div className={`${filtersCollapsed ? "hidden" : "block"}`}>
            {/* First row */}
            <div className="grid grid-cols-6 gap-3 mb-4 items-center">
              <div className="relative col-span-2">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search name, number, or company"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <select
                value={searchCompany}
                onChange={(e) => setSearchCompany(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
              >
                <option value="">All Companies</option>
                {availableCompanies.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.displayName || c.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
              >
                <option value="">All Crops</option>
                {CROPS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
              >
                <option value="">All Tags</option>
                {TAGS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
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
            </div>

            {/* Second row */}
            {/* Second row */}
            <div className="grid grid-cols-6 gap-3 mb-4">
              <select
                value={selectedDistrict}
                onChange={async (e) => {
                  setSelectedDistrict(e.target.value);
                  setSelectedTaluk("");
                  setSelectedVillage("");
                  if (e.target.value)
                    await loadTaluksWrapper("Karnataka", e.target.value);
                  else {
                    setTaluks([]);
                    setVillages([]);
                  }
                }}
                className="px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
              >
                <option value="">Select District</option>
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <select
                value={selectedTaluk}
                onChange={async (e) => {
                  setSelectedTaluk(e.target.value);
                  setSelectedVillage("");
                  if (e.target.value && selectedDistrict)
                    await loadVillagesWrapper(
                      "Karnataka",
                      selectedDistrict,
                      e.target.value
                    );
                  else setVillages([]);
                }}
                disabled={!selectedDistrict}
                className="px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                <option value="">Select Taluk</option>
                {taluks.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              <select
                value={selectedVillage}
                onChange={(e) => setSelectedVillage(e.target.value)}
                disabled={!selectedTaluk}
                className="px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                <option value="">Select Village</option>
                {villages.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>

              <select
                value={selectedCapacity}
                onChange={(e) => setSelectedCapacity(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
              >
                <option value="">&gt; Capacity</option>
                <option value="30">&gt; 30 capacity</option>
                <option value="20">&gt; 20 capacity</option>
                <option value="10">&gt; 10 capacity</option>
              </select>

              <select
                value={selectedScore}
                onChange={(e) => setSelectedScore(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
              >
                <option value="">&lt; Score</option>
                <option value="50">&lt; 50% Score</option>
                <option value="70">&lt; 70% Score</option>
                <option value="90">&lt; 90% Score</option>
              </select>

              {/* Move Has Stock here so 2nd row has no empty space */}
              <select
                value={selectedHasStock}
                onChange={(e) => setSelectedHasStock(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
              >
                <option value="">Has Stock?</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>

            {/* Third row */}
            <div className="grid grid-cols-6 gap-3">
              <select
                value={selectedIsVisited}
                onChange={(e) => setSelectedIsVisited(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
              >
                <option value="">Is Visited?</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>

              <select
                value={selectedIsTcCompliant}
                onChange={(e) => setSelectedIsTcCompliant(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
              >
                <option value="">T&C Compliant?</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>

              <select
                value={selectedFrequency}
                onChange={(e) => setSelectedFrequency(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
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
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
              >
                <option value="">Interested to Work?</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>

              {/* Accurate radius moved left to keep Reset aligned at very end */}
              <input
                type="number"
                placeholder="Accurate Radius (km)"
                value={selectedAccurateRadius}
                onChange={(e) => setSelectedAccurateRadius(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
                min="0"
              />

              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={() => setShowColumnSelector((prev) => !prev)}
                  className="px-3 py-2 bg-green border border-gray-200 rounded-md text-base text-green-600 hover:bg-green-100 flex items-center gap-2"
                  title="Select columns to display"
                >
                  {/* small indicator when open */}
                  <span className="hidden sm:inline">Columns</span>
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    aria-hidden="true"
                    style={{
                      background: showColumnSelector ? "#10B981" : "transparent",
                      border: "1px solid #D1D5DB",
                    }}
                  />
                </button>
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-600 hover:bg-gray-50"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Column selector */}
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

        {/* Results + Table */}
        <div className="mb-3 text-sm text-gray-600 flex items-center gap-3">
          {loadingLeads ? (
            <>
              <Spinner size={14} /> Loading aggregators...
            </>
          ) : (
            `Showing ${sortedData.length} of ${total} aggregators`
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto tableScroll">
            <table className="w-full min-w-[900px]">
              {/* Header */}
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                <tr>
                  {/* EXPAND / COLLAPSE header cell - sticky at left:0 */}
                  <th
                    style={{
                      position: "sticky",
                      left: 0,
                      zIndex: EXPAND_COL_Z,
                      background: FROZEN_BACKGROUND,
                      borderRight: FROZEN_BORDER_RIGHT,
                      boxShadow: FROZEN_SHADOW,
                      width: EXPAND_COL_WIDTH,
                      minWidth: EXPAND_COL_WIDTH,
                    }}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase w-14"
                  ></th>

                  {visibleColumns.map((col) => {
                    const isFrozen = FROZEN_KEYS.includes(col.key as any);
                    const left = isFrozen
                      ? leftOffsetMap[col.key] ?? 0
                      : undefined;
                    const stickyStyle: React.CSSProperties | undefined =
                      isFrozen
                        ? {
                            position: "sticky",
                            left,
                            top: 0,
                            zIndex: HEADER_STICKY_Z,
                            background: FROZEN_BACKGROUND,
                            borderRight: FROZEN_BORDER_RIGHT,
                            boxShadow: FROZEN_SHADOW,
                            width: FROZEN_WIDTHS[col.key] ?? 160,
                            minWidth: FROZEN_WIDTHS[col.key] ?? 160,
                          }
                        : undefined;

                    return (
                      <th
                        key={col.key}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase"
                        style={stickyStyle}
                      >
                        {col.label}
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {sortedData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={effectiveVisibleCount}
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
                            isSelected ? "bg-emerald-50" : ""
                          }`}
                          onClick={() => openDetails(row.id as any)}
                        >
                          {/* EXPAND ICON cell (sticky at left:0) */}
                          <td
                            className="px-4 py-3"
                            style={{
                              position: "sticky",
                              left: 0,
                              zIndex: EXPAND_COL_Z - 10,
                              background: FROZEN_BACKGROUND,
                              borderRight: FROZEN_BORDER_RIGHT,
                              boxShadow: FROZEN_SHADOW,
                              width: EXPAND_COL_WIDTH,
                              minWidth: EXPAND_COL_WIDTH,
                            }}
                          >
                            {isSelected ? (
                              <ChevronUp size={16} className="text-gray-600" />
                            ) : (
                              <ChevronDown
                                size={16}
                                className="text-gray-600"
                              />
                            )}
                          </td>

                          {visibleColumns.map((col) => {
                            const isFrozen = FROZEN_KEYS.includes(
                              col.key as any
                            );
                            const left = isFrozen
                              ? leftOffsetMap[col.key] ?? 0
                              : undefined;
                            const stickyCellStyle:
                              | React.CSSProperties
                              | undefined = isFrozen
                              ? {
                                  position: "sticky",
                                  left,
                                  zIndex: BODY_STICKY_Z,
                                  background: FROZEN_BACKGROUND,
                                  borderRight: FROZEN_BORDER_RIGHT,
                                  boxShadow: FROZEN_SHADOW,
                                  width: FROZEN_WIDTHS[col.key] ?? 160,
                                  minWidth: FROZEN_WIDTHS[col.key] ?? 160,
                                }
                              : undefined;

                            return (
                              <td
                                key={col.key}
                                className="px-4 py-3 text-sm text-gray-900"
                                style={stickyCellStyle}
                              >
                                {renderCellForKey(col.key, row)}
                              </td>
                            );
                          })}
                        </tr>

                        {isSelected && (
                          <tr>
                            <td
                              colSpan={effectiveVisibleCount}
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

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
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

      {/* Toast & Confirm */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: "", type: "success" })}
      />
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
