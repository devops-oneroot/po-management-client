"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import CompanyForm from "@/components/form/CompanyForm";
import {
  Plus,
  Search,
  MapPin,
  Loader2,
  Users,
  MoreVertical,
  Edit2,
  Trash2,
  Phone,
  Building2,
  Package2,
  CheckCircle2,
} from "lucide-react";

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

const CompanyDashboard = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const crop = searchParams.get("crop");
    const district = searchParams.get("district");
    const params = new URLSearchParams();
    if (crop) params.set("crop", crop);
    if (district) params.set("district", district);

    setIsLoading(true);

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/po-companies?${params}`, {
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setCompanies(Array.isArray(data) ? data : []))
      .catch(() => {
        /* silent */
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [searchParams, reloadKey]);

  const filteredCompanies = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cropNames?.some((crop) =>
        crop.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const total = filteredCompanies.length;

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
            Partner Companies
          </h1>

          <p className="text-lg md:text-xl text-emerald-100 max-w-2xl mx-auto">
            Your verified agricultural partners — all in one trusted network
          </p>

          {/* Stats Section */}
          <div className="mt-10 flex flex-wrap justify-center gap-6 md:gap-12">
            <div className="bg-white/10 backdrop-blur-md px-8 py-4 rounded-xl shadow-md border border-white/20">
              <div className="text-3xl font-bold">{companies.length}</div>
              <div className="text-sm opacity-90">Total Partners</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-8 py-4 rounded-xl shadow-md border border-white/20">
              <div className="text-3xl font-bold">
                {new Set(companies.map((c) => c.district)).size}
              </div>
              <div className="text-sm opacity-90">Districts Covered</div>
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-gray-50 -mt-8">
        <div className="max-w-8xl mx-auto px-6 py-12">
          {/* Search Bar */}
          <div className="mb-10 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by company, district, crop..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-5 py-4 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-pulse"
                >
                  <div className="h-44 bg-gradient-to-br from-gray-200 to-gray-300" />
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-100 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty / No Results */}
          {!isLoading && total === 0 && (
            <div className="text-center py-20">
              <div className="w-32 h-32 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <Building2 className="w-16 h-16 text-emerald-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {searchTerm ? "No companies found" : "No companies onboarded yet"}
              </h2>
              <p className="text-gray-600 mb-8">
                {searchTerm ? "Try a different search term" : "Start adding your first partner"}
              </p>
            </div>
          )}

          {/* Companies Grid */}
          {!isLoading && total > 0 && (
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredCompanies.map((company) => (
                <Link
                  key={company.id}
                  href={`/company/${company.id}`}
                  className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 transition-all duration-300 hover:-translate-y-2 overflow-hidden"
                  // Ensure keyboard focus shows as a link
                  tabIndex={0}
                >
                  {/* Header with Logo */}
                  <div className="h-44 bg-gradient-to-br from-emerald-500 to-teal-600 relative">
                    {company.company_logo ? (
                      <img
                        src={company.company_logo}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover opacity-20"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="absolute bottom-4 left-6">
                      {company.company_logo ? (
                        <img
                          src={company.company_logo}
                          alt={company.name}
                          className="w-20 h-20 rounded-full border-4 border-white shadow-xl object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-3xl font-bold text-emerald-600 shadow-xl">
                          {company.name[0]}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Name + Menu */}
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900">{company.name}</h3>

                      {/* stopPropagation so this button doesn't trigger the Link */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setOpenMenuId(openMenuId === company.id ? null : company.id);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition"
                        aria-label={`Open menu for ${company.name}`}
                      >
                        <MoreVertical className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>

                    {/* Location */}
                    <div className="flex items-center text-gray-600 mb-5">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="text-sm">{company.village}, {company.district}</span>
                    </div>

                    {/* Crops */}
                    {company.cropNames && company.cropNames.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-5">
                        {company.cropNames.slice(0, 3).map((crop) => (
                          <span key={crop} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
                            {crop}
                          </span>
                        ))}
                        {company.cropNames.length > 3 && (
                          <span className="text-xs text-gray-500">+{company.cropNames.length - 3}</span>
                        )}
                      </div>
                    )}

                    {/* Contact & GST Footer */}
                    <div className="pt-5 border-t mt-2 border-gray-200 space-y-4 bg-gray-50 -m-6 p-6 rounded-b-2xl">
                      {/* Contact Person + Phone */}
                      {(company.contactPersonName || company.contactPersonNumber) && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Contact Person</p>
                              <p className="font-bold text-gray-900">{company.contactPersonName || "—"}</p>
                            </div>
                          </div>

                          {company.contactPersonNumber && (
                            <div className="text-right">
                              <p className="text-xs text-gray-600 flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5" /> Phone
                              </p>
                              <p className="font-mono text-lg font-black text-emerald-700">{company.contactPersonNumber}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* GST Number */}
                      {company.gstNumber && (
                        <div className="flex items-center justify-between bg-amber-50 rounded-xl p-4 border border-amber-200">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                              GST
                            </div>
                            <div>
                              <p className="text-xs text-amber-700 font-medium">GSTIN</p>
                              <p className="font-mono text-xl font-black text-amber-900 tracking-widest">{company.gstNumber}</p>
                            </div>
                          </div>
                          <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                      )}

                      {/* Address */}
                      {company.company_address && (
                        <div className="flex items-start gap-3 text-sm text-gray-700">
                          <Package2 className="w-5 h-5 mt-0.5 text-gray-400" />
                          <p>{company.company_address}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dropdown Menu */}
                  {openMenuId === company.id && (
                    <div
                      className="absolute top-52 right-6 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 pointer-events-auto"
                      // prevent clicks from bubbling to the Link
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setEditingCompany(company);
                          setIsFormOpen(true);
                          setOpenMenuId(null);
                        }}
                        className="w-full px-6 py-3 text-left hover:bg-gray-50 flex items-center gap-3"
                      >
                        <Edit2 className="w-4 h-4" /> Edit
                      </button>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          if (confirm("Delete this company?")) {
                            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/po-companies/${company.id}`, { method: "DELETE" });
                            setReloadKey((k) => k + 1);
                          }
                          setOpenMenuId(null);
                        }}
                        className="w-full px-6 py-3 text-left hover:bg-red-50 flex items-center gap-3 text-red-600"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsFormOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-40"
        aria-label="Add new company"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* Modal */}
      {isFormOpen && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setIsFormOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">{editingCompany ? "Edit Company" : "Onboard New Company"}</h2>
              <button
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingCompany(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-100px)] p-6">
              <CompanyForm
                company={editingCompany}
                onSuccess={() => {
                  setReloadKey((k) => k + 1);
                  setIsFormOpen(false);
                  setEditingCompany(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const CompanyPageWithSuspense = () => (
  <Suspense
    fallback={
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
      </div>
    }
  >
    <CompanyDashboard />
  </Suspense>
);

export default CompanyPageWithSuspense;