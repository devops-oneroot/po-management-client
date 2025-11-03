"use client";

import React, { useRef, useState } from "react";
import axios from "axios";
import {
  Upload,
  ImageIcon,
  FileCheck2,
  Loader2,
  X,
  FileText,
  ExternalLink,
} from "lucide-react";

interface UploadReportsProps {
  id: string;
  data: any;
  onUpdate?: () => void;
}

export default function UploadReports({ id, data, onUpdate }: UploadReportsProps) {
  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

  const reports = [
    { title: "Payment Slip", key: "paymentSlipImages" },
    { title: "Quality Report", key: "qualityReportImages" },
    { title: "E-Way Bill", key: "eWayBillImages" },
    { title: "APMC", key: "apmcImages" },
    { title: "Sales Invoice", key: "salesInvoiceImages" },
    { title: "Miscellaneous", key: "miscellaneousDocs" },
  ];

  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string[]>>(
    {}
  );
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleFileUpload = async (
    reportKey: string,
    files: FileList | null
  ) => {
    if (!files || files.length === 0) return;

    try {
      setLoading((prev) => ({ ...prev, [reportKey]: true }));
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
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

      const payload = { [reportKey]: uploadedUrls };
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/master-po-assignees/${id}`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      setUploadedFiles((prev) => ({
        ...prev,
        [reportKey]: [...(prev[reportKey] ?? []), ...uploadedUrls],
      }));
      
      // Trigger parent refetch after successful upload
      setTimeout(() => {
        onUpdate?.();
      }, 1000);
    } catch (error) {
      console.error(error);
      alert("Upload failed. Please check Cloudinary credentials.");
    } finally {
      setLoading((prev) => ({ ...prev, [reportKey]: false }));
    }
  };

  const isPdfFile = (url: string) => url.endsWith(".pdf");

  return (
    <>
      <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
        <h3 className="text-base font-semibold text-slate-900 mb-5 pb-4 border-b border-slate-200">
          Upload Reports
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {reports.map((report) => {
            const existing = (data[report.key] ?? []) as string[];
            const justUploaded = uploadedFiles[report.key] ?? [];
            const allFiles = [...existing, ...justUploaded];

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
                  {loading[report.key] ? (
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                  ) : allFiles.length ? (
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
                      handleFileUpload(report.key, e.target.files)
                    }
                  />
                </div>

                <button
                  onClick={() => fileInputRefs.current[report.key]?.click()}
                  className="mt-3 flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  {allFiles.length ? "Add More" : "Upload"}
                  <Upload className="w-3 h-3" />
                </button>

                {/* File previews */}
                {allFiles.length > 0 && (
                  <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                    {allFiles.map((url, idx) => (
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
                        {isPdfFile(url) && (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute -top-1 -right-1 bg-white border border-slate-200 rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition"
                            title="Open PDF"
                          >
                            <ExternalLink className="w-3 h-3 text-blue-600" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg shadow-xl p-4 max-w-4xl w-full max-h-[90vh] overflow-auto">
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute top-3 right-3 text-slate-600 hover:text-slate-900"
            >
              <X className="w-6 h-6" />
            </button>

            {isPdfFile(previewUrl) ? (
              <iframe
                src={previewUrl}
                className="w-full h-[80vh]"
                title="PDF Preview"
              />
            ) : (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-auto rounded-lg"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
