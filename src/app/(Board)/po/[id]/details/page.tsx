"use client";

import React, { useEffect, useState } from "react";
import {
  Phone,
  MessageCircle,
  CheckCircle2,
  CheckCircle,
  Upload,
  MapPin,
  CalendarDays,
  IndianRupee,
  Package,
  Hash,
  ArrowLeft,
  Loader2,
  Edit2,
  X,
} from "lucide-react";

import PaymentDetails from "@/src/components/details/PaymentDetails";
import WeighmentDetails from "@/src/components/details/WeighmentDetails";
import TruckDetails from "@/src/components/details/TruckDetails";
import UploadReports from "@/src/components/details/UploadReports";
import GRNDetails from "@/src/components/details/GRNDetails";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import axios from "axios";

// Format date helper
function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function BuyerDetails() {
  const [status, setStatus] = useState("");
  const [buyer, setBuyer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [deductionNotes, setDeductionNotes] = useState("");
  const [savingNoteType, setSavingNoteType] = useState<
    "additional" | "deduction" | null
  >(null);
  const [reloadKey, setReloadKey] = useState(0);

  // --- Editable Fields ---
  const [editField, setEditField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});
  const [savingField, setSavingField] = useState<string | null>(null);

  const { id } = useParams();
  const router = useRouter();

  // Fetch data
  useEffect(() => {
    if (!id) return;
    const fetchBuyer = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/master-po-assignees/${id}`
        );
        const data = res.data.data;
        setBuyer(data);
        setStatus(data?.status || "");
        setAdditionalNotes(data?.additionalNotes || "");
        setDeductionNotes(data?.deductionNotes || "");

        // Initialize edit values
        setEditValues({
          promisedQuantity: data?.promisedQuantity ?? "",
          promisedQuantityMeasure: data?.promisedQuantityMeasure ?? "QUINTAL",
          rate: data?.rate ?? "",
          promisedDate: data?.promisedDate?.split("T")[0] ?? "", // ISO date format
        });
      } catch (error) {
        console.error("Error fetching buyer details:", error);
        alert("Failed to load buyer details.");
      } finally {
        setLoading(false);
      }
    };

    fetchBuyer();
  }, [id, reloadKey]);

  // Start editing
  const startEdit = (field: string) => {
    setEditField(field);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditField(null);
    setEditValues((prev: any) => ({
      ...prev,
      promisedQuantity: buyer?.promisedQuantity ?? "",
      promisedQuantityMeasure: buyer?.promisedQuantityMeasure ?? "QUINTAL",
      rate: buyer?.rate ?? "",
      promisedDate: buyer?.promisedDate?.split("T")[0] ?? "",
    }));
  };

  // Save field — CORRECT TYPES
  const saveField = async (field: string) => {
    let value = editValues[field];

    // Handle promisedQuantity → number
    if (field === "promisedQuantity") {
      value = Number(value);
      if (isNaN(value) || value <= 0) {
        alert("Quantity must be greater than 0.");
        return;
      }
    }

    // Handle rate → string
    if (field === "rate") {
      if (!value || isNaN(Number(value)) || Number(value) <= 0) {
        alert("Rate must be greater than 0.");
        return;
      }
      value = String(value); // ← Ensure it's a string
    }

    if (field === "promisedDate" && !value) {
      alert("Please select a valid date.");
      return;
    }

    if (field === "promisedQuantityMeasure" && !value) {
      alert("Please select a unit.");
      return;
    }

    setSavingField(field);
    try {
      const payload: any = { [field]: value };

      // Send measure with quantity
      if (field === "promisedQuantity") {
        payload.promisedQuantityMeasure = editValues.promisedQuantityMeasure;
      }

      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/master-po-assignees/${id}`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      alert(`${field.replace(/([A-Z])/g, " $1").trim()} updated successfully!`);
      setEditField(null);
      setReloadKey((k) => k + 1);
    } catch (error: any) {
      console.error("Error updating field:", error);
      const msg =
        error?.response?.data?.message?.[0] ||
        "Update failed. Please check input.";
      alert(msg);
    } finally {
      setSavingField(null);
    }
  };

  // Save Additional Notes
  const handleSaveAdditionalNotes = async () => {
    if (!id) return;
    setSavingNoteType("additional");
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/master-po-assignees/${id}`,
        { additionalNotes }
      );
      alert("Additional Notes updated");
      setReloadKey((k) => k + 1);
    } catch (error) {
      console.error("Error updating additional notes:", error);
      alert("Failed to update Additional Notes");
    } finally {
      setSavingNoteType(null);
    }
  };

  // Save Deduction Notes
  const handleSaveDeductionNotes = async () => {
    if (!id) return;
    setSavingNoteType("deduction");
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/master-po-assignees/${id}`,
        { deductionNotes }
      );
      alert("Deduction Notes updated");
      setReloadKey((k) => k + 1);
    } catch (error) {
      console.error("Error updating deduction notes:", error);
      alert("Failed to update Deduction Notes");
    } finally {
      setSavingNoteType(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-slate-400 animate-spin mx-auto mb-4" />
              <p className="text-sm text-slate-600">Loading buyer details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!buyer) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-red-50 rounded-lg flex items-center justify-center mx-auto mb-6">
              <Package className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Buyer Not Found
            </h3>
            <p className="text-sm text-slate-600">No buyer details found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 hover:border-slate-300 rounded-md font-medium shadow-sm transition-all duration-150 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-600">Status:</span>
            {(buyer?.quantityUnloaded == null ||
              buyer?.rejectedQuantity == null ||
              Number(buyer?.quantityUnloaded) <=
                Number(buyer?.rejectedQuantity)) && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-md">
                <span className="text-xs font-medium text-amber-700">
                  Complete weighment data first
                </span>
              </div>
            )}
            <select
              value={status}
              onChange={async (e) => {
                const newStatus = e.target.value;
                if (newStatus === "COMPLETED") {
                  const unloaded = buyer?.quantityUnloaded;
                  const rejected = buyer?.rejectedQuantity;
                  if (unloaded == null || rejected == null) {
                    alert(
                      "Enter both unloaded and rejected quantity before completing."
                    );
                    return;
                  }
                  if (Number(unloaded) <= Number(rejected)) {
                    alert("Unloaded must be greater than rejected.");
                    return;
                  }
                }

                setStatus(newStatus);
                try {
                  await axios.patch(
                    `${process.env.NEXT_PUBLIC_API_URL}/master-po-assignees/${id}`,
                    { status: newStatus }
                  );
                  alert(`Status updated to ${newStatus}`);
                  setReloadKey((k) => k + 1);
                } catch (error) {
                  console.error("Error updating status:", error);
                  alert("Failed to update status");
                  setStatus(buyer?.status || "");
                }
              }}
              className="border border-slate-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none hover:border-slate-300 transition-colors duration-150"
            >
              <option value="PO_ASSIGNED">PO Assigned</option>
              <option value="VEHICLE_ASSIGNED">Vehicle Assigned</option>
              <option value="WEIGHMENT_DONE">Weighment Done</option>
              <option value="TRUCK_ENROUTE">Truck Enroute</option>
              <option value="GATE_PASS_ISSUED">Gate Pass Issued</option>
              <option value="QC_CHECK_DONE">QC Check Done</option>
              <option value="UNLOADING_DONE">Unloading Done</option>
              <option value="GRN_ISSUED">GRN Issued</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Buyer Info Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200 mb-6">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-200">
            {/* Buyer Info */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-slate-700 font-semibold text-xl">
                {buyer?.user?.name?.charAt(0).toUpperCase() || "B"}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {buyer?.user?.name}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {buyer?.user?.village || "Unknown"},{" "}
                  {buyer?.user?.district || ""}
                </p>
                <div className="flex items-center gap-2 mt-2 text-sm text-slate-700">
                  <Phone className="w-4 h-4 text-slate-500" />
                  <span>{buyer?.user?.mobileNumber || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Editable Stats */}
            <div className="flex gap-3">
              {/* Quantity */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-center relative">
                <p className="text-xs text-slate-600 mb-1">Quantity</p>
                {editField === "promisedQuantity" ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={editValues.promisedQuantity}
                      onChange={(e) =>
                        setEditValues({
                          ...editValues,
                          promisedQuantity: e.target.value,
                        })
                      }
                      className="w-16 px-1 py-0.5 text-sm border border-slate-300 rounded"
                      min="0.01"
                      step="0.01"
                      autoFocus
                    />
                    <select
                      value={editValues.promisedQuantityMeasure}
                      onChange={(e) =>
                        setEditValues({
                          ...editValues,
                          promisedQuantityMeasure: e.target.value,
                        })
                      }
                      className="text-xs border border-slate-300 rounded px-1 py-0.5"
                    >
                      <option value="QUINTAL">QUINTAL</option>
                      <option value="KILOGRAM">KILOGRAM</option>
                      <option value="TON">TON</option>
                    </select>
                    <button
                      onClick={() => saveField("promisedQuantity")}
                      disabled={savingField === "promisedQuantity"}
                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                    >
                      {savingField === "promisedQuantity" ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-lg font-semibold text-slate-900">
                      {buyer?.promisedQuantity || 0}{" "}
                      {buyer?.promisedQuantityMeasure || ""}
                    </p>
                    <button
                      onClick={() => startEdit("promisedQuantity")}
                      className="absolute top-1 right-1 p-1 text-slate-500 hover:text-blue-600"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>

              {/* Rate */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-center relative">
                <p className="text-xs text-slate-600 mb-1">Rate</p>
                {editField === "rate" ? (
                  <div className="flex items-center gap-1">
                    <span className="text-sm">₹</span>
                    <input
                      type="number"
                      value={editValues.rate}
                      onChange={(e) =>
                        setEditValues({ ...editValues, rate: e.target.value })
                      }
                      className="w-16 px-1 py-0.5 text-sm border border-slate-300 rounded"
                      min="0.01"
                      step="0.01"
                      autoFocus
                    />
                    <button
                      onClick={() => saveField("rate")}
                      disabled={savingField === "rate"}
                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                    >
                      {savingField === "rate" ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-lg font-semibold text-slate-900">
                      ₹{buyer?.rate || "N/A"}
                    </p>
                    <button
                      onClick={() => startEdit("rate")}
                      className="absolute top-1 right-1 p-1 text-slate-500 hover:text-blue-600"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>

              {/* Promised Date */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-center relative">
                <p className="text-xs text-slate-600 mb-1">Promised Date</p>
                {editField === "promisedDate" ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="date"
                      value={editValues.promisedDate}
                      onChange={(e) =>
                        setEditValues({
                          ...editValues,
                          promisedDate: e.target.value,
                        })
                      }
                      className="text-sm border border-slate-300 rounded px-1 py-0.5"
                      autoFocus
                    />
                    <button
                      onClick={() => saveField("promisedDate")}
                      disabled={savingField === "promisedDate"}
                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                    >
                      {savingField === "promisedDate" ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-slate-900">
                      {buyer?.promisedDate
                        ? formatDate(buyer.promisedDate)
                        : "N/A"}
                    </p>
                    <button
                      onClick={() => startEdit("promisedDate")}
                      className="absolute top-1 right-1 p-1 text-slate-500 hover:text-blue-600"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
            <div className="flex items-center gap-4">
              <Image
                src={
                  buyer?.masterPO?.poCompany?.company_logo ||
                  "/default-logo.png"
                }
                alt="Company Logo"
                width={56}
                height={56}
                className="rounded-lg border border-slate-200 shadow-sm"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900">
                  {buyer?.masterPO?.poCompany?.name || "Company Name"}
                </h3>
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {buyer?.masterPO?.poCompany?.address || "Company Address"}
                </p>
              </div>
              <div className="flex gap-3">
                <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 text-center">
                  <div className="flex items-center gap-1.5 mb-1">
                    <CalendarDays className="w-4 h-4 text-slate-500" />
                    <span className="text-xs text-slate-600">Issue Date</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    {buyer?.createdAt ? formatDate(buyer.createdAt) : "N/A"}
                  </span>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 text-center">
                  <div className="flex items-center gap-1.5 mb-1">
                    <CalendarDays className="w-4 h-4 text-slate-500" />
                    <span className="text-xs text-slate-600">Fulfill By</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    {buyer?.masterPO?.poExpiryDate || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-200">
              <div>
                <div className="flex items-center gap-2 text-slate-600 mb-1">
                  <IndianRupee className="w-4 h-4" />
                  <span className="text-xs font-medium">PO Price</span>
                </div>
                <p className="text-lg font-semibold text-slate-900">
                  ₹{buyer?.masterPO?.poPrice}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-slate-600 mb-1">
                  <Package className="w-4 h-4" />
                  <span className="text-xs font-medium">Total Quantity</span>
                </div>
                <p className="text-lg font-semibold text-slate-900">
                  {buyer?.masterPO?.poQuantity || 0}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-slate-600 mb-1">
                  <Hash className="w-4 h-4" />
                  <span className="text-xs font-medium">Fulfilled</span>
                </div>
                <p className="text-lg font-semibold text-slate-900">
                  {buyer?.masterPO?.totalSuppliedQuantity || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Details Sections */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <TruckDetails
            id={buyer.id}
            truckNo={buyer.truckNo}
            driverName={buyer.driverName}
            driverPhone={buyer.driverPhone}
            deliveryLocation={buyer.deliveryLocation}
            onUpdate={() => setReloadKey((k) => k + 1)}
          />
          <UploadReports
            id={buyer.id}
            data={buyer}
            onUpdate={() => setReloadKey((k) => k + 1)}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <WeighmentDetails
            id={buyer.id}
            quantityLoaded={buyer.quantityLoaded}
            quantityLoadedMeasure={buyer.quantityLoadedMeasure}
            quantityUnloaded={buyer.quantityUnloaded}
            quantityUnloadedMeasure={buyer.quantityUnloadedMeasure}
            weighmentImages={buyer.weighmentImages}
            onUpdate={() => setReloadKey((k) => k + 1)}
          />
          <GRNDetails
            id={buyer.id}
            grnDate={buyer.grnDate}
            rejectedQuantity={buyer.rejectedQuantity}
            rejectedQuantityMeasure={buyer.rejectedQuantityMeasure}
            grnImages={buyer.grnImages}
            onUpdate={() => setReloadKey((k) => k + 1)}
          />
          <PaymentDetails
            assigneeId={buyer.id}
            onUpdate={() => setReloadKey((k) => k + 1)}
          />
        </div>

        {/* Notes */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              Additional Notes
            </label>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Enter additional notes..."
              className="w-full border border-slate-200 rounded-md p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none hover:border-slate-300 transition-colors duration-150 placeholder-slate-400"
              rows={4}
            />
            <button
              onClick={handleSaveAdditionalNotes}
              disabled={savingNoteType === "additional"}
              className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-md font-medium shadow-sm transition-colors duration-150 text-sm"
            >
              {savingNoteType === "additional" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Notes"
              )}
            </button>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              Deduction Notes
            </label>
            <textarea
              value={deductionNotes}
              onChange={(e) => setDeductionNotes(e.target.value)}
              placeholder="Enter deduction notes..."
              className="w-full border border-slate-200 rounded-md p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none hover:border-slate-300 transition-colors duration-150 placeholder-slate-400"
              rows={4}
            />
            <button
              onClick={handleSaveDeductionNotes}
              disabled={savingNoteType === "deduction"}
              className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-md font-medium shadow-sm transition-colors duration-150 text-sm"
            >
              {savingNoteType === "deduction" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Notes"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
