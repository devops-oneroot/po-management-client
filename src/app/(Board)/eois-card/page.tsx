"use client";

import React, { useState, useMemo } from "react";
import axios from "axios";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  Package,
  Calendar,
  IndianRupee,
  MapPin,
  Loader2,
  UsersRound,
  TrendingUp,
  Eye,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import OrderForm from "@/src/components/form/OrderForm";

interface PurchaseOrder {
  id: string;
  companyName: string;
  village: string;
  taluk: string;
  district: string;
  coordinates: {
    type: string;
    coordinates: [number, number];
  };
  company_logo: string;
  cropName: string;
  cropVariety: string | null;
  quality: string | null;
  measure: string;
  unit: string;
  minQuantity: number;
  price_rate: number | null;
  price_measure: string;
  moisturePercent: number | null;
  expiresAt: string;
  specification_en: string;
  specification_kn: string | null;
  specification_te: string | null;
  termsAndConditions_en: string;
  termsAndConditions_kn: string | null;
  termsAndConditions_te: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  buyerInterestCount?: number;
}

const fetchPurchaseOrders = async (): Promise<PurchaseOrder[]> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/po`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch purchase orders");
  }
  return response.json();
};

const handlePushNotification = async () => {
  // Show confirmation popup
  const confirmSend = confirm(
    "Are you sure you want to send the push notification?"
  );

  if (!confirmSend) {
    return; // User clicked Cancel → do nothing
  }

  // User clicked OK → hit API
  try {
    const res = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_API_URL}/daily-update/send-prices`,
    });

    console.log(res.data);
    alert("Push notification sent!");
  } catch (error) {
    console.error(error);
    alert("Failed to send notification");
  }
};

const ITEMS_PER_PAGE = 10;

