"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import MultiSelectAggregators from "../../../../components/MultiSelectAggregators";
import {
  MapPin,
  Users,
  Phone,
  Package2,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface Company {
  id: string;
  name: string;
  village: string;
  taluk: string;
  district: string;
  state: string;
  company_logo: string | null;
  company_address: string | null;
  contactPersonName?: string | null;
  contactPersonNumber?: string | null;
  gstNumber?: string | null;
  cropNames?: string[];
  notes?: string | null;
  createdAt: string;
}

const CompanyDetailsPage = () => {
  const params = useParams() as { id?: string };
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<any[]>([]);
  const [fetchingPreview, setFetchingPreview] = useState(false);
  
  // Store all processed leads returned by the child component
  const [allProcessedLeads, setAllProcessedLeads] = useState<any[]>([]);
  
  // State for removing leads
  const [removingLeadId, setRemovingLeadId] = useState<string | null>(null);
  
  // Pagination state for selected leads preview
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Handler to receive selection changes from child component (only sets IDs)
  function handleSelectionChange(ids: string[]) {
    setSelectedLeadIds(ids);
  }

  // Handle onUpdate (server response when Update button pressed inside the child).
  function handleAggregatorsUpdate(resp: any) {
    if (!resp) return;

    // Store all processed leads from the component
    if (resp?.allProcessedLeads && Array.isArray(resp.allProcessedLeads)) {
      setAllProcessedLeads(resp.allProcessedLeads);
      return;
    }

    // If child returned an array of leads directly
    if (Array.isArray(resp)) {
      setSelectedLeads(resp);
      return;
    }

    // If backend returned a processedUsers array (with userId + status), try to fetch corresponding leads
    if (resp?.processedUsers && Array.isArray(resp.processedUsers)) {
      const userIds = resp.processedUsers.map((p: any) => p.userId).filter(Boolean);
      if (userIds.length === 0) return;

      // Try to fetch lead objects by userId using the listing endpoint
      const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
      (async () => {
        const out: any[] = [];
        for (const uid of userIds) {
          try {
            const res = await fetch(`${base}/aggregator-leads?page=1&limit=1&userId=${encodeURIComponent(uid)}`);
            if (!res.ok) continue;
            const j = await res.json();
            const lead = Array.isArray(j?.data) && j.data.length > 0 ? j.data[0] : (j?.data ?? null);
            if (lead) out.push(lead);
          } catch (err) {
            continue;
          }
        }
        if (out.length > 0) setSelectedLeads(out);
      })();
      return;
    }

    // Fallback: if resp.data is an array of leads
    if (Array.isArray(resp?.data)) {
      setSelectedLeads(resp.data);
    }
  }

  // Fetch company details on mount / params change
  useEffect(() => {
    if (!params?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/po-companies/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => setCompany(data))
      .catch(() => {
        router.back();
      })
      .finally(() => setLoading(false));
  }, [params?.id, router]);

  // Debounced preview fetch: when selectedLeadIds change, fetch full lead objects (debounced)
  useEffect(() => {
    if (!selectedLeadIds || selectedLeadIds.length === 0) {
      setSelectedLeads([]);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    const signal = controller.signal;

    setFetchingPreview(true);
    const t = setTimeout(async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
        const bulkUrl = `${base}/aggregator-leads/bulk?ids=${encodeURIComponent(selectedLeadIds.join(","))}`;
        try {
          const br = await fetch(bulkUrl, { signal });
          if (br.ok) {
            const bj = await br.json();
            const leads = Array.isArray(bj?.data) ? bj.data : Array.isArray(bj) ? bj : (bj?.data ? [bj.data] : []);
            if (!cancelled) {
              setSelectedLeads(leads);
              setFetchingPreview(false);
            }
            return;
          }
        } catch (err) {
          // fallback
        }

        const fetched: any[] = [];
        for (const id of selectedLeadIds) {
          if (cancelled) break;
          try {
            const r = await fetch(`${base}/aggregator-leads/${encodeURIComponent(id)}`, { signal });
            if (!r.ok) continue;
            const json = await r.json();
            const leadObj = json?.data ?? json;
            if (leadObj) fetched.push(leadObj);
          } catch (err) {
            continue;
          }
        }
        if (!cancelled) setSelectedLeads(fetched);
      } catch (err) {
        console.error("preview fetch error", err);
      } finally {
        if (!cancelled) setFetchingPreview(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(t);
    };
  }, [selectedLeadIds]);

  // Combine processed leads and newly selected leads for display
  const displayLeads = React.useMemo(() => {
    const leadsMap = new Map();
    
    // Add all processed leads first
    allProcessedLeads.forEach((lead: any) => {
      if (lead?.id) leadsMap.set(lead.id, lead);
    });
    
    // Add selected leads (may overlap with processed)
    selectedLeads.forEach((lead: any) => {
      if (lead?.id) leadsMap.set(lead.id, lead);
    });
    
    return Array.from(leadsMap.values());
  }, [allProcessedLeads, selectedLeads]);

  // Calculate pagination based on displayLeads (combined processed + selected)
  const totalPages = Math.ceil(displayLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLeads = displayLeads.slice(startIndex, endIndex);

  // Reset to page 1 when display leads change
  useEffect(() => {
    setCurrentPage(1);
  }, [displayLeads.length]);

  // Function to remove a lead from company association
  async function handleRemoveLead(lead: any) {
    if (!lead?.userId) {
      alert("Cannot remove this lead - missing user ID");
      return;
    }

    const confirmed = confirm(`Are you sure you want to remove ${lead.user?.name || 'this lead'} from this company?`);
    if (!confirmed) return;

    setRemovingLeadId(lead.id);
    
    try {
      const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
      const url = `${base}/aggregator-leads/remove-company-from-user`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: company?.id,
          userId: lead.userId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("API error:", data);
        alert("Error: " + (data?.message ?? "Failed to remove lead"));
        return;
      }

      // Remove from allProcessedLeads
      setAllProcessedLeads(prev => prev.filter(l => l.userId !== lead.userId));
      
      // Remove from selectedLeads
      setSelectedLeads(prev => prev.filter(l => l.userId !== lead.userId));
      
      // Remove from selectedLeadIds
      setSelectedLeadIds(prev => prev.filter(id => id !== lead.id));

      alert(data?.message ?? "Lead removed successfully");
    } catch (err) {
      console.error("Remove error:", err);
      alert("Something went wrong while removing the lead");
    } finally {
      setRemovingLeadId(null);
    }
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
      </div>
    );

  if (!company)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Company not found</p>
      </div>
    );

  return (
    <div className="w-full px-6 py-6 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] xl:grid-cols-[450px_1fr] gap-6">
        {/* Left: company details - narrow column */}
        <div className="flex flex-col gap-5">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
              <Link
                href="/company"
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-sm font-medium transition-colors"
              >
                Back
              </Link>
            </div>

            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
              {company.company_logo ? (
                <img
                  src={company.company_logo}
                  alt={company.name}
                  className="w-24 h-24 rounded-xl object-cover shadow-md border-2 border-gray-100"
                />
              ) : (
                <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-3xl font-bold text-white shadow-md">
                  {company.name[0]}
                </div>
              )}
              <div className="flex-1">
                <div className="text-sm text-gray-600 flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-600" />
                  <span className="leading-relaxed">
                    {company.village}
                    {company.taluk ? `, ${company.taluk}` : ""}, {company.district},{" "}
                    {company.state}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <section className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-5">
            {company.contactPersonName || company.contactPersonNumber ? (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-blue-700 font-medium">Contact Person</p>
                    <p className="font-semibold text-base text-gray-900">{company.contactPersonName || "—"}</p>
                  </div>
                </div>

                {company.contactPersonNumber && (
                  <div className="flex items-center gap-2 pl-2 pt-3 border-t border-blue-200">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <p className="font-mono text-sm font-bold text-gray-900">
                      {company.contactPersonNumber}
                    </p>
                  </div>
                )}
              </div>
            ) : null}

            {company.gstNumber && (
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-amber-700 font-semibold mb-1">GST Number</p>
                    <p className="font-mono text-base font-bold tracking-wide text-gray-900">
                      {company.gstNumber}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            )}

            {company.company_address && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <Package2 className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 font-semibold mb-1">Address</p>
                    <p className="text-sm text-gray-800 leading-relaxed">{company.company_address}</p>
                  </div>
                </div>
              </div>
            )}

            {company.cropNames && company.cropNames.length > 0 && (
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                <p className="text-xs text-emerald-700 font-semibold mb-3">Crops Handled</p>
                <div className="flex flex-wrap gap-2">
                  {company.cropNames.map((c) => (
                    <span
                      key={c}
                      className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-700 text-sm font-medium rounded-lg shadow-sm"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {company.notes && (
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <p className="text-xs text-purple-700 font-semibold mb-2">Notes</p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {company.notes}
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Right: MultiSelect + Selection Preview - wide column */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="mb-6 pb-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Aggregators Interested</h2>
            <p className="text-sm text-gray-600">select leads to associate with this company</p>
          </div>

          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200 mb-6">
            <MultiSelectAggregators
              initialSelectedIds={[]}
              companyId={company.id}
              cropName={company.cropNames?.[0]}
              onUpdate={(resp) => {
                handleAggregatorsUpdate(resp);
              }}
              onChange={(ids: string[]) => {
                handleSelectionChange(ids);
              }}
              apiBaseUrl="https://markhet-internal-ngfs.onrender.com/aggregator-leads"
            />
          </div>

          <div className="mt-6 pt-6 border-t-2 border-gray-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                Associated Leads 
                {displayLeads.length > 0 && (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-bold rounded-full">
                    {displayLeads.length} Total
                  </span>
                )}
              </h3>
              {fetchingPreview && (
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                </div>
              )}
            </div>

            {!fetchingPreview && displayLeads.length === 0 ? (
              <div className="text-sm text-gray-400 text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No leads associated yet</p>
                <p className="text-xs mt-1">Select leads from the dropdown above to associate them</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-xl border-2 border-gray-200 shadow-sm">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-bold border-r border-emerald-500">#</th>
                        <th className="px-4 py-3 text-left text-sm font-bold border-r border-emerald-500">Name</th>
                        <th className="px-4 py-3 text-left text-sm font-bold border-r border-emerald-500">Village</th>
                        <th className="px-4 py-3 text-left text-sm font-bold border-r border-emerald-500">Taluk</th>
                        <th className="px-4 py-3 text-left text-sm font-bold border-r border-emerald-500">District</th>
                        <th className="px-4 py-3 text-left text-sm font-bold border-r border-emerald-500">Mobile Number</th>
                        {/* <th className="px-4 py-3 text-center text-sm font-bold">Action</th> */}
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {currentLeads.map((l: any, index: number) => {
                        const actualIndex = startIndex + index;
                        return (
                          <tr 
                            key={l.id} 
                            className={`
                              ${actualIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'} 
                              hover:bg-emerald-50 transition-colors border-b border-gray-200
                            `}
                          >
                            <td className="px-4 py-3 text-sm font-medium text-gray-700 border-r border-gray-200">
                              {actualIndex + 1}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-900 border-r border-gray-200">
                              {l.user?.name ?? l.userId ?? l.id}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              {l.user?.village || '—'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              {l.user?.taluk || '—'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 border-r border-gray-200">
                              {l.user?.district || '—'}
                            </td>
                            <td className="px-4 py-3 text-sm font-mono font-medium text-gray-900 border-r border-gray-200">
                              {l.user?.mobileNumber || '—'}
                            </td>
                            {/* <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => handleRemoveLead(l)}
                                disabled={removingLeadId === l.id}
                                className={`
                                  px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                                  ${removingLeadId === l.id
                                    ? 'bg-gray-300 text-gray-500 cursor-wait'
                                    : 'bg-red-100 text-red-700 hover:bg-red-600 hover:text-white border border-red-300 hover:border-red-600'
                                  }
                                `}
                                title="Remove this lead from company"
                              >
                                {removingLeadId === l.id ? (
                                  <span className="flex items-center gap-1">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Removing...
                                  </span>
                                ) : (
                                  'Remove'
                                )}
                              </button>
                            </td> */}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 px-2">
                    <div className="text-sm text-gray-600">
                      Showing <span className="font-semibold">{startIndex + 1}</span> to{" "}
                      <span className="font-semibold">{Math.min(endIndex, displayLeads.length)}</span> of{" "}
                      <span className="font-semibold">{displayLeads.length}</span> leads
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className={`
                          px-4 py-2 rounded-lg font-medium text-sm transition-all
                          ${currentPage === 1 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm hover:shadow-md'
                          }
                        `}
                      >
                        Previous
                      </button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`
                              w-10 h-10 rounded-lg font-semibold text-sm transition-all
                              ${currentPage === page
                                ? 'bg-emerald-600 text-white shadow-md'
                                : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-emerald-300 hover:bg-emerald-50'
                              }
                            `}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className={`
                          px-4 py-2 rounded-lg font-medium text-sm transition-all
                          ${currentPage === totalPages 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm hover:shadow-md'
                          }
                        `}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetailsPage;