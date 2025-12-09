"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Plus,
  Package,
  IndianRupee,
  ChevronDown,
  ChevronUp,
  Edit2,
  X,
  ArrowBigRight,
  ArrowRight,
} from "lucide-react";

import AssignBuyerForm from "@/components/form/AssignForm";
import UploadReports from "@/components/details/UploadReports";
import POForm from "@/components/form/POForm";

enum POStatus {
  INPROGRESS = "INPROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

interface Assignee {
  id: string;
  user: {
    name: string;
    mobileNumber: string;
  };
  promisedQuantity: number;
  promisedQuantityMeasure: string;
  promisedDate: string;
  rate: string;
  quantityLoaded: number | null;
  quantityLoadedMeasure: string | null;
  quantityUnloaded: number | null;
  quantityUnloadedMeasure: string | null;
  rejectedQuantity: number | null;
  rejectedQuantityMeasure: string | null;
  status: string;
  truckNo?: string | null;
  dispatchDate?: string;

  driverName?: string | null;
  driverPhone?: string | null;
  salesInvoiceNo?: string | null;
  deliveryLocation?: string | null;
  grnDate?: string | null;
  dispatches?: Dispatch[];
  weighmentImages?: string[] | null;
  grnImages?: string[] | null;
  paymentSlipImages?: string[] | null;

  qualityReportImages?: string[] | null;
  eWayBillImages?: string[] | null;
  apmcImages?: string[] | null;
  salesInvoiceImages?: string[] | null;
  debitInvoiceImages?: string[] | null;
  miscellaneousDocs?: string[] | null;
}

interface Dispatch {
  truckNo: string | null;
  status: string;
  salesInvoiceNo: string;
  dispatchDate: string;
  promisedDate: string;
  acceptedQty: number;
  rejectedQty: number;
  eWayBill: boolean;
  grnImages: boolean;
  weighmentImages: boolean;
  apmc: boolean;
  purchaseBill: boolean;
  qualityReport: boolean;
  driverDetails: boolean;
  paymentSlip: boolean;
  weighment: boolean;
}

interface MasterPO {
  id: string;
  cropName: string;
  poPrice: string;
  poQuantity: number;
  poQuantityMeasure: string;
  totalSuppliedQuantity: number;
  poExpiryDate: string;
  poStatus: string;
  poNumber: string;
  poIssuedDate: string;
  poCompany: {
    name: string;
    company_logo: string;
    village: string;
    taluk: string;
    district: string;
    state: string;
  };
  assignees: Assignee[];
}

const PurchaseOrdersPage = () => {
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");
  const [poData, setPoData] = useState<MasterPO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedPOId, setSelectedPOId] = useState<string | null>(null);
  const [expandedPO, setExpandedPO] = useState<string | null>(null);
  const [expandedAggregators, setExpandedAggregators] = useState<Set<string>>(
    new Set()
  );
  const [reloadKey, setReloadKey] = useState(0);
  const [editingAssignee, setEditingAssignee] = useState<Assignee | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  const router = useRouter();

  const togglePO = (poId: string) => {
    setExpandedPO(expandedPO === poId ? null : poId);
  };

  const toggleAggregator = (assigneeId: string) => {
    const newSet = new Set(expandedAggregators);
    if (newSet.has(assigneeId)) newSet.delete(assigneeId);
    else newSet.add(assigneeId);
    setExpandedAggregators(newSet);
  };

  const handleAssigneeClick = (mobile: string) => {
    const cleanMobile = mobile.replace(/^\+91/, "").trim();
    router.push(`/assignee/${cleanMobile}`);
  };

  // Fetch correct API based on tab
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const endpoint =
          activeTab === "completed"
            ? `${process.env.NEXT_PUBLIC_API_URL}/master-po/completed`
            : `${process.env.NEXT_PUBLIC_API_URL}/master-po`;

