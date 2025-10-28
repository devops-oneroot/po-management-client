// "use client";

// import React, { useState } from "react";
// import {
//   ArrowLeft,
//   Phone,
//   MapPin,
//   Calendar,
//   Upload,
//   CheckCircle2,
//   Plus,
//   MessageCircle,
// } from "lucide-react";

// export default function BuyerDetails() {
//   const [status, setStatus] = useState("Ongoing");

//   const paymentData = [
//     { id: 1, date: "23.09.2025", amount: "2,00,000", reference: "123456" },
//     { id: 2, date: "11.11.2024", amount: "3,00,000", reference: "987654" },
//   ];

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
//       {/* Header */}
//       <div className="bg-white shadow rounded-xl p-6">
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-4">
//           <div className="flex items-center gap-4">
//             <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
//               <span className="text-gray-400 text-sm">IMG</span>
//             </div>
//             <div>
//               <h2 className="text-xl font-semibold">Mahadevappa</h2>
//               <p className="text-gray-600 text-sm">Maddur, Mandya</p>
//               <div className="flex items-center gap-2 mt-1 text-sm text-gray-700">
//                 <Phone className="w-4 h-4 text-green-600" />
//                 <MessageCircle className="w-4 h-4 text-green-600" />
//                 <span>+91 9876543210</span>
//               </div>
//             </div>
//           </div>

//           {/* Quantity & Status */}
//           <div className="flex flex-wrap gap-4 text-center">
//             <div className="bg-gray-100 p-4 rounded-lg min-w-[130px]">
//               <p className="text-sm font-semibold text-gray-700">
//                 Agreed Quantity
//               </p>
//               <p className="text-xl font-bold">25 Tons</p>
//               <p className="text-sm mt-2 font-semibold text-gray-700">
//                 Accepted Quantity
//               </p>
//               <p className="text-xl font-bold">25 Tons</p>
//             </div>
//             <div className="bg-gray-100 p-4 rounded-lg min-w-[130px]">
//               <p className="text-sm font-semibold text-gray-700">
//                 Agreed Price
//               </p>
//               <p className="text-xl font-bold">₹20.25</p>
//             </div>
//             <div className="bg-gray-100 p-4 rounded-lg min-w-[130px]">
//               <p className="text-sm font-semibold text-gray-700">
//                 To be fulfilled by:
//               </p>
//               <p className="text-xl font-bold">23rd Dec</p>
//             </div>
//             <div className="flex flex-col items-start">
//               <label className="font-semibold text-gray-700">Status</label>
//               <select
//                 value={status}
//                 onChange={(e) => setStatus(e.target.value)}
//                 className="mt-1 border rounded-md px-3 py-2"
//               >
//                 <option>Ongoing</option>
//                 <option>Completed</option>
//                 <option>Pending</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* Stages */}
//         <div className="flex flex-wrap gap-6 mt-6 justify-start border-b pb-4">
//           {[
//             "Order Started",
//             "Loading",
//             "Quality Check",
//             "Weighment Unloading",
//             "GRN",
//             "Gate Pass",
//           ].map((stage) => (
//             <div
//               key={stage}
//               className="flex flex-col items-center text-sm font-medium text-gray-600"
//             >
//               <CheckCircle2 className="w-6 h-6 text-gray-700" />
//               <span className="mt-2">{stage}</span>
//             </div>
//           ))}
//         </div>

//         {/* Notes */}
//         <div className="mt-6">
//           <label className="block font-semibold text-gray-700 mb-2">
//             Notes:
//           </label>
//           <textarea
//             placeholder="Input text"
//             className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
//           />
//         </div>
//       </div>

//       {/* Details Sections */}
//       <div className="mt-8 grid md:grid-cols-3 gap-6">
//         {/* Weighment Details */}
//         <div className="bg-white p-6 shadow rounded-xl">
//           <h3 className="font-semibold mb-4 border-b pb-2">
//             Weighment Details
//           </h3>
//           <div className="flex flex-col gap-3">
//             {["Loading", "Unloading"].map((label) => (
//               <div key={label} className="flex items-center gap-2">
//                 <label className="w-24 text-sm font-medium">{label}:</label>
//                 <input
//                   type="text"
//                   className="border p-2 rounded w-full"
//                   placeholder="10.25"
//                 />
//                 <select className="border p-2 rounded">
//                   <option>Measure</option>
//                   <option>Tons</option>
//                 </select>
//               </div>
//             ))}
//           </div>
//           <button className="mt-4 flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded">
//             <Upload className="w-4 h-4" /> Upload Images
//           </button>
//           <div className="flex gap-2 mt-3">
//             <div className="w-20 h-20 bg-gray-100 flex items-center justify-center rounded">
//               <span className="text-gray-400 text-sm">IMG</span>
//             </div>
//             <div className="w-20 h-20 bg-gray-100 flex items-center justify-center rounded">
//               <span className="text-gray-400 text-sm">IMG</span>
//             </div>
//           </div>
//         </div>

