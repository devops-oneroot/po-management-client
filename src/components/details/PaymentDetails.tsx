"use client";

import React, { useState } from "react";
import { Upload, Plus, CreditCard } from "lucide-react";

type Payment = {
  id: number;
  date: string;
  amount: string;
  reference: string;
};

export default function PaymentDetails() {
  const [payments, setPayments] = useState<Payment[]>([
    { id: 1, date: "23.09.2025", amount: "2,00,000", reference: "123456" },
    { id: 2, date: "11.11.2024", amount: "3,00,000", reference: "987654" },
  ]);

  const handleAddPayment = () => {
    const newPayment: Payment = {
      id: payments.length + 1,
      date: "",
      amount: "",
      reference: "",
    };
    setPayments([...payments, newPayment]);
  };

  const handlePaymentChange = (
    id: number,
    field: keyof Payment,
    value: string
  ) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <CreditCard className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold text-lg text-gray-800">Payment Details</h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-purple-50 text-gray-700 text-xs uppercase tracking-wide">
            <tr>
              <th className="p-2 border text-center">S.No.</th>
              <th className="p-2 border text-center">Date</th>
              <th className="p-2 border text-center">Amount</th>
              <th className="p-2 border text-center">Reference</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p, index) => (
              <tr
                key={p.id}
                className={`${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-purple-50/60 transition-colors`}
              >
                <td className="p-2 border text-center font-medium text-gray-600">
                  {p.id}
                </td>
                <td className="p-2 border">
                  <input
                    type="text"
                    value={p.date}
                    onChange={(e) =>
                      handlePaymentChange(p.id, "date", e.target.value)
                    }
                    placeholder="DD.MM.YYYY"
                    className="w-full text-center bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-purple-400 rounded-md text-gray-700"
                  />
                </td>
                <td className="p-2 border">
                  <input
                    type="text"
                    value={p.amount}
                    onChange={(e) =>
                      handlePaymentChange(p.id, "amount", e.target.value)
                    }
                    placeholder="0.00"
                    className="w-full text-center bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-purple-400 rounded-md text-gray-700"
                  />
                </td>
                <td className="p-2 border">
                  <input
                    type="text"
                    value={p.reference}
                    onChange={(e) =>
                      handlePaymentChange(p.id, "reference", e.target.value)
                    }
                    placeholder="Ref No."
                    className="w-full text-center bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-purple-400 rounded-md text-gray-700"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Payment Button */}
      <button
        onClick={handleAddPayment}
        className="mt-5 w-full flex items-center justify-center gap-2 text-purple-600 border border-purple-400 hover:bg-purple-50 rounded-xl py-2 text-sm font-medium transition-all shadow-sm"
      >
        <Plus className="w-4 h-4" /> Add New Payment
      </button>

      {/* Total Paid */}
      <div className="flex items-center justify-between mt-6 border-t pt-3">
        <span className="font-semibold text-gray-800">Total Paid:</span>
        <input
          value="5,00,000"
          readOnly
          className="border border-gray-200 rounded-lg px-3 py-1.5 w-36 text-right text-sm font-medium bg-gray-50 text-gray-700"
        />
      </div>

      {/* Upload Button */}
      <button className="mt-5 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-5 py-2.5 text-sm font-medium shadow-sm transition-all w-full">
        <Upload className="w-4 h-4" /> Upload Payment Slips
      </button>
    </div>
  );
}
