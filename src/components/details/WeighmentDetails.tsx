"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Upload,
  Scale,
  Loader2,
  CheckCircle2,
  Image as ImageIcon,
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

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [popupImage, setPopupImage] = useState<string | null>(null);

  // ✅ Fetch existing weighment details
  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `https://markhet-internal-dev.onrender.com/master-po-assignees/${id}`
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

  // ✅ Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setError("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Handle Cloudinary image upload
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
      alert("Image upload failed. Please check your Cloudinary setup.");
    } finally {
      setUploading(false);
    }
  };

  // ✅ Save updated data to backend
  const handleUpdate = async () => {
    if (!id) return;

    // 🔸 Validation for mandatory fields
    if (!formData.quantityLoadedMeasure || !formData.quantityUnloadedMeasure) {
      setError("Please select both quantity measures before saving.");
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
        `https://markhet-internal-dev.onrender.com/master-po-assignees/${id}`,
        payload
      );

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error updating weighment details:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-2xl p-6">
      {/* Title */}
      <div className="flex items-center gap-2 mb-4">
        <Scale className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold text-lg text-gray-800">
          Weighment Details
        </h3>
      </div>

      <div className="flex flex-col gap-4">
        {/* ✅ Quantity Loaded */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label className="w-40 text-sm font-medium text-gray-700">
            Loading:
          </label>
          <div className="flex items-center gap-2 w-full">
            <input
              type="number"
              name="quantityLoaded"
              value={formData.quantityLoaded}
              onChange={handleChange}
              placeholder="10.25"
              className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-purple-500 text-sm"
            />
            <select
              name="quantityLoadedMeasure"
              value={formData.quantityLoadedMeasure}
              onChange={handleChange}
              required
              className="border border-gray-200 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select Measure *</option>
              {measureOptions.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ✅ Quantity Unloaded */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label className="w-40 text-sm font-medium text-gray-700">
            Unloading:
          </label>
          <div className="flex items-center gap-2 w-full">
            <input
              type="number"
              name="quantityUnloaded"
              value={formData.quantityUnloaded}
              onChange={handleChange}
              placeholder="10.25"
              className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-purple-500 text-sm"
            />
            <select
              name="quantityUnloadedMeasure"
              value={formData.quantityUnloadedMeasure}
              onChange={handleChange}
              required
              className="border border-gray-200 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select Measure *</option>
              {measureOptions.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ✅ Image Upload */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label className="w-40 text-sm font-medium text-gray-700">
            Weighment Images:
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full"
          />
        </div>

        {/* ✅ Display Images */}
        {formData.weighmentImages.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-3">
            {formData.weighmentImages.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`uploaded-${i}`}
                className="w-20 h-20 object-cover rounded-lg border cursor-pointer hover:scale-105 transition"
                onClick={() => setPopupImage(url)}
              />
            ))}
          </div>
        )}

        {/* ❌ Error */}
        {error && (
          <p className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" /> {error}
          </p>
        )}
      </div>

      {/* ✅ Save button */}
      <button
        onClick={handleUpdate}
        disabled={loading || uploading}
        className="mt-5 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-5 py-2.5 text-sm transition-all shadow-sm"
      >
        {loading || uploading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Upload className="w-4 h-4" />
        )}
        {loading || uploading ? "Saving..." : "Save Details"}
      </button>

      {success && (
        <p className="flex items-center gap-2 mt-3 text-green-600 text-sm">
          <CheckCircle2 className="w-4 h-4" /> Updated successfully!
        </p>
      )}

      {/* ✅ Image Popup */}
      {popupImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]"
          style={{ backdropFilter: "blur(4px)" }}
        >
          <div className="relative">
            <button
              onClick={() => setPopupImage(null)}
              className="absolute -top-3 -right-3 bg-white hover:bg-gray-100 p-2 rounded-full shadow-lg "
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
            <img
              src={popupImage}
              alt="Preview"
              className="max-w-[300px] max-h-[300px] rounded-xl shadow-2xl border border-gray-700 object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