//         {/* GRN Details */}
//         <div className="bg-white p-6 shadow rounded-xl">
//           <h3 className="font-semibold mb-4 border-b pb-2">GRN Details</h3>
//           <div className="flex flex-col gap-3">
//             <div className="flex items-center gap-2">
//               <label className="w-24 text-sm font-medium">GRN Date:</label>
//               <input
//                 type="text"
//                 placeholder="10.10.2025"
//                 className="border p-2 rounded w-full"
//               />
//             </div>
//             {[
//               "Accepted Quantity",
//               "Rejected Quantity",
//               "Total Billable Quantity",
//             ].map((label) => (
//               <div key={label} className="flex items-center gap-2">
//                 <label className="w-40 text-sm font-medium">{label}:</label>
//                 <input
//                   type="text"
//                   placeholder="10.25"
//                   className="border p-2 rounded w-full"
//                 />
//                 <select className="border p-2 rounded">
//                   <option>Measure</option>
//                   <option>Tons</option>
//                 </select>
//               </div>
//             ))}
//           </div>
//           <button className="mt-4 flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded">
//             <Upload className="w-4 h-4" /> Upload Images
//           </button>
//           <div className="flex gap-2 mt-3">
//             <div className="w-20 h-20 bg-gray-100 flex items-center justify-center rounded">
//               <span className="text-gray-400 text-sm">IMG</span>
//             </div>
//             <div className="w-20 h-20 bg-gray-100 flex items-center justify-center rounded">
//               <span className="text-gray-400 text-sm">IMG</span>
//             </div>
//           </div>
//         </div>

//         {/* Payment Details */}
//         <div className="bg-white p-6 shadow rounded-xl">
//           <h3 className="font-semibold mb-4 border-b pb-2">Payment Details</h3>
//           <table className="w-full text-sm border">
//             <thead className="bg-gray-100 text-left">
//               <tr>
//                 <th className="p-2 border">S.No.</th>
//                 <th className="p-2 border">Date</th>
//                 <th className="p-2 border">Amount</th>
//                 <th className="p-2 border">Reference Number</th>
//               </tr>
//             </thead>
//             <tbody>
//               {paymentData.map((p) => (
//                 <tr key={p.id}>
//                   <td className="p-2 border">{p.id}</td>
//                   <td className="p-2 border">{p.date}</td>
//                   <td className="p-2 border">{p.amount}</td>
//                   <td className="p-2 border">{p.reference}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           <button className="mt-3 flex items-center justify-center w-full border border-gray-400 text-gray-700 rounded py-2">
//             <Plus className="w-4 h-4 mr-1" /> Add New Payment
//           </button>

//           <div className="flex items-center justify-between mt-4">
//             <span className="font-semibold">Total Paid:</span>
//             <input
//               value="5,00,000"
//               readOnly
//               className="border rounded px-3 py-1 w-32 text-right"
//             />
//           </div>

//           <button className="mt-4 flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded">
//             <Upload className="w-4 h-4" /> Upload Payment Slips
//           </button>
//           <div className="flex gap-2 mt-3">
//             <div className="w-20 h-20 bg-gray-100 flex items-center justify-center rounded">
//               <span className="text-gray-400 text-sm">IMG</span>
//             </div>
//             <div className="w-20 h-20 bg-gray-100 flex items-center justify-center rounded">
//               <span className="text-gray-400 text-sm">IMG</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import React, { useState } from "react";
import { Phone, MessageCircle, CheckCircle2, Upload, Plus } from "lucide-react";

