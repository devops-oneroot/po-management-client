"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import CompanyForm from "@/src/components/form/CompanyForm";
import {
  Plus,
  Package,
  MapPin,
  Loader2,
  Users,
  Sprout,
  StickyNote,
  MoreVertical,
  Edit2,
  Trash2,
} from "lucide-react";

// Company interface
interface Company {
  id: string;
  name: string;
  village: string;
  taluk: string;
  district: string;
  state: string;
  company_logo: string | null;
  company_address: string | null;
  cropNames?: string[];
  coordinates?: { type: string; coordinates: [number, number] };
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

const OrderCard: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const [reloadKey, setReloadKey] = useState(0);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const openForm = () => setIsFormOpen(true);
  const closeForm = () => {
    setIsFormOpen(false);
    setEditingCompany(null);
  };

  const handleEdit = (company: Company, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingCompany(company);
    setOpenMenuId(null);
    setIsFormOpen(true);
  };

  const handleDelete = async (companyId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this company?")) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/po-companies/${companyId}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) throw new Error("Failed to delete company");
      setReloadKey((k) => k + 1);
      setOpenMenuId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete company");
    }
  };

  const toggleMenu = (companyId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenMenuId(openMenuId === companyId ? null : companyId);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Fetch companies
  useEffect(() => {
    const controller = new AbortController();
    const crop = searchParams.get("crop");
    const district = searchParams.get("district");
    const params = new URLSearchParams();
    if (crop) params.set("crop", crop);
    if (district) params.set("district", district);

    // Set loading state immediately
    setIsLoading(true);
    setError(null);

    async function load() {
      try {
        const qs = params.toString();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/po-companies${
            qs ? `?${qs}` : ""
          }`,
          {
            signal: controller.signal,
          }
        );
        if (!res.ok)
          throw new Error(`Failed to load companies (${res.status})`);
        const data: Company[] = await res.json();
        setCompanies(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (e.name !== "AbortError") {
          setError(e?.message || "Unable to load companies");
        }
      } finally {
        setIsLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [searchParams, reloadKey]);

  // Loading Skeleton (Minimal)
  const CompanySkeleton = () => (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden animate-pulse">
      <div className="w-full h-32 bg-slate-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-slate-200 rounded w-32" />
        <div className="h-3 bg-slate-100 rounded w-48" />
        <div className="h-px bg-slate-100" />
        <div className="flex gap-2">
          <div className="h-5 bg-slate-100 rounded w-16" />
          <div className="h-5 bg-slate-100 rounded w-20" />
        </div>
      </div>
    </div>
  );

  const totalCompanies = companies.length;

  // Loading State - Show skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-8xl mx-auto">
          {/* Header Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900 mb-1">
                  Companies
                </h1>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                </div>
              </div>
              <button
                onClick={openForm}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-medium shadow-sm transition-colors duration-150 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Onboard Company</span>
              </button>
            </div>
          </div>

          {/* Loading Skeleton Grid */}
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <CompanySkeleton key={i} />
            ))}
          </div>
        </div>

        {/* Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200 bg-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {editingCompany ? "Edit Company" : "Onboard Company"}
                  </h2>
                  <button
                    onClick={closeForm}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="max-h-[calc(90vh-80px)] overflow-y-auto">
                <CompanyForm
                  company={editingCompany}
                  onSuccess={() => {
                    setReloadKey((k) => k + 1);
                    closeForm();
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-8xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900 mb-1">
                  Companies
                </h1>
              </div>
              <button
                onClick={openForm}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-medium shadow-sm transition-colors duration-150 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Onboard Company</span>
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center max-w-2xl mx-auto shadow-sm">
            <div className="w-16 h-16 bg-red-50 rounded-lg flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Failed to Load Companies
            </h3>
            <p className="text-sm text-slate-600 mb-6">{error}</p>
            <button
              onClick={() => setReloadKey((k) => k + 1)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-medium shadow-sm transition-colors duration-150 text-sm"
            >
              <Loader2 className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>

        {/* Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200 bg-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {editingCompany ? "Edit Company" : "Onboard Company"}
                  </h2>
                  <button
                    onClick={closeForm}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="max-h-[calc(90vh-80px)] overflow-y-auto">
                <CompanyForm
                  company={editingCompany}
                  onSuccess={() => {
                    setReloadKey((k) => k + 1);
                    closeForm();
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Empty State - Only shown when there are really no companies
  if (companies.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-8xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900 mb-1">
                  Companies
                </h1>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>0 Total Companies</span>
                </div>
              </div>
              <button
                onClick={openForm}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-medium shadow-sm transition-colors duration-150 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Onboard Company</span>
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center max-w-lg mx-auto shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-6">
              <Package className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No Companies Yet
            </h3>
            <p className="text-sm text-slate-600 mb-6 max-w-sm mx-auto">
              Get started by onboarding your first company partner.
            </p>
            <button
              onClick={openForm}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-medium shadow-sm transition-colors duration-150 text-sm"
            >
              <Plus className="w-4 h-4" />
              Onboard Company
            </button>
          </div>
        </div>

        {/* Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200 bg-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {editingCompany ? "Edit Company" : "Onboard Company"}
                  </h2>
                  <button
                    onClick={closeForm}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="max-h-[calc(90vh-80px)] overflow-y-auto">
                <CompanyForm
                  company={editingCompany}
                  onSuccess={() => {
                    setReloadKey((k) => k + 1);
                    closeForm();
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Main Content - Companies exist
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Main Content */}
      <div className="max-w-8xl mx-auto">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 mb-1">
                Companies
              </h1>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>{totalCompanies} Total Companies</span>
                </div>
              </div>
            </div>
            <button
              onClick={openForm}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-medium shadow-sm transition-colors duration-150 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Onboard Company</span>
            </button>
          </div>
        </div>

        {/* Companies Grid */}
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {companies.map((company) => (
              <div
                key={company.id}
                className="relative group"
              >
                <Link href="#" className="block">
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden h-full">
                    {/* Banner / Logo */}
                    {company.company_logo ? (
                      <img
                        src={company.company_logo}
                        alt={company.name}
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.style.display = "none";
                          const fallback =
                            img.nextElementSibling as HTMLElement | null;
                          if (fallback) fallback.classList.remove("hidden");
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-32 bg-slate-100 ${company.company_logo ? "hidden" : "flex"} items-center justify-center`}>
                      <span className="text-3xl font-bold text-slate-400">
                        {company.name.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-sm font-semibold text-slate-900 truncate pr-2">
                          {company.name}
                        </h3>
                        <div className="relative">
                          <button
                            onClick={(e) => toggleMenu(company.id, e)}
                            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {openMenuId === company.id && (
                            <div className="absolute right-0 top-8 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-10 min-w-[140px]">
                              <button
                                onClick={(e) => handleEdit(company, e)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                Edit
                              </button>
                              <button
                                onClick={(e) => handleDelete(company.id, e)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Location line */}
                      <div className="mb-3 flex items-center text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                        <span className="truncate">
                          {[company.village, company.taluk, company.district]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </div>

                      <div className="mb-3 border-t border-slate-100" />

                      {/* Crops */}
                      {company.cropNames && company.cropNames.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-1.5">
                          {company.cropNames.slice(0, 6).map((crop, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                            >
                              <Sprout className="w-3 h-3" />
                              {crop}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Notes */}
                      {company.notes && (
                        <div className="flex items-start gap-1.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-md p-2">
                          <StickyNote className="w-3 h-3 text-slate-500 mt-0.5 flex-shrink-0" />
                          <p className="line-clamp-2 font-medium">
                            {company.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
        </div>

        {/* Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200 bg-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {editingCompany ? "Edit Company" : "Onboard Company"}
                  </h2>
                  <button
                    onClick={closeForm}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="max-h-[calc(90vh-80px)] overflow-y-auto">
                <CompanyForm
                  company={editingCompany}
                  onSuccess={() => {
                    setReloadKey((k) => k + 1);
                    closeForm();
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Wrapper component with Suspense boundary
const CompanyPageWithSuspense = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-slate-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-600 font-medium text-sm">Loading companies...</p>
          </div>
        </div>
      }
    >
      <OrderCard />
    </Suspense>
  );
};

export default CompanyPageWithSuspense;