        const res = await fetch(endpoint);
        const result = await res.json();
        setPoData(result?.data || []);
      } catch (err) {
        console.error("Error fetching PO data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab, reloadKey]);

  // const updateAssigneeStatus = async (assigneeId: string, status: string) => {
  //   try {
  //     const res = await fetch(
  //       `${process.env.NEXT_PUBLIC_API_URL}/master-po-assignees/${assigneeId}`,
  //       {
  //         method: "PATCH",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({ status }),
  //       }
  //     );

  //     if (!res.ok) {
  //       const err = await res.json();
  //       throw new Error(err.message || "Failed to update assignee status");
  //     }
  //     setReloadKey((k) => k + 1);
  //   } catch (err: any) {
  //     alert("Failed to update Status: " + err.message);
  //   }
  // };
  const updateAssigneeStatus = async (assigneeId: string, status: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/master-po-assignees/${assigneeId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update assignee status");
      }

      // ✅ UPDATE LOCAL STATE ONLY (NO RELOAD)
      setPoData((prev) =>
        prev.map((po) => ({
          ...po,
          assignees: po.assignees.map((a) =>
            a.id === assigneeId ? { ...a, status } : a
          ),
        }))
      );
    } catch (err: any) {
      alert("Failed to update Status: " + err.message);
    }
  };

  const updatePoStatus = async (poId: string, status: POStatus) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/master-po/${poId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ poStatus: status }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update status");
      }
      setReloadKey((k) => k + 1);
    } catch (err: any) {
      alert("Failed to update PO Status: " + err.message);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`;
  };

  const handleCardClick = (id: string) => {
    router.push(`/po/${id}`);
  };

  const transformedPOs: MasterPO[] = poData.map((po) => {
    const assigneesWithDispatches = po.assignees.map((assignee) => {
      const unloadedKg = assignee.quantityUnloaded || 0;
      const rejectedKg = assignee.rejectedQuantity || 0;

      const dispatch: Dispatch = {
        truckNo: assignee.truckNo || "—",
        salesInvoiceNo: assignee.salesInvoiceNo || "—",
        dispatchDate: assignee.dispatchDate || "",
        promisedDate: assignee.promisedDate,
        status: assignee.status === "COMPLETED" ? "Completed" : "In Progress",

        acceptedQty: unloadedKg / 1000,
        rejectedQty: rejectedKg / 1000,
        eWayBill: !!assignee.eWayBillImages?.length,
        apmc: !!assignee.apmcImages?.length,

        purchaseBill: !!assignee.salesInvoiceImages?.length,
        qualityReport: !!assignee.qualityReportImages?.length,
        driverDetails: !!assignee.driverName,
        paymentSlip: !!assignee.paymentSlipImages?.length,
        grnImages: !!assignee.grnImages?.length,
        weighmentImages: !!assignee.weighmentImages?.length,
        weighment: !!assignee.weighmentImages?.length,
      };

      return { ...assignee, dispatches: [dispatch] };
    });

    return { ...po, assignees: assigneesWithDispatches };
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-8xl mx-auto space-y-6">
        {/* TABS + CREATE BUTTON */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <button
              onClick={() => setActiveTab("active")}
              className={`px-8 py-3 font-medium transition-all ${
                activeTab === "active"
                  ? "bg-black text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Active POs
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`px-8 py-3 font-medium transition-all ${
                activeTab === "completed"
                  ? "bg-green-600 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Completed POs
            </button>
          </div>

          {/* Create PO only on Active tab */}
          {activeTab === "active" && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
            >
              <Plus className="w-5 h-5" />
              Create PO
            </button>
          )}
        </div>

        <h1 className="text-2xl font-bold">
          {activeTab === "completed"
            ? "Completed Purchase Orders"
            : "Purchase Orders"}
        </h1>

        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow h-48 animate-pulse"
              ></div>
            ))}
          </div>
        ) : transformedPOs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg border">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {activeTab === "completed"
                ? "No completed purchase orders found"
                : "No purchase orders found"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {transformedPOs.map((po) => {
              // Calculate assigned tons - convert KILOGRAM to TON if needed
              const assignedTons = po.assignees.reduce((sum, a) => {
                const quantity = a.promisedQuantity || 0;
                const measure = a.promisedQuantityMeasure || "KILOGRAM";
                // Convert to tons: if KILOGRAM divide by 1000, if TON use as-is
                return sum + (measure === "KILOGRAM" ? quantity / 1000 : quantity);
              }, 0);
              const fulfilledTons = po.assignees.reduce((sum, a) => {
                const unloaded = a.quantityUnloaded || 0;
                const measure = a.quantityUnloadedMeasure || "KILOGRAM";
                return (
                  sum + (measure === "KILOGRAM" ? unloaded / 1000 : unloaded)
                );
              }, 0);
              const remainingTons = po.poQuantity - assignedTons;

              const getExpiryInfo = (expiryDate: string) => {
                const today = new Date();
                const expiry = new Date(expiryDate);

                today.setHours(0, 0, 0, 0);
                expiry.setHours(0, 0, 0, 0);

                const diff = expiry.getTime() - today.getTime();
                const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));

                return {
                  isExpired: daysLeft < 0,
                  daysLeft,
                };
              };

              const { isExpired, daysLeft } = getExpiryInfo(po.poExpiryDate);

              return (
                <div
                  key={po.id}
                  className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-visible"
                >
                  {/* PO Header */}
                  {/* <div
                    className="flex items-center justify-between p-4 bg-gray-400 border-b cursor-pointer"
                    onClick={() => togglePO(po.id)}
                  > */}
                  <div
                    className={`flex items-center justify-between p-4 border-b cursor-pointer
      ${isExpired ? "bg-red-400" : "bg-gray-400"}`}
                    onClick={() => togglePO(po.id)}
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={po.poCompany.company_logo}
                        alt={po.poCompany.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-lg">
                          {po.poCompany.name}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {po.poCompany.village}, {po.poCompany.district}
                        </p>
                      </div>
                      <span className="text-sm bg-gray-200 px-3 py-1 rounded-full ml-4">
                        {po.cropName}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-sm bg-gray-200 px-3 py-1 rounded-full ml-4">
                        PO-NO {po.poNumber}
                      </span>
                      {/* Assign Buyer Button - Only on Active Tab */}
                      {activeTab === "active" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPOId(po.id);
                            setShowAssignForm(true);
                          }}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-sm font-medium transition shadow-sm"
                        >
                          <Plus className="w-4 h-4" />
                          Assign Buyer
                          {remainingTons > 0 ? (
                            <span className="text-xs opacity-90">
                              ({remainingTons.toFixed(1)}T left)
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-amber-300">
                              (Over-assign OK)
                            </span>
                          )}
                        </button>
                      )}

                      <button className="p-2 hover:bg-gray-200 rounded-lg transition">
                        {expandedPO === po.id ? <ChevronUp /> : <ChevronDown />}
                      </button>
                    </div>
                  </div>

                  {/* PO Summary */}
                  <div
                    className="grid grid-cols-10 gap-4 p-4 text-sm border-b bg-white"
                    onClick={() => togglePO(po.id)}
                  >
                    <div>
                      <p className="text-gray-500">PO Issued</p>
                      <p className="font-medium">
                        {formatDate(po.poIssuedDate)}
                      </p>
                    </div>
                    {/* <div>
                      <p className="text-gray-500">PO Expiry</p>
                      <p className="font-medium">
                        {formatDate(po.poExpiryDate)}
                      </p>
                    </div> */}
                    <div>
                      <p className="text-gray-500">PO Expiry</p>

                      <p
                        className={`font-medium ${
                          isExpired ? "text-red-600" : ""
                        }`}
                      >
                        {formatDate(po.poExpiryDate)}
                      </p>

                      <p
                        className={`text-xs font-semibold ${
                          isExpired ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {isExpired
                          ? `Expired ${Math.abs(daysLeft)} day(s) ago`
                          : `${daysLeft} day(s) left`}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Our Price</p>
                      <p className="font-medium flex items-center">
                        <IndianRupee className="w-4 h-4" />
                        {po.poPrice}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Tons</p>
                      <p className="font-medium">{po.poQuantity} Tons</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Assigned</p>
                      <p className="font-medium">
                        {assignedTons.toFixed(2)} Tons
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Fulfilled</p>
                      <p className="font-medium text-green-600">
                        {fulfilledTons.toFixed(2)} Tons
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Pending Assign</p>
                      <p
                        className={`font-medium ${
                          remainingTons < 0 ? "text-red-600" : "text-orange-600"
                        }`}
                      >
                        {remainingTons.toFixed(2)} Tons
                        {remainingTons < 0 && " (Over)"}
                      </p>
                    </div>
                    <div className="relative group cursor-pointer">
                      <p className="text-gray-500">Awaiting-fullfillment</p>
                      <p className="font-medium text-orange-600">
                        {(po.poQuantity - fulfilledTons).toFixed(2)} Tons
                      </p>
                      {/* <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 bg-white border border-gray-200 shadow-lg rounded-lg p-3 text-xs opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
                        <p className="font-semibold mb-2 text-gray-700 text-center">
                          Assignee Status
                        </p>
                        {po.assignees.map((assignee) => (
                          <div
                            key={assignee.id}
                            className="flex justify-between gap-3 border-b last:border-b-0 py-1"
                          >
                            <span className="text-gray-600">
                              {assignee.promisedQuantity}{" "}
                              {assignee.promisedQuantityMeasure === "KILOGRAM"
                                ? "KG"
                                : "Tons"}
                            </span>
                            <span className="font-semibold text-blue-600">
                              {assignee.status}
                            </span>
                          </div>
                        ))}
                      </div> */}

                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 bg-white border border-gray-200 shadow-lg rounded-lg p-3 text-xs opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
                        <p className="font-semibold mb-2 text-gray-700 text-center">
                          Assignee Status
                        </p>

                        {po.assignees
                          .filter((assignee) => assignee.status !== "COMPLETED")
                          .map((assignee) => (
                            <div
                              key={assignee.id}
                              className="flex justify-between gap-3 border-b last:border-b-0 py-1"
                            >
                              <span className="text-gray-600">
                                {assignee.promisedQuantity}{" "}
                                {assignee.promisedQuantityMeasure === "KILOGRAM"
                                  ? "KG"
                                  : "Tons"}
                              </span>
                              <span className="font-semibold text-blue-600">
                                {assignee.status}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500">Po-Status</p>
                      <select
                        value={po.poStatus}
                        onChange={(e) =>
                          updatePoStatus(po.id, e.target.value as POStatus)
                        }
                        className="mt-1 w-full rounded-md border border-gray-300 bg-white text-xs px-3 py-1 shadow-sm"
                      >
                        {Object.values(POStatus).map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="px-10">
                      <p className="text-gray-500">View</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(po.id);
                        }}
                        className="text-green-600 hover:underline flex"
                      >
                        click <ArrowRight />
                      </button>
                    </div>
                  </div>

                  {/* Assignees Section */}
                  {expandedPO === po.id && (
                    <div className="p-6 border-t">
                      <div className="space-y-3">
                        {po.assignees.map((assignee) => {
                          // Convert fulfilled to tons
                          const unloaded = assignee.quantityUnloaded || 0;
                          const unloadedMeasure = assignee.quantityUnloadedMeasure || "KILOGRAM";
                          const fulfilled = unloadedMeasure === "KILOGRAM" ? unloaded / 1000 : unloaded;
                          
                          // Convert rejected to tons
                          const rejectedQty = assignee.rejectedQuantity || 0;
                          const rejectedMeasure = assignee.rejectedQuantityMeasure || "KILOGRAM";
                          const rejected = rejectedMeasure === "KILOGRAM" ? rejectedQty / 1000 : rejectedQty;
                          
                          // Convert promised quantity to tons for calculation
                          const promisedQty = assignee.promisedQuantity || 0;
                          const promisedMeasure = assignee.promisedQuantityMeasure || "KILOGRAM";
                          const promisedInTons = promisedMeasure === "KILOGRAM" ? promisedQty / 1000 : promisedQty;
                          
                          const pending = promisedInTons - fulfilled;
                          const dispatch = assignee.dispatches?.[0];
                          const isExpanded = expandedAggregators.has(
                            assignee.id
                          );

                          return (
                            <div
                              key={assignee.id}
                              className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all"
                            >
                              <div
                                className={`p-4 flex items-center gap-4  cursor-pointer hover:bg-gray-300 transition ${
                                  isExpanded ? "bg-gray-300" : ""
                                }`}
                                onClick={() => toggleAggregator(assignee.id)}
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleAggregator(assignee.id);
                                  }}
                                  className="p-1 hover:bg-gray-200 rounded"
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="w-5 h-5" />
                                  ) : (
                                    <ChevronDown className="w-5 h-5" />
                                  )}
                                </button>

                                <div className="flex-1 grid grid-cols-10 gap-1 text-sm">
                                  <div>
                                    <span className="text-gray-500">Name</span>
                                    <p className="font-semibold mt-1">
                                      {assignee.user.name}
                                    </p>
                                  </div>
                                  <div
                                    className="text-blue-600 hover:underline cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAssigneeClick(
                                        assignee.user.mobileNumber
                                      );
                                    }}
                                  >
                                    <span className="text-gray-500">
                                      Mobile
                                    </span>
                                    <p className="font-semibold mt-1">
                                      {assignee.user.mobileNumber}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">
                                      sales No
                                    </span>
                                    <p className="font-semibold mt-1">
                                      {dispatch?.salesInvoiceNo || "—"}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">
                                      Vehicle No
                                    </span>
                                    <p className="font-semibold mt-1">
                                      {dispatch?.truckNo || "—"}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Rate</span>
                                    <p className="font-semibold mt-1">
                                      ₹{assignee.rate}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">
                                      Assigned
                                    </span>
                                    <p className="font-semibold mt-1">
                                      {assignee.promisedQuantity}{" "}
                                      {assignee.promisedQuantityMeasure === "KILOGRAM"
                                        ? "KG"
                                        : "Tons"}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">
                                      Fulfilled
                                    </span>
                                    <p className="font-semibold mt-1">
                                      {fulfilled.toFixed(2)} Tons
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">
                                      Rejected
                                    </span>
                                    <p className="font-semibold mt-1">
                                      {rejected.toFixed(2)} Tons
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">
                                      Pending
                                    </span>
                                    <p className="font-bold mt-1 text-orange-600">
                                      {pending.toFixed(2)} Tons
                                    </p>
                                  </div>
                                  <div>
                                    <label className="block text2sm font-medium text-gray-700">
                                      Status
                                    </label>
                                    <select
                                      value={assignee.status}
                                      // onChange={(e) =>
                                      //   updateAssigneeStatus(
                                      //     assignee.id,
                                      //     e.target.value
                                      //   )
                                      // }
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        updateAssigneeStatus(
                                          assignee.id,
                                          e.target.value
                                        );
                                      }}
                                    >
                                      {[
                                        "PO_ASSIGNED",
                                        "VEHICLE_ASSIGNED",
                                        "WEIGHMENT_DONE",
                                        "TRUCK_ENROUTE",
                                        "GATE_PASS_ISSUED",
                                        "QC_CHECK_DONE",
                                        "UNLOADING_DONE",
                                        "GRN_ISSUED",
                                        "COMPLETED",
                                        "REJECTED",
                                        "CANCELLED",
                                      ].map((s) => (
                                        <option key={s} value={s}>
                                          {s.replace(/_/g, " ")}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              </div>

                              {isExpanded && dispatch && (
                                <div className="border-t border-gray-200 bg-gray-50 px-2 py-5">
                                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-10 gap-1 text-sm items-end">
                                    <div className="text-center">
                                      <span className="text-gray-500">
                                        Edit
                                      </span>
                                      <p className="mt-1">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingAssignee(assignee);
                                            setShowEditForm(true);
                                          }}
                                          className="text-blue-600 hover:underline font-medium text-base"
                                        >
                                          <Edit2 />
                                        </button>
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">
                                        Vehicle No
                                      </span>
                                      <p className="font-semibold mt-1">
                                        {dispatch.truckNo}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">
                                        Status
                                      </span>
                                      <p className="font-semibold mt-1">
                                        {dispatch.status}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">
                                        Promised-Date
                                      </span>
                                      <p className="font-medium mt-1">
                                        {formatDate(dispatch.promisedDate)}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">
                                        Dispatch-date
                                      </span>
                                      <p className="font-medium mt-1">
                                        {formatDate(dispatch.dispatchDate)}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">
                                        Accepted
                                      </span>
                                      <p className="text-green-600 font-medium mt-1">
                                        {dispatch.acceptedQty.toFixed(2)} Ton
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">
                                        Rejected
                                      </span>
                                      <p className="text-red-600 font-medium mt-1">
                                        {dispatch.rejectedQty.toFixed(2)} Ton
                                      </p>
                                    </div>
                                    <div className="flex gap-4">
                                      {[
                                        { label: "E-Way", key: "eWayBill" },
                                        { label: "APMC", key: "apmc" },
                                        { label: "Sales", key: "purchaseBill" },
                                        {
                                          label: "Payment",
                                          key: "paymentSlip",
                                        },
                                        {
                                          label: "Quality",
                                          key: "qualityReport",
                                        },
                                        {
                                          label: "Driver",
                                          key: "driverDetails",
                                        },
                                        {
                                          label: "Weighment",
                                          key: "weighmentImages",
                                        },
                                        {
                                          label: "grn Image",
                                          key: "grnImages",
                                        },
                                      ].map(({ label, key }) => {
                                        const hasDoc =
                                          dispatch[key as keyof Dispatch];
                                        return (
                                          <div
                                            key={key}
                                            className="text-center"
                                          >
                                            <p className="text-xs text-gray-500 mb-1">
                                              {label}
                                            </p>
                                            <span
                                              className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold ${
                                                hasDoc
                                                  ? "bg-green-100 text-green-800"
                                                  : "bg-red-100 text-red-800"
                                              }`}
                                            >
                                              {hasDoc ? "Yes" : "No"}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Assign Buyer Modal */}
        {showAssignForm && selectedPOId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  Assign Buyer
                </h3>
                <button
                  onClick={() => {
                    setShowAssignForm(false);
                    setSelectedPOId(null);
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <AssignBuyerForm
                  masterPOId={selectedPOId}
                  onClose={() => {
                    setShowAssignForm(false);
                    setSelectedPOId(null);
                    setReloadKey((k) => k + 1);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Create PO Modal */}
        {showForm && activeTab === "active" && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-2xl font-bold">
                  Create New Purchase Order
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <POForm
                  onClose={() => {
                    setShowForm(false);
                    setReloadKey((k) => k + 1);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* FULL EDIT MODAL - EXACTLY YOUR ORIGINAL */}
        {showEditForm && editingAssignee && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
                <h2 className="text-2xl font-bold">
                  Edit Assignee - {editingAssignee.user.name}
                </h2>
                <button
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingAssignee(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-8">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const payload = {
                      promisedQuantity: Number(
                        formData.get("promisedQuantity")
                      ),
                      rate: formData.get("rate") as string,
                      promisedDate: formData.get("promisedDate") as string,
                      dispatchDate: formData.get("dispatchDate") as string,
                      status: formData.get("status") as string,
                      truckNo: (formData.get("truckNo") as string) || null,
                      driverName:
                        (formData.get("driverName") as string) || null,
                      driverPhone:
                        (formData.get("driverPhone") as string) || null,
                      salesInvoiceNo:
                        (formData.get("salesInvoiceNo") as string) || null,
                      deliveryLocation:
                        (formData.get("deliveryLocation") as string) || null,
                      grnDate: (formData.get("grnDate") as string) || null,
                      quantityLoaded: formData.get("quantityLoaded")
                        ? Number(formData.get("quantityLoaded"))
                        : null,
                      quantityLoadedMeasure:
                        (formData.get("quantityLoadedMeasure") as string) ||
                        "KILOGRAM",
                      quantityUnloaded: formData.get("quantityUnloaded")
                        ? Number(formData.get("quantityUnloaded"))
                        : null,
                      quantityUnloadedMeasure:
                        (formData.get("quantityUnloadedMeasure") as string) ||
                        "KILOGRAM",
                      rejectedQuantity: formData.get("rejectedQuantity")
                        ? Number(formData.get("rejectedQuantity"))
                        : null,
                      rejectedQuantityMeasure:
                        (formData.get("rejectedQuantityMeasure") as string) ||
                        "KILOGRAM",
                    };

                    try {
                      const res = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/master-po-assignees/${editingAssignee.id}`,
                        {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(payload),
                        }
                      );

                      if (res.ok) {
                        alert("Updated successfully!");
                        setReloadKey((k) => k + 1);
                        setShowEditForm(false);
                      } else {
                        const err = await res.json();
                        alert("Failed: " + (err.message || "Try again"));
                      }
                    } catch (err) {
                      alert("Network error");
                    }
                  }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Promised Quantity (Tons)
                      </label>
                      <input
                        name="promisedQuantity"
                        type="number"
                        step="0.01"
                        defaultValue={editingAssignee.promisedQuantity}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-4 py-2 border"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Rate (₹/Ton)
                      </label>
                      <input
                        name="rate"
                        type="text"
                        defaultValue={editingAssignee.rate}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-4 py-2 border"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Promised Date
                      </label>
                      <input
                        name="promisedDate"
                        type="date"
                        defaultValue={editingAssignee.promisedDate}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-4 py-2 border"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        dispatch-date
                      </label>
                      <input
                        name="dispatchDate"
                        type="date"
                        defaultValue={editingAssignee.dispatchDate}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-4 py-2 border"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        name="status"
                        defaultValue={editingAssignee.status}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-4 py-2 border"
                      >
                        {[
                          "PO_ASSIGNED",
                          "VEHICLE_ASSIGNED",
                          "WEIGHMENT_DONE",
                          "TRUCK_ENROUTE",
                          "GATE_PASS_ISSUED",
                          "QC_CHECK_DONE",
                          "UNLOADING_DONE",
                          "GRN_ISSUED",
                          "REJECTED",
                          "COMPLETED",
                          "CANCELLED",
                        ].map((s) => (
                          <option key={s} value={s}>
                            {s.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Truck No
                      </label>
                      <input
                        name="truckNo"
                        type="text"
                        defaultValue={editingAssignee.truckNo || ""}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-4 py-2 border"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        sales No
                      </label>
                      <input
                        name="salesInvoiceNo"
                        type="text"
                        defaultValue={editingAssignee.salesInvoiceNo || ""}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-4 py-2 border"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Loading location
                      </label>
                      <input
                        name="deliveryLocation"
                        type="text"
                        defaultValue={editingAssignee.deliveryLocation || ""}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-4 py-2 border"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        GRN Date
                      </label>
                      <input
                        name="grnDate"
                        type="date"
                        defaultValue={editingAssignee.grnDate || ""}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-4 py-2 border"
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">
                      Quantity Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {["Loaded", "Unloaded", "Rejected"].map((label, i) => {
                        const name =
                          i === 0
                            ? "quantityLoaded"
                            : i === 1
                            ? "quantityUnloaded"
                            : "rejectedQuantity";
                        const measure = name + "Measure";
                        return (
                          <div key={name}>
                            <label className="block text-sm font-medium text-gray-700">
                              {label} Quantity
                            </label>
                            <div className="flex gap-3 mt-1">
                              <input
                                type="number"
                                step="0.001"
                                name={name}
                                defaultValue={
                                  (editingAssignee[
                                    name as keyof Assignee
                                  ] as any) || ""
                                }
                                className="flex-1 rounded-md border-gray-300 shadow-sm px-3 py-2 border"
                              />
                              <select
                                name={measure}
                                defaultValue={
                                  (editingAssignee[
                                    measure as keyof Assignee
                                  ] as string) || "KILOGRAM"
                                }
                                className="w-32 rounded-md border-gray-300 px-3 py-2 border"
                              >
                                <option value="KILOGRAM">KG</option>
                                <option value="TON">Ton</option>
                              </select>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">
                      Driver Details
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                      <input
                        name="driverName"
                        type="text"
                        placeholder="Driver Name"
                        defaultValue={editingAssignee.driverName || ""}
                        className="rounded-md border-gray-300 shadow-sm px-4 py-2 border"
                      />
                      <input
                        name="driverPhone"
                        type="text"
                        placeholder="Driver Phone"
                        defaultValue={editingAssignee.driverPhone || ""}
                        className="rounded-md border-gray-300 shadow-sm px-4 py-2 border"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-8">
                    <UploadReports
                      id={editingAssignee.id}
                      data={editingAssignee}
                      onUpdate={() => setReloadKey((k) => k + 1)}
                    />
                  </div>

                  <div className="flex justify-end gap-4 pt-6 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditForm(false);
                        setEditingAssignee(null);
                      }}
                      className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-10 py-3 bg-black text-white rounded-lg hover:bg-gray-800 font-medium transition"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseOrdersPage;