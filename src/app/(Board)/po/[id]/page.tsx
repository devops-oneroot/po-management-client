"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  Eye,
  Hash,
  IndianRupee,
  MapPin,
  Package,
  Plus,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import AssignForm from "@/src/components/form/AssignForm";

enum POStatus {
  INPROGRESS = "INPROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

interface Aggregator {
  _id: string;
  name: string;
  dateOfInterest: string;
  quantityPromised: string;
  rate: string;
  promisedDate: string;
  status: string;
}

const BuyerDetails = () => {
  const router = useRouter();
  const { id } = useParams();
  const [poData, setPoData] = useState<any>(null);
  const [aggregators, setAggregators] = useState<Aggregator[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [poStatus, setPoStatus] = useState<POStatus | string>("");
  const [reloadKey, setReloadKey] = useState(0);

  // Fetch PO data using dynamic id (refetches when reloadKey changes)
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/master-po/${id}`
        );
        const json = await res.json();

        if (json?.data) {
          setPoData(json.data);
          setAggregators(json.data.aggregators || []);
          setPoStatus(json.data.poStatus || "");
        }
      } catch (err) {
        console.error("Error fetching PO:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, reloadKey]);

  const handleStatusChange = async (newStatus: POStatus) => {
    try {
      setPoStatus(newStatus);
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/master-po/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ poStatus: newStatus }),
      });
      // Refetch data to show updated status
      setReloadKey((k) => k + 1);
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case POStatus.COMPLETED:
        return "bg-green-50 text-green-700 border border-green-200";
      case POStatus.INPROGRESS:
        return "bg-blue-50 text-blue-700 border border-blue-200";
      case POStatus.CANCELLED:
        return "bg-red-50 text-red-700 border border-red-200";
      default:
        return "bg-slate-100 text-slate-600 border border-slate-200";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-slate-400 animate-spin mx-auto mb-4" />
              <p className="text-sm text-slate-600">Loading PO details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!poData) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-red-50 rounded-lg flex items-center justify-center mx-auto mb-6">
              <Package className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">PO Not Found</h3>
            <p className="text-sm text-slate-600">The purchase order doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  const {
    poCompany,
    poExpiryDate,
    poPrice,
    poQuantity,
    specification,
    termsAndConditions,
    totalSuppliedQuantity,
  } = poData;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push("/po-card")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 hover:border-slate-300 rounded-md font-medium shadow-sm transition-all duration-150 text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to POs</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-600">Status:</span>
            <select
              value={poStatus}
              onChange={(e) => handleStatusChange(e.target.value as POStatus)}
              className="border border-slate-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none hover:border-slate-300 transition-colors duration-150"
            >
              <option value={POStatus.INPROGRESS}>In Progress</option>
              <option value={POStatus.COMPLETED}>Completed</option>
              <option value={POStatus.CANCELLED}>Cancelled</option>
            </select>
          </div>
        </div>

        {/* Company Info Card */}
        <div className="bg-white shadow-sm rounded-lg border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                src={poCompany?.company_logo || "/default-logo.png"}
                alt="Company Logo"
                width={64}
                height={64}
                className="rounded-lg border border-slate-200 shadow-sm"
              />

              <div>
                <h2 className="text-2xl font-semibold text-slate-900">
                  {poCompany?.name || "Company Name"}
                </h2>
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {poCompany?.address || "Location"}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-center">
                <div className="flex items-center gap-1.5 mb-1">
                  <CalendarDays className="w-4 h-4 text-slate-500" />
                  <span className="text-xs text-slate-600">Issue Date</span>
                </div>
                <span className="text-lg font-semibold text-slate-900">
                  {formatDate(poExpiryDate)}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-center">
                <div className="flex items-center gap-1.5 mb-1">
                  <CalendarDays className="w-4 h-4 text-slate-500" />
                  <span className="text-xs text-slate-600">Fulfill By</span>
                </div>
                <span className="text-lg font-semibold text-slate-900">
                  {formatDate(poExpiryDate)}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-200">
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <IndianRupee className="w-5 h-5 text-slate-600" />
                <span className="text-sm font-medium text-slate-600">Price</span>
              </div>
              <p className="text-2xl font-semibold text-slate-900">₹{poPrice}</p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5 text-slate-600" />
                <span className="text-sm font-medium text-slate-600">Total Quantity</span>
              </div>
              <p className="text-2xl font-semibold text-slate-900">
                {poQuantity} Tons
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <Hash className="w-5 h-5 text-slate-600" />
                <span className="text-sm font-medium text-slate-600">Fulfilled</span>
              </div>
              <p className="text-2xl font-semibold text-slate-900">
                {totalSuppliedQuantity || 0}
              </p>
            </div>
          </div>

          {/* Specification & Terms */}
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Specification
              </label>
              <p className="text-sm text-slate-700 leading-relaxed">
                {specification || "No specification provided"}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Terms & Conditions
              </label>
              <p className="text-sm text-slate-700 leading-relaxed">
                {termsAndConditions || "No terms provided"}
              </p>
            </div>
          </div>

          {/* Assign Button */}
          <div className="flex justify-end mt-6">
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-medium shadow-sm transition-colors duration-150 text-sm"
            >
              <Plus className="w-4 h-4" />
              Assign Buyer
            </button>
          </div>
        </div>

        {/* Assign Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Assign Buyer</h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <span className="text-xl">×</span>
                </button>
              </div>
              <div className="p-6">
                <AssignForm 
                  masterPOId={String(id)} 
                  onClose={() => {
                    setShowForm(false);
                    setReloadKey((k) => k + 1); // Trigger refetch after assignment
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Assignees Table */}
        <div className="bg-white shadow-sm border border-slate-200 rounded-lg overflow-hidden mt-6">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
            <h3 className="text-base font-semibold text-slate-900">Assigned Buyers</h3>
            <p className="text-sm text-slate-600 mt-1">
              {poData.assignees?.length || 0} buyer{poData.assignees?.length !== 1 ? 's' : ''} assigned
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    "S. No",
                    "Assignee",
                    "Mobile",
                    "Interest Date",
                    "Quantity",
                    "Rate",
                    "Promised Date",
                    "Status",
                    "Action",
                  ].map((heading, i) => (
                    <th
                      key={i}
                      className="text-left px-6 py-3 text-xs font-semibold text-slate-900 uppercase border-b border-slate-200"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {poData.assignees && poData.assignees.length > 0 ? (
                  poData.assignees.map((assignee: any, index: number) => (
                    <tr
                      key={assignee.id}
                      className="hover:bg-slate-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 text-sm text-slate-600">{index + 1}</td>

                      {/* Assignee Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-slate-200 text-slate-700 rounded-full flex items-center justify-center text-sm font-semibold">
                            {assignee.user?.name?.charAt(0)?.toUpperCase() || "A"}
                          </div>
                          <span className="text-sm font-medium text-slate-900">
                            {assignee.user?.name}
                          </span>
                        </div>
                      </td>

                      {/* Mobile Number */}
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {assignee.user?.mobileNumber || "N/A"}
                      </td>

                      {/* Interest Date */}
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(assignee.createdAt)}
                      </td>

                      {/* Quantity */}
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {assignee.promisedQuantity}{" "}
                        {assignee.promisedQuantityMeasure}
                      </td>

                      {/* Rate */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-slate-700">
                          <IndianRupee className="w-4 h-4 text-slate-500" />
                          {assignee.rate}
                        </div>
                      </td>

                      {/* Promised Date */}
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(assignee.promisedDate)}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getStatusColor(
                            assignee.status
                          )}`}
                        >
                          {assignee.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => router.push(`/po/${assignee.id}/details`)}
                          className="inline-flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-medium shadow-sm transition-colors duration-150"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={9}
                      className="text-center text-slate-500 py-12"
                    >
                      <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-sm">No assignees found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDetails;