export default function BuyerDetails() {
  const [status, setStatus] = useState("Ongoing");
  const [payments, setPayments] = useState([
    { id: 1, date: "23.09.2025", amount: "2,00,000", reference: "123456" },
    { id: 2, date: "11.11.2024", amount: "3,00,000", reference: "987654" },
  ]);

  const handleAddPayment = () => {
    const newPayment = {
      id: payments.length + 1,
      date: "",
      amount: "",
      reference: "",
    };
    setPayments([...payments, newPayment]);
  };

  const handlePaymentChange = (id: number, field: string, value: string) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  return (
    <div>
      <div className="flex justify-end px-2">
        <label className="text-sm font-semibold text-gray-700 mt-4">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="mt-5 block w-36 rounded-lg border-gray-300 bg-white text-gray-700 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option>Ongoing</option>
          <option>Completed</option>
          <option>Pending</option>
        </select>
      </div>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8 font-sans text-gray-800">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between gap-6 border-b pb-6">
            {/* Buyer Info */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center font-semibold text-gray-700">
                M
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Mahadevappa
                </h2>
                <p className="text-gray-500 text-sm">Maddur, Mandya</p>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-700">
                  <Phone className="w-4 h-4 text-blue-500" />
                  <MessageCircle className="w-4 h-4 text-green-500" />
                  <span>+91 9876543210</span>
                </div>
              </div>
            </div>

            {/* Quantity + Status */}
            <div className="flex flex-wrap gap-4 items-center justify-end">
              <div className="bg-blue-50 px-5 py-3 rounded-xl text-center">
                <p className="text-sm font-medium text-gray-700">
                  Agreed Quantity
                </p>
                <p className="text-xl font-bold text-blue-600">25 Tons</p>
                <p className="text-sm font-medium mt-1 text-gray-700">
                  Accepted Quantity
                </p>
                <p className="text-xl font-bold text-blue-600">25 Tons</p>
              </div>
              <div className="bg-green-50 px-5 py-3 rounded-xl text-center">
                <p className="text-sm font-medium text-gray-700">
                  Agreed Price
                </p>
                <p className="text-xl font-bold text-green-600">₹20.25</p>
              </div>
              <div className="bg-gray-50 px-5 py-3 rounded-xl text-center">
                <p className="text-sm font-medium text-gray-700">
                  To be fulfilled by
                </p>
                <p className="text-xl font-bold text-gray-800">23rd Dec</p>
              </div>
            </div>
          </div>

          {/* Stages */}
          <div className="flex flex-wrap justify-around mt-6 text-sm">
            {[
              "Order Started",
              "Loading",
              "Quality Check",
              "Weighment Unloading",
              "GRN",
              "Gate Pass",
            ].map((stage, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-gray-600 font-medium"
              >
                <CheckCircle2 className="w-6 h-6 text-blue-500" />
                <span className="mt-2">{stage}</span>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div className="mt-6">
            <label className="block font-semibold mb-2 text-gray-700">
              Notes
            </label>
            <textarea
              placeholder="Add your notes..."
              className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Main Details Grid */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          {/* Weighment Details */}
          <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
            <h3 className="font-semibold mb-4 text-lg border-b pb-2 text-gray-800">
              Weighment Details
            </h3>
            {["Loading", "Unloading"].map((label) => (
              <div key={label} className="flex items-center gap-2 mb-3">
                <label className="w-24 text-sm font-medium">{label}:</label>
                <input
                  type="text"
                  placeholder="10.25"
                  className="border rounded-lg p-2 w-full"
                />
                <select className="border rounded-lg p-2 text-sm">
                  <option>Measure</option>
                  <option>Tons</option>
                </select>
              </div>
            ))}
            <button className="mt-3 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm">
              <Upload className="w-4 h-4" /> Upload Images
            </button>
          </div>

          {/* GRN Details */}
          <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
            <h3 className="font-semibold mb-4 text-lg border-b pb-2 text-gray-800">
              GRN Details
            </h3>
            <div className="flex items-center gap-2 mb-3">
              <label className="w-28 text-sm font-medium">GRN Date:</label>
              <input
                type="text"
                placeholder="10.10.2025"
                className="border rounded-lg p-2 w-full"
              />
            </div>
            {[
              "Accepted Quantity",
              "Rejected Quantity",
              "Total Billable Quantity",
            ].map((label) => (
              <div key={label} className="flex items-center gap-2 mb-3">
                <label className="w-40 text-sm font-medium">{label}:</label>
                <input
                  type="text"
                  placeholder="10.25"
                  className="border rounded-lg p-2 w-full"
                />
                <select className="border rounded-lg p-2 text-sm">
                  <option>Measure</option>
                  <option>Tons</option>
                </select>
              </div>
            ))}
            <button className="mt-3 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 text-sm">
              <Upload className="w-4 h-4" /> Upload Images
            </button>
          </div>

          {/* Payment Details */}
          <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
            <h3 className="font-semibold mb-4 text-lg border-b pb-2 text-gray-800">
              Payment Details
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-lg">
                <thead className="bg-blue-50 text-gray-700">
                  <tr>
                    <th className="p-2 border">S.No.</th>
                    <th className="p-2 border">Date</th>
                    <th className="p-2 border">Amount</th>
                    <th className="p-2 border">Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="p-2 border text-center">{p.id}</td>
                      <td className="p-2 border">
                        <input
                          value={p.date}
                          onChange={(e) =>
                            handlePaymentChange(p.id, "date", e.target.value)
                          }
                          placeholder="DD.MM.YYYY"
                          className="w-full text-center border-none focus:outline-none"
                        />
                      </td>
                      <td className="p-2 border">
                        <input
                          value={p.amount}
                          onChange={(e) =>
                            handlePaymentChange(p.id, "amount", e.target.value)
                          }
                          placeholder="0.00"
                          className="w-full text-center border-none focus:outline-none"
                        />
                      </td>
                      <td className="p-2 border">
                        <input
                          value={p.reference}
                          onChange={(e) =>
                            handlePaymentChange(
                              p.id,
                              "reference",
                              e.target.value
                            )
                          }
                          placeholder="Ref No."
                          className="w-full text-center border-none focus:outline-none"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={handleAddPayment}
              className="mt-4 w-full flex items-center justify-center gap-2 text-blue-600 border border-blue-400 hover:bg-blue-50 rounded-lg py-2 text-sm font-medium"
            >
              <Plus className="w-4 h-4" /> Add New Payment
            </button>

            <div className="flex items-center justify-between mt-5">
              <span className="font-semibold">Total Paid:</span>
              <input
                value="5,00,000"
                readOnly
                className="border rounded-lg px-3 py-1 w-36 text-right"
              />
            </div>

            <button className="mt-4 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm">
              <Upload className="w-4 h-4" /> Upload Payment Slips
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
