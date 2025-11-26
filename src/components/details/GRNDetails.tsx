"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Scale,
  Upload,
  Loader2,
  CheckCircle2,
  XCircle,
  X,
  AlertCircle,
  FileText,
  ExternalLink,
} from "lucide-react";

interface GRNDetailsProps {
  id: string;
  grnDate?: string;
  rejectedQuantity?: number;
  rejectedQuantityMeasure?: string;
  grnImages?: string[];
  onUpdate?: () => void;
}

export default function GRNDetails({
  id,
  grnDate = "",
  rejectedQuantity = 0,
  rejectedQuantityMeasure = "",
  grnImages = [],
  onUpdate,
}: GRNDetailsProps) {
  const [form, setForm] = useState({
    grnDate: "",
    rejectedQuantity: "",
    rejectedQuantityMeasure: "",
    grnImages: [] as string[],
  });

  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [errors, setErrors] = useState<{ measure?: string }>({});
  const [popupFile, setPopupFile] = useState<string | null>(null);

  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

  /* -------------------- Prefill form -------------------- */
  useEffect(() => {
    setForm({
      grnDate,
      rejectedQuantity: rejectedQuantity ? String(rejectedQuantity) : "",
      // Rejected quantity is always in kilograms
      rejectedQuantityMeasure: rejectedQuantityMeasure || "KILOGRAM",
      grnImages: grnImages || [],
    });
  }, [grnDate, rejectedQuantity, rejectedQuantityMeasure, grnImages]);

  /* -------------------- Input changes -------------------- */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({});
  };

  /* -------------------- File selection -------------------- */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const isPdfFile = (url: string) =>
    url.endsWith(".pdf") || url.includes("application/pdf");

  /* -------------------- Cloudinary Upload -------------------- */
  const handleUploadToCloudinary = async (
    file: File
  ): Promise<string | null> => {
    try {
      const isPdf = file.type === "application/pdf";
      const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${
        isPdf ? "raw" : "image"
      }/upload`;

      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", UPLOAD_PRESET);
      data.append("folder", "grn_docs");

      const res = await fetch(endpoint, { method: "POST", body: data });
      const result = await res.json();

      if (result.secure_url) return result.secure_url;
      throw new Error("Upload failed");
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "File upload failed!" });
      return null;
    }
  };

  /* -------------------- REMOVE IMAGE / PDF -------------------- */
  const handleRemoveFile = async (index: number) => {
    const updated = [...form.grnImages];
    updated.splice(index, 1);

    // Update UI immediately
    setForm((prev) => ({ ...prev, grnImages: updated }));

    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/master-po-assignees/${id}`,
        { grnImages: updated }
      );

      setMessage({ type: "success", text: "File removed successfully!" });
      setTimeout(() => setMessage(null), 2000);

      onUpdate?.();
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Failed to remove file!" });
    }
  };

  /* -------------------- SAVE / SUBMIT -------------------- */
  const handleSubmit = async () => {
    if (!id) return;

    try {
      setLoading(true);
      let uploadedUrls = [...form.grnImages];

      if (files.length > 0) {
        setUploading(true);

        for (const file of files) {
          const uploadedUrl = await handleUploadToCloudinary(file);
          if (uploadedUrl) uploadedUrls.push(uploadedUrl);
        }

        setUploading(false);
      }

      const payload = {
        grnDate: form.grnDate,
        rejectedQuantity: Number(form.rejectedQuantity),
        // Always send rejected quantity in kilograms
        rejectedQuantityMeasure: "KILOGRAM",
        grnImages: uploadedUrls,
      };

      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/master-po-assignees/${id}`,
        payload
      );

      setForm({ ...form, grnImages: uploadedUrls });
      setFiles([]);
      setMessage({ type: "success", text: "GRN details updated!" });
      setTimeout(() => setMessage(null), 3000);

      onUpdate?.();
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Failed to update!" });
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- UI -------------------- */
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-200">
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <Scale className="w-5 h-5 text-slate-600" />
          GRN Details
        </h3>
      </div>

      <div className="flex flex-col gap-4">
        {/* GRN Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">GRN Date</label>
          <input
            type="date"
            name="grnDate"
            value={form.grnDate}
            onChange={handleChange}
            className="w-full border border-slate-200 rounded-md px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Rejected Quantity */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Rejected Quantity
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              name="rejectedQuantity"
              value={form.rejectedQuantity}
              onChange={handleChange}
              placeholder="10"
              className="flex-1 border rounded-md px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500"
            />
            {/* Hardcoded to kilograms */}
            <span className="inline-flex items-center px-3 py-2.5 border rounded-md text-sm bg-slate-50">
              Kg
            </span>
          </div>

          {errors.measure && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.measure}
            </p>
          )}
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Upload GRN File (Image / PDF)
          </label>
          <input
            type="file"
            multiple
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            className="w-full border rounded-md px-3 py-2.5 text-sm 
                      file:bg-slate-100 file:px-3 file:py-1 file:rounded"
          />
        </div>

        {/* File Preview */}
        {form.grnImages.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {form.grnImages.map((url, i) => (
              <div key={i} className="relative group cursor-pointer">
                {/* REMOVE FILE */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(i);
                  }}
                  className="absolute top-1 right-1 bg-white p-1 rounded-full shadow border 
                             opacity-0 group-hover:opacity-100 transition"
                >
                  <X className="w-4 h-4 text-red-600" />
                </button>

                {/* Preview */}
                {isPdfFile(url) ? (
                  <div
                    onClick={() => setPopupFile(url)}
                    className="w-20 h-20 flex items-center justify-center bg-red-50 
                               border border-red-200 rounded-lg"
                  >
                    <FileText className="w-7 h-7 text-red-500" />
                  </div>
                ) : (
                  <img
                    src={url}
                    className="w-20 h-20 object-cover rounded-lg border hover:border-blue-400"
                    onClick={() => setPopupFile(url)}
                  />
                )}

                {/* PDF Open Icon */}
                {isPdfFile(url) && (
                  <a
                    href={url}
                    target="_blank"
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-1 right-1 bg-white p-1 rounded-full border opacity-0 
                               group-hover:opacity-100 transition"
                  >
                    <ExternalLink className="w-3 h-3 text-blue-600" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end mt-6 pt-4 border-t border-slate-200">
        <button
          onClick={handleSubmit}
          disabled={loading || uploading}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-md 
                     hover:bg-slate-800 disabled:bg-slate-400"
        >
          {loading || uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {uploading ? "Uploading..." : "Saving..."}
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Save Details
            </>
          )}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mt-4 flex items-center gap-2 p-3 rounded-md text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          {message.text}
        </div>
      )}

      {/* Popup Preview */}
      {popupFile && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setPopupFile(null)}
        >
          <div
            className="relative bg-white rounded-lg p-4 max-w-5xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPopupFile(null)}
              className="absolute top-3 right-3 p-2 bg-white rounded-full shadow"
            >
              <X className="w-5 h-5" />
            </button>

            {isPdfFile(popupFile) ? (
              <iframe src={popupFile} className="w-full h-[85vh]" />
            ) : (
              <img
                src={popupFile}
                className="w-full max-h-[85vh] object-contain"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
