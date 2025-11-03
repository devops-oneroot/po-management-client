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

const measureOptions = [
  "QUINTAL",
  "TON",
  "PIECE",
  "KILOGRAM",
  "GRAM",
  "LITRE",
  "BAG",
  "BOX",
];

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
    quantityLoadedMeasure: quantityLoadedMeasure || "",
    quantityUnloaded: quantityUnloaded?.toString() || "",
    quantityUnloadedMeasure: quantityUnloadedMeasure || "",
    weighmentImages: weighmentImages || [],
  });

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [errors, setErrors] = useState<{ measure?: string }>({});
  const [popupImage, setPopupImage] = useState<string | null>(null);

  // Fetch existing weighment details
  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/master-po-assignees/${id}`
        );
        const data = res.data.data;
        setFormData({
          quantityLoaded: data.quantityLoaded?.toString() || "",
          quantityLoadedMeasure: data.quantityLoadedMeasure || "",
          quantityUnloaded: data.quantityUnloaded?.toString() || "",
          quantityUnloadedMeasure: data.quantityUnloadedMeasure || "",
          weighmentImages: data.weighmentImages || [],
        });
      } catch (error) {
        console.error("Error fetching weighment details:", error);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({});
  };

  // Upload image to Cloudinary
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        const formDataCloud = new FormData();
        formDataCloud.append("file", file);
        formDataCloud.append("upload_preset", UPLOAD_PRESET);
        formDataCloud.append("folder", "weighment_docs");

        const res = await axios.post(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
          formDataCloud
        );
        uploadedUrls.push(res.data.secure_url);
      }

      setFormData((prev) => ({
        ...prev,
        weighmentImages: [...prev.weighmentImages, ...uploadedUrls],
      }));
    } catch (error) {
      console.error("Cloudinary upload failed:", error);
      setMessage({
        type: "error",
        text: "Image upload failed!",
      });
    } finally {
      setUploading(false);
    }
  };

  // Save to backend
  const handleUpdate = async () => {
    if (!id) return;

    if (!formData.quantityLoadedMeasure || !formData.quantityUnloadedMeasure) {
      setErrors({ measure: "Please select both measures" });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        quantityLoaded: Number(formData.quantityLoaded),
        quantityLoadedMeasure: formData.quantityLoadedMeasure,
        quantityUnloaded: Number(formData.quantityUnloaded),
        quantityUnloadedMeasure: formData.quantityUnloadedMeasure,
        weighmentImages: formData.weighmentImages,
      };

      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/master-po-assignees/${id}`,
        payload
      );

      setMessage({
        type: "success",
        text: "Weighment details updated!",
      });
      setTimeout(() => setMessage(null), 3000);
      
      // Trigger parent refetch
      setTimeout(() => {
        onUpdate?.();
      }, 1000);
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Failed to update!" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-200">
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <Scale className="w-5 h-5 text-slate-600" />
          Weighment Details
        </h3>
      </div>

      <div className="flex flex-col gap-4">
        {/* Quantity Loaded */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Loading Quantity</label>
          <div className="flex gap-2">
            <input
              type="number"
              name="quantityLoaded"
              value={formData.quantityLoaded}
              onChange={handleChange}
              placeholder="10.25"
              className="flex-1 border border-slate-200 rounded-md px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 hover:border-slate-300 transition-colors duration-150"
            />
            <select
              name="quantityLoadedMeasure"
              value={formData.quantityLoadedMeasure}
              onChange={handleChange}
              className="border border-slate-200 rounded-md px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 hover:border-slate-300 transition-colors duration-150"
            >
              <option value="">Measure</option>
              {measureOptions.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quantity Unloaded */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Unloading Quantity</label>
          <div className="flex gap-2">
            <input
              type="number"
              name="quantityUnloaded"
              value={formData.quantityUnloaded}
              onChange={handleChange}
              placeholder="10.25"
              className="flex-1 border border-slate-200 rounded-md px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 hover:border-slate-300 transition-colors duration-150"
            />
            <select
              name="quantityUnloadedMeasure"
              value={formData.quantityUnloadedMeasure}
              onChange={handleChange}
              className="border border-slate-200 rounded-md px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 hover:border-slate-300 transition-colors duration-150"
            >
              <option value="">Measure</option>
              {measureOptions.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {errors.measure && (
          <p className="text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.measure}
          </p>
        )}

        {/* Image Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Weighment Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            disabled={uploading}
            className="w-full border border-slate-200 rounded-md px-3 py-2.5 text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
          />
        </div>

        {/* Display Images */}
        {formData.weighmentImages.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.weighmentImages.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`weighment-${i}`}
                className="w-20 h-20 object-cover rounded-lg border border-slate-200 cursor-pointer hover:border-blue-300 transition-colors"
                onClick={() => setPopupImage(url)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end mt-6 pt-4 border-t border-slate-200">
        <button
          onClick={handleUpdate}
          disabled={loading || uploading}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-md font-medium shadow-sm transition-colors duration-150 text-sm"
        >
          {loading || uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
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

      {/* Image Popup */}
      {popupImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="relative">
            <button
              onClick={() => setPopupImage(null)}
              className="absolute -top-3 -right-3 bg-white hover:bg-slate-100 p-2 rounded-full shadow-lg"
            >
              <X className="w-5 h-5 text-slate-700" />
            </button>
            <img
              src={popupImage}
              alt="Preview"
              className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
