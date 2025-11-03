import React from "react";
import { Package, Building2, ShoppingCart, TrendingUp } from "lucide-react";
import Link from "next/link";

const Page = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome to PO Management
          </h1>
          <p className="text-base text-slate-600">
            Manage your purchase orders, companies, and track your business efficiently.
          </p>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mb-8">
          <Link href="/company" className="group">
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900">-</div>
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
                <div className="text-2xl font-bold text-slate-900">-</div>
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-1">EOIs</h3>
              <p className="text-sm text-slate-500">Expression of Interest orders</p>
            </div>
          </Link>

          <Link href="/po-card" className="group">
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-slate-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900">-</div>
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-1">Purchase Orders</h3>
              <p className="text-sm text-slate-500">Active and expired POs</p>
            </div>
          </Link>
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
                  Modern Dashboard
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  Real-time Updates
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
