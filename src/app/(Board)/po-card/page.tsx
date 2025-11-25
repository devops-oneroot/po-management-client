"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Plus,
  Package,
  IndianRupee,
  Truck,
  FileText,
} from "lucide-react";
import POForm from "@/src/components/form/POForm";

interface Assignee {
  name: string;
  promisedQuantity: string;
  promisedQuantityMeasure: string;
  assigneeTruckNo: string | null;
  mobileNumber: string | null;
  status: string;
}

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
  suppliedQuantity: number;
  assignees: Assignee[];
  po: {
    id: string;
    companyName: string;
    cropName: string;
  };
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/master-po`);
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

  const handleCardClick = (id: string) => {
    router.push(`/po/${id}`);
  };

  const handleAssigneeClick = (mobile: string) => {
    router.push(`/assignee/${mobile}`);
  };

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
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-medium shadow-sm transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Create PO
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab("expiring")}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
              activeTab === "expiring"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Active ({expiringPOs.length})
          </button>
          <button
            onClick={() => setActiveTab("expired")}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
              activeTab === "expired"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Expired ({expiredPOs.length})
          </button>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-slate-200 p-6 animate-pulse"
              >
                <div className="h-32 bg-slate-200 rounded mb-4"></div>
                <div className="space-y-3">
                  <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-100 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : displayedPOs.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">
              {activeTab === "expiring" ? "No active POs" : "No expired POs"}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {displayedPOs.map((po) => {
              const expiry = new Date(po.expiryDate);
              const diffDays = Math.ceil(
                (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
              );
              const isExpired = diffDays <= 0;

              // Extract PO Number (short format)
              const poNumber = po.po?.id
                ? `PO-${po.po.id.slice(0, 8).toUpperCase()}`
                : "N/A";

              return (
                <div
                  key={po.id}
                  onClick={() => handleCardClick(po.id)}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all cursor-pointer overflow-hidden"
                >
                  {/* Expiry Banner */}
                  <div
                    className={`text-center text-white text-xs font-semibold py-2 ${
                      isExpired
                        ? "bg-red-500"
                        : diffDays <= 7
                        ? "bg-amber-500"
                        : "bg-green-500"
                    }`}
                  >
                    {isExpired
                      ? "Expired"
                      : `${diffDays} Day${diffDays > 1 ? "s" : ""} Left`}
                  </div>

                  <div className="p-5">
                    {/* First Row: Logo + Company + Location + Qty */}
                    <div className="flex items-start gap-4 mb-4">
                      <img
                        src={po.companyImage}
                        alt={po.companyName}
                        className="w-16 h-16 rounded-lg object-cover shadow-sm flex-shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-900 truncate">
                            {po.companyName}
                          </h3>
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">
                            {poNumber}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {po.village}, {po.taluk}, {po.district}
                        </p>
                        <div className="flex gap-6 mt-2 text-xs">
                          <div>
                            <span className="text-slate-500">Required:</span>{" "}
                            <strong>{po.quantity} TON</strong>
                          </div>
                          <div>
                            <span className="text-slate-500">Supplied:</span>{" "}
                            <strong className="text-green-600">
                              {po.suppliedQuantity} TON
                            </strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Second Row: Crop, Quantity, Price */}
                    <div className="bg-slate-50 rounded-lg p-lg p-4 mb-5 grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Crop</div>
                        <div className="font-bold text-slate-900 text-sm">
                          {po.cropName}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">
                          Total Qty
                        </div>
                        <div className="font-bold text-slate-900 text-sm">
                          {po.quantity} TON
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">
                          Company Price
                        </div>
                        <div className="font-bold text-slate-900 text-sm flex items-center justify-center gap-1">
                          <IndianRupee className="w-4 h-4" />
                          {po.poPrice}/qtl
                        </div>
                      </div>
                    </div>

                    {/* Assignee Table */}
                    {/* {po.assignees.length > 0 ? (
                      <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                        <div className="bg-slate-100 grid grid-cols-5 font-semibold text-slate-700 px-3 py-2.5 border-b border-slate-200">
                          <div>Name</div>
                          <div>Promised Qty</div>
                          <div>Truck No</div>
                          <div>MobileNumber</div>
                          <div>Status</div>
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          {po.assignees.map((assignee, idx) => (
                            <div
                              key={idx}
                              className="grid grid-cols-4 px-3 py-2.5 border-t border-slate-100 hover:bg-slate-50 transition"
                            >
                              <div className="font-medium truncate">
                                {assignee.name}
                              </div>
                              <div>
                                {assignee.promisedQuantity}{" "}
                                <span className="text-slate-500 text-xs">
                                  {assignee.promisedQuantityMeasure === "TON"
                                    ? "T"
                                    : assignee.promisedQuantityMeasure ===
                                      "QUINTAL"
                                    ? "Q"
                                    : "KG"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                {assignee.assigneeTruckNo ? (
                                  <>
                                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="font-mono text-xs">
                                      {assignee.assigneeTruckNo}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-slate-400 text-xs">
                                    —
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1">
                                {assignee.mobileNumber ? (
                                  <>
                                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="font-mono text-xs">
                                      {assignee.mobileNumber}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-slate-400 text-xs">
                                    —
                                  </span>
                                )}
                              </div>

                              <div>
                                <span
                                  className={`px-2 py-1 rounded text-[11px] font-medium ${
                                    assignee.status === "COMPLETED"
                                      ? "bg-green-100 text-green-700"
                                      : assignee.status === "CANCELLED"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-blue-100 text-blue-700"
                                  }`}
                                >
                                  {assignee.status === "PO_ASSIGNED"
                                    ? "Assigned"
                                    : assignee.status.replace(/_/g, " ")}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-center text-xs text-slate-500 py-6 bg-slate-50 rounded-lg">
                        No assignees yet
                      </p>
                    )} */}
                    {po.assignees.length > 0 ? (
                      <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                        <div className="bg-slate-100 grid grid-cols-5 font-semibold text-slate-700 px-3 py-2.5 border-b border-slate-200">
                          <div>Name</div>
                          <div>Promised Qty</div>
                          <div>Truck No</div>
                          <div>Mobile </div>
                          <div>Status</div>
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          {po.assignees.map((assignee, idx) => (
                            <div
                              key={idx}
                              className="grid grid-cols-5 px-3 py-2.5 border-t border-slate-100 hover:bg-slate-50 transition"
                            >
                              {/* Name */}
                              <div className="font-medium truncate">
                                {assignee.name}
                              </div>

                              {/* Promised Qty */}
                              <div>
                                {assignee.promisedQuantity}{" "}
                                <span className="text-slate-500 text-xs">
                                  {assignee.promisedQuantityMeasure === "TON"
                                    ? "T"
                                    : assignee.promisedQuantityMeasure ===
                                      "QUINTAL"
                                    ? "Q"
                                    : "KG"}
                                </span>
                              </div>

                              {/* Truck No */}
                              <div className="flex items-center gap-1">
                                {assignee.assigneeTruckNo ? (
                                  <>
                                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="font-mono text-xs">
                                      {assignee.assigneeTruckNo}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-slate-400 text-xs">
                                    —
                                  </span>
                                )}
                              </div>

                              {/* Mobile Number - CLICKABLE */}
                              <div
                                className="flex items-center gap-1 cursor-pointer text-blue-600 hover:text-blue-800 hover:underline font-mono text-xs"
                                onClick={(e) => {
                                  e.stopPropagation(); // This is the key!
                                  if (assignee.mobileNumber) {
                                    handleAssigneeClick(assignee.mobileNumber);
                                  }
                                }}
                              >
                                {assignee.mobileNumber ? (
                                  <>
                                    <FileText className="w-3.5 h-3.5 text-blue-500" />
                                    <span>{assignee.mobileNumber}</span>
                                  </>
                                ) : (
                                  <span className="text-slate-400">—</span>
                                )}
                              </div>

                              {/* Status */}
                              <div className="px-4">
                                <span
                                  className={`px-2 py-1 rounded text-[11px] font-medium ${
                                    assignee.status === "COMPLETED"
                                      ? "bg-green-100 text-green-700"
                                      : assignee.status === "CANCELLED"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-blue-100 text-blue-700"
                                  }`}
                                >
                                  {assignee.status === "PO_ASSIGNED"
                                    ? "Assigned"
                                    : assignee.status.replace(/_/g, " ")}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-center text-xs text-slate-500 py-6 bg-slate-50 rounded-lg">
                        No assignees yet
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create PO Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Create Purchase Order</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              <POForm
                onClose={() => {
                  setShowForm(false);
                  setReloadKey((k) => k + 1);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompaniesPage;
