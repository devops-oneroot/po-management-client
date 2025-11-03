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
  onUpdate?: () => void;
}

export default function TruckDetails({
  id,
  truckNo = "",
  driverName = "",
  driverPhone = "",
  onUpdate,
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
        `${process.env.NEXT_PUBLIC_API_URL}/master-po-assignees/${id}`,
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
      
      // Trigger parent refetch
      setTimeout(() => {
        onUpdate?.();
      }, 1000);
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
    <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-200">
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <Truck className="w-5 h-5 text-slate-600" />
          Truck Details
        </h3>
        <span className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
          Required
        </span>
      </div>

      {/* Form Fields */}
      <div className="flex flex-col gap-4">
        {fields.map(({ label, key, placeholder, icon: Icon }) => (
          <div key={key} className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Icon className="w-4 h-4 text-slate-500" />
              {label}
            </label>
            <input
              type="text"
              value={form[key as keyof typeof form]}
              onChange={(e) => handleChange(key, e.target.value)}
              placeholder={placeholder}
              className="w-full border border-slate-200 rounded-md py-2.5 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-slate-300 placeholder-slate-400"
            />
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex justify-end mt-6 pt-4 border-t border-slate-200">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-md font-medium shadow-sm transition-colors duration-150 text-sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Details"
          )}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mt-4 flex items-center gap-2 p-3 rounded-md text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
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
