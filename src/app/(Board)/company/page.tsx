"use client";

import React, { useEffect, useState } from "react";
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/po-companies/${companyId}`, {
        method: "DELETE",
      });
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

    async function load() {
      try {
        setIsLoading(true);
        setError(null);
        const qs = params.toString();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/po-companies${qs ? `?${qs}` : ""}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Failed to load companies (${res.status})`);
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

  // Loading Skeleton
  const CompanySkeleton = () => (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200" />
      <div className="p-6 space-y-4">
        <div className="h-6 bg-gray-200 rounded w-32" />
        <div className="h-4 bg-gray-200 rounded w-48" />
        <div className="h-px bg-gray-100" />
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 rounded-full w-20" />
          <div className="h-6 bg-gray-200 rounded-full w-24" />
          <div className="h-6 bg-gray-200 rounded-full w-16" />
        </div>
        <div className="h-12 bg-gray-100 rounded-lg" />
      </div>
    </div>
  );

  const totalCompanies = companies.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Main Content */}
      <div className="max-w-8xl mx-auto px-3 py-3">
        {/* Header Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1 tracking-tight">Companies</h2>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                {isLoading ? (
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                ) : (
                  <>
                    <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-md font-semibold shadow-sm">
                      <Users className="w-3 h-3" /> 
                      <span>{totalCompanies} Total</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={openForm}
              className="group inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 font-semibold text-xs"
            >
              <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" />
              <span>Onboard Company</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {[...Array(8)].map((_, i) => (
              <CompanySkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-white rounded-3xl p-12 text-center max-w-2xl mx-auto border border-red-100">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Companies</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
            >
              <Loader2 className="w-4 h-4" />
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && companies.length === 0 && (
          <div className="bg-white rounded-3xl p-16 text-center max-w-2xl mx-auto border border-gray-100">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Companies Yet</h3>
            <p className="text-gray-600 mb-6">Get started by onboarding your first company partner.</p>
            <button
              onClick={openForm}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-colors"
            >
              <Plus className="w-5 h-5" />
              Onboard Company
            </button>
          </div>
        )}

        {/* Companies Grid */}
        {!isLoading && !error && companies.length > 0 && (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {companies.map((company) => (
                <div
                  key={company.id}
                  className="relative group block transform transition-all duration-300"
                >
                  <Link href="#" className="block">
                  <div className="bg-white rounded-3xl border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden">
                    {/* Banner / Logo */}
                    {company.company_logo ? (
                      <img
                        src={company.company_logo}
                        alt={company.name}
                        className="w-full h-40 object-cover"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.style.display = "none";
                          const fallback = img.nextElementSibling as HTMLElement | null;
                          if (fallback) fallback.classList.remove("hidden");
                        }}
                      />
                    ) : null}
                    <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 hidden items-center justify-center">
                      <span className="text-3xl font-bold text-gray-400">{company.name.charAt(0).toUpperCase()}</span>
                    </div>

                    <div className="p-3">
                      <div className="flex items-start justify-between mb-1.5">
                        <h3 className="text-sm font-bold text-gray-900 truncate pr-2 tracking-tight">
                          {company.name}
                        </h3>
                        <div className="relative">
                          <button
                            onClick={(e) => toggleMenu(company.id, e)}
                            className="text-gray-400 hover:text-purple-600 p-1.5 rounded-lg hover:bg-purple-50 transition-all"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          {openMenuId === company.id && (
                            <div className="absolute right-0 top-10 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-10 min-w-[160px]">
                              <button
                                onClick={(e) => handleEdit(company, e)}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                                Edit
                              </button>
                              <button
                                onClick={(e) => handleDelete(company.id, e)}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Location line */}
                      <div className="flex items-center text-[10px] text-gray-600 mb-2 font-medium">
                        <MapPin className="w-3 h-3 mr-1 text-purple-500 flex-shrink-0" />
                        <span className="truncate">
                          {[company.village, company.taluk, company.district].filter(Boolean).join(", ")}
                        </span>
                      </div>

                      <div className="border-t border-gray-100" />

                      {/* Crops */}
                      {company.cropNames && company.cropNames.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {company.cropNames.slice(0,6).map((crop, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm hover:bg-emerald-100 transition-colors"
                            >
                              <Sprout className="w-2.5 h-2.5" />
                              {crop}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Notes */}
                      {company.notes && (
                        <div className="mt-2 flex items-start gap-1 text-[10px] text-gray-700 bg-gray-50 border border-gray-200 rounded-md p-2 hover:bg-gray-100 transition-colors">
                          <StickyNote className="w-3 h-3 text-purple-500 mt-0.5 flex-shrink-0" />
                          <p className="line-clamp-2 font-medium">{company.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  </Link>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Enhanced Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden relative animate-slide-up border border-white/30">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 z-20">
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                      {editingCompany ? 'Edit Company' : 'Onboard Company'}
                    </h2>
                    <p className="text-sm text-purple-100 font-medium">
                      {editingCompany ? 'Update company information' : 'Fill in the details below'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeForm}
                  className="group p-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-200 hover:scale-110 active:scale-95"
                >
                  <svg
                    className="w-5 h-5 text-white transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-0">
              <CompanyForm 
                company={editingCompany} 
                onSuccess={() => { setReloadKey((k) => k + 1); closeForm(); }} 
              />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            backdrop-filter: blur(0px);
          }
          to {
            opacity: 1;
            backdrop-filter: blur(12px);
          }
        }
        @keyframes slide-up {
          from {
            transform: translateY(40px) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-slide-up {
          animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};

// (Header removed by request)

export default OrderCard;
