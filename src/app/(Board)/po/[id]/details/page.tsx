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
  ArrowBigRight,
} from "lucide-react";

import PaymentDetails from "@/src/components/details/PaymentDetails";
import WeighmentAndGRNDetails from "@/src/components/details/WeighmentDetails";
import TruckDetails from "@/src/components/details/TruckDetails";
import UploadReports from "@/src/components/details/UploadReports";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import WeighmentDetails from "@/src/components/details/WeighmentDetails";
import GRNDetails from "@/src/components/details/GRNDetails";

// Utility function to format date as DD/MM/YYYY
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

  const [updating, setUpdating] = useState(false);

  const [selectedBuyer, setSelectedBuyer] = useState({
    stages: [
      { id: 1, name: "PO Created", icon: CheckCircle2, completed: true },
      {
        id: 2,
        name: "Material Dispatched",
        icon: CheckCircle2,
        completed: false,
      },
      {
        id: 3,
        name: "Material Received",
        icon: CheckCircle2,
        completed: false,
      },
      { id: 4, name: "Payment Done", icon: CheckCircle2, completed: false },
    ],
  });

  const { id } = useParams();
  const router = useRouter();

  // --- Fetch Buyer Assignment Details ---
  useEffect(() => {
    if (!id) return;

    // const fetchBuyer = async () => {
    //   try {
    //     setLoading(true);
    //     const res = await axios.get(
    //       `https://markhet-internal-dev.onrender.com/master-po-assignees/${id}`
    //     );
    //     setBuyer(res.data.data);
    //     setAdditionalNotes(res.data.data?.additionalNotes || "");
    //     setDeductionNotes(res.data.data?.deductionNotes || "");
    //   } catch (error) {
    //     console.error("Error fetching buyer details:", error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    const fetchBuyer = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `https://markhet-internal-dev.onrender.com/master-po-assignees/${id}`
        );
        setBuyer(res.data.data);
        setStatus(res.data.data?.status || "");
        setAdditionalNotes(res.data.data?.additionalNotes || "");
        setDeductionNotes(res.data.data?.deductionNotes || "");
      } catch (error) {
        console.error("Error fetching buyer details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBuyer();
  }, [id]);

  const toggleStageCompletion = (stageId: number) => {
    setSelectedBuyer((prev) => ({
      ...prev,
      stages: prev.stages.map((stage) =>
        stage.id === stageId ? { ...stage, completed: !stage.completed } : stage
      ),
    }));
  };

  // ✅ Save Additional Notes
  const handleSaveAdditionalNotes = async () => {
    if (!id) return;
    setSavingNoteType("additional");
    try {
      await axios.patch(
        `https://markhet-internal-dev.onrender.com/master-po-assignees/${id}`,
        {
          additionalNotes,
        }
      );
      alert("Additional Notes updated successfully ✅");
    } catch (error) {
      console.error("Error updating additional notes:", error);
      alert("Failed to update Additional Notes ❌");
    } finally {
      setSavingNoteType(null);
    }
  };

  // ✅ Save Deduction Notes
  const handleSaveDeductionNotes = async () => {
    if (!id) return;
    setSavingNoteType("deduction");
    try {
      await axios.patch(
        `https://markhet-internal-dev.onrender.com/master-po-assignees/${id}`,
        {
          deductionNotes,
        }
      );
      alert("Deduction Notes updated successfully ✅");
    } catch (error) {
      console.error("Error updating deduction notes:", error);
      alert("Failed to update Deduction Notes ❌");
    } finally {
      setSavingNoteType(null);
    }
  };

  const handleImageUpload = (id: number, file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setSelectedBuyer((prev) => ({
      ...prev,
      stages: prev.stages.map((stage) =>
        stage.id === id ? { ...stage, image: imageUrl } : stage
      ),
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <p className="text-gray-500 animate-pulse">Loading buyer details...</p>
      </div>
    );
  }

  if (!buyer) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <p className="text-gray-600">No buyer details found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8 font-sans text-gray-800">
      {/* ---- Back Button + Status ---- */}
      <div className="flex justify-between px-5 mt-3">
        <button
          onClick={() => router.back()}
          className="inline-flex w-32 h-10 items-center gap-1 bg-purple-600 hover:bg-purple-700 active:scale-[0.98] transition-all text-white font-semibold text-xl shadow-2xl px-3 py-1.5 rounded-lg border border-gray-300"
        >
          <ArrowBigRight className="w-10 h-10 rotate-180" />
          Back
        </button>
        <div className="flex justify-end px-2 items-center gap-4">
          <div className="flex flex-col items-start">
            <label className="text-sm font-semibold text-gray-700">
              Status
            </label>
            <select
              value={status}
              onChange={async (e) => {
                const newStatus = e.target.value;
                setStatus(newStatus);

                try {
                  await axios.patch(
                    `https://markhet-internal-dev.onrender.com/master-po-assignees/${id}`,
                    { status: newStatus }
                  );
                  alert(`Status updated to ${newStatus} ✅`);
                } catch (error) {
                  console.error("Error updating status:", error);
                  alert("Failed to update status ❌");
                }
              }}
              className="mt-1 block w-48 rounded-lg border-gray-300 bg-white text-gray-700 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
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
      </div>

      {/* ---- Header Section ---- */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mt-6">
        <div className="flex flex-col md:flex-row justify-between gap-6 border-b pb-6">
          {/* Buyer Info */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center font-semibold text-gray-700">
              {buyer?.user?.name?.charAt(0).toUpperCase() || "B"}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {buyer?.user?.name}
              </h2>
              <p className="text-gray-500 text-sm">
                {buyer?.user?.village || "Unknown"},{" "}
                {buyer?.user?.district || ""}
              </p>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-700">
                <Phone className="w-4 h-4 text-blue-500" />
                <MessageCircle className="w-4 h-4 text-green-500" />
                <span>{buyer?.user?.mobileNumber || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Quantity + Price + Date */}
          <div className="flex flex-wrap gap-4 items-center justify-end">
            <div className="bg-blue-50 px-5 py-3 rounded-xl text-center">
              <p className="text-sm font-medium text-gray-700">
                Agreed Quantity
              </p>
              <p className="text-xl font-bold text-blue-600">
                {buyer?.promisedQuantity || 0}{" "}
                {buyer?.promisedQuantityMeasure || ""}
              </p>
            </div>
            <div className="bg-green-50 px-5 py-3 rounded-xl text-center">
              <p className="text-sm font-medium text-gray-700">Agreed Price</p>
              <p className="text-xl font-bold text-green-600">
                ₹{buyer?.rate || "N/A"}
              </p>
            </div>
            <div className="bg-gray-50 px-5 py-3 rounded-xl text-center">
              <p className="text-sm font-medium text-gray-700">Promised Date</p>
              <p className="text-xl font-bold text-gray-800">
                {buyer?.promisedDate
                  ? new Date(buyer.promisedDate).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className=" w-[900px] mt-8 shadow-2xl rounded-2xl border border-gray-100 p-8 mb-10 mx-auto hover:shadow-xl transition-all duration-300 ">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <Image
                src={
                  buyer?.masterPO?.poCompany?.company_logo ||
                  "/default-logo.png"
                }
                alt="Company Logo"
                width={60}
                height={60}
                className="rounded-full border border-gray-200 shadow-sm"
              />

              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-800 tracking-tight">
                  {buyer?.masterPO?.poCompany?.name || "Company Name"}
                </h2>
                <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-indigo-500" />
                  {buyer?.masterPO?.poCompany?.address || "Company Address"}
                </p>
                {buyer?.poExpiryDate ? formatDate(buyer.poExpiryDate) : "N/A"}
              </div>
            </div>

            <div className="flex justify-center items-center text-center gap-2">
              <div className=" gap-2 text-sm text-gray-700 border border-gray-200 bg-gradient-to-br from-white to-indigo-50 shadow-sm px-5 py-2 rounded-lg">
                <span className="flex gap-2">
                  PO ISSUE DATE{" "}
                  <CalendarDays className="w-4 h-4 text-indigo-600" />{" "}
                </span>
                <div>
                  <span className="font-semibold text-xl md:text-xl text-indigo-600">
                    {buyer?.createdAt ? formatDate(buyer.createdAt) : "N/A"}
                  </span>
                </div>
              </div>

              <div className=" gap-2 text-sm text-gray-700 border border-gray-200 bg-gradient-to-br from-white to-indigo-50 shadow-sm px-5 py-2 rounded-lg">
                <span className="flex gap-1">
                  To be fulfilled by{" "}
                  <CalendarDays className="w-4 h-4 text-indigo-600" />{" "}
                </span>
                <div>
                  <span className="font-semibold text-xl md:text-xl text-indigo-600">
                    {buyer?.poExpiryDate}
                    {buyer?.masterPO?.poExpiryDate}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-col md:flex-row justify-between mt-12 gap-10 md:gap-0 text-center md:text-left px-10">
            <div>
              <div className="flex items-center gap-2 text-indigo-600">
                <IndianRupee className="w-5 h-5" />
                <p className="text-sm font-medium text-gray-600">Our Price</p>
              </div>
              <p className="text-3xl font-semibold text-gray-800">
                ₹{buyer?.masterPO?.poPrice}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-green-600">
                <Package className="w-5 h-5" />
                <p className="text-sm font-medium text-gray-600">
                  Total Quantity
                </p>
              </div>
              <p className="text-5xl font-semibold text-gray-800">
                {buyer?.masterPO?.poQuantity}{" "}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-purple-600">
                <Hash className="w-5 h-5" />
                <p className="text-sm font-medium text-gray-600">
                  Total fulfilled
                </p>
              </div>
              <p className="text-3xl font-semibold text-gray-800">
                {buyer?.masterPO?.totalSuppliedQuantity}
              </p>
            </div>
          </div>
        </div>

        {/* ---- Progress Stages ---- */}
        {/* <div className="relative w-full max-w-3xl mx-auto mb-12 mt-10">
          <div className="absolute top-8 left-0 w-full h-1 bg-gray-200 rounded-full">
            <div
              className="h-1 bg-purple-500 rounded-full transition-all duration-500"
              style={{
                width: `${
                  (selectedBuyer.stages.filter((s) => s.completed).length /
                    selectedBuyer.stages.length) *
                  100
                }%`,
              }}
            />
          </div> */}
        {/* 
          <div className="flex justify-between items-center relative z-10">
            {selectedBuyer.stages.map((stage) => {
              const Icon = stage.icon;
              return (
                <div
                  key={stage.id}
                  className="flex flex-col items-center text-center cursor-pointer group"
                  onClick={() => toggleStageCompletion(stage.id)}
                >
                  <div
                    className={`w-16 h-16 flex items-center justify-center rounded-full border-4 transition-all duration-300 ${
                      stage.completed
                        ? "bg-purple-100 border-purple-500 text-purple-600"
                        : "bg-gray-100 border-gray-300 text-gray-400 group-hover:border-purple-300"
                    }`}
                  >
                    {stage.completed ? (
                      <CheckCircle className="w-8 h-8 text-purple-600" />
                    ) : (
                      <Icon className="w-8 h-8" />
                    )}
                  </div>
                  <span
                    className={`mt-3 text-sm font-medium ${
                      stage.completed ? "text-purple-600" : "text-gray-500"
                    }`}
                  >
                    {stage.name}
                  </span> */}

        {/* Image Upload */}
        {/* <div className="mt-3">
                    <label className="cursor-pointer text-xs text-purple-600 hover:underline flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleImageUpload(stage.id, e.target.files[0]);
                          }
                        }}
                      />
                    </label>

                    {stage.image && (
                      <div className="mt-2">
                        <img
                          src={stage.image}
                          alt="Stage proof"
                          className="w-20 h-20 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div> */}

        {/* Details Sections */}
        <div className="mt-3 flex flex-col md:flex-row gap-4">
          <TruckDetails
            id={buyer.id}
            truckNo={buyer.truckNo}
            driverName={buyer.driverName}
            driverPhone={buyer.driverPhone}
          />

          {/* <UploadReports id={id} data={buyer} /> */}
          <UploadReports id={buyer.id} data={buyer} />
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <WeighmentDetails
            id={buyer.id}
            quantityLoaded={buyer.quantityLoaded}
            quantityLoadedMeasure={buyer.quantityLoadedMeasure}
            quantityUnloaded={buyer.quantityUnloaded}
            quantityUnloadedMeasure={buyer.quantityUnloadedMeasure}
            weighmentImages={buyer.weighmentImages}
          />

          <GRNDetails
            id={buyer.id}
            grnDate={buyer.grnDate}
            rejectedQuantity={buyer.rejectedQuantity}
            rejectedQuantityMeasure={buyer.rejectedQuantityMeasure}
            grnImages={buyer.grnImages}
          />
          <PaymentDetails
            id={buyer.payments?.[0]?.id}
            assigneeId={buyer.id}
            // assigneeId={buyer.payments?.[0]?.assigneeId}
            paymentDate={buyer.payments?.[0]?.paymentDate}
            amount={buyer.payments?.[0]?.amount}
            refNo={buyer.payments?.[0]?.refNo}
            paymentSlipImages={buyer.payments?.[0]?.paymentSlipImages}
          />
        </div>

        {/* Notes */}
        {/* --- Additional Notes --- */}
        {/* --- Additional Notes --- */}
        <div className="mt-6 px-12 bg-white rounded-2xl p-6 shadow border border-gray-100">
          <label className="block font-semibold mb-2 text-gray-700">
            Additional Notes
          </label>
          <textarea
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="Enter additional notes..."
            className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            rows={3}
          />
          <button
            onClick={handleSaveAdditionalNotes}
            disabled={savingNoteType === "additional"}
            className="mt-3 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg shadow-sm transition-all"
          >
            {savingNoteType === "additional"
              ? "Saving..."
              : "Save Additional Notes"}
          </button>
        </div>

        {/* --- Deduction Notes --- */}
        <div className="mt-6 px-12 bg-white rounded-2xl p-6 shadow border border-gray-100">
          <label className="block font-semibold mb-2 text-gray-700">
            Deduction Notes
          </label>
          <textarea
            value={deductionNotes}
            onChange={(e) => setDeductionNotes(e.target.value)}
            placeholder="Enter deduction notes..."
            className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            rows={3}
          />
          <button
            onClick={handleSaveDeductionNotes}
            disabled={savingNoteType === "deduction"}
            className="mt-3 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg shadow-sm transition-all"
          >
            {savingNoteType === "deduction"
              ? "Saving..."
              : "Save Deduction Notes"}
          </button>
        </div>
      </div>
    </div>
  );
}
