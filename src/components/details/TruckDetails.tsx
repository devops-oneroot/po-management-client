"use client";

import React from "react";

export default function TruckDetails() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow border border-gray-100 w-full">
      <h3 className="font-semibold mb-4 text-lg border-b pb-2 text-gray-800">
        Truck Details
      </h3>

      <div className="flex flex-col gap-3">
        {[
          { label: "Truck Number", placeholder: "KA53RF5015" },
          { label: "Driver's Name", placeholder: "Sudarshana" },
          { label: "Driver's Phone", placeholder: "9876543210" },
        ].map(({ label, placeholder }) => (
          <div key={label} className="flex items-center gap-2">
            <label className="w-32 text-sm font-medium">{label}:</label>
            <input
              type="text"
              placeholder={placeholder}
              className="border rounded-lg p-2 w-full text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
