"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  Package,
  Calendar,
  IndianRupee,
  MapPin,
  Eye,
  Loader2,
  Users,
  TrendingUp,
  UsersRound, // Added for buyerInterestCount field
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
  buyerInterestCount?: number; // Made optional to handle undefined/null cases
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

const OrderCard: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const {
    data: orders,
    isLoading,
    error,
  } = useQuery<PurchaseOrder[]>({
    queryKey: ["purchaseOrders"],
    queryFn: fetchPurchaseOrders,
  });

  const openForm = () => setIsFormOpen(true);
  const closeForm = () => setIsFormOpen(false);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Loading State Component
  const LoadingState = () => (
    <div className="space-y-8">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/30 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl w-80 animate-pulse"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-64 animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl animate-pulse">
            <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
          </div>
        </div>

        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="animate-pulse space-y-4">
              <div className="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl mx-auto"></div>
              <div className="space-y-3">
                <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2"></div>
                <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-20 mx-auto"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Error State Component
  const ErrorState = ({ message }: { message: string }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 border border-white/30 shadow-2xl text-center max-w-4xl mx-auto">
      <div className="w-24 h-24 bg-red-100/80 rounded-2xl flex items-center justify-center mx-auto mb-8">
        <svg
          className="w-12 h-12 text-red-500"
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
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Failed to Load Orders
        </h3>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
          {message ||
            "We're having trouble loading your purchase orders right now."}
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Retry Loading</span>
          </button>
          <button
            onClick={openForm}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Order</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Empty State Component
  const EmptyState = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-16 border border-white/30 shadow-2xl text-center max-w-3xl mx-auto">
      <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
        <Package className="w-16 h-16 text-blue-500" />
      </div>
      <div className="space-y-6">
        <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
          No Orders Yet
        </h3>
        <p className="text-gray-600 text-xl max-w-2xl mx-auto leading-relaxed">
          Your purchase order collection is looking a bit empty. Let's change
          that by creating your first order!
        </p>
        <button
          onClick={openForm}
          className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 text-white rounded-3xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 transform text-lg"
        >
          <Plus className="w-6 h-6" />
          <span>Create Your First Order</span>
        </button>
        <p className="text-sm text-gray-500">
          Get started in just a few minutes with our guided form
        </p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
        <Header orders={[]} isLoading={true} onOpenForm={openForm} />
        <div className="max-w-8xl mx-auto">
          <LoadingState />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
        <Header orders={[]} isLoading={false} onOpenForm={openForm} />
        <div className="max-w-7xl mx-auto">
          <ErrorState message={(error as Error).message} />
        </div>
      </div>
    );
  }

  const activeOrders = (orders || []).filter((o) => o.isActive);
  const inactiveOrders = (orders || []).filter((o) => !o.isActive);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-blue-50">
      {/* Enhanced Header */}
      <Header orders={orders || []} isLoading={false} onOpenForm={openForm} />

      {/* Main Content */}
      <div className="max-w-8xl mx-auto px-3 py-3">
        {orders && orders.length === 0 && <EmptyState />}

        {orders && orders.length > 0 && (
          <div className="space-y-4">
            {/* Orders Summary */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-white/30 shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1.5 text-gray-600">
                    <Calendar className="w-4 h-4 text-purple-700" />
                    <span className="text-sm font-semibold text-gray-900">
                      {orders.length} Total Orders
                    </span>
                  </div>
                  <div className="hidden md:flex items-center space-x-3 text-[10px]">
                    <div className="flex items-center space-x-1 text-purple-600 font-medium">
                      <Users className="w-3 h-3" />
                      <span>
                        {orders.filter((o) => o.isActive).length} Active
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-500 font-medium">
                      <TrendingUp className="w-3 h-3" />
                      <span>
                        {orders.filter((o) => !o.isActive).length} Inactive
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-[10px] text-gray-500">
                  <span>
                    Last updated: {formatDate(new Date().toISOString())}
                  </span>
                </div>
              </div>
            </div>

            {/* Active Orders Section */}
            {activeOrders.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-base font-bold text-gray-900">
                  Active Orders
                </h2>
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  {activeOrders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/eois/${order.id}`}
                      className="group block transform transition-all duration-300"
                    >
                      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-lg hover:shadow-2xl hover:-translate-y-2 hover:border-purple-200/60 overflow-hidden relative h-full">
                        {/* Active Status Indicator */}
                        {order.isActive && (
                          <div className="absolute top-4 right-4 z-10">
                            <div className="relative">
                              <div className="w-4 h-4 bg-purple-800 rounded-full shadow-lg"></div>
                              <div className="absolute inset-0 w-4 h-4 bg-purple-400 rounded-full animate-ping opacity-75"></div>
                            </div>
                          </div>
                        )}

                        {/* Gradient Background */}
                        {/* <div className="absolute inset-0 from-white via-white/80 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div> */}
                        <div className="absolute inset-0 from-white via-white/80 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        {/* Company Logo */}
                        <div className="relative z-10 flex justify-center mb-5">
                          <div className="relative">
                            {order.company_logo ? (
                              <img
                                src={order.company_logo}
                                alt={order.companyName}
                                className="w-20 h-20 rounded-2xl object-cover shadow-xl ring-2 ring-white/50 group-hover:scale-110 transition-transform duration-500"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = "none";
                                  target.nextElementSibling?.classList.remove(
                                    "hidden"
                                  );
                                }}
                              />
                            ) : null}
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl ring-2 ring-white/50 absolute top-0 left-0 hidden group-hover:scale-110 transition-transform duration-500">
                              <span className="text-white text-2xl font-bold">
                                {order.companyName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Company Name */}
                        <div className="relative z-10 text-center mb-5">
                          <h3 className="font-bold text-gray-900 text-xl mb-2 truncate group-hover:text-purple-700 transition-colors duration-300 tracking-tight">
                            {order.companyName}
                          </h3>
                          <div className="flex items-center justify-center space-x-2">
                            <MapPin className="w-4 h-4 text-purple-500" />
                            <span className="text-sm text-gray-600 font-medium">
                              {order.village}
                            </span>
                          </div>
                        </div>

                        {/* Crop Information */}
                        <div className="relative z-10 space-y-3 mb-6">
                          <div className="flex items-center justify-center space-x-2 px-4 py-2 bg-purple-50 rounded-xl">
                            <Package className="w-5 h-5 text-purple-600 flex-shrink-0" />
                            <div className="text-center flex-1">
                              <p className="text-base font-bold text-gray-900">
                                {order.cropName}
                              </p>
                              {order.cropVariety && (
                                <p className="text-sm text-emerald-600 font-semibold">
                                  {order.cropVariety}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Quantity, Price & Interested */}
                        <div className="relative z-10 space-y-3 mb-5">
                          <div className="flex items-center justify-between text-sm py-2">
                            <span className="text-gray-600 flex items-center space-x-1 font-medium">
                              <Package className="w-4 h-4 text-gray-400" />
                              <span>{order.minQuantity.toLocaleString()}</span>
                            </span>
                            <span className="text-gray-500 text-xs">
                              {order.measure}
                            </span>
                          </div>
                          {order.price_rate && (
                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                              <span className="text-gray-600 flex items-center space-x-1 font-semibold">
                                <IndianRupee className="w-4 h-4 text-purple-600" />
                                <span>{order.price_rate.toLocaleString()}</span>
                              </span>
                              <span className="text-xs text-gray-500">
                                per {order.price_measure}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <span className="text-gray-600 flex items-center space-x-1 font-semibold">
                              <UsersRound className="w-4 h-4 text-purple-600" />
                              <span>
                                {(
                                  order.buyerInterestCount ?? 0
                                ).toLocaleString()}
                              </span>{" "}
                              {/* Fixed: Added fallback to 0 */}
                            </span>
                            <span className="text-xs text-gray-500">
                              Interested
                            </span>
                          </div>
                        </div>

                        {/* Status & Date Footer */}
                        <div className="relative z-10 pt-4 border-t border-gray-100 flex items-center justify-between">
                          <span
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                              order.isActive
                                ? "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 hover:shadow-md"
                                : "bg-gradient-to-r from-red-100 to-red-200 text-red-800 hover:shadow-md"
                            }`}
                          >
                            {order.isActive ? "Active" : "Inactive"}
                          </span>
                          <div className="flex items-center space-x-1.5 text-xs text-gray-600 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-gray-500" />
                            <span>{formatDate(order.createdAt)}</span>
                          </div>
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-6">
                          <button className="inline-flex items-center space-x-2 px-6 py-3 bg-white/95 backdrop-blur-sm rounded-2xl font-semibold text-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 transform opacity-0 group-hover:opacity-100">
                            <Eye className="w-4 h-4" />
                            <span className="text-sm">View Details</span>
                          </button>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Inactive Orders Section */}
            {inactiveOrders.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-base font-bold text-gray-900">
                  Inactive Orders
                </h2>
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  {inactiveOrders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/order/${order.id}`}
                      className="group block transform transition-all duration-300"
                    >
                      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-lg hover:shadow-2xl hover:-translate-y-2 hover:border-purple-200/60 overflow-hidden relative h-full">
                        {/* Active Status Indicator */}
                        {order.isActive && (
                          <div className="absolute top-4 right-4 z-10">
                            <div className="relative">
                              <div className="w-4 h-4 bg-purple-500 rounded-full shadow-lg"></div>
                              <div className="absolute inset-0 w-4 h-4 bg-purple-400 rounded-full animate-ping opacity-75"></div>
                            </div>
                          </div>
                        )}

                        {/* Gradient Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white via-white/80 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        {/* Company Logo */}
                        <div className="relative z-10 flex justify-center mb-5">
                          <div className="relative">
                            {order.company_logo ? (
                              <img
                                src={order.company_logo}
                                alt={order.companyName}
                                className="w-20 h-20 rounded-2xl object-cover shadow-xl ring-2 ring-white/50 group-hover:scale-110 transition-transform duration-500"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = "none";
                                  target.nextElementSibling?.classList.remove(
                                    "hidden"
                                  );
                                }}
                              />
                            ) : null}
                            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl ring-2 ring-white/50 absolute top-0 left-0 hidden group-hover:scale-110 transition-transform duration-500">
                              <span className="text-white text-2xl font-bold">
                                {order.companyName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Company Name */}
                        <div className="relative z-10 text-center mb-4">
                          <h3 className="font-bold text-gray-900 text-xl mb-1 truncate group-hover:text-purple-700 transition-colors duration-300">
                            {order.companyName}
                          </h3>
                          <div className="flex items-center justify-center space-x-2 mb-3">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="text-xs text-gray-600">
                              {order.village}
                            </span>
                          </div>
                        </div>

                        {/* Crop Information */}
                        <div className="relative z-10 space-y-3 mb-5">
                          <div className="flex items-center justify-center space-x-2">
                            <Package className="w-5 h-5 text-purple-600 flex-shrink-0" />
                            <div className="text-center flex-1">
                              <p className="text-sm font-semibold text-gray-900">
                                {order.cropName}
                              </p>
                              {order.cropVariety && (
                                <p className="text-xs text-emerald-600 font-medium">
                                  {order.cropVariety}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Quantity, Price & Interested */}
                        <div className="relative z-10 space-y-3 mb-5">
                          <div className="flex items-center justify-between text-sm py-2">
                            <span className="text-gray-600 flex items-center space-x-1 font-medium">
                              <Package className="w-4 h-4 text-gray-400" />
                              <span>{order.minQuantity.toLocaleString()}</span>
                            </span>
                            <span className="text-gray-500 text-xs">
                              {order.measure}
                            </span>
                          </div>
                          {order.price_rate && (
                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                              <span className="text-gray-600 flex items-center space-x-1 font-semibold">
                                <IndianRupee className="w-4 h-4 text-purple-600" />
                                <span>{order.price_rate.toLocaleString()}</span>
                              </span>
                              <span className="text-xs text-gray-500">
                                per {order.price_measure}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <span className="text-gray-600 flex items-center space-x-1 font-semibold">
                              <UsersRound className="w-4 h-4 text-purple-600" />
                              <span>
                                {(
                                  order.buyerInterestCount ?? 0
                                ).toLocaleString()}
                              </span>{" "}
                              {/* Fixed: Added fallback to 0 */}
                            </span>
                            <span className="text-xs text-gray-500">
                              Interested
                            </span>
                          </div>
                        </div>

                        {/* Status & Date Footer */}
                        <div className="relative z-10 pt-4 border-t border-gray-100 flex items-center justify-between">
                          <span
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                              order.isActive
                                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 shadow-md"
                                : "bg-red-100 text-red-800 hover:bg-red-200 shadow-md"
                            }`}
                          >
                            {order.isActive ? "Active" : "Inactive"}
                          </span>
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(order.createdAt)}</span>
                          </div>
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-6">
                          <button className="inline-flex items-center space-x-2 px-6 py-3 bg-white/95 backdrop-blur-sm rounded-2xl font-semibold text-emerald-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 transform opacity-0 group-hover:opacity-100">
                            <Eye className="w-4 h-4" />
                            <span className="text-sm">View Details</span>
                          </button>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Enhanced Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-3 shadow-lg">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-medium">Active</span>
                </div>
                <div className="text-2xl font-bold text-center mb-0.5">
                  {orders.filter((o) => o.isActive).length}
                </div>
                <p className="text-emerald-100 text-center text-[10px] opacity-90">
                  Live Orders
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl p-3 shadow-lg">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <Users className="w-3.5 h-3.5 opacity-80" />
                  <span className="text-[10px] font-medium">Total</span>
                </div>
                <div className="text-2xl font-bold text-center mb-0.5">
                  {orders.length}
                </div>
                <p className="text-blue-100 text-center text-[10px] opacity-90">
                  Purchase Orders
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-violet-600 text-white rounded-xl p-3 shadow-lg">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <Package className="w-3.5 h-3.5 opacity-80" />
                  <span className="text-[10px] font-medium">Quantity</span>
                </div>
                <div className="text-2xl font-bold text-center mb-0.5">
                  {orders
                    .reduce((sum, order) => sum + order.minQuantity, 0)
                    .toLocaleString()}
                </div>
                <p className="text-purple-100 text-center text-[10px] opacity-90">
                  Total Units
                </p>
              </div>
              {/* <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center justify-center space-x-3 mb-2">
                  <IndianRupee  className="w-5 h-5 opacity-80" />
                  <span className="text-sm font-medium">Priced</span>
                </div>
                <div className="text-4xl font-bold text-center mb-1">
                  {orders.filter((o) => o.price_rate).length}
                </div>
                <p className="text-orange-100 text-center text-sm opacity-90">
                  With Rates
                </p>
              </div> */}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden relative animate-slide-up border border-white/30">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-white/30 z-20">
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Create Purchase Order
                    </h2>
                    <p className="text-sm text-gray-600">
                      Fill in the details below
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeForm}
                  className="group p-2 rounded-2xl bg-white/80 hover:bg-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                >
                  <svg
                    className="w-6 h-6 text-gray-600 group-hover:text-gray-800 transition-colors"
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

            <div className="p-8 max-h-[75vh] overflow-y-auto">
              <OrderForm onSuccess={closeForm} />
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

// Header Component
const Header: React.FC<{
  orders: PurchaseOrder[];
  isLoading: boolean;
  onOpenForm: () => void;
}> = ({ orders, isLoading, onOpenForm }) => (
  <header className="bg-gradient-to-r from-purple-950 via-purple-850 to-teal-950 text-white py-6 shadow-2xl relative overflow-hidden">
    {/* Background Pattern */}
    <div className="absolute inset-0 opacity-10">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25% 25%, white 2px, transparent 2px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)",
          backgroundSize: "50px 50px, 50px 50px",
          backgroundPosition: "0 0, 25px 25px",
        }}
      ></div>
    </div>

    <div className="relative z-10 max-w-7xl mx-auto px-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
        <div className="flex-1 space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-emerald-100 to-transparent bg-clip-text text-transparent tracking-tight leading-tight">
            Marketplace Orders
          </h1>
          <p className="text-sm text-purple-100 max-w-2xl leading-relaxed font-medium">
            Seamlessly manage your agricultural purchase orders with precision
            and elegance
          </p>
          <div className="flex items-center space-x-2 pt-1">
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg border border-white/10">
              <Users className="w-3.5 h-3.5" />
              <span>{orders.length} Orders</span>
            </div>
            <div
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg border ${
                orders.filter((o) => o.isActive).length === orders.length
                  ? "bg-emerald-500/30 border-emerald-400/30"
                  : "bg-yellow-500/30 border-yellow-400/30"
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  orders.filter((o) => o.isActive).length === orders.length
                    ? "bg-emerald-300 animate-pulse"
                    : "bg-yellow-300 animate-pulse"
                }`}
              ></div>
              <span>{orders.filter((o) => o.isActive).length} Active</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenForm}
            disabled={isLoading}
            className="group relative inline-flex items-center space-x-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg font-bold shadow-2xl border border-white/20 transition-all duration-200 hover:shadow-3xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300 relative z-10" />
            <span className="relative z-10 text-white font-bold text-xs tracking-wide">
              Create New Order
            </span>
          </button>
        </div>
      </div>
    </div>
  </header>
);

export default OrderCard;
