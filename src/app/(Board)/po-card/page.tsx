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
  buyerUserId: string;
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
  truckOwnerName?: string | null;
  truckOwnerPhone?: string | null;
  salesInvoiceNo?: string | null;
  transportArrangeBy?: string | null;
  deliveryLocation?: string | null;
  grnDate?: string | null;
  dispatches?: Dispatch[];
  weighmentImages?: string[] | null;
  grnImages?: string[] | null;
  rcBookUrl?: string[] | null;

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
  transportArrangeBy: string;
  dispatchDate: string;
  promisedDate: string;
  acceptedQty: number;
  rejectedQty: number;
  eWayBill: boolean;
  grnImages: boolean;
  rcBookUrl: boolean;
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
  assignedBuyers?: Array<any>; // raw from API
  assignees: Assignee[]; // transformed for UI
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
  const [showTruckForm, setShowTruckForm] = useState(false);
  const [selectedBuyerForTruck, setSelectedBuyerForTruck] = useState<{
    masterPOId: string;
    userId: string;
    buyerName: string;
  } | null>(null);

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

  const updateAssigneeStatus = async (
    assigneeId: string,
    newStatus: string
  ) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/master-po-assignees/${assigneeId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to update status");
      }

      // UPDATE THE RAW assignedBuyers DATA SO TRANSFORMATION SEES THE CHANGE
      setPoData((prevPOs) =>
        prevPOs.map((po) => ({
          ...po,
          assignedBuyers: po.assignedBuyers?.map((assignedBuyer: any) => ({
            ...assignedBuyer,
            assignees: assignedBuyer.assignees.map((assignee: any) =>
              assignee.id === assigneeId
                ? { ...assignee, status: newStatus }
                : assignee
            ),
          })),
        }))
      );

      // Optional success feedback
      // console.log("Status updated instantly!");
    } catch (error: any) {
      alert("Error updating status: " + error.message);
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

  const transformedPOs = React.useMemo(() => {
    return poData.map((po) => {
      const rawAssignedBuyers = po.assignedBuyers || [];

      const assigneesWithDispatches = rawAssignedBuyers
        .map((assignedBuyer: any) => {
          const assigneeRecords = assignedBuyer.assignees || [];

          // Case 1: No truck added yet → only show buyer with basic info, no truck row
          if (assigneeRecords.length === 0) {
            return {
              id: assignedBuyer.id + "-placeholder", // unique ID
              buyerUserId: assignedBuyer.userId,
              user: {
                name: assignedBuyer.user.name,
                mobileNumber: assignedBuyer.user.mobileNumber,
              },
              promisedQuantity: assignedBuyer.promisedQuantity || 0,
              promisedQuantityMeasure:
                assignedBuyer.promisedQuantityMeasure || "TON",
              promisedDate: assignedBuyer.promisedDate || "",
              rate: assignedBuyer.rate || "0",
              status: "PO_ASSIGNED",
              // Mark as placeholder so UI knows not to show truck details
              isPlaceholder: true,
              dispatches: [],
            };
          }

          // Case 2: Real trucks exist → map normally
          return assigneeRecords.map((assignee: any) => {
            const unloadedKg = assignee.quantityUnloaded || 0;
            const rejectedKg = assignee.rejectedQuantity || 0;

            const dispatch: Dispatch = {
              truckNo: assignee.truckNo || "—",
              salesInvoiceNo: assignee.salesInvoiceNo || "—",
              transportArrangeBy: assignee.transportArrangeBy || "-",
              dispatchDate: assignee.dispatchDate || "",
              promisedDate:
                assignee.promisedDate || assignedBuyer.promisedDate || "",
              status:
                assignee.status === "COMPLETED" ? "Completed" : "In Progress",
              acceptedQty: unloadedKg / 1000,
              rejectedQty: rejectedKg / 1000,
              eWayBill: !!assignee.eWayBillImages?.length,
              apmc: !!assignee.apmcImages?.length,
              purchaseBill: !!assignee.salesInvoiceImages?.length,
              qualityReport: !!assignee.qualityReportImages?.length,
              driverDetails: !!assignee.driverName,
              paymentSlip: !!assignee.paymentSlipImages?.length,
              grnImages: !!assignee.grnImages?.length,
              rcBookUrl: !!assignee.rcBookUrl?.length,
              weighmentImages: !!assignee.weighmentImages?.length,
              weighment: !!assignee.weighmentImages?.length,
            };

            return {
              id: assignee.id,
              buyerUserId: assignedBuyer.userId,
              user: {
                name: assignedBuyer.user.name,
                mobileNumber: assignedBuyer.user.mobileNumber,
              },
              promisedQuantity:
                assignee.promisedQuantity ||
                assignedBuyer.promisedQuantity ||
                0,
              promisedQuantityMeasure:
                assignee.promisedQuantityMeasure ||
                assignedBuyer.promisedQuantityMeasure ||
                "TON",
              promisedDate:
                assignee.promisedDate || assignedBuyer.promisedDate || "",
              rate: assignee.rate || assignedBuyer.rate || "0",
              status: assignee.status || "VEHICLE_ASSIGNED",
              quantityLoaded: assignee.quantityLoaded,
              quantityLoadedMeasure: assignee.quantityLoadedMeasure,
              quantityUnloaded: assignee.quantityUnloaded,
              quantityUnloadedMeasure: assignee.quantityUnloadedMeasure,
              rejectedQuantity: assignee.rejectedQuantity,
              rejectedQuantityMeasure: assignee.rejectedQuantityMeasure,
              truckNo: assignee.truckNo,
              dispatchDate: assignee.dispatchDate,
              driverName: assignee.driverName,
              driverPhone: assignee.driverPhone,
              truckOwnerName: assignee.truckOwnerName,
              truckOwnerPhone: assignee.truckOwnerPhone,
              salesInvoiceNo: assignee.salesInvoiceNo,
              transportArrangeBy: assignee.transportArrangeBy,
              deliveryLocation: assignee.deliveryLocation,
              grnDate: assignee.grnDate,
              dispatches: [dispatch],
              isPlaceholder: false,
              // images
              weighmentImages: assignee.weighmentImages,
              grnImages: assignee.grnImages,
              rcBookUrl: assignee.rcBookUrl,
              paymentSlipImages: assignee.paymentSlipImages,
              qualityReportImages: assignee.qualityReportImages,
              eWayBillImages: assignee.eWayBillImages,
              apmcImages: assignee.apmcImages,
              salesInvoiceImages: assignee.salesInvoiceImages,
              debitInvoiceImages: assignee.debitInvoiceImages,
              miscellaneousDocs: assignee.miscellaneousDocs,
            };
          });
        })
        .flat();

      return {
        ...po,
        assignees: assigneesWithDispatches,
      };
    });
  }, [poData]);
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
              // Safe access to assignees (in case of empty PO)
              const assignees = po.assignees || [];

              // Calculate totals safely
              const assignedTons = assignees.reduce((sum, a) => {
                const quantity = a.promisedQuantity || 0;
                const measure = a.promisedQuantityMeasure || "KILOGRAM";
                return (
                  sum + (measure === "KILOGRAM" ? quantity / 1000 : quantity)
                );
              }, 0);

              const fulfilledTons = assignees.reduce((sum, a) => {
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
                return { isExpired: daysLeft < 0, daysLeft };
              };

              const { isExpired, daysLeft } = getExpiryInfo(po.poExpiryDate);

              return (
                <div
                  key={po.id}
                  className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-visible"
                >
                  {/* PO Header */}
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
                      <p className="text-gray-500">Assigned-Agg</p>
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
                                {assignee.quantityLoaded}{" "}
                                {assignee.quantityLoadedMeasure === "KILOGRAM"
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
                        className="text-green-600 hover:underline flex items-center gap-1"
                      >
                        click <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Assignees Section */}
                  {expandedPO === po.id && assignees.length > 0 && (
                    <div className="p-6 border-t">
                      <div className="space-y-6">
                        {/* Group by buyer */}
                        {Object.values(
                          assignees.reduce((groups, assignee) => {
                            const key = assignee.buyerUserId;
                            if (!groups[key]) {
                              groups[key] = {
                                buyerUserId: key,
                                user: assignee.user,
                                dispatches: [],
                              };
                            }
                            groups[key].dispatches.push(assignee);
                            return groups;
                          }, {} as Record<string, { buyerUserId: string; user: Assignee["user"]; dispatches: Assignee[] }>)
                        ).map((group) => {
                          const { user, dispatches } = group;

                          const buyerAssignedTons = dispatches.reduce(
                            (sum, a) =>
                              sum +
                              (a.promisedQuantityMeasure === "KILOGRAM"
                                ? (a.promisedQuantity || 0) / 1000
                                : a.promisedQuantity || 0),
                            0
                          );
                          const buyerFulfilledTons = dispatches.reduce(
                            (sum, a) =>
                              sum +
                              (a.quantityUnloadedMeasure === "KILOGRAM"
                                ? (a.quantityUnloaded || 0) / 1000
                                : a.quantityUnloaded || 0),
                            0
                          );
                          const buyerRejectedTons = dispatches.reduce(
                            (sum, a) =>
                              sum +
                              (a.rejectedQuantityMeasure === "KILOGRAM"
                                ? (a.rejectedQuantity || 0) / 1000
                                : a.rejectedQuantity || 0),
                            0
                          );
                          const buyerPendingTons =
                            buyerAssignedTons - buyerFulfilledTons;

                          const isBuyerExpanded = expandedAggregators.has(
                            group.buyerUserId
                          );

                          const buyerSuppliedTons = dispatches.reduce(
                            (sum, a) => {
                              const qty = Number(a.quantityLoaded ?? 0);
                              const measure =
                                a.quantityLoadedMeasure || "KILOGRAM";
                              return (
                                sum +
                                (measure === "KILOGRAM" ? qty / 1000 : qty)
                              );
                            },
                            0
                          );

                          return (
                            <div
                              key={group.buyerUserId}
                              className="bg-white border border-gray-300 rounded-xl overflow-hidden shadow-md"
                            >
                              {/* Buyer Header */}
                              <div
                                className="bg-gradient-to-r from-indigo-50 to-blue-50 p-5 border-b border-gray-200 cursor-pointer hover:bg-indigo-100 transition"
                                onClick={() =>
                                  toggleAggregator(group.buyerUserId)
                                }
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="bg-indigo-200 rounded-full w-14 h-14 flex items-center justify-center text-indigo-800 font-bold text-2xl">
                                      {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <h3 className="text-xl font-bold text-gray-800">
                                        {user.name}
                                      </h3>
                                      <p
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleAssigneeClick(
                                            user.mobileNumber
                                          );
                                        }}
                                        className="text-indigo-600 hover:underline font-medium"
                                      >
                                        {user.mobileNumber}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-8">
                                    <div className="grid grid-cols-6 gap-6 text-sm">
                                      <div>
                                        <span className="text-gray-500">
                                          Rate
                                        </span>
                                        <p className="font-semibold text-green-700">
                                          ₹{dispatches[0].rate || "-"}
                                        </p>
                                      </div>
                                      <div className="text-center">
                                        <p className="text-gray-600 font-medium">
                                          Assigned
                                        </p>
                                        <p className="text-lg font-bold text-blue-700">
                                          {buyerAssignedTons.toFixed(2)} Tons
                                        </p>
                                      </div>
                                      <div className="text-center">
                                        <p className="text-gray-600 font-medium">
                                          Supplied
                                        </p>
                                        <p className="text-lg font-bold text-black">
                                          {buyerSuppliedTons.toFixed(2)} Tons
                                        </p>
                                      </div>
                                      <div className="text-center">
                                        <p className="text-gray-600 font-medium">
                                          Fulfilled
                                        </p>
                                        <p className="text-lg font-bold text-green-600">
                                          {buyerFulfilledTons.toFixed(2)} Tons
                                        </p>
                                      </div>
                                      <div className="text-center">
                                        <p className="text-gray-600 font-medium">
                                          Rejected
                                        </p>
                                        <p className="text-lg font-bold text-red-600">
                                          {buyerRejectedTons.toFixed(2)} Tons
                                        </p>
                                      </div>
                                      <div className="text-center">
                                        <p className="text-gray-600 font-medium">
                                          Pending
                                        </p>
                                        <p className="text-lg font-bold text-orange-600">
                                          {buyerPendingTons.toFixed(2)} Tons
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedBuyerForTruck({
                                            masterPOId: po.id,
                                            userId: group.buyerUserId,
                                            buyerName: user.name,
                                          });
                                          setShowTruckForm(true);
                                        }}
                                        className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 transition"
                                      >
                                        <Plus className="w-5 h-5" />
                                        Add Truck
                                      </button>

                                      <button className="p-2 hover:bg-indigo-200 rounded-lg transition">
                                        {isBuyerExpanded ? (
                                          <ChevronUp className="w-6 h-6" />
                                        ) : (
                                          <ChevronDown className="w-6 h-6" />
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Trucks List */}
                              {isBuyerExpanded && (
                                <div className="divide-y divide-gray-200">
                                  {dispatches.map((assignee) => {
                                    // If it's just a placeholder (no truck yet), show clean message
                                    if (assignee.isPlaceholder) {
                                      return (
                                        <div
                                          key={assignee.id}
                                          className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg"
                                        >
                                          <p className="text-lg font-medium">
                                            No truck assigned yet
                                          </p>
                                          <p className="text-sm mt-2">
                                            Click "Add Truck" to assign the
                                            first dispatch
                                          </p>
                                        </div>
                                      );
                                    }

                                    // Real truck exists → show full details
                                    const dispatch = assignee.dispatches?.[0];
                                    const fulfilled =
                                      (assignee.quantityUnloaded || 0) /
                                      (assignee.quantityUnloadedMeasure ===
                                      "KILOGRAM"
                                        ? 1000
                                        : 1);
                                    const rejected =
                                      (assignee.rejectedQuantity || 0) /
                                      (assignee.rejectedQuantityMeasure ===
                                      "KILOGRAM"
                                        ? 1000
                                        : 1);
                                    const promised =
                                      (assignee.promisedQuantity || 0) /
                                      (assignee.promisedQuantityMeasure ===
                                      "KILOGRAM"
                                        ? 1000
                                        : 1);
                                    const pending = promised - fulfilled;

                                    return (
                                      <div
                                        key={assignee.id}
                                        className="p-5 hover:bg-gray-50"
                                      >
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 text-sm">
                                          <div>
                                            <span className="text-gray-500">
                                              Truck No
                                            </span>
                                            <p className="font-semibold">
                                              {dispatch?.truckNo || "—"}
                                            </p>
                                          </div>
                                          <div>
                                            <span className="text-gray-500">
                                              Driver
                                            </span>
                                            <p className="font-semibold">
                                              {assignee.driverName || "—"}
                                            </p>
                                          </div>
                                          <div>
                                            <span className="text-gray-500">
                                              Sales Invoice
                                            </span>
                                            <p className="font-semibold">
                                              {dispatch?.salesInvoiceNo || "—"}
                                            </p>
                                          </div>
                                          <div>
                                            <span className="text-gray-500">
                                              Transport By
                                            </span>
                                            <p className="font-semibold">
                                              {dispatch?.transportArrangeBy ||
                                                "—"}
                                            </p>
                                          </div>
                                          <div>
                                            <span className="text-gray-500">
                                              Dispatch
                                            </span>
                                            <p className="font-semibold text-green-700">
                                              {assignee.dispatchDate}
                                            </p>
                                          </div>
                                          <div>
                                            <span className="text-gray-500">
                                              Assigned
                                            </span>
                                            <p className="font-semibold">
                                              {assignee.quantityLoaded || 0}{" "}
                                              {assignee.quantityLoadedMeasure ===
                                              "KILOGRAM"
                                                ? "KG"
                                                : "Tons"}
                                            </p>
                                          </div>
                                          <div>
                                            <span className="text-gray-500">
                                              Fulfilled
                                            </span>
                                            <p className="font-semibold text-green-600">
                                              {fulfilled.toFixed(2)} Tons
                                            </p>
                                          </div>
                                          <div>
                                            <span className="text-gray-500">
                                              Rejected
                                            </span>
                                            <p className="font-semibold text-red-600">
                                              {rejected.toFixed(2)} Tons
                                            </p>
                                          </div>
                                          <div>
                                            <span className="text-gray-500">
                                              Pending
                                            </span>
                                            <p className="font-bold text-orange-600">
                                              {pending.toFixed(2)} Tons
                                            </p>
                                          </div>
                                          <div className="col-span-3 flex items-center gap-4">
                                            <select
                                              value={assignee.status}
                                              onChange={(e) =>
                                                updateAssigneeStatus(
                                                  assignee.id,
                                                  e.target.value
                                                )
                                              }
                                              className="flex-1 px-3 py-2 text-xs rounded border border-gray-300 bg-white"
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
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingAssignee(assignee);
                                                setShowEditForm(true);
                                              }}
                                              className="p-2.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                                            >
                                              <Edit2 className="w-5 h-5" />
                                            </button>
                                          </div>
                                        </div>

                                        {dispatch && (
                                          <div className="mt-4 pt-4 border-t border-gray-100">
                                            <div className="flex flex-wrap gap-3">
                                              {[
                                                {
                                                  label: "E-Way",
                                                  has: dispatch.eWayBill,
                                                },
                                                {
                                                  label: "APMC",
                                                  has: dispatch.apmc,
                                                },
                                                {
                                                  label: "Sales Bill",
                                                  has: dispatch.purchaseBill,
                                                },
                                                {
                                                  label: "Payment",
                                                  has: dispatch.paymentSlip,
                                                },
                                                {
                                                  label: "Quality",
                                                  has: dispatch.qualityReport,
                                                },
                                                {
                                                  label: "Driver",
                                                  has: dispatch.driverDetails,
                                                },
                                                {
                                                  label: "Weighment",
                                                  has: dispatch.weighmentImages,
                                                },
                                                {
                                                  label: "GRN",
                                                  has: dispatch.grnImages,
                                                },
                                                {
                                                  label: "RC Book",
                                                  has: dispatch.rcBookUrl,
                                                },
                                              ].map(({ label, has }) => (
                                                <span
                                                  key={label}
                                                  className={`px-4 py-2 rounded-full text-xs font-semibold ${
                                                    has
                                                      ? "bg-green-100 text-green-800"
                                                      : "bg-red-100 text-red-800"
                                                  }`}
                                                >
                                                  {label}: {has ? "Yes" : "No"}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Show message if no assignees */}
                  {expandedPO === po.id && assignees.length === 0 && (
                    <div className="p-6 border-t text-center text-gray-500">
                      No buyers assigned yet.
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
                      dispatchDate:
                        (formData.get("dispatchDate") as string) || null,
                      status: formData.get("status") as string,
                      truckNo: (formData.get("truckNo") as string) || null,
                      truckOwnerName:
                        (formData.get("truckOwnerName") as string) || null,
                      truckOwnerPhone:
                        (formData.get("truckOwnerPhone") as string) || null,
                      driverName:
                        (formData.get("driverName") as string) || null,
                      driverPhone:
                        (formData.get("driverPhone") as string) || null,

                      salesInvoiceNo:
                        (formData.get("salesInvoiceNo") as string) || null,
                      transportArrangeBy:
                        (formData.get("transportArrangeBy") as string) || null,
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
                        onWheel={(e) => e.currentTarget.blur()}
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
                        defaultValue={editingAssignee.dispatchDate || ""}
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
                        transportArrangeBy
                      </label>

                      <select
                        name="transportArrangeBy"
                        defaultValue={editingAssignee.transportArrangeBy || ""}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-4 py-2 border bg-white"
                      >
                        <option value="" disabled>
                          Select option
                        </option>
                        <option value="Oneroot">Oneroot</option>
                        <option value="Trader">Trader</option>
                      </select>
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
                                onWheel={(e) => e.currentTarget.blur()}
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
                      Truck Owner Detail
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                      <input
                        name="truckOwnerName"
                        type="text"
                        placeholder="truckOwner Name"
                        defaultValue={editingAssignee.truckOwnerName || ""}
                        className="rounded-md border-gray-300 shadow-sm px-4 py-2 border"
                      />
                      <input
                        name="truckOwnerPhone"
                        type="text"
                        placeholder="truckOwner Phone"
                        defaultValue={editingAssignee.truckOwnerPhone || ""}
                        className="rounded-md border-gray-300 shadow-sm px-4 py-2 border"
                      />
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

        {/* ADD TRUCK MODAL - FULLY CORRECTED WITH LOADING STATE & ALL FIELDS */}
        {showTruckForm && selectedBuyerForTruck && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
                <h2 className="text-2xl font-bold">
                  Assign Truck for {selectedBuyerForTruck.buyerName}
                </h2>
                <button
                  onClick={() => {
                    setShowTruckForm(false);
                    setSelectedBuyerForTruck(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();

                    // Prevent double submission
                    const form = e.currentTarget;
                    if (form.dataset.submitting === "true") return;
                    form.dataset.submitting = "true";

                    const submitButton = form.querySelector(
                      'button[type="submit"]'
                    ) as HTMLButtonElement;
                    if (submitButton) submitButton.disabled = true;

                    try {
                      const formData = new FormData(form);

                      const payload = {
                        masterPOId: selectedBuyerForTruck.masterPOId,
                        userId: selectedBuyerForTruck.userId,
                        truckNo:
                          (formData.get("truckNo") as string)?.trim() || null,
                        driverName:
                          (formData.get("driverName") as string)?.trim() ||
                          null,
                        driverPhone:
                          (formData.get("driverPhone") as string)?.trim() ||
                          null,
                        truckOwnerName: formData.get("truckOwnerName")
                          ? (formData.get("truckOwnerName") as string).trim()
                          : null,
                        truckOwnerPhone: formData.get("truckOwnerPhone")
                          ? (formData.get("truckOwnerPhone") as string).trim()
                          : null,
                        quantityLoaded: Number(formData.get("quantityLoaded")),
                        quantityLoadedMeasure: formData.get(
                          "quantityLoadedMeasure"
                        ) as string,
                        salesInvoiceNo: formData.get("salesInvoiceNo")
                          ? (formData.get("salesInvoiceNo") as string).trim()
                          : null,
                        dispatchDate: formData.get("dispatchDate") as string,
                        transportArrangeBy: formData.get(
                          "transportArrangeBy"
                        ) as string,
                        status: "VEHICLE_ASSIGNED",
                        additionalNotes: formData.get("additionalNotes")
                          ? (formData.get("additionalNotes") as string).trim()
                          : null,
                      };

                      const res = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/master-po/truck/add`,
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(payload),
                        }
                      );

                      const data = await res.json();

                      if (res.ok) {
                        alert("Truck assigned successfully!");
                        setShowTruckForm(false);
                        setSelectedBuyerForTruck(null);
                        setReloadKey((k) => k + 1);
                      } else {
                        alert("Failed: " + (data.message || "Unknown error"));
                      }
                    } catch (err) {
                      console.error("Truck assign error:", err);
                      alert("Network error – please try again");
                    } finally {
                      // Re-enable form and button
                      form.dataset.submitting = "false";
                      if (submitButton) submitButton.disabled = false;
                    }
                  }}
                  className="space-y-6"
                  data-submitting="false"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Truck No */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Truck No
                      </label>
                      <input
                        name="truckNo"
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-4 py-2 border focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Driver Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Driver Name
                      </label>
                      <input
                        name="driverName"
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-4 py-2 border focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Driver Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Driver Phone
                      </label>
                      <input
                        name="driverPhone"
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-4 py-2 border focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Truck Owner Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Truck Owner Name
                      </label>
                      <input
                        name="truckOwnerName"
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-4 py-2 border focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Truck Owner Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Truck Owner Phone
                      </label>
                      <input
                        name="truckOwnerPhone"
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-4 py-2 border focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Sales Invoice No */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Sales Invoice No
                      </label>
                      <input
                        name="salesInvoiceNo"
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-4 py-2 border focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Dispatch Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Dispatch Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="dispatchDate"
                        type="date"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-4 py-2 border focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Transport Arranged By */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Transport Arranged By{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="transportArrangeBy"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-4 py-2 border focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select...</option>
                        <option value="Oneroot">Oneroot</option>
                        <option value="Trader">Trader</option>
                      </select>
                    </div>

                    {/* Loaded Quantity */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Loaded Quantity <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="quantityLoaded"
                        type="number"
                        step="0.01"
                        required
                        min="0"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-4 py-2 border focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Measure */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Measure <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="quantityLoadedMeasure"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-4 py-2 border focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="KILOGRAM">Kilogram</option>
                        <option value="QUINTAL">Quintal</option>
                        <option value="TON">Ton</option>
                      </select>
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      name="additionalNotes"
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-4 py-2 border focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Any extra information about this dispatch..."
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end gap-4 pt-6 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        setShowTruckForm(false);
                        setSelectedBuyerForTruck(null);
                      }}
                      className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={false} // Will be controlled by JS
                      className="px-10 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition flex items-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <span>Assign Truck</span>
                      {/* Optional spinner can be added here later */}
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
