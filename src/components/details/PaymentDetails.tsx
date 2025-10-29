"use client";

import React, { useState } from "react";
import { Upload, Plus } from "lucide-react";

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
                      handlePaymentChange(p.id, "reference", e.target.value)
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
  );
}
