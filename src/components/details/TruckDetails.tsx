"use client";

import React from "react";
import { Truck, User, Phone } from "lucide-react";

export default function TruckDetails() {
  const fields = [
    { label: "Truck Number", placeholder: "KA53RF5015", icon: Truck },
    { label: "Driver's Name", placeholder: "Sudarshana", icon: User },
    { label: "Driver's Phone", placeholder: "9876543210", icon: Phone },
  ];

  return (
    <div className="bg-gradient-to-br from-white to-purple-50 rounded-3xl p-6 shadow-md border border-gray-100 w-full hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-xl text-gray-800 flex items-center gap-2">
          <Truck className="w-5 h-5 text-purple-600" />
          Truck Details
        </h3>
        <span className="text-xs text-gray-400 bg-purple-100 px-3 py-1 rounded-full">
          Required Info
        </span>
      </div>

      {/* Form Fields */}
      <div className="flex flex-col gap-4">
        {fields.map(({ label, placeholder, icon: Icon }) => (
          <div
            key={label}
            className="flex flex-col sm:flex-row sm:items-center gap-2"
          >
            <label className="w-40 text-sm font-medium text-gray-600">
              {label}
            </label>
            <div className="relative w-full">
              <Icon className="absolute left-3 top-2.5 text-purple-500 w-4 h-4" />
              <input
                type="text"
                placeholder={placeholder}
                className="w-full border border-gray-200 rounded-lg py-2 pl-10 pr-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-400 outline-none transition-all bg-white hover:bg-purple-50"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Optional Action */}
      <div className="flex justify-end mt-6">
        <button className="px-5 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 shadow-sm transition">
          Save Details
        </button>
      </div>
    </div>
  );
}
