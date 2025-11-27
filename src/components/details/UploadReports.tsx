"use client";

import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import {
  Upload,
  ImageIcon,
  FileCheck2,
  Loader2,
  X,
  FileText,
  ExternalLink,
  CheckCircle2,
  Edit2,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface UploadReportsProps {
  id: string;
  data: any;
  onUpdate?: () => void;
}

export default function UploadReports({
  id,
  data,
  onUpdate,
}: UploadReportsProps) {
  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

  const reports = [
    { title: "Payment Slip", key: "paymentSlipImages" },
    { title: "Quality Report", key: "qualityReportImages" },
    { title: "E-Way Bill", key: "eWayBillImages" },
    { title: "APMC", key: "apmcImages" },
    { title: "Sales Invoice", key: "salesInvoiceImages" },
    { title: "Purchase Bill", key: "miscellaneousDocs" },
  ];

  // State for uploaded files (local + saved)
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string[]>>(
    {}
  );
  const [pendingFiles, setPendingFiles] = useState<Record<string, File[]>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  /* ------------------- Sales Invoice Number ------------------- */
  const [salesInvoiceNo, setSalesInvoiceNo] = useState<string>("");
  const [editingInvoice, setEditingInvoice] = useState(false);
  const [invoiceSaving, setInvoiceSaving] = useState(false);

  useEffect(() => {
    if (data?.salesInvoiceNo) {
      setSalesInvoiceNo(String(data.salesInvoiceNo));
    }
  }, [data?.salesInvoiceNo]);

  const startEditingInvoice = () => setEditingInvoice(true);
  const cancelEditingInvoice = () => {
    setEditingInvoice(false);
    setSalesInvoiceNo(String(data?.salesInvoiceNo ?? ""));
  };

  const saveInvoiceNumber = async () => {
    if (!salesInvoiceNo.trim()) {
      alert("Please enter a Sales Invoice Number.");
      return;
    }

    setInvoiceSaving(true);
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/master-po-assignees/${id}`,
        { salesInvoiceNo: salesInvoiceNo.trim() },
        { headers: { "Content-Type": "application/json" } }
      );
      setEditingInvoice(false);
      setTimeout(() => onUpdate?.(), 800);
    } catch (err) {
      console.error(err);
      alert("Failed to save invoice number.");
    } finally {
      setInvoiceSaving(false);
    }
  };

  /* ------------------- File Upload ------------------- */
  const handleFileChange = (reportKey: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    setPendingFiles((prev) => ({
      ...prev,
      [reportKey]: [...(prev[reportKey] ?? []), ...newFiles],
    }));

    // Generate local preview URLs
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedFiles((prev) => ({
          ...prev,
          [reportKey]: [...(prev[reportKey] ?? []), reader.result as string],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const uploadPendingFiles = async (reportKey: string) => {
    const files = pendingFiles[reportKey];
    if (!files || files.length === 0) return;

    setUploading((prev) => ({ ...prev, [reportKey]: true }));

    try {
      const uploadedUrls: string[] = [];

      for (const file of files) {
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

      const existing = (data[reportKey] ?? []) as string[];
      const payload = { [reportKey]: [...existing, ...uploadedUrls] };

      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/master-po-assignees/${id}`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      // Update state
      setUploadedFiles((prev) => ({
        ...prev,
        [reportKey]: [
          ...(prev[reportKey] ?? []).filter((u) => !u.startsWith("data:")),
          ...uploadedUrls,
        ],
      }));
      setPendingFiles((prev) => ({ ...prev, [reportKey]: [] }));

      setTimeout(() => onUpdate?.(), 1000);
    } catch (error) {
      console.error(error);
      alert("Upload failed. Please check Cloudinary credentials.");
    } finally {
      setUploading((prev) => ({ ...prev, [reportKey]: false }));
    }
  };

  const removeFile = async (reportKey: string, url: string) => {
    const isLocal = url.startsWith("data:");
    const currentFiles = (data[reportKey] ?? []) as string[];
    const newFiles = currentFiles.filter((u: string) => u !== url);

    if (!isLocal) {
      try {
        await axios.patch(
          `${process.env.NEXT_PUBLIC_API_URL}/master-po-assignees/${id}`,
          { [reportKey]: newFiles },
          { headers: { "Content-Type": "application/json" } }
        );
        setTimeout(() => onUpdate?.(), 800);
      } catch (err) {
        console.error(err);
        alert("Failed to remove file.");
        return;
      }
    }

    setUploadedFiles((prev) => ({
      ...prev,
      [reportKey]: (prev[reportKey] ?? []).filter((u) => u !== url),
    }));
    setPendingFiles((prev) => ({
      ...prev,
      [reportKey]: (prev[reportKey] ?? []).filter((f) => {
        const reader = new FileReader();
        reader.readAsDataURL(f);
        // This is simplified; in practice, compare file names or size
        return true;
      }),
    }));
  };

  const isPdfFile = (url: string) =>
    url.endsWith(".pdf") || url.startsWith("data:application/pdf");

  /* ------------------- Render ------------------- */
  return (
    <>
      <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
        <h3 className="text-base font-semibold text-slate-900 mb-5 pb-4 border-b border-slate-200">
          Upload Reports
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {reports.map((report) => {
            const savedFiles = (data[report.key] ?? []) as string[];
            const localPreviews = uploadedFiles[report.key] ?? [];
            const allPreviews = [
              ...savedFiles,
              ...localPreviews.filter((u) => u.startsWith("data:")),
            ];
            const hasPending = (pendingFiles[report.key] ?? []).length > 0;
            const isUploading = uploading[report.key];
            const isSalesInvoice = report.key === "salesInvoiceImages";

            return (
              <div
                key={report.key}
                className="bg-slate-50 rounded-lg p-4 border border-slate-200 flex flex-col items-center"
              >
                {/* Title */}
                <h4 className="text-sm font-semibold text-slate-900 mb-3 text-center">
                  {report.title}
                </h4>

                {/* Upload Area */}
                <div className="relative w-16 h-16 bg-white border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors">
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                  ) : allPreviews.length > 0 ? (
                    <FileCheck2 className="w-6 h-6 text-green-500" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-slate-400" />
                  )}
                  <input
                    type="file"
                    multiple
                    accept="image/*,application/pdf"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    ref={(el) => (fileInputRefs.current[report.key] = el)}
                    onChange={(e) =>
                      handleFileChange(report.key, e.target.files)
                    }
                  />
                </div>

                <button
                  onClick={() => fileInputRefs.current[report.key]?.click()}
                  className="mt-3 flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  {allPreviews.length > 0 ? "Add More" : "Upload"}
                  <Upload className="w-3 h-3" />
                </button>

                {/* Upload Pending Button */}
                {hasPending && (
                  <button
                    onClick={() => uploadPendingFiles(report.key)}
                    disabled={isUploading}
                    className="mt-2 px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-3 h-3" />
                        Upload {pendingFiles[report.key].length}
                      </>
                    )}
                  </button>
                )}

                {/* File Previews */}
                {allPreviews.length > 0 && (
                  <div className="mt-3 flex flex-wrap justify-center gap-1.5 max-h-32 overflow-y-auto">
                    {allPreviews.map((url, idx) => (
                      <div key={idx} className="relative group">
                        <div
                          onClick={() => setPreviewUrl(url)}
                          className="cursor-pointer"
                        >
                          {isPdfFile(url) ? (
                            <div className="w-12 h-12 flex items-center justify-center bg-red-50 rounded-lg border border-red-200">
                              <FileText className="w-6 h-6 text-red-500" />
                            </div>
                          ) : (
                            <img
                              src={url}
                              alt="uploaded"
                              className="w-12 h-12 rounded-lg border border-slate-200 object-cover hover:border-blue-300 transition-colors"
                            />
                          )}
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(report.key, url);
                          }}
                          className="absolute -top-1 -right-1 bg-white border border-slate-300 rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition"
                          title="Remove"
                        >
                          <X className="w-3 h-3 text-red-600" />
                        </button>

                        {/* Open PDF in new tab */}
                        {isPdfFile(url) && !url.startsWith("data:") && (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute -bottom-1 -right-1 bg-white border border-slate-300 rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition"
                            title="Open PDF"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-3 h-3 text-blue-600" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* ---------- Sales Invoice Number (EDITABLE) ---------- */}
                {isSalesInvoice && (
                  <div className="mt-4 w-full space-y-2">
                    <label className="block text-xs font-medium text-slate-700">
                      Sales Invoice Number
                    </label>

                    <div className="flex items-center gap-2">
                      {editingInvoice ? (
                        <>
                          <input
                            type="text"
                            value={salesInvoiceNo}
                            onChange={(e) => setSalesInvoiceNo(e.target.value)}
                            placeholder="Enter invoice number"
                            className="flex-1 px-2 w-10 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            autoFocus
                          />
                          <button
                            onClick={saveInvoiceNumber}
                            disabled={invoiceSaving || !salesInvoiceNo.trim()}
                            className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                          >
                            {invoiceSaving ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={cancelEditingInvoice}
                            className="px-2 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="flex-1 text-sm font-medium text-slate-800">
                            {salesInvoiceNo || "—"}
                          </span>
                          <button
                            onClick={startEditingInvoice}
                            className="p-1 text-slate-600 hover:text-blue-600"
                            title="Edit invoice number"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ==================== PREVIEW MODAL ==================== */}
      {previewUrl && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="relative bg-white rounded-lg shadow-2xl p-4 max-w-5xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute top-3 right-3 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-slate-700" />
            </button>

            {isPdfFile(previewUrl) ? (
              <iframe
                src={previewUrl}
                className="w-full h-[85vh]"
                title="PDF Preview"
              />
            ) : (
              <img
                src={previewUrl}
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
