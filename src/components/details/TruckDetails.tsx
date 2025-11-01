"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Truck,
  User,
  Phone,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface TruckDetailsProps {
  id: string;
  truckNo?: string;
  driverName?: string;
  driverPhone?: string;
}

export default function TruckDetails({
  id,
  truckNo = "",
  driverName = "",
  driverPhone = "",
}: TruckDetailsProps) {
  const [form, setForm] = useState({
    truckNo: "",
    driverName: "",
    driverPhone: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // prefill form when props change
  useEffect(() => {
    setForm({ truckNo, driverName, driverPhone });
  }, [truckNo, driverName, driverPhone]);

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await axios.patch(
        `https://markhet-internal-dev.onrender.com/master-po-assignees/${id}`,
        {
          truckNo: form.truckNo,
          driverName: form.driverName,
          driverPhone: form.driverPhone,
        }
      );
      setMessage({
        type: "success",
        text: "Truck details updated successfully!",
      });
      console.log("Response:", response.data);
    } catch (error: any) {
      console.error(error);
      setMessage({ type: "error", text: "Failed to update truck details!" });
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      label: "Truck Number",
      key: "truckNo",
      placeholder: "KA53RF5015",
      icon: Truck,
    },
    {
      label: "Driver's Name",
      key: "driverName",
      placeholder: "Sudarshana",
      icon: User,
    },
    {
      label: "Driver's Phone",
      key: "driverPhone",
      placeholder: "9876543210",
      icon: Phone,
    },
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
        {fields.map(({ label, key, placeholder, icon: Icon }) => (
          <div
            key={key}
            className="flex flex-col sm:flex-row sm:items-center gap-2"
          >
            <label className="w-40 text-sm font-medium text-gray-600">
              {label}
            </label>
            <div className="relative w-full">
              <Icon className="absolute left-3 top-2.5 text-purple-500 w-4 h-4" />
              <input
                type="text"
                value={form[key as keyof typeof form]}
                onChange={(e) => handleChange(key, e.target.value)}
                placeholder={placeholder}
                className="w-full border border-gray-200 rounded-lg py-2 pl-10 pr-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-400 outline-none transition-all bg-white hover:bg-purple-50"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex justify-end mt-6">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-5 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 shadow-sm transition flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving...
            </>
          ) : (
            "Save Details"
          )}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mt-4 flex items-center gap-2 text-sm ${
            message.type === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          {message.text}
        </div>
      )}
    </div>
  );
}
