"use client";

import React, { useRef, useState } from "react";
import { Upload, ImageIcon, FileCheck2 } from "lucide-react";

export default function UploadReports() {
  const reports = [
    { title: "Quality Report" },
    { title: "E-Way Bill" },
    { title: "APMC" },
    { title: "Sales Invoice" },
    { title: "Miscellaneous Docs" },
  ];

  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>(
    {}
  );
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleFileUpload = (title: string, file: File | null) => {
    if (!file) return;
    setUploadedFiles((prev) => ({
      ...prev,
      [title]: file.name,
    }));
  };

  return (
    <div className="flex flex-wrap gap-6 mt-4">
      {reports.map((report) => (
        <div
          key={report.title}
          className="bg-gradient-to-br from-white to-purple-50 rounded-3xl p-6 shadow-md border border-gray-100 w-[200px] h-[240px] flex flex-col justify-between items-center hover:shadow-xl transition-all duration-300"
        >
          {/* Header */}
          <h4 className="font-semibold text-base text-gray-800 text-center border-b border-gray-100 pb-2 w-full">
            {report.title}
          </h4>

          {/* Upload Area */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-20 h-20 bg-white border border-dashed border-purple-300 rounded-xl flex items-center justify-center hover:border-purple-500 transition cursor-pointer">
              {uploadedFiles[report.title] ? (
                <FileCheck2 className="w-8 h-8 text-green-500" />
              ) : (
                <ImageIcon className="w-8 h-8 text-purple-400" />
              )}
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                ref={(el) => (fileInputRefs.current[report.title] = el)}
                onChange={(e) =>
                  handleFileUpload(report.title, e.target.files?.[0] || null)
                }
              />
            </div>

            {/* Upload Button */}
            <button
              onClick={() => fileInputRefs.current[report.title]?.click()}
              className="flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-800 transition"
            >
              {uploadedFiles[report.title] ? "Change File" : "Upload File"}
              <Upload className="w-4 h-4" />
            </button>

            {/* Uploaded File Name */}
            {uploadedFiles[report.title] && (
              <p className="text-xs text-gray-500 mt-1 truncate w-40 text-center">
                {uploadedFiles[report.title]}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
