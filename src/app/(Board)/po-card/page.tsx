"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Plus,
  Package,
  IndianRupee,
  Truck,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import POForm from "@/src/components/form/POForm";

interface Assignee {
  name: string;
  promisedQuantity: string;
  promisedQuantityMeasure: string;
  assigneeTruckNo: string | null;
  assigneeRate: string | null;
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
  assignees?: Assignee[];
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

  // Format date: 29 Nov 2025
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/master-po`);
        const result = await res.json();

        // Normalize data: ensure assignees is always an array
        const normalizedData = (result?.data || []).map((po: MasterPO) => ({
          ...po,
          assignees: Array.isArray(po.assignees) ? po.assignees : [],
        }));

        setPoData(normalizedData);
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

  const today = new Date();
  const expiringPOs = poData.filter((po) => new Date(po.expiryDate) >= today);
  const expiredPOs = poData.filter((po) => new Date(po.expiryDate) < today);
  const displayedPOs = activeTab === "expiring" ? expiringPOs : expiredPOs;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Purchase Orders
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {poData.length} total • {expiringPOs.length} active •{" "}
              {expiredPOs.length} expired
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium shadow-md transition-all text-sm"
          >
            <Plus className="w-5 h-5" />
            Create PO
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-3 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("expiring")}
            className={`pb-3 px-1 font-medium text-sm border-b-2 transition-all ${
              activeTab === "expiring"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Active ({expiringPOs.length})
          </button>
          <button
            onClick={() => setActiveTab("expired")}
            className={`pb-3 px-1 font-medium text-sm border-b-2 transition-all ${
              activeTab === "expired"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700"
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
                className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse"
              >
                <div className="h-10 bg-slate-200 rounded mb-4"></div>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-slate-200 rounded-lg"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-4 bg-slate-100 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : displayedPOs.length === 0 ? (
          <div className="text-center py-24">
            <Package className="w-20 h-20 text-slate-300 mx-auto mb-4" />
            <p className="text-lg text-slate-500">
              {activeTab === "expiring"
                ? "No active Purchase Orders"
                : "No expired POs"}
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

              const poNumber = po.po?.id
                ? `PO-${po.po.id.slice(0, 8).toUpperCase()}`
                : "N/A";

              return (
                <div
                  key={po.id}
                  onClick={() => handleCardClick(po.id)}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all cursor-pointer overflow-hidden group"
                >
                  {/* Expiry Banner - Beautiful */}
                  <div
                    className={`flex items-center justify-center gap-2 py-2.5 text-white font-semibold text-sm transition-all ${
                      isExpired
                        ? "bg-red-600"
                        : diffDays <= 7
                        ? "bg-orange-500"
                        : "bg-emerald-600"
                    }`}
                  >
                    {isExpired ? (
                      <>
                        <XCircle className="w-4 h-4" />
                        <span>Expired</span>
                      </>
                    ) : diffDays === 0 ? (
                      <>
                        <AlertTriangle className="w-4 h-4" />
                        <span>Expires Today</span>
                      </>
                    ) : diffDays <= 7 ? (
                      <>
                        <AlertTriangle className="w-4 h-4" />
                        <span>
                          {diffDays} Day{diffDays > 1 ? "s" : ""} Left
                        </span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>{diffDays} Days Remaining</span>
                      </>
                    )}
                  </div>

                  <div className="p-5">
                    {/* Header: Logo + Name + PO# */}
                    <div className="flex items-start gap-4 mb-4">
                      <img
                        src={po.companyImage}
                        alt={po.companyName}
                        className="w-16 h-16 rounded-lg object-cover shadow-sm border border-slate-200"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-900 truncate text-lg">
                            {po.companyName}
                          </h3>
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-mono">
                            {poNumber}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          {po.village}, {po.taluk}
                        </p>
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="flex flex-wrap gap-4 mt-4 text-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-600">Required:</span>
                        <span className="font-bold">{po.quantity} TON</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-600">Supplied:</span>
                        <span className="font-bold text-green-600">
                          {po.suppliedQuantity} TON
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <span>
                          <strong className="text-slate-900 text-2xl font-heading ml-12">
                            {formatDate(po.expiryDate)}
                          </strong>
                        </span>
                      </div>
                    </div>

                    {/* Crop, Qty, Price */}
                    <div className="mt-5 grid grid-cols-3 gap-4 bg-slate-50 rounded-lg p-4 text-center">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Crop</p>
                        <p className="font-bold text-slate-900">
                          {po.cropName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Total Qty</p>
                        <p className="font-bold text-slate-900">
                          {po.quantity} TON
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">PO Price</p>
                        <p className="font-bold text-slate-900 flex items-center justify-center gap-1">
                          <IndianRupee className="w-4 h-4" />
                          {po.poPrice}/qtl
                        </p>
                      </div>
                    </div>

                    {/* Assignees */}
                    {po.assignees && po.assignees.length > 0 ? (
                      <div className="mt-5 border border-slate-200 rounded-lg overflow-hidden text-xs">
                        <div className="bg-slate-100 grid grid-cols-5 font-semibold text-slate-700 px-3 py-2.5 border-b border-slate-200">
                          <div>Name</div>
                          <div>Qty</div>
                          <div>Truck</div>
                          <div>Rate</div>
                          <div>Status</div>
                        </div>
                        <div className="max-h-44 overflow-y-auto">
                          {po.assignees.map((assignee, idx) => (
                            <div
                              key={idx}
                              className="grid grid-cols-5 px-3 py-2.5 border-t border-slate-100 hover:bg-slate-50 transition"
                            >
                              <div className="font-medium truncate">
                                {assignee.name}
                              </div>
                              <div>
                                {assignee.promisedQuantity}{" "}
                                <span className="text-slate-500">
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
                                  <span className="text-slate-400">—</span>
                                )}
                              </div>
                              <div>
                                {assignee.assigneeRate ? (
                                  <span className="font-mono">
                                    ₹{assignee.assigneeRate}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">—</span>
                                )}
                              </div>
                              <div>
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${
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
                      <p className="text-center text-sm text-slate-500 py-8 bg-slate-50 rounded-lg mt-5">
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-bold">Create Purchase Order</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-500 hover:text-slate-700 transition"
              >
                <XCircle className="w-6 h-6" />
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
