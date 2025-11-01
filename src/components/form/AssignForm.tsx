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

const AssignBuyerForm = ({ masterPOId }: { masterPOId: string }) => {
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
        promisedDate: "",
        promisedQuantity: "",
        promisedQuantityMeasure: "",
        rate: "",
      });
      setSelectedBuyer(null);
      setBuyers([]);
      setSearch("");
    } catch (err) {
      console.error("Error submitting:", err);
      setMessage({ type: "error", text: "Failed to assign buyer." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-md border border-gray-100">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Assign Buyer to Master PO
      </h2>

      {/* ✅ Alert Message */}
      {message && (
        <div
          className={`flex items-center gap-2 mb-4 text-sm px-3 py-2 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {message.text}
        </div>
      )}

      {/* 🔍 Search Section */}
      <form onSubmit={handleSearch} className="flex items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="Search buyer by name or number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="animate-spin w-5 h-5" />
          ) : (
            <Search className="w-5 h-5" />
          )}
          Search
        </button>
      </form>

      {/* 👤 Buyer List */}
      {buyers.length > 0 && (
        <div className="mb-6 border rounded-xl divide-y">
          {buyers.map((buyer) => (
            <div
              key={buyer.id}
              className={`p-3 cursor-pointer flex justify-between items-center hover:bg-indigo-50 ${
                selectedBuyer?.id === buyer.id
                  ? "bg-indigo-100 border-l-4 border-indigo-500"
                  : ""
              }`}
              onClick={() => setSelectedBuyer(buyer)}
            >
              <div>
                <p className="font-medium text-gray-800">{buyer.name}</p>
                <p className="text-sm text-gray-500">{buyer.mobileNumber}</p>
                <p className="text-xs text-gray-400">
                  {buyer.village}, {buyer.district}
                </p>
              </div>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                {buyer.identity}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 📝 Form Section */}
      {selectedBuyer && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Promised Date
              </label>
              <input
                type="date"
                value={formData.promisedDate}
                onChange={(e) =>
                  setFormData({ ...formData, promisedDate: e.target.value })
                }
                className="w-full border border-gray-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Promised Quantity
              </label>
              <input
                type="number"
                value={formData.promisedQuantity}
                onChange={(e) =>
                  setFormData({ ...formData, promisedQuantity: e.target.value })
                }
                placeholder="Enter quantity"
                className="w-full border border-gray-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Dropdown for Measure */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">
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
                className="w-full border border-gray-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select measure</option>
                {Object.values(QuantityUnit).map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>

            {/* Rate Field */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Rate In KG
              </label>
              <input
                type="text"
                value={formData.rate}
                onChange={(e) =>
                  setFormData({ ...formData, rate: e.target.value })
                }
                placeholder={`Enter rate per ${
                  formData.promisedQuantityMeasure
                    ? formData.promisedQuantityMeasure.toLowerCase()
                    : "unit"
                }`}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl mt-3 flex items-center justify-center gap-2"
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
