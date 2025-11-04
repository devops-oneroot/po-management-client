"use client";

import React, { useState } from "react";
import axios from "axios";
import { Search, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

// 📦 Quantity Enum
enum QuantityUnit {
  QUINTAL = "QUINTAL",
  TON = "TON",
  PIECE = "PIECE",
  KILOGRAM = "KILOGRAM",
  GRAM = "GRAM",
  LITRE = "LITRE",
  BAG = "BAG",
  BOX = "BOX",
}

const AssignBuyerForm = ({
  masterPOId,
  onClose,
}: {
  masterPOId: string;
  onClose?: () => void;
}) => {
  const [search, setSearch] = useState("");
  const [buyers, setBuyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState<any>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    masterPOId: masterPOId,
    userId: selectedBuyer ? selectedBuyer.id : "",
    promisedDate: "",
    promisedQuantity: "",
    promisedQuantityMeasure: "",
    rate: "",
  });

  // 🔍 Search Buyer (by name or number)
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;

    setLoading(true);
    try {
      const isNumber = /^\d+$/.test(search.trim());
      const queryParam = isNumber
        ? `mobileNumber=${search.trim()}`
        : `name=${encodeURIComponent(search.trim())}`;

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/users/buyer?page=1&limit=20&${queryParam}`
      );

      setBuyers(res.data.data || []);
      setMessage(null);
    } catch (err) {
      console.error("Error fetching buyer:", err);
      setMessage({ type: "error", text: "Failed to fetch buyers." });
    } finally {
      setLoading(false);
    }
  };

  // 📨 Submit Assignment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBuyer) {
      setMessage({
        type: "error",
        text: "Please select a buyer before submitting.",
      });
      return;
    }

    const payload = {
      masterPOId,
      userId: selectedBuyer.id,
      promisedDate: formData.promisedDate,
      promisedQuantity: Number(formData.promisedQuantity),
      promisedQuantityMeasure: formData.promisedQuantityMeasure,
      rate: formData.rate,
    };

    setSubmitting(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/master-po-assignees`,
        payload
      );
      console.log("Submitted:", res.data);
      setMessage({ type: "success", text: "Buyer successfully assigned!" });
      setFormData({
        masterPOId: masterPOId,
        userId: "",
        promisedDate: "",
        promisedQuantity: "",
        promisedQuantityMeasure: "",
        rate: "",
      });
      setSelectedBuyer(null);
      setBuyers([]);
      setSearch("");

      // Close modal after 2 seconds if callback provided
      setTimeout(() => {
        onClose?.();
      }, 2000);
    } catch (err) {
      console.error("Error submitting:", err);
      setMessage({ type: "error", text: "Failed to assign buyer." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-base font-semibold mb-4 text-slate-900">
        Search and Assign Buyer
      </h2>

      {/* Alert Message */}
      {message && (
        <div
          className={`flex items-center gap-2 mb-4 text-sm px-4 py-3 rounded-md ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          {message.text}
        </div>
      )}

      {/* Search Section */}
      <form onSubmit={handleSearch} className="flex items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="Search buyer by name or number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-slate-200 rounded-md px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm hover:border-slate-300 transition-colors duration-150"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-md font-medium shadow-sm transition-colors duration-150 text-sm"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin w-4 h-4" />
              <span>Searching...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Search</span>
            </>
          )}
        </button>
      </form>

      {/* Buyer List */}
      {/* {buyers.length > 0 && (
        <div className="mb-6 border border-slate-200 rounded-lg divide-y divide-slate-200">
          {buyers.map((buyer) => (
            <div
              key={buyer.id}
              className={`p-4 cursor-pointer flex justify-between items-center hover:bg-slate-50 transition-colors duration-150 ${
                selectedBuyer?.id === buyer.id
                  ? "bg-blue-50 border-l-4 border-blue-500"
                  : ""
              }`}
              onClick={() => setSelectedBuyer(buyer)}
            >
              <div>
                <p className="font-medium text-slate-900">{buyer.name}</p>
                <p className="text-sm text-slate-600">{buyer.mobileNumber}</p>
                <p className="text-xs text-slate-500">
                  {buyer.village}, {buyer.district}
                </p>
              </div>
              <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-md text-slate-600 border border-slate-200">
                {buyer.identity}
              </span>
            </div>
          ))}
        </div>
      )} */}
      {buyers.length > 0 && (
        <div className="mb-6 border border-slate-200 rounded-lg">
          <div className="divide-y divide-slate-200 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
            {buyers.map((buyer) => (
              <div
                key={buyer.id}
                className={`p-4 cursor-pointer flex justify-between items-center hover:bg-slate-50 transition-colors duration-150 ${
                  selectedBuyer?.id === buyer.id
                    ? "bg-blue-50 border-l-4 border-blue-500"
                    : ""
                }`}
                onClick={() => setSelectedBuyer(buyer)}
              >
                <div>
                  <p className="font-medium text-slate-900">{buyer.name}</p>
                  <p className="text-sm text-slate-600">{buyer.mobileNumber}</p>
                  <p className="text-xs text-slate-500">
                    {buyer.village}, {buyer.district}
                  </p>
                </div>
                <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-md text-slate-600 border border-slate-200">
                  {buyer.identity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form Section */}
      {selectedBuyer && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Promised Date
              </label>
              <input
                type="date"
                value={formData.promisedDate}
                onChange={(e) =>
                  setFormData({ ...formData, promisedDate: e.target.value })
                }
                className="w-full border border-slate-200 rounded-md px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm hover:border-slate-300 transition-colors duration-150"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Promised Quantity
              </label>
              <input
                type="number"
                value={formData.promisedQuantity}
                onChange={(e) =>
                  setFormData({ ...formData, promisedQuantity: e.target.value })
                }
                placeholder="Enter quantity"
                className="w-full border border-slate-200 rounded-md px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm hover:border-slate-300 transition-colors duration-150 placeholder-slate-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Measure
              </label>
              <select
                value={formData.promisedQuantityMeasure}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    promisedQuantityMeasure: e.target.value,
                  })
                }
                className="w-full border border-slate-200 rounded-md px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm hover:border-slate-300 transition-colors duration-150"
              >
                <option value="">Select measure</option>
                {Object.values(QuantityUnit).map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Rate (₹)
              </label>
              <input
                type="text"
                value={formData.rate}
                onChange={(e) =>
                  setFormData({ ...formData, rate: e.target.value })
                }
                placeholder="Enter rate"
                className="w-full border border-slate-200 rounded-md px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm hover:border-slate-300 transition-colors duration-150 placeholder-slate-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-md font-semibold shadow-sm transition-colors duration-150 text-sm"
          >
            {submitting && <Loader2 className="animate-spin w-5 h-5" />}
            {submitting ? "Submitting..." : "Submit Assignment"}
          </button>
        </form>
      )}
    </div>
  );
};

export default AssignBuyerForm;
