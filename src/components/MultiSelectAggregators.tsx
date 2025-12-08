"use client";

import React, { useEffect, useRef, useState } from "react";

type User = {
  id: string;
  name: string;
  village?: string | null;
  taluk?: string | null;
  district?: string | null;
  mobileNumber?: string | null;
};

type CompanyRef = {
  id: string;
  name?: string;
};

type AggregatorLead = {
  id: string;
  userId: string;
  user?: User | null;
  cropName?: string | null;
  interestsCompanies?: CompanyRef[];
};

type Props = {
  initialSelectedIds?: string[];
  onChange?: (selectedIds: string[]) => void;
  onUpdate?: (resp: any) => void;
  apiBaseUrl?: string;
  label?: string;
  searchParamName?: string;
  defaultLimit?: number;
  companyId: string;
  cropName?: string;
};

export default function MultiSelectAggregators({
  initialSelectedIds = [],
  onChange,
  onUpdate,
  apiBaseUrl = "https://markhet-internal-ngfs.onrender.com/aggregator-leads",
  label = "Aggregator leads",
  searchParamName = "search",
  defaultLimit = 20,
  companyId,
  cropName,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(defaultLimit);
  const [total, setTotal] = useState<number | null>(null);
  const [leads, setLeads] = useState<AggregatorLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [updating, setUpdating] = useState(false);

  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [selectAll, setSelectAll] = useState(false);

  // All processed leads with this company (fetched from all pages)
  const [allProcessedLeads, setAllProcessedLeads] = useState<AggregatorLead[]>([]);
  const [fetchingProcessed, setFetchingProcessed] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [visibleCount, setVisibleCount] = useState(0);

  // debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // click outside to close
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // Fetch ALL processed leads (across all pages) on mount
  useEffect(() => {
    let cancelled = false;
    setFetchingProcessed(true);

    async function fetchAllProcessedLeads() {
      try {
        const allProcessed: AggregatorLead[] = [];
        
        // First fetch to get total count
        const baseUrl = new URL(apiBaseUrl);
        baseUrl.searchParams.set("page", "1");
        baseUrl.searchParams.set("limit", "100"); // fetch in batches of 100
        
        const firstRes = await fetch(baseUrl.toString());
        if (!firstRes.ok) throw new Error("Failed to fetch");
        
        const firstJson = await firstRes.json();
        const firstPageData: AggregatorLead[] = Array.isArray(firstJson?.data) ? firstJson.data : [];
        
        // Collect processed leads from first page
        for (const lead of firstPageData) {
          const companies = Array.isArray(lead.interestsCompanies) ? lead.interestsCompanies : [];
          if (companies.some((c) => c?.id === companyId)) {
            allProcessed.push(lead);
          }
        }
        
        const totalFromMeta = firstJson?.meta?.total ?? firstJson?.meta?.pagination?.total ?? firstJson?.total ?? null;
        const totalCount = typeof totalFromMeta === "number" ? totalFromMeta : null;
        
        // If more pages exist, fetch them
        if (totalCount && totalCount > 100) {
          const totalPages = Math.ceil(totalCount / 100);
          
          for (let p = 2; p <= totalPages; p++) {
            if (cancelled) break;
            
            const url = new URL(apiBaseUrl);
            url.searchParams.set("page", String(p));
            url.searchParams.set("limit", "100");
            
            try {
              const res = await fetch(url.toString());
              if (!res.ok) continue;
              
              const json = await res.json();
              const pageData: AggregatorLead[] = Array.isArray(json?.data) ? json.data : [];
              
              for (const lead of pageData) {
                const companies = Array.isArray(lead.interestsCompanies) ? lead.interestsCompanies : [];
                if (companies.some((c) => c?.id === companyId)) {
                  allProcessed.push(lead);
                }
              }
            } catch (err) {
              console.error("Error fetching page", p, err);
            }
          }
        }
        
        if (!cancelled) {
          setAllProcessedLeads(allProcessed);
          
          // Auto-select all processed lead IDs
          const processedIds = allProcessed.map(l => l.id);
          setSelectedIds(prev => {
            const combined = new Set([...prev, ...processedIds]);
            return Array.from(combined);
          });
          
          // Pass processed leads to parent via onChange
          onChange?.(processedIds);
          
          // Also notify via onUpdate with processed leads data
          onUpdate?.({ allProcessedLeads: allProcessed });
        }
      } catch (err) {
        console.error("Error fetching all processed leads:", err);
      } finally {
        if (!cancelled) setFetchingProcessed(false);
      }
    }

    fetchAllProcessedLeads();

    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl, companyId]);

  // Fetch current page for dropdown (excluding already processed)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    async function fetchPage() {
      try {
        const u = new URL(apiBaseUrl);
        u.searchParams.set("page", String(page));
        u.searchParams.set("limit", String(limit));
        if (debouncedSearch) u.searchParams.set(searchParamName, debouncedSearch);

        const res = await fetch(u.toString());
        if (!res.ok) throw new Error("Failed to fetch aggregator leads");

        const json = await res.json();
        const pageData: AggregatorLead[] = Array.isArray(json?.data) ? json.data : [];

        if (!cancelled) {
          setLeads(pageData);
          setVisibleCount(pageData.length);

          const totalFromMeta =
            json?.meta?.total ?? json?.meta?.pagination?.total ?? json?.total ?? null;
          setTotal(typeof totalFromMeta === "number" ? totalFromMeta : null);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Could not load aggregator leads");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPage();
    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl, page, limit, debouncedSearch, searchParamName]);

  // Update select all checkbox based on visible items
  useEffect(() => {
    const processedUserIds = new Set(allProcessedLeads.map(l => l.userId));
    const availableLeads = leads.filter(l => !processedUserIds.has(l.userId));
    const visibleIds = availableLeads.map(l => l.id);
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selectedIds.includes(id));
    setSelectAll(allVisibleSelected);
  }, [leads, selectedIds, allProcessedLeads]);

  // Notify parent of selection changes
  useEffect(() => {
    onChange?.(selectedIds);
  }, [selectedIds, onChange]);

  function displayLabelFor(lead: AggregatorLead) {
    const u = lead.user;
    const name = u?.name ?? "(unknown)";
    const village = u?.village ?? "";
    const taluk = u?.taluk ?? "";
    const district = u?.district ?? "";
    const locationParts = [village, taluk, district].filter(Boolean);
    const location = locationParts.join(", ");
    return location ? `${name} — ${location}` : `${name}`;
  }

  function toggleSelect(id: string) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function handleSelectAllVisible() {
    const processedUserIds = new Set(allProcessedLeads.map(l => l.userId));
    const availableLeads = leads.filter(l => !processedUserIds.has(l.userId));
    const visibleIds = availableLeads.map(l => l.id);
    
    if (visibleIds.length === 0) return;
    
    setSelectedIds(prev => {
      const allSelected = visibleIds.every(id => prev.includes(id));
      if (allSelected) {
        return prev.filter(id => !visibleIds.includes(id));
      } else {
        const set = new Set([...prev, ...visibleIds]);
        return Array.from(set);
      }
    });
  }

  async function handleUpdateClick() {
    if (selectedIds.length === 0) {
      alert("Please select at least one aggregator lead before updating.");
      return;
    }

    // Only send IDs of newly selected items (not already processed)
    const processedUserIds = new Set(allProcessedLeads.map(l => l.userId));
    const newlySelectedLeads = leads.filter(l => 
      selectedIds.includes(l.id) && !processedUserIds.has(l.userId)
    );
    const userIdsToSend = newlySelectedLeads.map(l => l.userId).filter(Boolean) as string[];

    if (userIdsToSend.length === 0) {
      alert("No new leads to update. All selected leads are already associated.");
      return;
    }

    const payload = {
      companyId,
      userIds: userIdsToSend,
      cropName: cropName ?? undefined,
    };

    setUpdating(true);
    try {
      const base = process.env.NEXT_PUBLIC_API_URL ?? "";
      const url = base 
        ? `${base.replace(/\/$/, "")}/aggregator-leads/add-company-to-users` 
        : "/aggregator-leads/add-company-to-users";

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("API error:", data);
        alert("Error: " + (data?.message ?? "Server returned an error"));
        onUpdate?.(data);
        return;
      }

      // Add newly processed leads to the processed list
      const processed = Array.isArray(data?.processedUsers) ? data.processedUsers : [];
      const newlyProcessedUserIds: string[] = processed
        .filter((p: any) => p?.status === "created" || p?.status === "updated")
        .map((p: any) => p.userId)
        .filter(Boolean);

      if (newlyProcessedUserIds.length > 0) {
        const newlyProcessedLeads = leads.filter(l => 
          l.userId && newlyProcessedUserIds.includes(l.userId)
        );
        
        setAllProcessedLeads(prev => [...prev, ...newlyProcessedLeads]);
      }

      alert(data?.message ?? "Update successful.");
      onUpdate?.(data);
    } catch (err) {
      console.error("Update error:", err);
      alert("Something went wrong while updating.");
    } finally {
      setUpdating(false);
    }
  }

  function gotoPage(n: number) {
    const nn = Math.max(1, Math.floor(n));
    if (nn !== page) setPage(nn);
  }

  function prevPage() {
    if (page > 1) setPage(p => p - 1);
  }

  function nextPage() {
    if (total !== null) {
      const last = Math.max(1, Math.ceil(total / limit));
      setPage(p => Math.min(last, p + 1));
    } else {
      setPage(p => p + 1);
    }
  }

  function changeLimit(n: number) {
    setLimit(n);
    setPage(1);
  }

  const lastPage = total ? Math.max(1, Math.ceil(total / limit)) : null;
  const showingFrom = total ? (page - 1) * limit + 1 : null;
  const showingTo = total ? Math.min(page * limit, total) : null;

  // Filter out already processed leads from dropdown display
  const processedUserIds = new Set(allProcessedLeads.map(l => l.userId));
  // Also filter out currently selected leads (even if not yet processed)
  const selectedUserIds = new Set(
    leads.filter(l => selectedIds.includes(l.id)).map(l => l.userId)
  );
  const availableLeads = leads.filter(l => 
    !processedUserIds.has(l.userId) && !selectedUserIds.has(l.userId)
  );

  return (
    <div className="w-full" ref={wrapperRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

      <div className="flex gap-3 items-start">
        <div className="relative flex-1">
          <button
            type="button"
            onClick={() => setOpen(s => !s)}
            className="w-full text-left border bg-white rounded-lg px-3 py-2 flex justify-between items-center shadow-sm hover:ring-1 hover:ring-emerald-300"
          >
            <div className="truncate text-sm">
              {selectedIds.length === 0 ? (
                <span className="text-gray-400">Select aggregator leads...</span>
              ) : (
                <span>{`${selectedIds.length} selected`}</span>
              )}
            </div>
            <svg
              className={`w-4 h-4 ml-2 transform transition-transform ${open ? "rotate-180" : "rotate-0"}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {open && (
            <div className="absolute z-50 mt-2 w-full bg-white border rounded-lg shadow-xl">
              <div className="p-4 border-b space-y-3 bg-gray-50">
                <div className="flex gap-2">
                  <input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-300 focus:outline-none"
                    placeholder="Search name, village, taluk, district..."
                    autoFocus
                  />
                  <select
                    value={limit}
                    onChange={(e) => changeLimit(Number(e.target.value))}
                    className="px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-emerald-300 focus:outline-none"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={40}>40</option>
                    <option value={80}>80</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      id="select-all-visible"
                      type="checkbox"
                      checked={selectAll}
                      onChange={() => handleSelectAllVisible()}
                      className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="select-all-visible" className="text-sm font-medium text-gray-700">
                      Select all on this page
                    </label>
                  </div>

                  <div className="text-xs text-gray-600 font-medium">
                    {loading ? (
                      "Loading..."
                    ) : total !== null ? (
                      `${showingFrom}–${showingTo} of ${total}`
                    ) : (
                      `${visibleCount} results`
                    )}
                  </div>
                </div>
              </div>

              {/* Available leads (not yet processed) */}
              <div className="p-4">
                {loading ? (
                  <div className="py-8 text-center text-sm text-gray-500">Loading...</div>
                ) : error ? (
                  <div className="py-8 text-center text-sm text-red-500">{error}</div>
                ) : availableLeads.length === 0 ? (
                  <div className="py-8 text-center text-sm text-gray-500">
                    {allProcessedLeads.length > 0 
                      ? "All leads on this page are already associated with this company" 
                      : "No results found"}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {availableLeads.map((lead) => {
                      const id = lead.id;
                      const checked = selectedIds.includes(id);
                      return (
                        <div
                          key={id}
                          className="flex items-center gap-3 p-3 hover:bg-emerald-50 rounded-lg cursor-pointer border border-transparent hover:border-emerald-200 transition-all"
                          onClick={() => toggleSelect(id)}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleSelect(id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-900 truncate">
                              {displayLabelFor(lead)}
                            </div>
                            <div className="text-xs text-gray-600 truncate">
                              {lead.user?.mobileNumber ?? "—"}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Pagination footer */}
              <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevPage}
                    disabled={page <= 1 || loading}
                    className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed bg-white hover:bg-gray-100 transition-colors"
                  >
                    ← Prev
                  </button>
                  <button
                    onClick={nextPage}
                    disabled={(lastPage !== null && page >= lastPage) || loading}
                    className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed bg-white hover:bg-gray-100 transition-colors"
                  >
                    Next →
                  </button>
                </div>

                <div className="text-sm font-semibold text-gray-700">
                  Page {page}{lastPage ? ` of ${lastPage}` : ""}
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-600 font-medium">Jump to:</label>
                  <input
                    type="number"
                    min={1}
                    max={lastPage || undefined}
                    value={page}
                    onChange={(e) => gotoPage(Number(e.target.value))}
                    className="w-16 px-2 py-1 border rounded-lg text-sm text-center focus:ring-2 focus:ring-emerald-300 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex-shrink-0">
          <button
            type="button"
            onClick={handleUpdateClick}
            disabled={updating}
            className={`px-5 py-2 rounded-lg text-sm font-semibold shadow-md transition-all ${
              updating 
                ? "bg-emerald-400 text-white cursor-wait" 
                : "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg"
            }`}
          >
            {updating ? "Updating..." : "Update"}
          </button>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-600">
        {fetchingProcessed ? (
          <span>Loading already associated leads...</span>
        ) : (
          <>
            <span className="font-semibold">{selectedIds.length}</span> leads selected
            {allProcessedLeads.length > 0 && (
              <span className="ml-2">
                · <span className="font-semibold text-emerald-600">{allProcessedLeads.length}</span> already associated (shown in table below)
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}