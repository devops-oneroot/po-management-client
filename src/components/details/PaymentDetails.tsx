"use client";

import React, { useState, useEffect } from "react";
import {
  Upload,
  Plus,
  CreditCard,
  Loader2,
  CheckCircle2,
  ImagePlus,
} from "lucide-react";
import axios from "axios";

interface Payment {
  id?: string;
  paymentDate: string;
  amount: string;
  refNo: string;
  isNew?: boolean;
}

interface PaymentDetailsProps {
  assigneeId: string;
  onUpdate?: () => void;
}

export default function PaymentDetails({ assigneeId, onUpdate }: PaymentDetailsProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [paymentSlipFile, setPaymentSlipFile] = useState<File | null>(null);
  const [uploadingSlip, setUploadingSlip] = useState(false);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  useEffect(() => {
    const total = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    setTotalAmount(total);
  }, [payments]);

  // Fetch existing payments
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/master-po-assignees/${assigneeId}`
        );
        const data = res.data?.data?.payments || [];
        setPayments(
          data.map((p: any) => ({
            id: p.id,
            paymentDate: p.paymentDate?.split("T")[0] || "",
            amount: p.amount?.toString() || "",
            refNo: p.refNo || "",
          }))
        );
      } catch (err) {
        console.error("Error fetching payment details:", err);
      }
    };
    if (assigneeId) fetchPayments();
  }, [assigneeId]);

  // Add new payment row
  const handleAddPayment = () => {
    const newPayment: Payment = {
      id: `${Date.now()}`,
      paymentDate: "",
      amount: "",
      refNo: "",
      isNew: true,
    };
    setPayments([...payments, newPayment]);
  };

  // Handle input change
  const handlePaymentChange = (
    id: string | undefined,
    field: keyof Payment,
    value: string
  ) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  // Save payment
  const handleSavePayment = async (payment: Payment) => {
    if (!payment.paymentDate || !payment.amount || !payment.refNo) {
      alert("Please fill all fields before saving.");
      return;
    }

    try {
      setSavingId(payment.id || null);

      const payload = {
        paymentDate: payment.paymentDate,
        amount: payment.amount.toString(),
        refNo: payment.refNo,
      };

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/master-po-assignees/${assigneeId}/payments`,
        payload
      );

      setPayments((prev) =>
        prev.map((p) =>
          p.id === payment.id
            ? { ...p, isNew: false, id: res.data?.data?.id || payment.id }
            : p
        )
      );

      setSuccessMsg("Payment saved successfully!");
      setTimeout(() => setSuccessMsg(null), 3000);
      
      // Trigger parent refetch
      setTimeout(() => {
        onUpdate?.();
      }, 1000);
    } catch (err) {
      console.error("Error saving payment:", err);
      alert("Failed to save payment");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-200">
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-slate-600" />
          Payment Details
        </h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-slate-200 rounded-lg">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-3 border border-slate-200 text-left text-xs font-semibold text-slate-900 uppercase">
                S.No.
              </th>
              <th className="p-3 border border-slate-200 text-left text-xs font-semibold text-slate-900 uppercase">
                Date
              </th>
              <th className="p-3 border border-slate-200 text-left text-xs font-semibold text-slate-900 uppercase">
                Amount
              </th>
              <th className="p-3 border border-slate-200 text-left text-xs font-semibold text-slate-900 uppercase">
                Reference
              </th>
              <th className="p-3 border border-slate-200 text-center text-xs font-semibold text-slate-900 uppercase">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p, index) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="p-3 border border-slate-200 font-medium text-slate-600">
                  {index + 1}
                </td>
                <td className="p-3 border border-slate-200">
                  <input
                    type="date"
                    value={p.paymentDate}
                    onChange={(e) =>
                      handlePaymentChange(p.id, "paymentDate", e.target.value)
                    }
                    className="w-full bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-400 rounded-md text-sm"
                  />
                </td>
                <td className="p-3 border border-slate-200">
                  <input
                    type="number"
                    value={p.amount}
                    onChange={(e) =>
                      handlePaymentChange(p.id, "amount", e.target.value)
                    }
                    className="w-full bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-400 rounded-md text-sm"
                    placeholder="0.00"
                  />
                </td>
                <td className="p-3 border border-slate-200">
                  <input
                    type="text"
                    value={p.refNo}
                    onChange={(e) =>
                      handlePaymentChange(p.id, "refNo", e.target.value)
                    }
                    className="w-full bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-400 rounded-md text-sm"
                    placeholder="Ref No."
                  />
                </td>

                <td className="p-3 border border-slate-200 text-center">
                  {p.isNew ? (
                    <button
                      onClick={() => handleSavePayment(p)}
                      disabled={savingId === p.id}
                      className="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150"
                    >
                      {savingId === p.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Upload className="w-3 h-3" />
                      )}
                      {savingId === p.id ? "Saving..." : "Save"}
                    </button>
                  ) : (
                    <span className="text-green-600 text-xs font-medium flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Saved
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total Amount */}
        {payments.length > 0 && (
          <div className="flex justify-end mt-3">
            <div className="bg-slate-100 text-slate-900 px-4 py-2 rounded-md text-sm font-semibold border border-slate-200">
              Total: ₹{totalAmount.toLocaleString("en-IN")}
            </div>
          </div>
        )}
      </div>

      {/* Add Payment Button */}
      <div className="flex justify-center mt-6 pt-4 border-t border-slate-200">
        <button
          onClick={handleAddPayment}
          className="inline-flex items-center gap-2 px-4 py-2 text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-md font-medium text-sm transition-colors duration-150"
        >
          <Plus className="w-4 h-4" />
          Add Payment
        </button>
      </div>

      {/* Success Message */}
      {successMsg && (
        <div className="mt-4 flex items-center gap-2 p-3 rounded-md text-sm bg-green-50 text-green-700 border border-green-200">
          <CheckCircle2 className="w-4 h-4" />
          {successMsg}
        </div>
      )}
    </div>
  );
}