const OrderCard: React.FC = () => {
  // === STATE: Always at top so modal works everywhere ===
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"active" | "inactive">("active");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [cropFilter, setCropFilter] = useState("");
  const [measureFilter, setMeasureFilter] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const openForm = () => setIsFormOpen(true);
  const closeForm = () => setIsFormOpen(false);

  const {
    data: orders = [],
    isLoading,
    error,
  } = useQuery<PurchaseOrder[]>({
    queryKey: ["purchaseOrders"],
    queryFn: fetchPurchaseOrders,
  });

  // === UTILS ===
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const activeOrders = orders.filter((o) => o.isActive);
  const inactiveOrders = orders.filter((o) => !o.isActive);

  const filteredOrders = useMemo(() => {
    const data = activeTab === "active" ? activeOrders : inactiveOrders;

    return data.filter((order) => {
      const matchesSearch =
        order.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.taluk.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.district.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCrop = !cropFilter || order.cropName === cropFilter;
      const matchesMeasure = !measureFilter || order.measure === measureFilter;

      let matchesDate = true;
      if (filterDate) {
        const localFilterDate = new Date(filterDate);
        const filterDateMidnightUTC = Date.UTC(
          localFilterDate.getFullYear(),
          localFilterDate.getMonth(),
          localFilterDate.getDate()
        );

        const orderDate = new Date(order.createdAt);
        const orderDateMidnightUTC = Date.UTC(
          orderDate.getUTCFullYear(),
          orderDate.getUTCMonth(),
          orderDate.getUTCDate()
        );

        matchesDate = orderDateMidnightUTC >= filterDateMidnightUTC;
      }

      return matchesSearch && matchesCrop && matchesMeasure && matchesDate;
    });
  }, [
    activeTab,
    activeOrders,
    inactiveOrders,
    searchTerm,
    cropFilter,
    measureFilter,
    filterDate,
  ]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  const resetFilters = () => {
    setSearchTerm("");
    setCropFilter("");
    setMeasureFilter("");
    setFilterDate("");
    setCurrentPage(1);
  };

  const uniqueCrops = Array.from(new Set(orders.map((o) => o.cropName)));
  const uniqueMeasures = Array.from(new Set(orders.map((o) => o.measure)));

  // === LOADING ===
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-8xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div className="animate-pulse space-y-2">
              <div className="h-6 bg-slate-200 rounded w-48"></div>
              <div className="h-4 bg-slate-100 rounded w-32"></div>
            </div>
            <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-200 rounded-md animate-pulse w-32 h-10"></div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-slate-200 rounded"></div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-100 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === ERROR ===
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center shadow-sm">
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
            <h3 className="text-lg font-semibold text-slate-900">
              Failed to Load Orders
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              {(error as Error).message}
            </p>
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-medium shadow-sm transition-colors text-sm"
              >
                <Loader2 className="w-4 h-4" />
                Retry
              </button>
              <button
                onClick={openForm}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium shadow-sm transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Create Order
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === MAIN RENDER (Always includes modal) ===
  return (
    <>
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-8xl mx-auto space-y-6">
          {/* === EMPTY STATE === */}
          {orders.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                <Package className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                No Orders Yet
              </h3>
              <p className="text-sm text-slate-600 mt-2">
                Create your first purchase order to get started.
              </p>
              <button
                onClick={openForm}
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-medium shadow-sm transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Create Order
              </button>
            </div>
          ) : (
            <>
              {/* === HEADER === */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold text-slate-900">
                    Purchase Orders
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    {orders.length} total • {activeOrders.length} active •{" "}
                    {inactiveOrders.length} inactive
                  </p>
                </div>
                <button
                  onClick={openForm}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-medium shadow-sm transition-all text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Create Order
                </button>

                <button
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-medium shadow-sm transition-all text-sm"
                  onClick={handlePushNotification}
                >
                  <Plus className="w-4 h-4" />
                  push notification
                </button>
              </div>

              {/* === STATS === */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-600">
                      Active Orders
                    </span>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <p className="text-2xl font-semibold text-slate-900">
                    {activeOrders.length}
                  </p>
                  <p className="text-xs text-slate-500">Live on platform</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-600">
                      Total Orders
                    </span>
                    <Package className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-2xl font-semibold text-slate-900">
                    {orders.length}
                  </p>
                  <p className="text-xs text-slate-500">All time</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-600">
                      Total Quantity
                    </span>
                    <TrendingUp className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-2xl font-semibold text-slate-900">
                    {orders
                      .reduce((sum, o) => sum + o.minQuantity, 0)
                      .toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500">Across all orders</p>
                </div>
              </div>

              {/* === SEARCH & FILTERS === */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search company, crop, location..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    <select
                      value={cropFilter}
                      onChange={(e) => {
                        setCropFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Crops</option>
                      {uniqueCrops.map((crop) => (
                        <option key={crop} value={crop}>
                          {crop}
                        </option>
                      ))}
                    </select>

                    <select
                      value={measureFilter}
                      onChange={(e) => {
                        setMeasureFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Units</option>
                      {uniqueMeasures.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={resetFilters}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-sm font-medium transition-colors flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* === TABS + TABLE === */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="border-b border-slate-200">
                  <div className="flex">
                    <button
                      onClick={() => {
                        setActiveTab("active");
                        setCurrentPage(1);
                      }}
                      className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                        activeTab === "active"
                          ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Active Orders ({activeOrders.length})
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("inactive");
                        setCurrentPage(1);
                      }}
                      className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                        activeTab === "inactive"
                          ? "text-slate-900 border-b-2 border-slate-900 bg-slate-50"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Inactive Orders ({inactiveOrders.length})
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 font-medium">Company</th>
                        <th className="px-4 py-3 font-medium">Location</th>
                        <th className="px-4 py-3 font-medium">Crop</th>
                        <th className="px-4 py-3 font-medium text-center">
                          Quantity
                        </th>
                        <th className="px-4 py-3 font-medium text-center">
                          Aggregator Price
                        </th>
                        <th className="px-4 py-3 font-medium text-center">
                          Interested
                        </th>
                        <th className="px-4 py-3 font-medium text-center">
                          Status
                        </th>
                        <th className="px-4 py-3 font-medium text-center">
                          Created
                        </th>
                        <th className="px-4 py-3 font-medium text-center">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                        >
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {order.company_logo ? (
                                  <img
                                    src={order.company_logo}
                                    alt={order.companyName}
                                    className={`w-full h-full object-cover ${
                                      !order.isActive ? "grayscale" : ""
                                    }`}
                                    onError={(e) => {
                                      const target =
                                        e.target as HTMLImageElement;
                                      target.style.display = "none";
                                      target.nextElementSibling?.classList.remove(
                                        "hidden"
                                      );
                                    }}
                                  />
                                ) : null}
                                <span
                                  className={`text-sm font-semibold text-slate-600 ${
                                    order.company_logo ? "hidden" : ""
                                  }`}
                                >
                                  {order.companyName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-slate-900 truncate max-w-[140px]">
                                  {order.companyName}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {order.taluk}, {order.district}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex items-center gap-1 text-xs text-slate-600">
                              <MapPin className="w-3.5 h-3.5" />
                              {order.village}
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <div>
                              <p className="font-medium text-slate-900">
                                {order.cropName}
                              </p>
                              {order.cropVariety && (
                                <p className="text-xs text-slate-500">
                                  {order.cropVariety}
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Package className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-medium">
                                {order.minQuantity.toLocaleString()}
                              </span>
                              <span className="text-xs text-slate-500">
                                {order.measure}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-4 text-center">
                            {order.price_rate ? (
                              <div className="flex items-center justify-center gap-1">
                                <IndianRupee className="w-3.5 h-3.5 text-slate-600" />
                                <span className="font-medium">
                                  {order.price_rate.toLocaleString()}
                                </span>
                                <span className="text-xs text-slate-500">
                                  /{order.price_measure}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">
                                Negotiable
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <UsersRound className="w-3.5 h-3.5 text-slate-600" />
                              <span className="font-medium">
                                {(
                                  order.buyerInterestCount ?? 0
                                ).toLocaleString()}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                order.isActive
                                  ? "bg-green-50 text-green-700 border border-green-200"
                                  : "bg-slate-100 text-slate-600 border border-slate-200"
                              }`}
                            >
                              <div
                                className={`w-1.5 h-1.5 rounded-full ${
                                  order.isActive
                                    ? "bg-green-500"
                                    : "bg-slate-400"
                                }`}
                              ></div>
                              {order.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-center text-xs text-slate-600">
                            <div className="flex items-center justify-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(order.createdAt)}
                            </div>
                          </td>

                          <td className="px-4 py-4 text-center">
                            <Link
                              href={`/eois/${order.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {paginatedOrders.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                      <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>No orders match your filters.</p>
                    </div>
                  )}
                </div>

                {/* === PAGINATION === */}
                {totalPages > 1 && (
                  <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between text-sm">
                    <p className="text-slate-600">
                      Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                      {Math.min(
                        currentPage * ITEMS_PER_PAGE,
                        filteredOrders.length
                      )}{" "}
                      of {filteredOrders.length} results
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                        className="p-2 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="px-3">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* === MODAL: Always rendered, conditionally shown === */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Create Purchase Order
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
            <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              <OrderForm onSuccess={closeForm} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderCard;
