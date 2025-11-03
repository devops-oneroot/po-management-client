"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, CircleUser, Plus, Calendar, Package, IndianRupee } from "lucide-react";
import POForm from "@/src/components/form/POForm";

interface MasterPO {
  id: string;
  companyName: string;
  companyImage: string;
  village: string;
  taluk: string;
  district: string;
  cropName: string;
  expiryDate: string;
  status: string;
  quantity: number;
  poPrice: string;
}

const CompaniesPage = () => {
  const [poData, setPoData] = useState<MasterPO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"expiring" | "expired">(
    "expiring"
  );
  const [reloadKey, setReloadKey] = useState(0);
  const router = useRouter();

  // ✅ Fetch all Master POs (refetches when reloadKey changes)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/master-po`
        );
        const result = await res.json();
        setPoData(result?.data || []);
      } catch (err) {
        console.error("Error fetching PO data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [reloadKey]);

  // ✅ Navigate to PO Details Page
  const handleCardClick = (id: string) => {
    router.push(`/po/${id}`);
  };

  // ✅ Filter POs
  const today = new Date();
  const expiringPOs = poData.filter((po) => new Date(po.expiryDate) >= today);
  const expiredPOs = poData.filter((po) => new Date(po.expiryDate) < today);

  const displayedPOs = activeTab === "expiring" ? expiringPOs : expiredPOs;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 mb-1">
              Purchase Orders
            </h1>
            <p className="text-sm text-slate-500">
              {poData.length} total POs • {expiringPOs.length} active
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-medium shadow-sm transition-colors duration-150 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create PO</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab("expiring")}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors duration-150 ${
              activeTab === "expiring"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Active ({expiringPOs.length})
          </button>
          <button
            onClick={() => setActiveTab("expired")}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors duration-150 ${
              activeTab === "expired"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Expired ({expiredPOs.length})
          </button>
        </div>

        {/* PO List */}
        {loading ? (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm animate-pulse">
                <div className="space-y-4">
                  <div className="w-20 h-20 bg-slate-200 rounded-lg mx-auto"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-full"></div>
                    <div className="h-3 bg-slate-100 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : displayedPOs.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center max-w-lg mx-auto shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-6">
              <Package className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {activeTab === "expiring" ? "No Active POs" : "No Expired POs"}
            </h3>
            <p className="text-sm text-slate-600 max-w-sm mx-auto">
              {activeTab === "expiring"
                ? "No active purchase orders found."
                : "No expired purchase orders found."}
            </p>
          </div>
        ) : (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayedPOs.map((po) => {
              // 🧮 Calculate remaining days
              const expiry = new Date(po.expiryDate);
              const diffTime = expiry.getTime() - today.getTime();
              const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              const expiryText =
                remainingDays > 0
                  ? `${remainingDays} Day${remainingDays > 1 ? "s" : ""} Left`
                  : "Expired";

              const isExpired = remainingDays <= 0;

              return (
                <div
                  key={po.id}
                  onClick={() => handleCardClick(po.id)}
                  className="group cursor-pointer bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden"
                >
                  {/* Expiry Banner */}
                  <div
                    className={`text-center text-white text-xs font-medium py-2 ${
                      isExpired ? "bg-red-500" : remainingDays <= 7 ? "bg-amber-500" : "bg-green-500"
                    }`}
                  >
                    {expiryText}
                  </div>

                  {/* Company Logo */}
                  <div className="flex justify-center pt-5 pb-3">
                    {po.companyImage ? (
                      <img
                        src={po.companyImage}
                        alt={po.companyName}
                        className="w-20 h-20 rounded-lg object-cover shadow-sm"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center">
                        <CircleUser className="w-10 h-10 text-slate-400" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="px-5 pb-5">
                    <h2 className="text-sm font-semibold text-slate-900 text-center mb-1 truncate">
                      {po.companyName}
                    </h2>
                    <p className="text-xs text-slate-500 flex items-center justify-center gap-1 mb-3">
                      <MapPin className="w-3.5 h-3.5" />
                      {po.village}, {po.taluk}
                    </p>

                    {/* Crop Details */}
                    <div className="border-t border-slate-100 pt-3 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 flex items-center gap-1 font-medium">
                          <Package className="w-3.5 h-3.5 text-slate-400" />
                          {po.cropName}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                        <span className="text-slate-600 flex items-center gap-1 font-medium">
                          <Package className="w-3.5 h-3.5 text-slate-400" />
                          {po.quantity} Tons
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                        <span className="text-slate-600 flex items-center gap-1 font-semibold">
                          <IndianRupee className="w-3.5 h-3.5 text-slate-600" />
                          {po.poPrice}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(po.expiryDate).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                        po.status === "Completed"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          po.status === "Completed" ? "bg-green-500" : "bg-blue-500"
                        }`}></div>
                        {po.status || "In Progress"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 bg-white">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Create Purchase Order</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              <POForm onClose={() => {
                setShowForm(false);
                setReloadKey((k) => k + 1); // Trigger refetch
              }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompaniesPage;
