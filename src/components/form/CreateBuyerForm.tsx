// src/components/form/CreateBuyerForm.tsx
"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import Select from "react-select";
import { createBuyer } from "../../../src/hooks/createBuyer";
import { X } from "lucide-react";

export interface CreateBuyerFormProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * Called when buyer creation succeeds.
   * onCreated(phone, user?)
   */
  onCreated?: (phone: string, user?: any) => void;
}

type PriceEntry = { cropName: string; cropVariety: string; price: number };

const CreateBuyerForm: React.FC<CreateBuyerFormProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    village: "",
    mobileNumber: "",
    taluk: "",
    district: "",
    state: "",
    language: "en",
    identity: "BUYER",
    fcmToken: `dummy-fcm-token-${Math.random().toString(36).substr(2, 9)}`,
    deviceId: `dummy-device-id-${Math.random().toString(36).substr(2, 9)}`,
    cropNames: [] as string[],
  });
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [talukas, setTalukas] = useState<string[]>([]);
  const [villages, setVillages] = useState<string[]>([]);
  const [loading, setLoading] = useState({
    states: false,
    districts: false,
    talukas: false,
    villages: false,
  });
  const [prices, setPrices] = useState<PriceEntry[]>([]);

  const crops = [
    { name: "Tender Coconut", variety: "Naati" },
    { name: "Dry Coconut", variety: "Naati" },
    { name: "Banana", variety: "Nendra" },
    { name: "Turmeric", variety: "Erode" },
    { name: "Maize", variety: "Yellow" },
    { name: "Sunflower", variety: "Sunflower" },
  ];

  const API_BASE_URL =
    (process.env.NEXT_PUBLIC_API_URL as string) || "http://localhost:3000";

  // Fetch states on mount
  useEffect(() => {
    const fetchStates = async () => {
      setLoading((prev) => ({ ...prev, states: true }));
      try {
        const response = await axios.get(`${API_BASE_URL}/newlocations/states`);
        setStates(Array.isArray(response.data.data) ? response.data.data : []);
      } catch (error) {
        console.error("Error fetching states:", error);
        setStates([]);
      } finally {
        setLoading((prev) => ({ ...prev, states: false }));
      }
    };
    fetchStates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // body scroll lock while modal open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // handle ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const state = e.target.value;
    setFormData((prev) => ({
      ...prev,
      state,
      district: "",
      taluk: "",
      village: "",
    }));
    setDistricts([]);
    setTalukas([]);
    setVillages([]);

    if (!state) return;

    setLoading((prev) => ({ ...prev, districts: true }));
    try {
      const response = await axios.get(`${API_BASE_URL}/newlocations/districts`, {
        params: { state },
      });
      setDistricts(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error("Error fetching districts:", error);
      setDistricts([]);
    } finally {
      setLoading((prev) => ({ ...prev, districts: false }));
    }
  };

  const handleDistrictChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const district = e.target.value;
    setFormData((prev) => ({ ...prev, district, taluk: "", village: "" }));
    setTalukas([]);
    setVillages([]);

    if (!district) return;

    setLoading((prev) => ({ ...prev, talukas: true }));
    try {
      const response = await axios.get(`${API_BASE_URL}/newlocations/taluks`, {
        params: { state: formData.state, district },
      });
      setTalukas(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error("Error fetching talukas:", error);
      setTalukas([]);
    } finally {
      setLoading((prev) => ({ ...prev, talukas: false }));
    }
  };

  const handleTalukaChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const taluk = e.target.value;
    setFormData((prev) => ({ ...prev, taluk, village: "" }));
    setVillages([]);

    if (!taluk) return;

    setLoading((prev) => ({ ...prev, villages: true }));
    try {
      const response = await axios.get(`${API_BASE_URL}/newlocations/villages`, {
        params: {
          state: formData.state,
          district: formData.district,
          taluk,
        },
      });
      setVillages(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error("Error fetching villages:", error);
      setVillages([]);
    } finally {
      setLoading((prev) => ({ ...prev, villages: false }));
    }
  };

  const handleVillageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const village = e.target.value;
    setFormData((prev) => ({ ...prev, village }));
  };

  const handleCropChange = (selected: any) => {
    const selectedCropNames = selected ? selected.map((opt: any) => opt.value) : [];
    const newPrices = selectedCropNames.map((cropName: string) => {
      const existingPrice = prices.find((p) => p.cropName === cropName);
      const crop = crops.find((c) => c.name === cropName);
      return {
        cropName,
        cropVariety: existingPrice?.cropVariety || crop?.variety || "default",
        price: existingPrice?.price || 0,
      };
    });
    setFormData((prev) => ({ ...prev, cropNames: selectedCropNames }));
    setPrices(newPrices);
  };

  const handlePriceChange = (cropName: string, price: string) => {
    const parsedPrice = parseFloat(price) || 0;
    setPrices((prev) => prev.map((p) => (p.cropName === cropName ? { ...p, price: parsedPrice } : p)));
  };

  // safe stringify helper for unknown response bodies
  const safeStringify = (v: unknown) => {
    try {
      if (typeof v === "string") return v;
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name) {
      alert("Please enter a name.");
      return;
    }
    if (!formData.mobileNumber) {
      alert("Please enter a mobile number.");
      return;
    }
    if (!formData.state) {
      alert("Please select a state.");
      return;
    }
    if (!formData.district) {
      alert("Please select a district.");
      return;
    }
    if (!formData.taluk) {
      alert("Please select a taluk.");
      return;
    }
    if (!formData.village) {
      alert("Please select a village.");
      return;
    }
    if (formData.cropNames.length === 0) {
      alert("Please select at least one crop.");
      return;
    }
    if (prices.some((p) => p.price <= 0)) {
      alert("Please enter a valid price for all selected crops.");
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        ...formData,
        prices, // Include prices array
      };
      console.log("Submitting formData:", submitData);

      const result = await createBuyer(submitData);
      const asAny = result as any;

      if (asAny?.status === 200 || asAny?.status === "success" || asAny?.user) {
        // Prefer the user object returned by API if present
        const createdUser = asAny?.user ?? asAny?.data ?? null;

        // Call parent's callback so it can open aggregator modal and prefill
        try {
          onCreated?.(formData.mobileNumber, createdUser ?? undefined);
        } catch (err) {
          console.warn("onCreated callback threw:", err);
        }

        onClose();
        // reset the form
        setFormData({
          name: "",
          village: "",
          mobileNumber: "",
          taluk: "",
          district: "",
          state: "",
          language: "en",
          identity: "BUYER",
          fcmToken: `dummy-fcm-token-${Math.random().toString(36).substr(2, 9)}`,
          deviceId: `dummy-device-id-${Math.random().toString(36).substr(2, 9)}`,
          cropNames: [],
        });
        setPrices([]);
      } else {
        const errMsg =
          (asAny && (asAny.message || asAny.error || asAny.detail)) ||
          safeStringify(asAny) ||
          "Unknown error";
        alert(`Failed to create buyer: ${errMsg}`);
      }
    } catch (error: any) {
      console.error("Error creating buyer:", error);
      const message = error?.message ?? safeStringify(error) ?? "Unknown error";
      alert(`Failed to create buyer: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If the modal is closed, render nothing
  if (!isOpen) return null;

  const modal = (
    <div
      className="fixed inset-0 flex items-center justify-center z-[10000]"
      aria-modal="true"
      role="dialog"
    >
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => onClose()}
      />

      {/* panel */}
      <div
        className="relative bg-white p-6 rounded-lg shadow-lg w-full max-w-md z-[10001]"
        onClick={(e) => e.stopPropagation()} // prevent overlay click from closing when clicking inside
      >
        <button
          onClick={() => onClose()}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-sm"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h1 className="text-lg font-bold text-green-700 mb-4">Buyer Registration</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
            <input
              name="mobileNumber"
              type="text"
              value={formData.mobileNumber}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">State</label>
            <select
              name="state"
              value={formData.state}
              onChange={handleStateChange}
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
              required
            >
              <option value="">Select State</option>
              {loading.states ? (
                <option value="" disabled>
                  Loading states...
                </option>
              ) : states.length > 0 ? (
                states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No states available
                </option>
              )}
            </select>
            {!formData.state && <p className="text-red-500 text-xs mt-1">State is required.</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">District</label>
            <select
              name="district"
              value={formData.district}
              onChange={handleDistrictChange}
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
              required
              disabled={!formData.state}
            >
              <option value="">Select District</option>
              {loading.districts ? (
                <option value="" disabled>
                  Loading districts...
                </option>
              ) : districts.length > 0 ? (
                districts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No districts available
                </option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Taluk</label>
            <select
              name="taluk"
              value={formData.taluk}
              onChange={handleTalukaChange}
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
              required
              disabled={!formData.district}
            >
              <option value="">Select Taluk</option>
              {loading.talukas ? (
                <option value="" disabled>
                  Loading taluks...
                </option>
              ) : talukas.length > 0 ? (
                talukas.map((taluka) => (
                  <option key={taluka} value={taluka}>
                    {taluka}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No taluks available
                </option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Village</label>
            <select
              name="village"
              value={formData.village}
              onChange={handleVillageChange}
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
              required
              disabled={!formData.taluk}
            >
              <option value="">Select Village</option>
              {loading.villages ? (
                <option value="" disabled>
                  Loading villages...
                </option>
              ) : villages.length > 0 ? (
                villages.map((village) => (
                  <option key={village} value={village}>
                    {village}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No villages available
                </option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Crop Interest</label>
            <Select
              isMulti
              options={crops.map((crop) => ({ value: crop.name, label: crop.name }))}
              value={formData.cropNames.map((name: string) => ({ value: name, label: name }))}
              onChange={handleCropChange}
              placeholder="Select crops..."
              className="mt-1 text-sm"
              classNamePrefix="react-select"
            />

            {formData.cropNames.length > 0 && (
              <div className="mt-2 space-y-2">
                {formData.cropNames.map((cropName: string) => {
                  const crop = prices.find((p) => p.cropName === cropName);
                  return (
                    <div key={cropName} className="flex items-center gap-2">
                      <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        {cropName} ({crop?.cropVariety || "default"})
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              cropNames: prev.cropNames.filter((c) => c !== cropName),
                            }));
                            setPrices((prev) => prev.filter((p) => p.cropName !== cropName));
                          }}
                          className="hover:text-red-500"
                          aria-label={`Remove ${cropName}`}
                        >
                          <X size={12} />
                        </button>
                      </div>
                      <input
                        type="number"
                        placeholder="Price"
                        value={crop?.price || ""}
                        onChange={(e) => handlePriceChange(cropName, e.target.value)}
                        className="w-24 px-2 py-1 border rounded-md text-sm"
                        required
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm ${
              isSubmitting
                ? "bg-green-600 opacity-50 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default CreateBuyerForm;
