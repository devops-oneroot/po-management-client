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
}

export default function PaymentDetails({ assigneeId }: PaymentDetailsProps) {
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

  // ✅ Fetch existing payments
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await axios.get(
          `https://markhet-internal-dev.onrender.com/master-po-assignees/${assigneeId}`
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

  // ✅ Add new payment row
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

  // ✅ Handle input change
  const handlePaymentChange = (
    id: string | undefined,
    field: keyof Payment,
    value: string
  ) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  // ✅ Save payment details
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
        // explicitly set null
      };

      const res = await axios.post(
        `https://markhet-internal-dev.onrender.com/master-po-assignees/${assigneeId}/payments`,
        payload
      );

      setPayments((prev) =>
        prev.map((p) =>
          p.id === payment.id
            ? { ...p, isNew: false, id: res.data?.data?.id || payment.id }
            : p
        )
      );

      setSuccessMsg("Payment saved successfully ✅");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error("Error saving payment:", err);
      alert("Failed to save payment ❌");
    } finally {
      setSavingId(null);
    }
  };

  // ✅ Upload payment slip (separate API)
  const handleUploadSlip = async () => {
    if (!paymentSlipFile) {
      alert("Please select a payment slip image first.");
      return;
    }

    try {
      setUploadingSlip(true);
      const formData = new FormData();
      formData.append("paymentSlipImages", paymentSlipFile);

      await axios.post(
        `https://markhet-internal-dev.onrender.com/master-po-assignees/${assigneeId}/payments`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setSuccessMsg("Payment slip uploaded successfully ✅");
      setTimeout(() => setSuccessMsg(null), 3000);
      setPaymentSlipFile(null);
    } catch (err) {
      console.error("Error uploading slip:", err);
      alert("Failed to upload payment slip ❌");
    } finally {
      setUploadingSlip(false);
    }
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
              <th className="p-2 border text-center">Action</th>
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
                  {index + 1}
                </td>
                <td className="p-2 border text-center">
                  <input
                    type="date"
                    value={p.paymentDate}
                    onChange={(e) =>
                      handlePaymentChange(p.id, "paymentDate", e.target.value)
                    }
                    className="w-full text-center bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-purple-400 rounded-md"
                  />
                </td>
                <td className="p-2 border text-center">
                  <input
                    type="number"
                    value={p.amount}
                    onChange={(e) =>
                      handlePaymentChange(p.id, "amount", e.target.value)
                    }
                    className="w-full text-center bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-purple-400 rounded-md"
                    placeholder="0.00"
                  />
                </td>
                <td className="p-2 border text-center">
                  <input
                    type="text"
                    value={p.refNo}
                    onChange={(e) =>
                      handlePaymentChange(p.id, "refNo", e.target.value)
                    }
                    className="w-full text-center bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-purple-400 rounded-md"
                    placeholder="Ref No."
                  />
                </td>

                <td className="p-2 border text-center">
                  {p.isNew ? (
                    <button
                      onClick={() => handleSavePayment(p)}
                      disabled={savingId === p.id}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md text-xs flex items-center justify-center gap-1 disabled:opacity-70"
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
        <div className="flex justify-end mt-4 pr-2">
          <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm">
            Total Amount: ₹{totalAmount.toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      {/* Add Payment & Upload Slip Buttons */}
      <div className="flex items-center justify-between mt-5 gap-3">
        <button
          onClick={handleAddPayment}
          className="flex-1 flex items-center justify-center gap-2 text-purple-600 border border-purple-400 hover:bg-purple-50 rounded-xl py-2 text-sm font-medium transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add New Payment
        </button>

        <div className="flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2 text-purple-600 border border-purple-400 hover:bg-purple-50 rounded-xl py-2 px-3 text-sm font-medium transition-all shadow-sm">
            <ImagePlus className="w-4 h-4" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setPaymentSlipFile(e.target.files?.[0] || null)}
            />
            {paymentSlipFile ? "Slip Selected" : "Upload Slip"}
          </label>

          {/* <button
            onClick={handleUploadSlip}
            disabled={uploadingSlip}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 disabled:opacity-70"
          >
            {uploadingSlip ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {uploadingSlip ? "Uploading..." : "Upload"}
          </button> */}
        </div>
      </div>

      {/* Success message */}
      {successMsg && (
        <p className="flex items-center gap-2 mt-3 text-green-600 text-sm">
          <CheckCircle2 className="w-4 h-4" /> {successMsg}
        </p>
      )}
    </div>
  );
}
