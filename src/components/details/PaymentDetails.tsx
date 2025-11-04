"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Upload,
  Plus,
  CreditCard,
  Loader2,
  CheckCircle2,
  ImagePlus,
  X,
  FileText,
  ExternalLink,
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

export default function PaymentDetails({
  assigneeId,
  onUpdate,
}: PaymentDetailsProps) {
  /* ====================== STATE ====================== */
  const [payments, setPayments] = useState<Payment[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  // --- Multiple Slip Upload ---
  const [slipFiles, setSlipFiles] = useState<File[]>([]);
  const [slipPreviews, setSlipPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Preview Modal ---
  const [modalUrl, setModalUrl] = useState<string | null>(null);

  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

  /* ====================== EFFECTS ====================== */
  // Total amount
  useEffect(() => {
    const total = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    setTotalAmount(total);
  }, [payments]);

  // Fetch payments + existing slips
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/master-po-assignees/${assigneeId}`
        );
        const data = res.data?.data;

        const fetchedPayments = (data?.payments || []).map((p: any) => ({
          id: p.id,
          paymentDate: p.paymentDate?.split("T")[0] || "",
          amount: p.amount?.toString() || "",
          refNo: p.refNo || "",
        }));

        setPayments(fetchedPayments);

        const existingSlips = (data?.paymentSlipImages || []) as string[];
        if (existingSlips.length > 0) {
          setSlipPreviews(existingSlips);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    if (assigneeId) fetchData();
  }, [assigneeId]);

  /* ====================== PAYMENT HANDLERS ====================== */
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

  const handlePaymentChange = (
    id: string | undefined,
    field: keyof Payment,
    value: string
  ) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

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
      setTimeout(() => onUpdate?.(), 1000);
    } catch (err) {
      console.error("Error saving payment:", err);
      alert("Failed to save payment");
    } finally {
      setSavingId(null);
    }
  };

  /* ====================== SLIP UPLOAD HANDLERS ====================== */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setSlipFiles((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSlipPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const removeSlip = (index: number) => {
    setSlipFiles((prev) => prev.filter((_, i) => i !== index));
    setSlipPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadAllSlips = async () => {
    if (slipFiles.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [
      ...slipPreviews.filter((p) => p.startsWith("http")),
    ];

    try {
      for (const file of slipFiles) {
        const isPdf = file.type === "application/pdf";
        const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${
          isPdf ? "raw" : "image"
        }/upload`;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);

        const uploadRes = await axios.post(endpoint, formData);
        uploadedUrls.push(uploadRes.data.secure_url);
      }

      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/master-po-assignees/${assigneeId}`,
        { paymentSlipImages: uploadedUrls },
        { headers: { "Content-Type": "application/json" } }
      );

      setSlipPreviews(uploadedUrls);
      setSlipFiles([]);
      setSuccessMsg(`Uploaded ${slipFiles.length} slip(s) successfully!`);
      setTimeout(() => setSuccessMsg(null), 3000);
      setTimeout(() => onUpdate?.(), 800);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload one or more slips.");
    } finally {
      setUploading(false);
    }
  };

  const removeSavedSlip = async (url: string) => {
    const newUrls = slipPreviews.filter((u) => u !== url);
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/master-po-assignees/${assigneeId}`,
        { paymentSlipImages: newUrls },
        { headers: { "Content-Type": "application/json" } }
      );
      setSlipPreviews(newUrls);
      setSuccessMsg("Slip removed.");
      setTimeout(() => setSuccessMsg(null), 3000);
      setTimeout(() => onUpdate?.(), 800);
    } catch (err) {
      console.error("Failed to remove slip:", err);
    }
  };

  const isPdf = (url: string) => url.endsWith(".pdf");
  const openModal = (url: string) => setModalUrl(url);
  const closeModal = () => setModalUrl(null);

  /* ====================== RENDER ====================== */
  return (
    <>
      <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all duration-200">
        {/* ==================== HEADER ==================== */}
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-200">
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-slate-600" />
            Payment Details
          </h3>
        </div>

        {/* ==================== PAYMENT TABLE ==================== */}
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

        {/* ==================== ADD PAYMENT BUTTON ==================== */}
        <div className="flex justify-center mt-6 pt-4 border-t border-slate-200">
          <button
            onClick={handleAddPayment}
            className="inline-flex items-center gap-2 px-4 py-2 text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-md font-medium text-sm transition-colors duration-150"
          >
            <Plus className="w-4 h-4" />
            Add Payment
          </button>
        </div>

        {/* ==================== MULTIPLE SLIP UPLOAD SECTION ==================== */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <h4 className="text-sm font-semibold text-slate-900 mb-3">
            Payment Slips ({slipPreviews.length + slipFiles.length} uploaded)
          </h4>

          <div className="space-y-4">
            {/* Upload Button */}
            <div className="flex justify-center">
              <input
                type="file"
                multiple
                accept="image/*,application/pdf"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors"
              >
                <ImagePlus className="w-4 h-4" />
                Add Payment Slips
              </button>
            </div>

            {/* Preview Grid */}
            {(slipPreviews.length > 0 || slipFiles.length > 0) && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {/* Saved Slips */}
                {slipPreviews
                  .filter((p) => p.startsWith("http"))
                  .map((url, idx) => (
                    <div
                      key={`saved-${idx}`}
                      className="relative group rounded-lg overflow-hidden border border-slate-300 cursor-pointer"
                      onClick={() => openModal(url)}
                    >
                      {isPdf(url) ? (
                        <div className="w-full h-32 bg-red-50 flex items-center justify-center">
                          <FileText className="w-10 h-10 text-red-500" />
                        </div>
                      ) : (
                        <img
                          src={url}
                          alt="slip"
                          className="w-full h-32 object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <ExternalLink className="w-5 h-5 text-white" />
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSavedSlip(url);
                        }}
                        className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3 text-red-600" />
                      </button>
                    </div>
                  ))}

                {/* Pending Uploads */}
                {slipFiles.map((_, idx) => {
                  const previewUrl =
                    slipPreviews[slipPreviews.length - slipFiles.length + idx];
                  return (
                    <div
                      key={`pending-${idx}`}
                      className="relative group rounded-lg overflow-hidden border-2 border-dashed border-blue-400"
                    >
                      {previewUrl && isPdf(previewUrl) ? (
                        <div className="w-full h-32 bg-blue-50 flex items-center justify-center">
                          <FileText className="w-10 h-10 text-blue-600" />
                        </div>
                      ) : (
                        <img
                          src={previewUrl}
                          alt="preview"
                          className="w-full h-32 object-cover"
                        />
                      )}
                      <button
                        onClick={() => removeSlip(idx)}
                        className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-md hover:bg-red-100"
                      >
                        <X className="w-3 h-3 text-red-600" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Upload All Button */}
            {slipFiles.length > 0 && (
              <div className="flex justify-center">
                <button
                  onClick={uploadAllSlips}
                  disabled={uploading}
                  className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading {slipFiles.length}...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload All Slips
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ==================== SUCCESS MESSAGE ==================== */}
        {successMsg && (
          <div className="mt-4 flex items-center gap-2 p-3 rounded-md text-sm bg-green-50 text-green-700 border border-green-200">
            <CheckCircle2 className="w-4 h-4" />
            {successMsg}
          </div>
        )}
      </div>

      {/* ==================== PREVIEW MODAL ==================== */}
      {modalUrl && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="relative bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-slate-700" />
            </button>

            {isPdf(modalUrl) ? (
              <iframe
                src={modalUrl}
                className="w-full h-[85vh]"
                title="PDF Preview"
              />
            ) : (
              <img
                src={modalUrl}
                alt="Full preview"
                className="w-full h-auto max-h-[85vh] object-contain"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
