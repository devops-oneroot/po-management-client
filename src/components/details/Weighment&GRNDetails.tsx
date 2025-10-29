"use client";

import React from "react";
import { Upload } from "lucide-react";

export default function WeighmentAndGRNDetails() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Weighment Details */}
      <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
        <h3 className="font-semibold mb-4 text-lg border-b pb-2 text-gray-800">
          Weighment Details
        </h3>

        {["Loading", "Unloading"].map((label) => (
          <div key={label} className="flex items-center gap-2 mb-3">
            <label className="w-40 text-sm font-medium">{label}:</label>
            <input
              type="text"
              placeholder="10.25"
              className="border rounded-lg p-2 w-full"
            />
            <select className="border rounded-lg p-2 text-sm">
              <option>Measure</option>
              <option>Tons</option>
            </select>
          </div>
        ))}

        <button className="mt-3 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm">
          <Upload className="w-4 h-4" /> Upload Images
        </button>
      </div>

      {/* GRN Details */}
      <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
        <h3 className="font-semibold mb-4 text-lg border-b pb-2 text-gray-800">
          GRN Details
        </h3>

        <div className="flex items-center gap-2 mb-3">
          <label className="w-40 text-sm font-medium">GRN Date:</label>
          <input
            type="text"
            placeholder="10.10.2025"
            className="border rounded-lg p-2 w-full"
          />
        </div>

        {[
          "Accepted Quantity",
          "Rejected Quantity",
          "Total Billable Quantity",
        ].map((label) => (
          <div key={label} className="flex items-center gap-2 mb-3">
            <label className="w-40 text-sm font-medium">{label}:</label>
            <input
              type="text"
              placeholder="10.25"
              className="border rounded-lg p-2 w-full"
            />
            <select className="border rounded-lg p-2 text-sm">
              <option>Measure</option>
              <option>Tons</option>
            </select>
          </div>
        ))}

        <button className="mt-3 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 text-sm">
          <Upload className="w-4 h-4" /> Upload Images
        </button>
      </div>
    </div>
  );
}
