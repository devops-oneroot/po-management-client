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
} from "lucide-react";
import Image from "next/image";
import POForm from "@/src/components/form/POForm";
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
  const { id } = useParams(); // ✅ Get dynamic id from URL
  const [poData, setPoData] = useState<any>(null);
  const [aggregators, setAggregators] = useState<Aggregator[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [poStatus, setPoStatus] = useState<POStatus | string>("");

  // ✅ Fetch PO data using dynamic id
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const res = await fetch(
          `https://markhet-internal-dev.onrender.com/master-po/${id}`
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
  }, [id]);

  const handleStatusChange = async (newStatus: POStatus) => {
    try {
      setPoStatus(newStatus);
      await fetch(`https://markhet-internal-dev.onrender.com/master-po/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ poStatus: newStatus }),
      });
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case POStatus.COMPLETED:
        return "bg-green-100 text-green-700";
      case POStatus.INPROGRESS:
        return "bg-blue-100 text-blue-700";
      case POStatus.CANCELLED:
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-600";
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

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading...
      </div>
    );

  if (!poData)
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        PO not found.
      </div>
    );

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
        <button
          onClick={() => router.push("/po-card")}
          className="flex items-center gap-2 text-gray-700 hover:text-black transition border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium ">Back to PO Card</span>
        </button>

        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <span className="text-gray-600 font-medium">Status:</span>
          <select
            value={poStatus}
            onChange={(e) => handleStatusChange(e.target.value as POStatus)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value={POStatus.INPROGRESS}>INPROGRESS</option>
            <option value={POStatus.COMPLETED}>COMPLETED</option>
            <option value={POStatus.CANCELLED}>CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Buyer Info */}
      <div className="bg-white shadow-lg rounded-2xl border border-gray-100 p-8 mb-10 mx-auto hover:shadow-xl transition-all duration-300">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <Image
              src={poCompany?.company_logo || "/default-logo.png"}
              alt="Company Logo"
              width={60}
              height={60}
              className="rounded-full border border-gray-200 shadow-sm"
            />

            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 tracking-tight">
                {poCompany?.name || "Company Name"}
              </h2>
              <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
                <MapPin className="w-4 h-4 text-indigo-500" />
                {poCompany?.address || "Maddur, Mandya"}
              </p>
            </div>
          </div>

          <div className="flex justify-center items-center text-center gap-2">
            <div className=" gap-2 text-sm text-gray-700 border border-gray-200 bg-gradient-to-br from-white to-indigo-50 shadow-sm px-5 py-2 rounded-lg">
              <span className="flex gap-2">
                PO ISSUE DATE{" "}
                <CalendarDays className="w-4 h-4 text-indigo-600" />{" "}
              </span>
              <div>
                <span className="font-semibold text-4xl md:text-4xl text-indigo-600">
                  {formatDate(poExpiryDate)}
                </span>
              </div>
            </div>

            <div className=" gap-2 text-sm text-gray-700 border border-gray-200 bg-gradient-to-br from-white to-indigo-50 shadow-sm px-5 py-2 rounded-lg">
              <span className="flex gap-1">
                To be fulfilled by{" "}
                <CalendarDays className="w-4 h-4 text-indigo-600" />{" "}
              </span>
              <div>
                <span className="font-semibold text-2xl md:text-3xl text-indigo-600">
                  {formatDate(poExpiryDate)}
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
            <p className="text-3xl font-semibold text-gray-800">₹{poPrice}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-green-600">
              <Package className="w-5 h-5" />
              <p className="text-sm font-medium text-gray-600">
                Total Quantity
              </p>
            </div>
            <p className="text-5xl font-semibold text-gray-800">
              {poQuantity} Tons
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
              {totalSuppliedQuantity}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-16">
          {/* Specification Section */}
          <div className="bg-gray-50 border rounded-xl p-5 shadow-sm">
            <label
              htmlFor="summary"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Specification
            </label>
            <p className="w-full rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none p-3 text-sm bg-white transition">
              {specification}
            </p>
          </div>

          {/* Terms & Conditions Section */}
          <div className="bg-gray-50 border rounded-xl p-5 shadow-sm">
            <label
              htmlFor="summary"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Terms & Conditions Section
            </label>
            <p className="w-full rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none p-3 text-sm bg-white transition">
              {termsAndConditions}
            </p>
          </div>
        </div>

        <div className="flex justify-end px-4 mt-4">
          <button
            onClick={() => setShowForm(true)}
            className="flex bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg transition-all"
          >
            <Plus size={24} />
          </button>
          {showForm && (
            <AssignForm
              masterPOId={String(id)}
              onClose={() => setShowForm(false)}
            />
          )}
        </div>
      </div>

      {/* Assignees Table */}
      <div className="bg-white shadow-md border border-gray-100 rounded-2xl overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-gradient-to-r from-indigo-100 to-purple-50">
            <tr>
              {[
                "S. No",
                "Assignee Name",
                "Mobile",
                "Date When Expressed Interest",
                "Promised Quantity",
                "Rate (₹)",
                "Promised Date",
                // "Payment (₹)",
                // "Ref No",
                "Status",
                "Action",
              ].map((heading, i) => (
                <th
                  key={i}
                  className="text-left px-6 py-3 font-semibold text-gray-700 border-b border-gray-200 whitespace-nowrap"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {poData.assignees && poData.assignees.length > 0 ? (
              poData.assignees.map((assignee: any, index: number) => (
                <tr
                  key={assignee.id}
                  className="hover:bg-indigo-50 transition-all border-b border-gray-100 last:border-0"
                >
                  <td className="px-6 py-4 text-gray-600">{index + 1}</td>

                  {/* Assignee Name */}
                  <td className="px-6 py-4 text-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-semibold shadow-sm">
                        {assignee.user?.name?.charAt(0)?.toUpperCase() || "A"}
                      </div>
                      <span className="font-medium">{assignee.user?.name}</span>
                    </div>
                  </td>

                  {/* Mobile Number */}
                  <td className="px-6 py-4 text-gray-600">
                    {assignee.user?.mobileNumber || "N/A"}
                  </td>

                  {/* when show interested */}
                  <td className="px-6 py-4 text-gray-600">
                    {formatDate(assignee.createdAt)}
                  </td>

                  {/* Quantity */}
                  <td className="px-6 py-4 text-gray-600">
                    {assignee.promisedQuantity}{" "}
                    {assignee.promisedQuantityMeasure}
                  </td>

                  {/* Rate */}
                  <td className="px-6 py-4 text-gray-600 flex items-center gap-1">
                    <IndianRupee className="w-4 h-4 text-yellow-500" />
                    {assignee.rate}
                  </td>

                  {/* Promised Date */}
                  <td className="px-6 py-4 text-gray-600">
                    {formatDate(assignee.promisedDate)}
                  </td>

                  {/* Payment */}
                  {/* <td className="px-6 py-4 text-gray-600">
                    {assignee.payments && assignee.payments.length > 0
                      ? assignee.payments[0].amount
                      : "-"}
                  </td> */}

                  {/* Ref No */}
                  {/* <td className="px-6 py-4 text-gray-600">
                    {assignee.payments && assignee.payments.length > 0
                      ? assignee.payments[0].refNo
                      : "-"}
                  </td> */}

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        assignee.status
                      )}`}
                    >
                      {assignee.status}
                    </span>
                  </td>

                  {/* Action */}
                  {/* <td className="px-6 py-4">
                    <button
                      onClick={() =>
                        router.push(`/assignee/${assignee.id}/details`)
                      }
                      className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>
                  </td> */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => router.push(`/po/${assignee.id}/details`)}
                      className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs shadow-sm"
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
                  colSpan={10}
                  className="text-center text-gray-500 py-6 italic"
                >
                  No assignees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BuyerDetails;
