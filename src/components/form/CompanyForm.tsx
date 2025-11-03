// "use client";
import axios from "axios";
import React, { useState, useCallback, useEffect } from "react";
import {
  Building2,
  Upload,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Globe,
  Sprout,
} from "lucide-react";

interface Company {
  id: string;
  name: string;
  village: string;
  taluk: string;
  district: string;
  state: string;
  company_logo: string | null;
  company_address: string | null;
  cropNames?: string[];
  coordinates?: { type: string; coordinates: [number, number] };
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CompanyFormProps {
  company?: Company | null;
  onSuccess?: () => void;
}

const CROPS = [
  "Maize",
  "Tender Coconut",
  "Dry Coconut",
  "Sunflower",
  "Turmeric",
  "Groundnut",
] as const;

// Cloudinary Constants
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

const InputField = React.memo(
  ({
    label,
    name,
    value,
    onChange,
    type = "text",
    required = false,
    error: fieldError,
    placeholder,
    icon: Icon,
    disabled,
    options,
    isSelect = false,
  }: {
    label: string;
    name: string;
    value: any;
    onChange: any;
    type?: string;
    required?: boolean;
    error?: string;
    placeholder?: string;
    icon?: React.ComponentType<{ className?: string }>;
    disabled?: boolean;
    options?: { value: string; label: string }[];
    isSelect?: boolean;
  }) => {
    const iconPadding = Icon ? "pl-12" : "pl-4";
    const baseClasses = `${iconPadding} pr-4 py-3 bg-white border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 placeholder-gray-400 w-full`;

    return (
      <div className="space-y-2" key={name}>
        <label
          className={`flex items-center space-x-2 text-sm font-semibold ${
            required ? "text-purple-700" : "text-gray-700"
          }`}
        >
          {required && <span className="text-red-500">*</span>}
          {Icon && <Icon className="w-4 h-4" />}
          <span className="truncate">{label}</span>
        </label>
        <div className={`relative ${fieldError ? "animate-shake" : ""}`}>
          {Icon && (
            <Icon
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                fieldError ? "text-red-500" : "text-gray-400"
              }`}
            />
          )}
          {isSelect ? (
            <select
              name={name}
              value={value}
              onChange={onChange}
              disabled={disabled}
              className={`${
                fieldError
                  ? "border-red-300 bg-red-50"
                  : disabled
                  ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                  : "border-gray-200 hover:border-gray-300"
              } pr-10 ${baseClasses}`}
            >
              <option value="" disabled className="text-gray-500">
                Select {label}
              </option>
              {options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={type}
              name={name}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              disabled={disabled}
              className={`${
                fieldError
                  ? "border-red-300 bg-red-50"
                  : disabled
                  ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                  : "border-gray-200 hover:border-gray-300"
              } ${baseClasses}`}
            />
          )}
        </div>
        {fieldError && (
          <p className="flex items-center space-x-1 text-sm text-red-600 mt-1">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{fieldError}</span>
          </p>
        )}
      </div>
    );
  }
);

const FileUpload = React.memo(
  ({
    label,
    onChange,
    preview,
    uploading = false,
  }: {
    label: string;
    onChange: any;
    preview?: string;
    uploading?: boolean;
  }) => (
    <div className="space-y-3">
      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
        <Upload className="w-4 h-4 text-gray-500" />
        <span>{label}</span>
      </label>
      <div className="relative">
        <input
          type="file"
          accept="image/*"
          onChange={onChange}
          disabled={uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div
          className={`w-full p-6 border-2 border-dashed rounded-xl transition-all duration-300 cursor-pointer hover:shadow-md ${
            preview
              ? "border-purple-300 bg-purple-50"
              : "border-gray-300 hover:border-gray-400 bg-white"
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center justify-center space-y-3 text-gray-500">
              <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
              <p className="text-sm font-medium">Uploading…</p>
            </div>
          ) : preview ? (
            <div className="flex flex-col items-center space-y-3 text-center">
              <div className="relative">
                <img
                  src={preview}
                  alt="Logo Preview"
                  className="w-20 h-20 object-cover rounded-xl shadow-md"
                />
                <div className="absolute -top-1 -right-1 bg-purple-500 text-white rounded-full p-1.5 shadow-lg">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Logo uploaded
                </p>
                <p className="text-xs text-purple-600">Click to change image</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-3 text-gray-500">
              <Upload className="w-10 h-10 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Click to upload logo
                </p>
                <p className="text-xs">PNG, JPG (Max 2MB)</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
);

const CompanyForm: React.FC<CompanyFormProps> = ({ company, onSuccess }) => {
  const isEditMode = !!company;
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [talukas, setTalukas] = useState<string[]>([]);
  const [villages, setVillages] = useState<string[]>([]);
  const [loading, setLoading] = useState({
    states: false,
    districts: false,
    talukas: false,
    villages: false,
    coordinates: false,
  });
  const [formData, setFormData] = useState({
    companyName: "",
    state: "",
    village: "",
    taluk: "",
    district: "",
    coordinates: { lat: "", lon: "" },
    company_logo: "",
    notes: "",
  });
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [uploadingLogo, setUploadingLogo] = useState(false); // New state

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const [error, setError] = useState<{
    field?: string;
    message: string;
  } | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form with existing company data when in edit mode
  useEffect(() => {
    if (isEditMode && company) {
      const [lon, lat] = company.coordinates?.coordinates || [0, 0];
      setFormData({
        companyName: company.name || "",
        state: company.state || "",
        village: company.village || "",
        taluk: company.taluk || "",
        district: company.district || "",
        coordinates: {
          lat: lat.toString(),
          lon: lon.toString(),
        },
        company_logo: company.company_logo || "",
        notes: company.notes || "",
      });
      setSelectedCrops(company.cropNames || []);
    }
  }, [isEditMode, company]);

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
        setError({ message: "Failed to fetch states" });
      } finally {
        setLoading((prev) => ({ ...prev, states: false }));
      }
    };
    fetchStates();
  }, [API_BASE_URL]);

  // Fetch districts when state changes
  useEffect(() => {
    if (!formData.state) {
      setDistricts([]);
      setTalukas([]);
      setVillages([]);
      return;
    }
    const fetchDistricts = async () => {
      setLoading((prev) => ({ ...prev, districts: true }));
      try {
        const response = await axios.get(
          `${API_BASE_URL}/newlocations/districts`,
          {
            params: { state: formData.state },
          }
        );
        setDistricts(
          Array.isArray(response.data.data) ? response.data.data : []
        );
      } catch (error) {
        console.error("Error fetching districts:", error);
        setDistricts([]);
        setError({ message: "Failed to fetch districts" });
      } finally {
        setLoading((prev) => ({ ...prev, districts: false }));
      }
    };
    fetchDistricts();
  }, [formData.state, API_BASE_URL]);

  // Fetch talukas when district changes
  useEffect(() => {
    if (!formData.district) {
      setTalukas([]);
      setVillages([]);
      return;
    }
    const fetchTalukas = async () => {
      setLoading((prev) => ({ ...prev, talukas: true }));
      try {
        const response = await axios.get(
          `${API_BASE_URL}/newlocations/taluks`,
          {
            params: { state: formData.state, district: formData.district },
          }
        );
        setTalukas(Array.isArray(response.data.data) ? response.data.data : []);
      } catch (error) {
        console.error("Error fetching talukas:", error);
        setTalukas([]);
        setError({ message: "Failed to fetch talukas" });
      } finally {
        setLoading((prev) => ({ ...prev, talukas: false }));
      }
    };
    fetchTalukas();
  }, [formData.state, formData.district, API_BASE_URL]);

  // Fetch villages when taluk changes
  useEffect(() => {
    if (!formData.taluk) {
      setVillages([]);
      return;
    }
    const fetchVillages = async () => {
      setLoading((prev) => ({ ...prev, villages: true }));
      try {
        const response = await axios.get(
          `${API_BASE_URL}/newlocations/villages`,
          {
            params: {
              state: formData.state,
              district: formData.district,
              taluk: formData.taluk,
            },
          }
        );
        setVillages(
          Array.isArray(response.data.data) ? response.data.data : []
        );
      } catch (error) {
        console.error("Error fetching villages:", error);
        setVillages([]);
        setError({ message: "Failed to fetch villages" });
      } finally {
        setLoading((prev) => ({ ...prev, villages: false }));
      }
    };
    fetchVillages();
  }, [formData.state, formData.district, formData.taluk, API_BASE_URL]);

  // Fetch coordinates when district, taluk, and village are selected
  useEffect(() => {
    const { district, taluk, village } = formData;
    if (!district || !taluk || !village) {
      setFormData((prev) => ({
        ...prev,
        coordinates: { lat: "", lon: "" },
      }));
      return;
    }
    const fetchCoordinates = async () => {
      setLoading((prev) => ({ ...prev, coordinates: true }));
      try {
        const address = `${district},${taluk},${village}`;
        const response = await axios.get(
          `${API_BASE_URL}/newlocations/coordinates`,
          {
            params: { address },
          }
        );
        const coords = response?.data?.data;
        if (
          coords &&
          typeof coords.latitude !== "undefined" &&
          typeof coords.longitude !== "undefined"
        ) {
          setFormData((prev) => ({
            ...prev,
            coordinates: {
              lat: String(coords.latitude),
              lon: String(coords.longitude),
            },
          }));
        } else {
          console.warn("Coordinates response missing data:", response.data);
          setFormData((prev) => ({
            ...prev,
            coordinates: { lat: "", lon: "" },
          }));
          setError({ message: "Failed to fetch valid coordinates" });
        }
      } catch (err) {
        console.error("Error fetching coordinates:", err);
        setFormData((prev) => ({
          ...prev,
          coordinates: { lat: "", lon: "" },
        }));
        setError({ message: "Failed to fetch coordinates" });
      } finally {
        setLoading((prev) => ({ ...prev, coordinates: false }));
      }
    };
    fetchCoordinates();
  }, [formData.district, formData.taluk, formData.village, API_BASE_URL]);

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      const { name, value } = e.target;
      if (name.includes("coordinates.")) {
        const key = name.split(".")[1];
        setFormData((prev) => ({
          ...prev,
          coordinates: { ...prev.coordinates, [key]: value },
        }));
      } else {
        setFormData((prev) => {
          const newFormData = { ...prev, [name]: value };
          // Reset dependent fields when parent field changes
          if (name === "state") {
            return {
              ...newFormData,
              district: "",
              taluk: "",
              village: "",
              coordinates: { lat: "", lon: "" },
            };
          } else if (name === "district") {
            return {
              ...newFormData,
              taluk: "",
              village: "",
              coordinates: { lat: "", lon: "" },
            };
          } else if (name === "taluk") {
            return {
              ...newFormData,
              village: "",
              coordinates: { lat: "", lon: "" },
            };
          }
          return newFormData;
        });
      }
      if (error?.field === name) {
        setError(null);
      }
    },
    [error?.field]
  );

  // Updated handleFileChange with Cloudinary upload
  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Instant preview
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({
          ...prev,
          company_logo: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary
      setUploadingLogo(true);
      try {
        const formDataCloud = new FormData();
        formDataCloud.append("file", file);
        formDataCloud.append("upload_preset", UPLOAD_PRESET);
        formDataCloud.append("folder", "company_logos");

        const res = await axios.post(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
          formDataCloud
        );

        setFormData((prev) => ({
          ...prev,
          company_logo: res.data.secure_url,
        }));
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
        alert("Logo upload failed. Please try again.");
        setFormData((prev) => ({ ...prev, company_logo: "" }));
      } finally {
        setUploadingLogo(false);
      }
    },
    [UPLOAD_PRESET, CLOUD_NAME]
  );

  const toggleCrop = (crop: string) => {
    setSelectedCrops((prev) =>
      prev.includes(crop) ? prev.filter((c) => c !== crop) : [...prev, crop]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    // Validate mandatory fields
    const requiredFields = [
      { field: "companyName", label: "Company Name" },
      { field: "state", label: "State" },
      { field: "village", label: "Village" },
      { field: "taluk", label: "Taluk" },
      { field: "district", label: "District" },
      { field: "coordinates.lat", label: "Latitude" },
      { field: "coordinates.lon", label: "Longitude" },
    ];

    for (const { field, label } of requiredFields) {
      const value = field.includes("coordinates.")
        ? formData.coordinates[
            field.split(".")[1] as keyof typeof formData.coordinates
          ]
        : formData[field as keyof typeof formData];

      if (!value || (typeof value === "string" && value.trim() === "")) {
        setError({ field, message: `${label} is required` });
        setIsSubmitting(false);
        return;
      }
    }

    const payload = {
      name: formData.companyName,
      state: formData.state,
      village: formData.village,
      taluk: formData.taluk,
      district: formData.district,
      coordinates: {
        type: "Point",
        coordinates: [
          parseFloat(formData.coordinates.lon),
          parseFloat(formData.coordinates.lat),
        ],
      },
      company_logo: formData.company_logo || null,
      company_address: null,
      cropNames: selectedCrops,
      notes: formData.notes || null,
    };

    try {
      let response;

      if (isEditMode && company?.id) {
        response = await fetch(`${API_BASE_URL}/po-companies/${company.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Company updated successfully:", result);
        setSuccess(true);

        setTimeout(() => {
          onSuccess?.();
        }, 1500);
      } else {
        response = await fetch(`${API_BASE_URL}/po-companies`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Company created successfully:", result);
        setSuccess(true);

        setFormData({
          companyName: "",
          state: "",
          village: "",
          taluk: "",
          district: "",
          coordinates: { lat: "", lon: "" },
          company_logo: "",
          notes: "",
        });
        setSelectedCrops([]);

        setTimeout(() => {
          onSuccess?.();
        }, 1500);
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      setError({
        message: isEditMode
          ? "Failed to update company. Please try again."
          : "Failed to create company. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-0">
      {/* Header */}
      <div
        className={`${
          isEditMode
            ? "bg-gradient-to-r from-blue-600 to-indigo-700"
            : "bg-gradient-to-r from-purple-600 to-purple-700"
        } text-white p-6 rounded-t-2xl shadow-lg`}
      >
        <div className="flex items-center justify-center space-x-3 mb-2">
          <Building2 className="w-6 h-6" />
          <h2 className="text-2xl font-bold">
            {isEditMode ? "Edit Company" : "Onboard Company"}
          </h2>
        </div>
        <p className="text-center text-sm opacity-90 text-purple-100">
          {isEditMode
            ? "Update company information"
            : "Register a new company with location and crop details"}
        </p>
      </div>

      <div className="bg-white rounded-b-2xl shadow-xl border border-gray-200 overflow-hidden">
        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-8 max-h-[70vh] overflow-y-auto"
        >
          {/* Global Messages */}
          {error && !error.field && (
            <div className="relative bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 text-sm leading-relaxed flex-1">
                  {error.message}
                </p>
              </div>
            </div>
          )}

          {success && (
            <div className="relative bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4 animate-bounce">
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-purple-800 font-semibold text-sm">
                    Success!
                  </p>
                  <p className="text-purple-700 text-sm leading-relaxed">
                    {isEditMode
                      ? "Company updated successfully."
                      : "Company onboarded successfully."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Company Information Section */}
          <div className="bg-gray-50/50 rounded-xl p-6 border border-purple-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <h3 className="text-lg font-bold text-gray-900">
                Company Information
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <InputField
                label="Company Name"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                placeholder="Enter company name"
                icon={Building2}
                error={
                  error?.field === "companyName" ? error.message : undefined
                }
              />

              <FileUpload
                label="Company Logo (Optional)"
                onChange={handleFileChange}
                preview={formData.company_logo}
                uploading={uploadingLogo}
              />

              <div className="lg:col-span-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-4">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>Location Details</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <InputField
                    label="State"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    isSelect
                    options={[
                      { value: "", label: "Select State" },
                      ...states.map((state) => ({
                        value: state,
                        label: state,
                      })),
                    ]}
                    disabled={loading.states}
                    error={error?.field === "state" ? error.message : undefined}
                  />
                  <InputField
                    label="District"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    required
                    isSelect
                    options={[
                      { value: "", label: "Select District" },
                      ...districts.map((district) => ({
                        value: district,
                        label: district,
                      })),
                    ]}
                    disabled={!formData.state || loading.districts}
                    error={
                      error?.field === "district" ? error.message : undefined
                    }
                  />
                  <InputField
                    label="Taluk"
                    name="taluk"
                    value={formData.taluk}
                    onChange={handleChange}
                    required
                    isSelect
                    options={[
                      { value: "", label: "Select Taluk" },
                      ...talukas.map((taluka) => ({
                        value: taluka,
                        label: taluka,
                      })),
                    ]}
                    disabled={!formData.district || loading.talukas}
                    error={error?.field === "taluk" ? error.message : undefined}
                  />
                  <InputField
                    label="Village"
                    name="village"
                    value={formData.village}
                    onChange={handleChange}
                    required
                    isSelect
                    options={[
                      { value: "", label: "Select Village" },
                      ...villages.map((village) => ({
                        value: village,
                        label: village,
                      })),
                    ]}
                    disabled={!formData.taluk || loading.villages}
                    error={
                      error?.field === "village" ? error.message : undefined
                    }
                  />
                </div>
              </div>

              <div className="lg:col-span-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-4">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>Geographic Coordinates</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Latitude"
                    name="coordinates.lat"
                    value={formData.coordinates.lat}
                    onChange={handleChange}
                    type="text"
                    required
                    disabled
                    placeholder="Auto-filled"
                    error={
                      error?.field === "coordinates.lat"
                        ? error.message
                        : undefined
                    }
                  />
                  <InputField
                    label="Longitude"
                    name="coordinates.lon"
                    value={formData.coordinates.lon}
                    onChange={handleChange}
                    type="text"
                    required
                    disabled
                    placeholder="Auto-filled"
                    error={
                      error?.field === "coordinates.lon"
                        ? error.message
                        : undefined
                    }
                  />
                </div>
                <div className="mt-2">
                  {loading.coordinates ? (
                    <p className="text-sm text-gray-500">
                      Fetching coordinates...
                    </p>
                  ) : formData.coordinates.lat && formData.coordinates.lon ? (
                    <p className="text-sm text-gray-500">
                      Coordinates auto-filled from address.
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Coordinates will be filled automatically after selecting
                      State, District, Taluk, and Village.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Crops Section */}
          <div className="bg-gray-50/50 rounded-xl p-6 border border-purple-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <h3 className="text-lg font-bold text-gray-900">
                Crops (Optional)
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {CROPS.map((crop) => {
                const active = selectedCrops.includes(crop);
                return (
                  <button
                    key={crop}
                    type="button"
                    onClick={() => toggleCrop(crop)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all ${
                      active
                        ? "bg-purple-600 text-white border-purple-700 shadow-md"
                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Sprout className="w-4 h-4" />
                    {crop}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-gray-50/50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <h3 className="text-lg font-bold text-gray-900">
                Notes (Optional)
              </h3>
            </div>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Any additional information about the company..."
              className="w-full p-3 bg-white border-2 rounded-xl resize-vertical transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 border-gray-200 hover:border-gray-300 placeholder-gray-400"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || uploadingLogo}
              className={`w-full flex items-center justify-center space-x-3 py-4 px-8 rounded-xl font-semibold text-lg transition-all duration-300 transform ${
                isSubmitting || uploadingLogo
                  ? "bg-gray-400 cursor-not-allowed opacity-70"
                  : "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-purple-500/25 hover:-translate-y-0.5 active:scale-95"
              }`}
            >
              {isSubmitting || uploadingLogo ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{isEditMode ? "Updating..." : "Creating..."}</span>
                </>
              ) : (
                <>
                  <Building2 className="w-5 h-5" />
                  <span>
                    {isEditMode ? "Update Company" : "Create Company"}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyForm;
