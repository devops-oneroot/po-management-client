"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Upload,
  Scale,
  Loader2,
  CheckCircle2,
  XCircle,
  X,
  AlertCircle,
  FileText,
  ExternalLink,
} from "lucide-react";

interface WeighmentProps {
  id: string;
  quantityLoaded?: number;
  quantityLoadedMeasure?: string;
  quantityUnloaded?: number;
  quantityUnloadedMeasure?: string;
  weighmentImages?: string[];
  onUpdate?: () => void;
}

export default function WeighmentDetails({
  id,
  quantityLoaded,
  quantityLoadedMeasure,
  quantityUnloaded,
  quantityUnloadedMeasure,
  weighmentImages = [],
  onUpdate,
}: WeighmentProps) {
  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

  const [formData, setFormData] = useState({
    quantityLoaded: quantityLoaded?.toString() || "",
    // Loading quantity is always captured in kilograms
    quantityLoadedMeasure: quantityLoadedMeasure || "KILOGRAM",
    quantityUnloaded: quantityUnloaded?.toString() || "",
    // Unloading quantity is always captured in kilograms
    quantityUnloadedMeasure: quantityUnloadedMeasure || "KILOGRAM",
    weighmentImages: weighmentImages || [],
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

  // Update form when props change
  useEffect(() => {
    setFormData({
      quantityLoaded: quantityLoaded?.toString() || "",
      quantityLoadedMeasure: quantityLoadedMeasure || "KILOGRAM",
      quantityUnloaded: quantityUnloaded?.toString() || "",
      quantityUnloadedMeasure: quantityUnloadedMeasure || "KILOGRAM",
      weighmentImages: weighmentImages || [],
    });
  }, [
    quantityLoaded,
    quantityLoadedMeasure,
    quantityUnloaded,
    quantityUnloadedMeasure,
    weighmentImages,
  ]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({});
  };

  // Cloudinary upload for image/pdf
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
      data.append("folder", "weighment_docs");

      const res = await fetch(endpoint, { method: "POST", body: data });
      const result = await res.json();

      return result.secure_url || null;
    } catch (_) {
      setMessage({ type: "error", text: "File upload failed!" });
      return null;
    }
  };

  const isPdfFile = (url: string) =>
    url.endsWith(".pdf") || url.includes("application/pdf");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files)]);
    }
  };

  // Auto delete single file and update backend
  const handleRemoveFile = async (index: number) => {
    const updatedImages = [...formData.weighmentImages];
    const removedFile = updatedImages[index];
    updatedImages.splice(index, 1);

    // update UI immediately
    setFormData((prev) => ({
      ...prev,
      weighmentImages: updatedImages,
    }));

    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/master-po-assignees/${id}`,
        {
          weighmentImages: updatedImages,
        }
      );

      setMessage({ type: "success", text: "File removed successfully!" });
      setTimeout(() => setMessage(null), 2000);

      onUpdate?.();
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Failed to remove file!" });
    }
  };

  // Save all details (images + quantities)
  const handleUpdate = async () => {
    if (!id) return;

    try {
      setLoading(true);
      let uploadedUrls = [...formData.weighmentImages];

      if (files.length > 0) {
        setUploading(true);
        for (const file of files) {
          const uploadedUrl = await handleUploadToCloudinary(file);
          if (uploadedUrl) uploadedUrls.push(uploadedUrl);
        }
        setUploading(false);
      }

      const payload: any = { weighmentImages: uploadedUrls };

      if (formData.quantityLoaded) {
        payload.quantityLoaded = Number(formData.quantityLoaded);
        // Always send loading quantity in kilograms
        payload.quantityLoadedMeasure = "KILOGRAM";
      }

      if (formData.quantityUnloaded) {
        payload.quantityUnloaded = Number(formData.quantityUnloaded);
        // Always send unloading quantity in kilograms
        payload.quantityUnloadedMeasure = "KILOGRAM";
      }

      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/master-po-assignees/${id}`,
        payload
      );

      setFormData((prev) => ({ ...prev, weighmentImages: uploadedUrls }));
      setFiles([]);
      setMessage({ type: "success", text: "Weighment details updated!" });
      setTimeout(() => setMessage(null), 3000);

      onUpdate?.();
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Failed to update!" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-200">
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Scale className="w-5 h-5 text-slate-600" />
            Weighment Details
          </h3>
        </div>

        <div className="flex flex-col gap-4">
          {/* Loaded */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Loading Quantity
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                name="quantityLoaded"
                value={formData.quantityLoaded}
                onChange={handleChange}
                placeholder="e.g. 25"
                className="flex-1 border rounded-md px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500"
              />
              {/* Hardcoded to kilograms */}
              <span className="inline-flex items-center px-3 py-2.5 border rounded-md text-sm bg-slate-50">
                Kg
              </span>
            </div>
          </div>

          {/* Unloaded */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Unloading Quantity
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                name="quantityUnloaded"
                value={formData.quantityUnloaded}
                onChange={handleChange}
                placeholder="e.g. 20"
                className="flex-1 border rounded-md px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500"
              />
              {/* Hardcoded to kilograms */}
              <span className="inline-flex items-center px-3 py-2.5 border rounded-md text-sm bg-slate-50">
                Kg
              </span>
            </div>
          </div>

          {errors.measure && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.measure}
            </p>
          )}

          {/* File Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Upload Weighment File
            </label>
            <input
              type="file"
              multiple
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="w-full border rounded-md px-3 py-2.5 text-sm file:bg-slate-100"
            />
          </div>

          {/* File Preview */}
          {formData.weighmentImages.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.weighmentImages.map((url, i) => (
                <div key={i} className="relative group cursor-pointer">
                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(i);
                    }}
                    className="absolute top-1 right-1 bg-white p-1 rounded-full shadow z-10 opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </button>

                  {isPdfFile(url) ? (
                    <div
                      onClick={() => setPopupFile(url)}
                      className="w-20 h-20 flex items-center justify-center bg-red-50 border border-red-200 rounded-lg"
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

                  {isPdfFile(url) && (
                    <a
                      href={url}
                      target="_blank"
                      className="absolute bottom-1 right-1 bg-white rounded-full p-0.5 border opacity-0 group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-3 h-3 text-blue-600" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save */}
        <div className="flex justify-end mt-6 pt-4 border-t">
          <button
            onClick={handleUpdate}
            disabled={loading || uploading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-md disabled:bg-slate-400"
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
      </div>

      {/* Popup Preview */}
      {popupFile && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setPopupFile(null)}
        >
          <div
            className="relative bg-white rounded-lg p-4 max-w-5xl w-full max-h-[90vh]"
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
    </>
  );
}
