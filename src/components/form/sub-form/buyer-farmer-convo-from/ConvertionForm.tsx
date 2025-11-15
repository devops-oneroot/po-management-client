"use client";

import React, { useState } from "react";
import axios from "axios";
import { X } from "lucide-react";

// Define CropName enum (match backend)
enum CropName {
  TENDER_COCONUT = "Tender Coconut",
  DRY_COCONUT = "Dry Coconut",
  TURMERIC = "Turmeric",
  BANANA = "Banana",
  SUNFLOWER = "Sunflower",
  MAIZE = "Maize",
}

// Props for the popup
interface ConversionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentIdentity: "FARMER" | "BUYER";
}

const ConversionPopup: React.FC<ConversionPopupProps> = ({
  isOpen,
  onClose,
  userId,
  currentIdentity,
}) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    id: userId,
    cropNames:
      currentIdentity === "FARMER"
        ? CropName.BANANA // Default single crop for Farmer to Buyer
        : [CropName.BANANA], // Default array for Buyer to Farmer
  });

  // Handle single crop selection for Farmer-to-Buyer
  const handleSingleCropChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, cropNames: e.target.value as CropName });
  };

  // Handle multiple crop selection for Buyer-to-Farmer
  const handleMultipleCropChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value as CropName
    );
    setFormData({ ...formData, cropNames: selectedOptions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const endpoint =
        currentIdentity === "FARMER"
          ? `${process.env.NEXT_PUBLIC_API_URL}/users/convert-farmer-buyer`
          : `${process.env.NEXT_PUBLIC_API_URL}/users/convert-buyer-farmer`;

      const response = await axios.put(endpoint, formData, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.data.status === 200) {
        setMessage(response.data.message);
        setTimeout(onClose, 2000); // Close after 2 seconds
      } else {
        setMessage(`Error: ${response.data.message}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
          aria-label="Close"
          disabled={loading}
        >
          <X size={24} />
        </button>

        <h1 className="text-2xl font-bold text-green-700 mb-4">
          {currentIdentity === "FARMER"
            ? "Convert Farmer to Buyer"
            : "Convert Buyer to Farmer"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              User ID
            </label>
            <input
              type="text"
              value={formData.id}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Crop Name{currentIdentity === "BUYER" && "s"} (Required)
            </label>
            {currentIdentity === "FARMER" ? (
              <select
                value={formData.cropNames as string}
                onChange={handleSingleCropChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                required
                disabled={loading}
              >
                <option value="" disabled>
                  Select a crop
                </option>
                {Object.values(CropName).map((crop) => (
                  <option key={crop} value={crop}>
                    {crop}
                  </option>
                ))}
              </select>
            ) : (
              <select
                multiple
                value={formData.cropNames as string[]}
                onChange={handleMultipleCropChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 h-32"
                required
                disabled={loading}
              >
                {Object.values(CropName).map((crop) => (
                  <option key={crop} value={crop}>
                    {crop}
                  </option>
                ))}
              </select>
            )}
            {currentIdentity === "BUYER" && (
              <p className="text-xs text-gray-500 mt-1">
                Hold Ctrl (Windows) or Cmd (Mac) to select multiple crops
              </p>
            )}
          </div>

          <div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Converting..." : "Convert"}
            </button>
          </div>

          {message && (
            <p
              className={`text-sm text-center ${
                message.startsWith("Error") ? "text-red-600" : "text-green-600"
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default ConversionPopup;
