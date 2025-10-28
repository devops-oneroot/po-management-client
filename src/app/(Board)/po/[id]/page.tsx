"use client";
import React from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Eye,
  Hash,
  IndianRupee,
  MapPin,
  Package,
  User,
} from "lucide-react";
import Image from "next/image";

const BuyerDetails = () => {
  const router = useRouter();

  const aggregators = [
    {
      id: 1,
      name: "Ramesh Kumar",
      date: "23 Oct 2025",
      quantity: "10 Tons",
      rate: "₹20.25",
      promisedDate: "23 Dec 2025",
      status: "Ongoing",
    },
    {
      id: 2,
      name: "Suresh Singh",
      date: "24 Oct 2025",
      quantity: "5 Tons",
      rate: "₹20.25",
      promisedDate: "23 Dec 2025",
      status: "Pending",
    },
    {
      id: 3,
      name: "Anil Kumar",
      date: "25 Oct 2025",
      quantity: "5 Tons",
      rate: "₹20.25",
      promisedDate: "23 Dec 2025",
      status: "Completed",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Ongoing":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6 font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <button
          onClick={() => router.push("/po-card")}
          className="flex items-center gap-2 text-gray-700 hover:text-black transition"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium">Back to PO Card</span>
        </button>

        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <span className="text-gray-600 font-medium">Status:</span>
          <select className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
            <option>Ongoing</option>
            <option>Completed</option>
            <option>Pending</option>
          </select>
        </div>
      </div>

      {/* Buyer Details Card */}
      <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 shadow-lg rounded-2xl border border-gray-100 p-8 mb-10 mx-auto hover:shadow-xl transition-all duration-300">
        {/* Top Info */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <Image
              src="/images/sahyadri-logo.png"
              alt="Sahyadri Farms Logo"
              width={60}
              height={60}
              className="rounded-full border border-gray-200 shadow-sm"
            />
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                Sahyadri Farms
              </h2>
              <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
                <MapPin className="w-4 h-4 text-indigo-500" />
                Maddur, Mandya
              </p>
            </div>
          </div>

          <div className="flex justify-center items-center text-center">
            <div className="flex items-center gap-2 text-sm text-gray-700 border border-gray-200 bg-gradient-to-br from-white to-indigo-50 shadow-sm px-5 py-2 rounded-lg">
              <CalendarDays className="w-4 h-4 text-indigo-600" />
              <span>
                To be fulfilled by{" "}
                <span className="font-semibold text-2xl md:text-3xl text-indigo-600">
                  23rd Dec
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-col md:flex-row justify-between mt-12 gap-10 md:gap-0 text-center md:text-left px-10">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2 text-indigo-600">
              <IndianRupee className="w-5 h-5" />
              <p className="text-sm font-medium text-gray-600">Our Price</p>
            </div>
            <p className="text-3xl md:text-4xl font-semibold text-gray-800">
              ₹20.25
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2 text-green-600">
              <Package className="w-5 h-5" />
              <p className="text-sm font-medium text-gray-600">
                Total Quantity
              </p>
            </div>
            <p className="text-5xl md:text-6xl font-semibold text-gray-800">
              25 Tons
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2 text-purple-600">
              <CheckCircle2 className="w-5 h-5" />
              <p className="text-sm font-medium text-gray-600">
                Fulfilled Quantity
              </p>
            </div>
            <p className="text-3xl md:text-4xl font-semibold text-gray-800">
              25 Tons
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center mt-10">
          <button className="bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition-all text-white text-sm px-8 py-3 rounded-lg shadow-md font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Assign Aggregator
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white shadow-md border border-gray-100 rounded-2xl overflow-hidden">
        <table className="min-w-full border-collapse">
          {/* Table Header */}
          <thead className="bg-gradient-to-r from-indigo-100 to-purple-50">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700 border-b border-gray-200">
                S. No
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700 border-b border-gray-200">
                Aggregator Name
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700 border-b border-gray-200">
                Date of Interest
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700 border-b border-gray-200">
                Quantity Promised
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700 border-b border-gray-200">
                Rate
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700 border-b border-gray-200">
                Promised Date
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700 border-b border-gray-200">
                Status
              </th>
              <th className="text-center px-6 py-3 text-sm font-semibold text-gray-700 border-b border-gray-200">
                Action
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {aggregators.map((agg) => (
              <tr
                key={agg.id}
                className="hover:bg-indigo-50 transition-all border-b border-gray-100 last:border-0"
              >
                {/* S.No */}
                <td className="px-6 py-4 text-sm text-gray-600">{agg.id}</td>

                {/* Aggregator Name */}
                <td className="px-6 py-4 text-sm text-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-semibold shadow-sm">
                      {agg.name.charAt(0)}
                    </div>
                    <span className="font-medium">{agg.name}</span>
                  </div>
                </td>

                {/* Date of Interest */}
                <td className="px-6 py-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-indigo-500" />
                    {agg.date}
                  </div>
                </td>

                {/* Quantity Promised */}
                <td className="px-6 py-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-green-500" />
                    {agg.quantity}
                  </div>
                </td>

                {/* Rate */}
                <td className="px-6 py-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-yellow-500" />
                    {agg.rate}
                  </div>
                </td>

                {/* Promised Date */}
                <td className="px-6 py-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-500" />
                    {agg.promisedDate}
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      agg.status
                    )}`}
                  >
                    {agg.status}
                  </span>
                </td>

                {/* Action */}
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => router.push(`/po/${agg.id}/details`)}
                    className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition-all text-white text-xs px-3 py-1.5 rounded-lg shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BuyerDetails;
