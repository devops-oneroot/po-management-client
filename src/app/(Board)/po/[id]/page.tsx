"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

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
      {/* Header */}
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
          <div className="text-sm text-gray-700 border border-gray-200 bg-white shadow-sm px-3 py-1.5 rounded-lg">
            To be fulfilled by{" "}
            <span className="font-semibold text-indigo-600">23rd Dec</span>
          </div>
        </div>
      </div>

      {/* Buyer Info */}
      <div className="bg-white shadow-sm rounded-2xl border border-gray-100 p-6 mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Sahyadri Farms</h2>
            <p className="text-gray-500 text-sm mt-1">Maddur, Mandya</p>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-6 md:mt-0 text-center">
            <div>
              <p className="text-sm text-gray-500">Our Price</p>
              <p className="text-lg font-semibold text-gray-800">₹20.25</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Quantity</p>
              <p className="text-lg font-semibold text-gray-800">25 Tons</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fulfilled Quantity</p>
              <p className="text-lg font-semibold text-gray-800">25 Tons</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <button className="bg-indigo-600 hover:bg-indigo-700 transition text-white text-sm px-6 py-2.5 rounded-lg shadow">
            Assign Aggregator
          </button>
        </div>
      </div>

      {/* Aggregator Table */}
      <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              {[
                "S. No",
                "Aggregator Name",
                "Date of Interest",
                "Quantity Promised",
                "Rate",
                "Promised Date",
                "Status",
                "Action",
              ].map((title) => (
                <th
                  key={title}
                  className="text-left px-6 py-3 text-sm font-semibold text-gray-700 border-b"
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {aggregators.map((agg) => (
              <tr
                key={agg.id}
                className="hover:bg-gray-50 transition border-b last:border-0"
              >
                <td className="px-6 py-3 text-sm text-gray-600">{agg.id}</td>
                <td className="px-6 py-3 text-sm text-gray-800 flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-medium">
                    {agg.name.charAt(0)}
                  </div>
                  {agg.name}
                </td>
                <td className="px-6 py-3 text-sm text-gray-600">{agg.date}</td>
                <td className="px-6 py-3 text-sm text-gray-600">
                  {agg.quantity}
                </td>
                <td className="px-6 py-3 text-sm text-gray-600">{agg.rate}</td>
                <td className="px-6 py-3 text-sm text-gray-600">
                  {agg.promisedDate}
                </td>
                <td className="px-6 py-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      agg.status
                    )}`}
                  >
                    {agg.status}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <button
                    onClick={() => router.push(`/po/${agg.id}/details`)}
                    className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg shadow transition"
                  >
                    View Details
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
