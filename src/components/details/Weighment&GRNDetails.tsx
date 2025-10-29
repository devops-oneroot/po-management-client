"use client";

import React from "react";
import { Upload, Scale } from "lucide-react";

export default function WeighmentAndGRNDetails() {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Weighment Details */}
      <div className="bg-white/90 backdrop-blur-sm border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Scale className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-lg text-gray-800">
            Weighment Details
          </h3>
        </div>

        <div className="flex flex-col gap-4">
          {["Loading", "Unloading"].map((label) => (
            <div
              key={label}
              className="flex flex-col sm:flex-row sm:items-center gap-2"
            >
              <label className="w-40 text-sm font-medium text-gray-700">
                {label}:
              </label>
              <div className="flex items-center gap-2 w-full">
                <input
                  type="text"
                  placeholder="10.25"
                  className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm"
                />
                <select className="border border-gray-200 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-purple-500 transition-all">
                  <option>Measure</option>
                  <option>Tons</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        <button className="mt-5 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-5 py-2.5 text-sm transition-all shadow-sm">
          <Upload className="w-4 h-4" /> Upload Images
        </button>
      </div>

      {/* GRN Details */}
      <div className="bg-white/90 backdrop-blur-sm border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Scale className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-lg text-gray-800">GRN Details</h3>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="w-40 text-sm font-medium text-gray-700">
              GRN Date:
            </label>
            <input
              type="date"
              className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm"
            />
          </div>

          {[
            "Accepted Quantity",
            "Rejected Quantity",
            "Total Billable Quantity",
          ].map((label) => (
            <div
              key={label}
              className="flex flex-col sm:flex-row sm:items-center gap-2"
            >
              <label className="w-40 text-sm font-medium text-gray-700">
                {label}:
              </label>
              <div className="flex items-center gap-2 w-full">
                <input
                  type="text"
                  placeholder="10.25"
                  className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm"
                />
                <select className="border border-gray-200 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-purple-500 transition-all">
                  <option>Measure</option>
                  <option>Tons</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        <button className="mt-5 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-5 py-2.5 text-sm transition-all shadow-sm">
          <Upload className="w-4 h-4" /> Upload Images
        </button>
      </div>
    </div>
  );
}
