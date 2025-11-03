"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, CircleUser, Plus } from "lucide-react";
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
  const router = useRouter();

  // ✅ Fetch all Master POs
  useEffect(() => {
    const fetchData = async () => {
      try {
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
  }, []);

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
    <div>
      {/* ➕ Add PO Button */}
      <div className="flex justify-end px-4 mt-4 ">
        <button
          onClick={() => setShowForm(true)}
          className="flex bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg transition-all"
        >
          <Plus size={24} />
        </button>
        {showForm && <POForm onClose={() => setShowForm(false)} />}
      </div>

      {/* Tabs */}
      <div className="flex justify-center mt-8 space-x-4">
        <button
          onClick={() => setActiveTab("expiring")}
          className={`px-6 py-2 rounded-full font-medium text-sm transition-all ${
            activeTab === "expiring"
              ? "bg-purple-600 text-white shadow-lg"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Expiring In
        </button>
        <button
          onClick={() => setActiveTab("expired")}
          className={`px-6 py-2 rounded-full font-medium text-sm transition-all ${
            activeTab === "expired"
              ? "bg-red-600 text-white shadow-lg"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Expired
        </button>
      </div>

      {/* 📦 PO List */}
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-50 px-12 py-6 relative">
        {loading ? (
          <div className="text-center text-gray-500 mt-20">Loading POs...</div>
        ) : displayedPOs.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            {activeTab === "expiring"
              ? "No active POs found."
              : "No expired POs found."}
          </div>
        ) : (
          <div className="flex flex-wrap gap-12 justify-start">
            {displayedPOs.map((po) => {
              // 🧮 Calculate remaining days
              const expiry = new Date(po.expiryDate);
              const diffTime = expiry.getTime() - today.getTime();
              const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              const expiryText =
                remainingDays > 0
                  ? `Expiring in ${remainingDays} Day${
                      remainingDays > 1 ? "s" : ""
                    }`
                  : "Expired";

              return (
                <div
                  key={po.id}
                  onClick={() => handleCardClick(po.id)}
                  className="cursor-pointer group relative w-[300px] sm:w-[340px] bg-white rounded-3xl border border-purple-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                >
                  {/* 🕒 Expiry Banner */}
                  <div
                    className={`text-center text-white text-xs font-semibold py-2 rounded-t-3xl ${
                      remainingDays > 0 ? "bg-purple-500" : "bg-red-500"
                    }`}
                  >
                    {expiryText}
                  </div>

                  {/* Header */}
                  <div className="relative bg-gradient-to-r from-purple-100 to-purple-50 h-28 flex items-start justify-between p-4 rounded-b-3xl">
                    <span className="absolute top-3 right-3 text-xs font-medium bg-purple-600 text-white px-3 py-1 rounded-full shadow">
                      {po.status || "In Progress"}
                    </span>
                    <div className="absolute left-1/2 -bottom-8 transform -translate-x-1/2 w-20 h-20 rounded-full bg-gradient-to-tr from-gray-100 to-gray-50 flex items-center justify-center ring-4 ring-white shadow-inner overflow-hidden">
                      {po.companyImage ? (
                        <img
                          src={po.companyImage}
                          alt={po.companyName}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <CircleUser className="w-10 h-10 text-gray-500" />
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="pt-12 pb-6 px-6 text-center">
                    <h2 className="text-lg font-semibold text-gray-800 tracking-tight group-hover:text-purple-700 transition-colors">
                      {po.companyName}
                    </h2>
                    <p className="text-sm text-gray-500 flex items-center justify-center gap-1 mt-1">
                      <MapPin className="w-4 h-4 text-purple-400" />
                      {po.village}, {po.taluk}
                    </p>

                    {/* Crop Details */}
                    <div className="mt-6 border border-gray-100 rounded-2xl bg-gradient-to-br from-gray-50 to-white p-4 text-left transition-all duration-300 group-hover:shadow-md">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-800">
                            {po.cropName}
                          </h3>
                          <p className="text-xs text-gray-500">
                            Expiry:{" "}
                            {new Date(po.expiryDate).toLocaleDateString(
                              "en-IN"
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-4 text-gray-700 text-sm">
                        <p className="font-medium">{po.quantity} Tons</p>
                        <p className="font-semibold text-purple-700">
                          ₹{po.poPrice}
                        </p>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="mt-5 flex justify-center gap-3">
                      <button className="text-xs px-4 py-1.5 rounded-full bg-purple-50 text-purple-700 hover:bg-purple-100 font-medium transition">
                        Specs
                      </button>
                      <button className="text-xs px-4 py-1.5 rounded-full bg-purple-50 text-purple-700 hover:bg-purple-100 font-medium transition">
                        Terms
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompaniesPage;
