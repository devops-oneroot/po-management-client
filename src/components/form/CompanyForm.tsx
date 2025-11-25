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
  Sprout,
  Phone,
  User,
  FileText,
  Hash,
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
  gstNumber?: string | null;
  contactPersonName?: string | null;
  contactPersonNumber?: string | null;
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
    const baseClasses = `${iconPadding} pr-4 py-3 bg-white border rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400 w-full text-sm`;

    return (
      <div className="space-y-2" key={name}>
        <label
          className={`flex items-center space-x-2 text-sm font-medium ${
            required ? "text-slate-900" : "text-slate-700"
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
                  ? "border-slate-200 bg-slate-50 cursor-not-allowed"
                  : "border-slate-200 hover:border-slate-300"
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
                  ? "border-slate-200 bg-slate-50 cursor-not-allowed"
                  : "border-slate-200 hover:border-slate-300"
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
      <label className="flex items-center space-x-2 text-sm font-medium text-slate-700">
        <Upload className="w-4 h-4 text-slate-500" />
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
          className={`w-full p-6 border-2 border-dashed rounded-lg transition-all duration-150 cursor-pointer ${
            preview
              ? "border-blue-300 bg-blue-50"
              : "border-slate-300 hover:border-slate-400 bg-white"
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center justify-center space-y-3 text-slate-500">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
              <p className="text-sm font-medium">Uploading…</p>
            </div>
          ) : preview ? (
            <div className="flex flex-col items-center space-y-3 text-center">
              <div className="relative">
                <img
                  src={preview}
                  alt="Logo Preview"
                  className="w-20 h-20 object-cover rounded-lg shadow-sm"
                />
                <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-1.5 shadow-sm">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Logo uploaded
                </p>
                <p className="text-xs text-blue-600">Click to change image</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-3 text-slate-500">
              <Upload className="w-10 h-10 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-700">
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
    gstNumber: "",
    contactPersonName: "",
    contactPersonNumber: "",
    company_address: "",
  });

  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const [error, setError] = useState<{
    field?: string;
    message: string;
  } | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form in edit mode
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
        gstNumber: (company as any).gstNumber || "",
        contactPersonName: (company as any).contactPersonName || "",
        contactPersonNumber: (company as any).contactPersonNumber || "",
        company_address: company.company_address || "",
      });
      setSelectedCrops(company.cropNames || []);
    }
  }, [isEditMode, company]);

  // Fetch states
  useEffect(() => {
    const fetchStates = async () => {
      setLoading((prev) => ({ ...prev, states: true }));
      try {
        const response = await axios.get(`${API_BASE_URL}/newlocations/states`);
        setStates(Array.isArray(response.data.data) ? response.data.data : []);
      } catch (error) {
        console.error("Error fetching states:", error);
        setError({ message: "Failed to fetch states" });
      } finally {
        setLoading((prev) => ({ ...prev, states: false }));
      }
    };
    fetchStates();
  }, [API_BASE_URL]);

  // Fetch districts, talukas, villages, coordinates (unchanged)
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
          { params: { state: formData.state } }
        );
        setDistricts(
          Array.isArray(response.data.data) ? response.data.data : []
        );
      } catch (error) {
        console.error("Error fetching districts:", error);
      } finally {
        setLoading((prev) => ({ ...prev, districts: false }));
      }
    };
    fetchDistricts();
  }, [formData.state, API_BASE_URL]);

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
      } finally {
        setLoading((prev) => ({ ...prev, talukas: false }));
      }
    };
    fetchTalukas();
  }, [formData.state, formData.district, API_BASE_URL]);

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
      } finally {
        setLoading((prev) => ({ ...prev, villages: false }));
      }
    };
    fetchVillages();
  }, [formData.state, formData.district, formData.taluk, API_BASE_URL]);

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
        const address = `${village},${taluk},${district},${formData.state}`;
        const response = await axios.get(
          `${API_BASE_URL}/newlocations/coordinates`,
          { params: { address } }
        );
        const coords = response?.data?.data;
        if (coords?.latitude && coords?.longitude) {
          setFormData((prev) => ({
            ...prev,
            coordinates: {
              lat: String(coords.latitude),
              lon: String(coords.longitude),
            },
          }));
        }
      } catch (err) {
        console.error("Error fetching coordinates:", err);
      } finally {
        setLoading((prev) => ({ ...prev, coordinates: false }));
      }
    };
    fetchCoordinates();
  }, [
    formData.district,
    formData.taluk,
    formData.village,
    formData.state,
    API_BASE_URL,
  ]);

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
          const newData = { ...prev, [name]: value };
          if (["state", "district", "taluk"].includes(name)) {
            return {
              ...newData,
              district: name === "state" ? "" : newData.district,
              taluk: ["state", "district"].includes(name) ? "" : newData.taluk,
              village: ["state", "district", "taluk"].includes(name)
                ? ""
                : newData.village,
              coordinates: { lat: "", lon: "" },
            };
          }
          return newData;
        });
      }
      if (error?.field === name) setError(null);
    },
    [error?.field]
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({
          ...prev,
          company_logo: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);

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
        setFormData((prev) => ({ ...prev, company_logo: res.data.secure_url }));
      } catch (err) {
        console.error("Upload failed:", err);
        alert("Logo upload failed");
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

    const requiredFields = [
      { field: "companyName", label: "Company Name" },
      { field: "state", label: "State" },
      { field: "district", label: "District" },
      { field: "taluk", label: "Taluk" },
      { field: "village", label: "Village" },
      { field: "coordinates.lat", label: "Latitude" },
      { field: "coordinates.lon", label: "Longitude" },
      { field: "gstNumber", label: "GST Number" },
      { field: "contactPersonName", label: "Contact Person Name" },
      { field: "contactPersonNumber", label: "Contact Person Number" },
      { field: "company_address", label: "Company Address" },
    ];

    for (const { field, label } of requiredFields) {
      const value = field.includes("coordinates.")
        ? formData.coordinates[
            field.split(".")[1] as keyof typeof formData.coordinates
          ]
        : (formData as any)[field];

      if (!value || value.toString().trim() === "") {
        setError({ field, message: `${label} is required` });
        setIsSubmitting(false);
        return;
      }
    }

    const payload = {
      name: formData.companyName,
      state: formData.state,
      district: formData.district,
      taluk: formData.taluk,
      village: formData.village,
      coordinates: {
        type: "Point",
        coordinates: [
          parseFloat(formData.coordinates.lon),
          parseFloat(formData.coordinates.lat),
        ],
      },
      company_logo: formData.company_logo || null,
      company_address: formData.company_address || null,
      gstNumber: formData.gstNumber || null,
      contactPersonName: formData.contactPersonName || null,
      contactPersonNumber: formData.contactPersonNumber || null,
      cropNames: selectedCrops.length > 0 ? selectedCrops : null,
      notes: formData.notes || null,
    };

    try {
      let response;
      if (isEditMode && company?.id) {
        response = await fetch(`${API_BASE_URL}/po-companies/${company.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`${API_BASE_URL}/po-companies`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      setSuccess(true);
      if (!isEditMode) {
        setFormData({
          companyName: "",
          state: "",
          village: "",
          taluk: "",
          district: "",
          coordinates: { lat: "", lon: "" },
          company_logo: "",
          notes: "",
          gstNumber: "",
          contactPersonName: "",
          contactPersonNumber: "",
          company_address: "",
        });
        setSelectedCrops([]);
      }
      setTimeout(() => onSuccess?.(), 1500);
    } catch (err) {
      setError({
        message: isEditMode
          ? "Failed to update company"
          : "Failed to create company",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-0">
      <div className="bg-slate-50 p-6 border-b border-slate-200">
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="w-5 h-5 text-slate-600" />
          <h2 className="text-xl font-semibold text-slate-900">
            {isEditMode ? "Edit Company" : "Onboard Company"}
          </h2>
        </div>
        <p className="text-sm text-slate-600">
          {isEditMode ? "Update company details" : "Register a new company"}
        </p>
      </div>

      <div className="bg-white border-slate-200 overflow-hidden">
        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-8 max-h-[70vh] overflow-y-auto"
        >
          {error && !error.field && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-800 text-sm">{error.message}</p>
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-green-900 font-semibold text-sm">Success!</p>
                <p className="text-green-700 text-sm">
                  {isEditMode ? "Company updated" : "Company onboarded"}{" "}
                  successfully.
                </p>
              </div>
            </div>
          )}

          {/* Company Information */}
          <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
              <h3 className="text-base font-semibold text-slate-900">
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

              {/* New Fields */}
              <InputField
                label="GST Number"
                name="gstNumber"
                value={formData.gstNumber}
                onChange={handleChange}
                required
                placeholder="e.g. 27AABCU9603R1ZN"
                icon={Hash}
                error={error?.field === "gstNumber" ? error.message : undefined}
              />

              <InputField
                label="Contact Person Name"
                name="contactPersonName"
                value={formData.contactPersonName}
                onChange={handleChange}
                required
                placeholder="Full name"
                icon={User}
                error={
                  error?.field === "contactPersonName"
                    ? error.message
                    : undefined
                }
              />

              <InputField
                label="Contact Person Phone"
                name="contactPersonNumber"
                value={formData.contactPersonNumber}
                onChange={handleChange}
                type="tel"
                required
                placeholder="9876543210"
                icon={Phone}
                error={
                  error?.field === "contactPersonNumber"
                    ? error.message
                    : undefined
                }
              />

              <div className="lg:col-span-2">
                <InputField
                  label="Company Address (Full)"
                  name="company_address"
                  value={formData.company_address}
                  onChange={handleChange}
                  required
                  placeholder="Complete address with pincode"
                  icon={FileText}
                  error={
                    error?.field === "company_address"
                      ? error.message
                      : undefined
                  }
                />
              </div>
            </div>

            {/* Location & Coordinates */}
            <div className="mt-8">
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
                  options={states.map((s) => ({ value: s, label: s }))}
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
                  options={districts.map((d) => ({ value: d, label: d }))}
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
                  options={talukas.map((t) => ({ value: t, label: t }))}
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
                  options={villages.map((v) => ({ value: v, label: v }))}
                  disabled={!formData.taluk || loading.villages}
                  error={error?.field === "village" ? error.message : undefined}
                />
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Latitude"
                  name="coordinates.lat"
                  value={formData.coordinates.lat}
                  onChange={handleChange}
                  disabled
                  required
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
                  disabled
                  required
                  error={
                    error?.field === "coordinates.lon"
                      ? error.message
                      : undefined
                  }
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {loading.coordinates
                  ? "Fetching coordinates..."
                  : formData.coordinates.lat
                  ? "Coordinates auto-filled"
                  : "Select all location fields to auto-fill coordinates"}
              </p>
            </div>
          </div>

          {/* Crops */}
          <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
              <h3 className="text-base font-semibold text-slate-900">
                Crops (Optional)
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {CROPS.map((crop) => (
                <button
                  key={crop}
                  type="button"
                  onClick={() => toggleCrop(crop)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm border transition-colors ${
                    selectedCrops.includes(crop)
                      ? "bg-blue-500 text-white border-blue-600"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <Sprout className="w-4 h-4" />
                  {crop}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
              <h3 className="text-base font-semibold text-slate-900">
                Notes (Optional)
              </h3>
            </div>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Any additional information..."
              className="w-full p-3 bg-white border rounded-md resize-vertical focus:outline-none focus:ring-2 focus:ring-blue-500 border-slate-200 hover:border-slate-300 placeholder-slate-400 text-sm"
            />
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || uploadingLogo}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-md font-semibold text-sm transition-colors ${
                isSubmitting || uploadingLogo
                  ? "bg-slate-400 cursor-not-allowed text-white"
                  : "bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
              }`}
            >
              {isSubmitting || uploadingLogo ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Building2 className="w-5 h-5" />
                  {isEditMode ? "Update Company" : "Create Company"}
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
