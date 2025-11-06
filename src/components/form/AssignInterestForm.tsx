"use client";

import React, { useState } from "react";
import axios from "axios";
import { Search, Loader2, CheckCircle2, AlertCircle, X } from "lucide-react";

interface Buyer {
  id: string;
  name: string;
  mobileNumber: string;
  village: string;
  district: string;
  identity: string;
}

interface AssignInterestFormProps {
  /** The PO that the buyer will be interested in */
  poId: string;
  /** Optional callback – called after a successful POST (modal close, refresh list…) */
  onClose?: () => void;
}

/**
 *  AssignInterestForm
 *  -------------------------------------------------
 *  1. Search buyer by name or mobile
 *  2. Pick one buyer
 *  3. Fill quantity + commit date
 *  4. POST to /po-interested
 */
const AssignInterestForm: React.FC<AssignInterestFormProps> = ({
  poId,
  onClose,
}) => {
  /* ────────────────────────────────────── STATE ────────────────────────────────────── */
  const [search, setSearch] = useState("");
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);

  const [quantity, setQuantity] = useState("");
  const [commitDate, setCommitDate] = useState("");

  const [msg, setMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  /* ─────────────────────────────────── SEARCH BUYER ─────────────────────────────────── */
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;

    setLoading(true);
    setMsg(null);
    try {
      const isNumber = /^\d+$/.test(search.trim());
      const param = isNumber
        ? `mobileNumber=${search.trim()}`
        : `name=${encodeURIComponent(search.trim())}`;

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/users/buyer?page=1&limit=30&${param}`
      );

      setBuyers(res.data.data || []);
    } catch (err) {
      console.error(err);
      setMsg({ type: "error", text: "Failed to fetch buyers." });
    } finally {
      setLoading(false);
    }
  };

  /* ─────────────────────────────────── SUBMIT INTEREST ─────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBuyer) {
      setMsg({ type: "error", text: "Please select a buyer first." });
      return;
    }
    if (!quantity || !commitDate) {
      setMsg({ type: "error", text: "Quantity and commit date are required." });
      return;
    }

    const payload = {
      userId: selectedBuyer.id,
      poId,
      quantity: Number(quantity),
      commitDate: new Date(commitDate).toISOString().split("T")[0], // YYYY-MM-DD
    };

    setSubmitting(true);
    setMsg(null);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/po-interested`,
        payload
      );

      setMsg({ type: "success", text: "Interest recorded successfully!" });

      // reset form
      setQuantity("");
      setCommitDate("");
      setSelectedBuyer(null);
      setBuyers([]);
      setSearch("");

      // auto-close after a short delay (optional)
      setTimeout(() => onClose?.(), 1800);
    } catch (err: any) {
      console.error(err);
      const txt = err.response?.data?.message || "Failed to record interest.";
      setMsg({ type: "error", text: txt });
    } finally {
      setSubmitting(false);
    }
  };

  /* ────────────────────────────────────── UI ────────────────────────────────────── */
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-slate-900">
          Add Buyer Interest
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* ──────── Message ──────── */}
      {msg && (
        <div
          className={`flex items-center gap-2 mb-4 px-4 py-2.5 rounded-md text-sm ${
            msg.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {msg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          {msg.text}
        </div>
      )}

      {/* ──────── Search Form ──────── */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Buyer name or mobile…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-md font-medium text-sm transition-colors"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          <span>{loading ? "Searching…" : "Search"}</span>
        </button>
      </form>

      {/* ──────── Buyer List ──────── */}
      {buyers.length > 0 && (
        <div className="mb-5 border border-slate-200 rounded-md max-h-64 overflow-y-auto">
          {buyers.map((b) => (
            <div
              key={b.id}
              onClick={() => setSelectedBuyer(b)}
              className={`p-3 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors ${
                selectedBuyer?.id === b.id
                  ? "bg-blue-50 border-l-4 border-blue-500"
                  : ""
              }`}
            >
              <div>
                <p className="font-medium text-slate-900">{b.name}</p>
                <p className="text-sm text-slate-600">{b.mobileNumber}</p>
                <p className="text-xs text-slate-500">
                  {b.village}, {b.district}
                </p>
              </div>
              <span className="text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {b.identity}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ──────── Interest Form (shown after buyer selected) ──────── */}
      {selectedBuyer && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 100"
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Commit Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Commit Date
              </label>
              <input
                type="date"
                required
                value={commitDate}
                onChange={(e) => setCommitDate(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-md font-medium text-sm transition-colors"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            {submitting ? "Saving…" : "Record Interest"}
          </button>
        </form>
      )}
    </div>
  );
};

export default AssignInterestForm;
