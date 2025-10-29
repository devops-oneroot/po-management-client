"use client";

import React from "react";
import { Upload, ImageIcon } from "lucide-react";

export default function UploadReports() {
  const reports = [
    { title: "Quality Report", button: "Upload Report" },
    { title: "E-Way Bill", button: "Upload" },
    { title: "APMC", button: "Upload" },
    { title: "Sales Invoice", button: "Upload" },
    { title: "Miscellaneous Docs", button: "Upload" },
  ];

  return (
    <div className="flex flex-wrap gap-4">
      {reports.map((report) => (
        <div
          key={report.title}
          className="bg-white rounded-2xl p-4 shadow border border-gray-100 w-[225px] mt-1 h-[240px] flex flex-col items-center"
        >
          <h4 className="font-semibold text-sm mb-3 text-center border-b w-full pb-1">
            {report.title}
          </h4>

          <button className="flex items-center justify-center gap-2 text-gray-700 hover:text-black text-sm font-medium mb-3">
            {report.button} <Upload className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center gap-2">
            <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-gray-400" />
            </div>

            {report.title === "Miscellaneous Docs" && (
              <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
