"use client";

import React, { useEffect, useState } from "react";
import { Package, Building2, ShoppingCart, TrendingUp, Users, Activity, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import Link from "next/link";

interface Analytics {
  totalCompanies: number;
  totalEOIs: number;
  activeEOIs: number;
  inactiveEOIs: number;
  totalPOs: number;
  totalInterests: number;
  totalQuantity: number;
  averagePrice: number;
}

const Page = () => {
  const [analytics, setAnalytics] = useState<Analytics>({
    totalCompanies: 0,
    totalEOIs: 0,
    activeEOIs: 0,
    inactiveEOIs: 0,
    totalPOs: 0,
    totalInterests: 0,
    totalQuantity: 0,
    averagePrice: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [companiesRes, eoisRes, posRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/po-companies`).catch(() => null),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/po`).catch(() => null),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/master-po`).catch(() => null),
        ]);

        const companies = companiesRes?.ok ? await companiesRes.json() : [];
        const eois = eoisRes?.ok ? await eoisRes.json() : [];
        const pos = posRes?.ok ? await posRes.json() : [];

        // Normalize data
        const companiesData = Array.isArray(companies) ? companies : companies?.data || [];
        const eoisData = Array.isArray(eois) ? eois : eois?.data || [];
        const posData = Array.isArray(pos) ? pos : pos?.data || [];

        // Calculate analytics
        const activeEOIs = eoisData.filter((e: any) => e.isActive).length;
        const inactiveEOIs = eoisData.length - activeEOIs;
        
        const totalInterests = eoisData.reduce((sum: number, eoi: any) => {
          return sum + (eoi.buyerInterestCount || 0);
        }, 0);

        const totalQuantity = eoisData.reduce((sum: number, eoi: any) => {
          return sum + (eoi.minQuantity || 0);
        }, 0);

        const pricesWithValues = eoisData.filter((e: any) => e.price_rate && e.price_rate > 0);
        const averagePrice = pricesWithValues.length > 0
          ? pricesWithValues.reduce((sum: number, e: any) => sum + e.price_rate, 0) / pricesWithValues.length
          : 0;

        setAnalytics({
          totalCompanies: companiesData.length,
          totalEOIs: eoisData.length,
          activeEOIs,
          inactiveEOIs,
          totalPOs: posData.length,
          totalInterests,
          totalQuantity,
          averagePrice,
        });
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-slate-400 animate-spin mx-auto mb-4" />
              <p className="text-sm text-slate-600">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Overview
          </h1>
          <p className="text-base text-slate-600">
            Your business at a glance
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Analytics Dashboard */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Total Companies */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-600">Companies</span>
              <Building2 className="w-5 h-5 text-blue-500" />
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-slate-900">
                {analytics.totalCompanies}
              </div>
              <p className="text-xs text-slate-500">
                Total registered
              </p>
            </div>
          </div>

          {/* Total EOIs */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-600">EOIs</span>
              <Package className="w-5 h-5 text-green-500" />
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-slate-900">
                {analytics.totalEOIs}
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {analytics.activeEOIs} Active
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">{analytics.inactiveEOIs} Inactive</span>
              </div>
            </div>
          </div>

          {/* Total POs */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-600">Purchase Orders</span>
              <ShoppingCart className="w-5 h-5 text-slate-600" />
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-slate-900">
                {analytics.totalPOs}
              </div>
              <p className="text-xs text-slate-500">
                Master POs created
              </p>
            </div>
          </div>

          {/* Buyer Interests */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-600">Interests</span>
              <Users className="w-5 h-5 text-slate-600" />
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-slate-900">
                {analytics.totalInterests}
              </div>
              <p className="text-xs text-slate-500">
                Buyer interests
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 mb-8">
          {/* Total Quantity */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-slate-600" />
                <span className="text-sm font-medium text-slate-900">Total Quantity</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {analytics.totalQuantity.toLocaleString()} <span className="text-base font-normal text-slate-500">units</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Across all active EOIs</p>
          </div>

          {/* Average Price */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-slate-600" />
                <span className="text-sm font-medium text-slate-900">Average Price</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              ₹{analytics.averagePrice > 0 ? analytics.averagePrice.toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '0'}
            </div>
            <p className="text-xs text-slate-500 mt-1">Average rate across orders</p>
          </div>
        </div>

        {/* Quick Navigation Cards */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Access</h2>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <Link href="/company" className="group">
              <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{analytics.totalCompanies}</div>
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">Companies</h3>
                <p className="text-sm text-slate-500">Manage company partners</p>
              </div>
            </Link>

            <Link href="/eois-card" className="group">
              <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{analytics.totalEOIs}</div>
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">EOIs</h3>
                <p className="text-sm text-slate-500">
                  {analytics.activeEOIs} active orders
                </p>
              </div>
            </Link>

            <Link href="/po-card" className="group">
              <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-slate-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{analytics.totalPOs}</div>
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">Purchase Orders</h3>
                <p className="text-sm text-slate-500">Master POs created</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Activity Overview */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 mb-8">
          {/* Status Breakdown */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900 mb-4">EOI Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-slate-700">Active Orders</span>
                </div>
                <span className="text-sm font-semibold text-slate-900">{analytics.activeEOIs}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                  <span className="text-sm text-slate-700">Inactive Orders</span>
                </div>
                <span className="text-sm font-semibold text-slate-900">{analytics.inactiveEOIs}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-700">Buyer Interests</span>
                </div>
                <span className="text-sm font-semibold text-blue-600">{analytics.totalInterests}</span>
              </div>
            </div>
          </div>

          {/* Business Metrics */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Business Metrics</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Total Volume</span>
                <span className="text-sm font-semibold text-slate-900">
                  {analytics.totalQuantity.toLocaleString()} units
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Avg. Price</span>
                <span className="text-sm font-semibold text-slate-900">
                  ₹{analytics.averagePrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-sm text-slate-700">Completion Rate</span>
                <span className="text-sm font-semibold text-green-600">
                  {analytics.totalEOIs > 0 
                    ? Math.round((analytics.activeEOIs / analytics.totalEOIs) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Getting Started
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Use the navigation menu on the left to access different sections of the dashboard. 
                You can manage companies, create expression of interest orders, and track purchase orders all in one place.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  Real-time Analytics
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  Modern Dashboard
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  Easy Management
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
