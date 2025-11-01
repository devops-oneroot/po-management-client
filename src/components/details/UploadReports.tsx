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
}

export default function UploadReports({ id, data }: UploadReportsProps) {
  // 🔹 Replace with your actual Cloudinary credentials
  const CLOUD_NAME = "dz23idc5e";
  const UPLOAD_PRESET = "Image_upload";

  const reports = [
    { title: "Payment Slip", key: "paymentSlipImages" },
    { title: "Quality Report", key: "qualityReportImages" },
    { title: "E-Way Bill", key: "eWayBillImages" },
    { title: "APMC", key: "apmcImages" },
    { title: "Sales Invoice", key: "salesInvoiceImages" },
    { title: "Miscellaneous Docs", key: "miscellaneousDocs" },
  ];

  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string[]>>(
    {}
  );
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // 🔹 Handle upload to Cloudinary (image/pdf)
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

        // ✅ Correct endpoint for Cloudinary (no "type" param)
        const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${
          isPdf ? "raw" : "image"
        }/upload`;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);

        const uploadRes = await axios.post(endpoint, formData);
        uploadedUrls.push(uploadRes.data.secure_url);
      }

      // ✅ Send Cloudinary URLs to backend
      const payload = { [reportKey]: uploadedUrls };
      await axios.patch(
        `https://markhet-internal-dev.onrender.com/master-po-assignees/${id}`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      // ✅ Update UI locally
      setUploadedFiles((prev) => ({
        ...prev,
        [reportKey]: [...(prev[reportKey] ?? []), ...uploadedUrls],
      }));
    } catch (error) {
      console.error(error);
      alert("Upload failed. Please check Cloudinary credentials or preset.");
    } finally {
      setLoading((prev) => ({ ...prev, [reportKey]: false }));
    }
  };

  const isPdfFile = (url: string) => url.endsWith(".pdf");

  return (
    <>
      <div className="flex flex-wrap gap-6 mt-4">
        {reports.map((report) => {
          const existing = (data[report.key] ?? []) as string[];
          const justUploaded = uploadedFiles[report.key] ?? [];
          const allFiles = [...existing, ...justUploaded];

          return (
            <div
              key={report.key}
              className="bg-gradient-to-br from-white to-purple-50 rounded-3xl p-6 shadow-md border border-gray-100 w-[220px] flex flex-col items-center"
            >
              {/* Header */}
              <h4 className="font-semibold text-base text-gray-800 border-b w-full text-center pb-2">
                {report.title}
              </h4>

              {/* Upload UI */}
              <div className="mt-4 flex flex-col items-center gap-3">
                <div className="relative w-20 h-20 bg-white border border-dashed border-purple-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-purple-500">
                  {loading[report.key] ? (
                    <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                  ) : allFiles.length ? (
                    <FileCheck2 className="w-8 h-8 text-green-500" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-purple-400" />
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
                  className="flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-800"
                >
                  {allFiles.length ? "Add More" : "Upload"}{" "}
                  <Upload className="w-4 h-4" />
                </button>
              </div>

              {/* File previews */}
              {allFiles.length > 0 && (
                <div className="mt-4 w-full">
                  <div className="flex flex-wrap justify-center gap-2">
                    {allFiles.map((url, idx) => (
                      <div key={idx} className="relative group">
                        <div
                          onClick={() => setPreviewUrl(url)}
                          className="cursor-pointer"
                        >
                          {isPdfFile(url) ? (
                            <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-lg border shadow-sm">
                              <FileText className="w-8 h-8 text-red-500" />
                            </div>
                          ) : (
                            <img
                              src={url}
                              alt="uploaded"
                              className="w-16 h-16 rounded-lg border object-cover shadow-sm hover:scale-105 transition-transform"
                            />
                          )}
                        </div>
                        {isPdfFile(url) && (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute -top-2 -right-2 bg-white border rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition"
                            title="Open PDF in new tab"
                          >
                            <ExternalLink className="w-3 h-3 text-purple-600" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-xl shadow-2xl p-4 max-w-3xl w-full max-h-[90vh] overflow-auto">
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black"
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
