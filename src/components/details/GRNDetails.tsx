"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Scale, Upload, Loader2, CheckCircle2, XCircle, X } from "lucide-react";

interface GRNDetailsProps {
  id: string;
  grnDate?: string;
  rejectedQuantity?: number;
  rejectedQuantityMeasure?: string;
  grnImages?: string[];
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

export default function GRNDetails({
  id,
  grnDate = "",
  rejectedQuantity = 0,
  rejectedQuantityMeasure = "",
  grnImages = [],
}: GRNDetailsProps) {
  const [form, setForm] = useState({
    grnDate: "",
    rejectedQuantity: "",
    rejectedQuantityMeasure: "",
    grnImages: [] as string[],
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [errors, setErrors] = useState<{ measure?: string }>({});
  const [popupImage, setPopupImage] = useState<string | null>(null);

  // ✅ Cloudinary ENV values
  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

  // Prefill form
  useEffect(() => {
    setForm({
      grnDate,
      rejectedQuantity: rejectedQuantity ? String(rejectedQuantity) : "",
      rejectedQuantityMeasure,
      grnImages: grnImages || [],
    });
  }, [grnDate, rejectedQuantity, rejectedQuantityMeasure, grnImages]);

  // ✅ Upload image to Cloudinary
  const handleUploadToCloudinary = async (
    file: File
  ): Promise<string | null> => {
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", UPLOAD_PRESET);
      data.append("folder", "grn_docs");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: data,
        }
      );

      const result = await res.json();
      if (result.secure_url) return result.secure_url;
      throw new Error("Failed to upload image");
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      setMessage({
        type: "error",
        text: "Failed to upload image to Cloudinary!",
      });
      return null;
    }
  };

  // ✅ Handle submit (upload → send to backend)
  const handleSubmit = async () => {
    if (!id) return;

    // Validation
    if (!form.rejectedQuantityMeasure) {
      setErrors({ measure: "Please select a measure before saving." });
      return;
    }
    setErrors({});
    setLoading(true);
    setMessage(null);

    try {
      let imageUrls = [...form.grnImages];

      // Upload new image (if selected)
      if (file) {
        const uploadedUrl = await handleUploadToCloudinary(file);
        if (uploadedUrl) {
          imageUrls.push(uploadedUrl);
        }
      }

      // Payload for backend
      const payload = {
        grnDate: form.grnDate,
        rejectedQuantity: Number(form.rejectedQuantity),
        rejectedQuantityMeasure: form.rejectedQuantityMeasure,
        grnImages: imageUrls,
      };

      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/master-po-assignees/${id}`,
        payload
      );

      setForm({ ...form, grnImages: imageUrls });
      setFile(null);
      setMessage({
        type: "success",
        text: "GRN details updated successfully!",
      });
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Failed to update GRN details!" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow hover:shadow-lg transition-all relative">
      <div className="flex items-center gap-2 mb-4">
        <Scale className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold text-lg text-gray-800">GRN Details</h3>
      </div>

      <div className="flex flex-col gap-4">
        {/* GRN Date */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label className="w-40 text-sm font-medium text-gray-700">
            GRN Date
          </label>
          <input
            type="date"
            value={form.grnDate}
            onChange={(e) => setForm({ ...form, grnDate: e.target.value })}
            className="border border-gray-200 rounded-lg px-3 py-2 w-full text-sm focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Rejected Quantity */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label className="w-40 text-sm font-medium text-gray-700">
            Rejected Quantity
          </label>
          <div className="flex items-center gap-2 w-full">
            <input
              value={form.rejectedQuantity}
              onChange={(e) =>
                setForm({ ...form, rejectedQuantity: e.target.value })
              }
              placeholder="10"
              className="border border-gray-200 rounded-lg px-3 py-2 w-full text-sm focus:ring-2 focus:ring-purple-500"
            />
            <select
              value={form.rejectedQuantityMeasure}
              onChange={(e) =>
                setForm({ ...form, rejectedQuantityMeasure: e.target.value })
              }
              className={`border rounded-lg px-2 py-2 text-sm focus:ring-2 w-40 ${
                errors.measure
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-200 focus:ring-purple-500"
              }`}
            >
              <option value="">Select Measure</option>
              {measureOptions.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {errors.measure && (
          <p className="text-xs text-red-600 ml-[10rem]">{errors.measure}</p>
        )}

        {/* Image Upload */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label className="w-40 text-sm font-medium text-gray-700">
            GRN Images
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="text-sm"
          />
        </div>

        {/* Show Uploaded Images */}
        {form.grnImages.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-3">
            {form.grnImages.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`GRN-${i}`}
                className="w-24 h-24 object-cover rounded-lg border cursor-pointer hover:scale-105 transition"
                onClick={() => setPopupImage(img)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-5 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-5 py-2.5 text-sm transition-all shadow-sm disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Upload className="w-4 h-4" />
        )}
        {loading ? "Saving..." : "Save Details"}
      </button>

      {/* Message */}
      {message && (
        <p
          className={`mt-3 flex items-center gap-2 text-sm ${
            message.type === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          {message.text}
        </p>
      )}

      {/* ✅ Image Popup Preview */}
      {popupImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="relative">
            <button
              onClick={() => setPopupImage(null)}
              className="absolute top-2 right-2 bg-white p-2 rounded-full shadow"
            >
              <X className="w-4 h-4 text-gray-700" />
            </button>
            <img
              src={popupImage}
              alt="Preview"
              className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
