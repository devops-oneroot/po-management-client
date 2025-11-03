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
  UsersRound,
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

  // Loading State Component (Minimal)
  const LoadingState = () => (
    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="animate-pulse space-y-4">
            <div className="w-20 h-20 bg-slate-200 rounded-lg mx-auto"></div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-3 bg-slate-100 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Error State Component (Minimal)
  const ErrorState = ({ message }: { message: string }) => (
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
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Failed to Load Orders
        </h3>
        <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          {message || "We're having trouble loading your purchase orders right now."}
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-medium shadow-sm transition-colors duration-150 text-sm"
          >
            <Loader2 className="w-4 h-4" />
            <span>Retry Loading</span>
          </button>
          <button
            onClick={openForm}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium shadow-sm transition-colors duration-150 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Order</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Empty State Component (Minimal)
  const EmptyState = () => (
    <div className="bg-white border border-slate-200 rounded-lg p-12 text-center max-w-lg mx-auto shadow-sm">
      <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-6">
        <Package className="w-8 h-8 text-slate-400" />
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">
          No Orders Yet
        </h3>
        <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
          Your purchase order collection is empty. Let's create your first order to get started!
        </p>
        <button
          onClick={openForm}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-medium shadow-sm transition-colors duration-150 text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create Your First Order</span>
        </button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-8xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div className="animate-pulse space-y-2">
              <div className="h-6 bg-slate-200 rounded w-48"></div>
              <div className="h-4 bg-slate-100 rounded w-32"></div>
            </div>
            <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-200 rounded-md animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            </div>
          </div>
          <LoadingState />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <ErrorState message={(error as Error).message} />
        </div>
      </div>
    );
  }

  const activeOrders = (orders || []).filter((o) => o.isActive);
  const inactiveOrders = (orders || []).filter((o) => !o.isActive);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Main Content */}
      <div className="max-w-8xl mx-auto">
        {orders && orders.length === 0 && <EmptyState />}

        {orders && orders.length > 0 && (
          <div className="space-y-6">
            {/* Header with Stats */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">Purchase Orders</h1>
                <p className="text-sm text-slate-500 mt-1">
                  {orders.length} total orders • {activeOrders.length} active
                </p>
              </div>
              <button
                onClick={openForm}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-medium shadow-sm hover:shadow-md transition-all duration-150 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Create Order</span>
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-600">Active Orders</span>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-semibold text-slate-900">
                    {activeOrders.length}
                  </div>
                  <p className="text-xs text-slate-500">
                    Live on marketplace
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-600">Total Orders</span>
                  <Package className="w-5 h-5 text-slate-400" />
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-semibold text-slate-900">
                    {orders.length}
                  </div>
                  <p className="text-xs text-slate-500">
                    All purchase orders
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-600">Total Quantity</span>
                  <TrendingUp className="w-5 h-5 text-slate-400" />
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-semibold text-slate-900">
                    {orders.reduce((sum, order) => sum + order.minQuantity, 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-slate-500">
                    Units across all orders
                  </p>
                </div>
              </div>
            </div>

            {/* Active Orders Section */}
            {activeOrders.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-base font-semibold text-slate-900">
                  Active Orders ({activeOrders.length})
                </h2>
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  {activeOrders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/eois/${order.id}`}
                      className="group block"
                    >
                      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden relative h-full">
                        {/* Active Indicator - Minimal */}
                        <div className="absolute top-4 right-4 z-10">
                          <div className="relative">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping opacity-75"></div>
                          </div>
                        </div>

                        {/* Subtle Hover Background */}
                        <div className="absolute inset-0 bg-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>

                        {/* Company Logo */}
                        <div className="relative z-10 flex justify-center mb-4">
                          {order.company_logo ? (
                            <img
                              src={order.company_logo}
                              alt={order.companyName}
                              className="w-20 h-20 rounded-lg object-cover shadow-sm"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                target.nextElementSibling?.classList.remove("hidden");
                              }}
                            />
                          ) : null}
                          <div className={`w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center shadow-sm ${order.company_logo ? "hidden" : ""}`}>
                            <span className="text-slate-600 text-xl font-semibold">
                              {order.companyName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {/* Company Name */}
                        <div className="relative z-10 text-center mb-3">
                          <h3 className="font-semibold text-slate-900 text-sm mb-1 truncate">
                            {order.companyName}
                          </h3>
                          <div className="flex items-center justify-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-xs text-slate-500 truncate">
                              {order.village}
                            </span>
                          </div>
                        </div>

                        {/* Crop Information */}
                        <div className="relative z-10 mb-4">
                          <div className="flex items-center justify-center gap-2">
                            <Package className="w-4 h-4 text-slate-600 flex-shrink-0" />
                            <div className="text-center flex-1">
                              <p className="text-sm font-semibold text-slate-900 truncate">
                                {order.cropName}
                              </p>
                              {order.cropVariety && (
                                <p className="text-xs text-slate-500 truncate">
                                  {order.cropVariety}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Quantity, Price & Interested */}
                        <div className="relative z-10 space-y-2 mb-4">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-600 flex items-center gap-1 font-medium">
                              <Package className="w-3.5 h-3.5 text-slate-400" />
                              <span>{order.minQuantity.toLocaleString()}</span>
                            </span>
                            <span className="text-slate-500">
                              {order.measure}
                            </span>
                          </div>
                          {order.price_rate && (
                            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                              <span className="text-slate-600 flex items-center gap-1 font-semibold">
                                <IndianRupee className="w-3.5 h-3.5 text-slate-600" />
                                <span>{order.price_rate.toLocaleString()}</span>
                              </span>
                              <span className="text-slate-500">
                                per {order.price_measure}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                            <span className="text-slate-600 flex items-center gap-1 font-semibold">
                              <UsersRound className="w-3.5 h-3.5 text-slate-600" />
                              <span>{(order.buyerInterestCount ?? 0).toLocaleString()}</span>
                            </span>
                            <span className="text-slate-500">
                              Interested
                            </span>
                          </div>
                        </div>

                        {/* Status & Date Footer */}
                        <div className="relative z-10 pt-3 border-t border-slate-200 flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                            Active
                          </span>
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(order.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Inactive Orders Section */}
            {inactiveOrders.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-base font-semibold text-slate-900">
                  Inactive Orders ({inactiveOrders.length})
                </h2>
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  {inactiveOrders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/eois/${order.id}`}
                      className="group block"
                    >
                      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden relative h-full opacity-75">
                        {/* Company Logo */}
                        <div className="relative z-10 flex justify-center mb-4">
                          {order.company_logo ? (
                            <img
                              src={order.company_logo}
                              alt={order.companyName}
                              className="w-20 h-20 rounded-lg object-cover shadow-sm grayscale"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                target.nextElementSibling?.classList.remove("hidden");
                              }}
                            />
                          ) : null}
                          <div className={`w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center shadow-sm ${order.company_logo ? "hidden" : ""}`}>
                            <span className="text-slate-400 text-xl font-semibold">
                              {order.companyName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {/* Company Name */}
                        <div className="relative z-10 text-center mb-3">
                          <h3 className="font-semibold text-slate-700 text-sm mb-1 truncate">
                            {order.companyName}
                          </h3>
                          <div className="flex items-center justify-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-xs text-slate-500 truncate">
                              {order.village}
                            </span>
                          </div>
                        </div>

                        {/* Crop Information */}
                        <div className="relative z-10 mb-4">
                          <div className="flex items-center justify-center gap-2">
                            <Package className="w-4 h-4 text-slate-500 flex-shrink-0" />
                            <div className="text-center flex-1">
                              <p className="text-sm font-semibold text-slate-700 truncate">
                                {order.cropName}
                              </p>
                              {order.cropVariety && (
                                <p className="text-xs text-slate-500 truncate">
                                  {order.cropVariety}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status & Date Footer */}
                        <div className="relative z-10 pt-3 border-t border-slate-200 flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                            Inactive
                          </span>
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(order.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal (Minimal) */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-white">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Create Purchase Order</h2>
                <button
                  onClick={closeForm}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              <OrderForm onSuccess={closeForm} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
