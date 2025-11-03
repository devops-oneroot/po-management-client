"use client";
import axios from "axios";

import React, { useState, useCallback, useEffect } from "react";
import {
  Building2,
  Upload,
  MapPin,
  Package,
  Tag,
  IndianRupee,
  Droplets,
  Calendar,
  FileText,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Edit3,
  Globe,
  Languages,
} from "lucide-react";
import { stat } from "fs";

interface PurchaseOrder {
  id: string;
  companyName: string;
  state: string;

  village: string;
  taluk: string;
  district: string;
  coordinates: {
    type: string;
    coordinates: [number, number];
  };
  company_logo: string;
  cropName: string;
  cropVariety: string | null;
  quality: string | null;
  measure: string;
  unit: string;
  minQuantity: number;
  price_rate: number | null;
  price_measure: string;
  moisturePercent: number | null;
  expiresAt: string;
  specification_en: string;
  specification_kn: string | null;
  specification_te: string | null;
  termsAndConditions_en: string;
  termsAndConditions_kn: string | null;
  termsAndConditions_te: string | null;
  isActive: boolean;

  availablePoExpiry: string | null; // New field
  createdAt: string;
  updatedAt: string;
}

// Language configuration
const LANGUAGES = [
  { value: "en", label: "English", icon: "🇺🇸" },
  { value: "kn", label: "Kannada", icon: "🇮🇳" },
  { value: "te", label: "Telugu", icon: "🇮🇳" },
] as const;

type Language = (typeof LANGUAGES)[number]["value"];

// Move sub-components outside to prevent re-definition on re-render
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
    step,
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
    step?: string;
    disabled?: boolean;
    options?: { value: string; label: string; icon?: string }[];
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
                  {option.icon} {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={type}
              name={name}
              value={value}
              onChange={onChange}
              step={step}
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

const TextAreaField = React.memo(
  ({
    label,
    name,
    value,
    onChange,
    placeholder,
    rows = 4,
    language,
    error: fieldError,
  }: {
    label: string;
    name: string;
    value: string;
    onChange: any;
    placeholder?: string;
    rows?: number;
    language?: Language;
    error?: string;
  }) => (
    <div className="space-y-2" key={name}>
      <label className="flex items-center space-x-2 text-sm font-medium text-slate-700">
        <FileText className="w-4 h-4 text-slate-500" />
        {language && (
          <span className="flex items-center space-x-1">
            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
              {language.toUpperCase()}
            </span>
          </span>
        )}
        <span>{label}</span>
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className={`w-full p-3 bg-white border rounded-md resize-vertical transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          fieldError
            ? "border-red-300 bg-red-50"
            : "border-slate-200 hover:border-slate-300"
        } placeholder-slate-400 min-h-[100px] text-sm`}
      />
      {fieldError && (
        <p className="flex items-center space-x-1 text-sm text-red-600 mt-1">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{fieldError}</span>
        </p>
      )}
    </div>
  )
);

const LanguageSelector = React.memo(
  ({
    selectedLanguage,
    onLanguageChange,
    label,
  }: {
    selectedLanguage: Language;
    onLanguageChange: (language: Language) => void;
    label: string;
  }) => (
    <div className="space-y-2">
      <label className="flex items-center space-x-2 text-sm font-medium text-slate-700">
        <Globe className="w-4 h-4 text-slate-500" />
        <span>{label}</span>
      </label>
      <select
        value={selectedLanguage}
        onChange={(e) => onLanguageChange(e.target.value as Language)}
        className="w-full p-3 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-slate-200 hover:border-slate-300 text-sm transition-colors duration-150"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.value} value={lang.value}>
            {lang.icon} {lang.label}
          </option>
        ))}
      </select>
    </div>
  )
);

const FileUpload = React.memo(
  ({
    label,
    onChange,
    preview,
  }: {
    label: string;
    onChange: any;
    preview?: string;
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
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div
          className={`w-full p-6 border-2 border-dashed rounded-lg transition-all duration-150 cursor-pointer ${
            preview
              ? "border-blue-300 bg-blue-50"
              : "border-slate-300 hover:border-slate-400 bg-white"
          }`}
        >
          {preview ? (
            <div className="flex flex-col items-center space-y-3 text-center">
              <div className="relative">
                <img
                  src={preview}
                  alt="Logo Preview"
                  className="w-20 h-20 object-cover rounded-xl shadow-md"
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const OrderForm = ({
  order,
  isEditMode = false,
  onSuccess,
}: {
  order?: any | null; // accept a looser order shape to interop with other modules
  isEditMode?: boolean;
  onSuccess?: () => void;
}) => {
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [talukas, setTalukas] = useState<string[]>([]);
  const [villages, setVillages] = useState<string[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [loadingCompanies, setLoadingCompanies] = useState(false);
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
    cropName: "",
    cropVariety: "",
    quality: "",
    measure: "",
    unit: "",
    minQuantity: "",
    price_rate: "",
    price_measure: "",
    moisturePercent: "",
    expiresAt: "",
    // Multi-language fields
    specification_en: "",
    specification_kn: "",
    specification_te: "",
    termsAndConditions_en: "",
    termsAndConditions_kn: "",
    termsAndConditions_te: "",
    isActive: true,

    availablePoExpiry: "", // New field
  });

  // Base API URL (stable) — declare before any effects that use it to avoid
  // "Cannot access 'API_BASE_URL' before initialization" runtime errors.

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoadingCompanies(true);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/po-companies`
        );
        // Support multiple API shapes:
        // - response.data is an array (API returns raw array)
        // - response.data.data is an array (API wraps payload)
        const payload = response.data;
        const companyList = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
          ? payload.data
          : [];
        setCompanies(companyList);
        // Debug: log a sample to help diagnose dropdown mapping issues
        // (remove or disable in production)
        console.debug(
          "Fetched companies (normalized):",
          companyList.slice(0, 5)
        );
      } catch (error) {
        console.error("Error fetching companies:", error);
        setError({ message: "Failed to load companies" });
      } finally {
        setLoadingCompanies(false);
      }
    };
    fetchCompanies();
  }, [API_BASE_URL]);

  // Company Options for Dropdown
  // const companyOptions = companies.map((comp: any) => {
  //   // Some APIs return different id or name keys (_id, id) or companyName/company_name/name
  //   const id = String(comp?.id ?? comp?._id ?? comp?.companyId ?? "");
  //   const label =
  //     (comp?.companyName ?? comp?.company_name ?? comp?.name ?? id) ||
  //     "Unknown";
  //   return { value: id, label };
  // });
  const companyOptions = companies.map((comp: any) => {
    const id = String(comp?.id ?? comp?._id ?? comp?.companyId ?? "");
    const name =
      (comp?.companyName ?? comp?.company_name ?? comp?.name ?? id) ||
      "Unknown";

    // Pull the extra fields – fall‑back to empty strings if missing
    const village = comp?.village ?? "";
    const district = comp?.district ?? "";

    // Build a readable label
    const label = `${name.padEnd(25)} | ${village.padEnd(16)} | ${district}`;

    return { value: id, label };
  });

  // Debug: print options to verify what will render in the dropdown
  console.debug("Company dropdown options:", companyOptions.slice(0, 10));

  // Handle Company Selection
  const handleCompanyChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const companyId = e.target.value;
      setSelectedCompanyId(companyId);
      // Match by id or _id coerced to string
      const selected = companies.find(
        (c: any) => String(c?.id ?? c?._id ?? c?.companyId ?? "") === companyId
      );
      if (selected) {
        // Support different coordinate shapes: { coordinates: [lon, lat] } or { lon, lat }
        const coordsArray = selected.coordinates?.coordinates;
        const lon = coordsArray ? coordsArray[0] : selected.coordinates?.lon;
        const lat = coordsArray ? coordsArray[1] : selected.coordinates?.lat;

        setFormData((prev) => ({
          ...prev,
          companyName:
            selected.companyName ??
            selected.name ??
            selected.company_name ??
            "",
          state: selected.state || "",
          district: selected.district || "",
          taluk: selected.taluk || "",
          village: selected.village || "",
          coordinates: {
            lat: lat?.toString?.() || "",
            lon: lon?.toString?.() || "",
          },
          company_logo: selected.company_logo || "",
        }));
      } else {
        // Reset if no company selected
        setFormData((prev) => ({
          ...prev,
          companyName: "",
          state: "",
          district: "",
          taluk: "",
          village: "",
          coordinates: { lat: "", lon: "" },
          company_logo: "",
        }));
      }

      if (error?.field === "companyId") setError(null);
    },
    [companies]
  );

  // Language selection state
  const [selectedSpecificationLanguage, setSelectedSpecificationLanguage] =
    useState<Language>("en");
  const [selectedTermsLanguage, setSelectedTermsLanguage] =
    useState<Language>("en");

  const [error, setError] = useState<{
    field?: string;
    message: string;
  } | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form with existing order data when in edit mode

  useEffect(() => {
    if (isEditMode && order) {
      // Normalize order fields (API may use `name` instead of `companyName`, etc.)
      const coords =
        order?.coordinates?.coordinates || order?.coordinates || [];
      const lon = coords[0] ?? "";
      const lat = coords[1] ?? "";

      const specLang = order?.specification_en
        ? "en"
        : order?.specification_kn
        ? "kn"
        : order?.specification_te
        ? "te"
        : "en";

      const termsLang = order?.termsAndConditions_en
        ? "en"
        : order?.termsAndConditions_kn
        ? "kn"
        : order?.termsAndConditions_te
        ? "te"
        : "en";

      setFormData({
        companyName: order?.companyName ?? order?.name ?? "",
        state: order?.state || "",
        village: order?.village || "",
        taluk: order?.taluk || "",
        district: order?.district || "",
        coordinates: {
          lat: lat?.toString() || "",
          lon: lon?.toString() || "",
        },
        company_logo: order?.company_logo || "",
        cropName: order?.cropName || "",
        cropVariety: order?.cropVariety || "",
        quality: order?.quality || "",
        measure: order?.measure || "",
        unit: order?.unit?.toString() || "",
        minQuantity: order?.minQuantity?.toString() || "",
        price_rate: order?.price_rate?.toString() || "",
        price_measure: order?.price_measure || "",
        moisturePercent: order?.moisturePercent?.toString() || "",
        expiresAt: order?.expiresAt
          ? new Date(order.expiresAt).toISOString().split("T")[0]
          : "",
        specification_en: order?.specification_en || "",
        specification_kn: order?.specification_kn || "",
        specification_te: order?.specification_te || "",
        termsAndConditions_en: order?.termsAndConditions_en || "",
        termsAndConditions_kn: order?.termsAndConditions_kn || "",
        termsAndConditions_te: order?.termsAndConditions_te || "",
        isActive: order?.isActive ?? true,

        availablePoExpiry: order?.availablePoExpiry
          ? new Date(order.availablePoExpiry).toISOString().split("T")[0]
          : "",
      });

      setSelectedSpecificationLanguage(specLang as Language);
      setSelectedTermsLanguage(termsLang as Language);
    } else {
      setFormData({
        companyName: "",
        state: "",
        village: "",
        taluk: "",
        district: "",
        coordinates: { lat: "", lon: "" },
        company_logo: "",
        cropName: "",
        cropVariety: "",
        quality: "",
        measure: "",
        unit: "",
        minQuantity: "",
        price_rate: "",
        price_measure: "",
        moisturePercent: "",
        expiresAt: "",
        specification_en: "",
        specification_kn: "",
        specification_te: "",
        termsAndConditions_en: "",
        termsAndConditions_kn: "",
        termsAndConditions_te: "",
        isActive: true,

        availablePoExpiry: "",
      });
      setSelectedSpecificationLanguage("en");
      setSelectedTermsLanguage("en");
    }
  }, [isEditMode, order]);

  // Auto-select company in edit mode
  useEffect(() => {
    if (isEditMode && order && companies.length > 0) {
      // Try to match company by id (order.id / order.companyId) or by name
      const orderCompanyId = String(order?.companyId ?? order?.id ?? "");
      const orderCompanyName = order?.companyName ?? order?.name ?? "";

      const matchedCompany = companies.find((c: any) => {
        const cid = String(c?.id ?? c?._id ?? c?.companyId ?? "");
        if (orderCompanyId && cid && orderCompanyId === cid) return true;
        const cname = c?.companyName ?? c?.name ?? c?.company_name ?? "";
        return cname && orderCompanyName && cname === orderCompanyName;
      });

      if (matchedCompany) {
        const cid = String(
          matchedCompany?.id ??
            matchedCompany?._id ??
            matchedCompany?.companyId ??
            ""
        );
        setSelectedCompanyId(cid);
        // Optional: Re-fill formData to ensure sync (use normalized fields)
        const [lon, lat] = matchedCompany.coordinates?.coordinates || [0, 0];
        setFormData((prev) => ({
          ...prev,
          companyName: matchedCompany.companyName ?? matchedCompany.name ?? "",
          state: matchedCompany.state || "",
          district: matchedCompany.district || "",
          taluk: matchedCompany.taluk || "",
          village: matchedCompany.village || "",
          coordinates: {
            lat: lat?.toString() || "",
            lon: lon?.toString() || "",
          },
          company_logo: matchedCompany.company_logo || "",
        }));
      }
    }
  }, [isEditMode, order, companies]);

  // Memoize handleChange to prevent unnecessary re-renders

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

  const handleLanguageChange = useCallback(
    (fieldType: "specification" | "terms", language: Language) => {
      if (fieldType === "specification") {
        setSelectedSpecificationLanguage(language);
      } else {
        setSelectedTermsLanguage(language);
      }
    },
    []
  );

  const handleCheckboxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, checked } = e.target;
      console.log(`Checkbox ${name} changed to: ${checked}`);
      setFormData((prev) => ({ ...prev, [name]: checked }));
    },
    []
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          setFormData((prev) => ({
            ...prev,
            company_logo: reader.result as string,
          }));
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);
    setDistricts([]);
    setTalukas([]);
    setVillages([]);

    // Validate mandatory fields with specific error messages

    const requiredFields = [
      // Validate companyId only in create mode, optional in edit mode
      ...(!isEditMode ? [{ field: "companyId", label: "Company" }] : []),
      { field: "cropName", label: "Crop Name" },
      { field: "cropVariety", label: "Crop Variety" },
      { field: "measure", label: "Measure" },
      { field: "unit", label: "Total Quantity" },
      { field: "minQuantity", label: "Minimum Quantity" },
      { field: "price_rate", label: "Price Rate" },
      { field: "price_measure", label: "Price Measure" },
      { field: "expiresAt", label: "Expiry Date" },

      // Existing specification and terms validations...
      {
        field: "specification",
        label: "Specifications",
        customValidation: () => {
          return (
            formData.specification_en ||
            formData.specification_kn ||
            formData.specification_te
          );
        },
      },
      {
        field: "termsAndConditions",
        label: "Terms & Conditions",
        customValidation: () => {
          return (
            formData.termsAndConditions_en ||
            formData.termsAndConditions_kn ||
            formData.termsAndConditions_te
          );
        },
      },
    ];

    for (const { field, label, customValidation } of requiredFields) {
      if (customValidation) {
        const hasContent = customValidation();
        if (!hasContent) {
          setError({
            field,
            message: `${label} is required in at least one language`,
          });
          setIsSubmitting(false);
          return;
        }
      } else {
        // Special handling for companyId
        if (field === "companyId") {
          if (!selectedCompanyId) {
            setError({ field, message: `${label} is required` });
            setIsSubmitting(false);
            return;
          }
        } else {
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
      }
    }

    // Base data (always included)
    const baseData = {
      cropName: formData.cropName,
      cropVariety: formData.cropVariety,
      quality: formData.quality,
      measure: formData.measure,
      unit: parseInt(formData.unit),
      minQuantity: parseInt(formData.minQuantity),
      price_rate: parseFloat(formData.price_rate),
      price_measure: formData.price_measure,
      moisturePercent: formData.moisturePercent
        ? parseFloat(formData.moisturePercent)
        : undefined,
      expiresAt: formData.expiresAt,
      specification_en: formData.specification_en,
      specification_kn: formData.specification_kn,
      specification_te: formData.specification_te,
      termsAndConditions_en: formData.termsAndConditions_en,
      termsAndConditions_kn: formData.termsAndConditions_kn,
      termsAndConditions_te: formData.termsAndConditions_te,
      isActive: formData.isActive,
      availablePoExpiry: formData.availablePoExpiry || null,
    };

    // Company data (only included when company is selected)
    const companyData = selectedCompanyId ? {
      companyId: selectedCompanyId,
      companyName: formData.companyName,
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
      company_logo: formData.company_logo,
    } : {};

    // Merge data
    const formattedData = {
      ...companyData,
      ...baseData,
    };

    try {
      let response;

      if (isEditMode && order?.id) {
        // Update existing order using PATCH
        response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/po/${order.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formattedData),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Order updated successfully:", result);
        setSuccess(true);

        // Call onSuccess callback after a short delay
        setTimeout(() => {
          onSuccess?.();
        }, 2000);
      } else {
        // Create new order using POST
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/po`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedData),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Form submitted successfully:", result);
        setSuccess(true);

        // Reset form after success for create mode
        setFormData({
          companyName: "",
          state: "",
          village: "",
          taluk: "",
          district: "",
          coordinates: { lat: "", lon: "" },
          company_logo: "",
          cropName: "",
          cropVariety: "",
          quality: "",
          measure: "",
          unit: "",
          minQuantity: "",
          price_rate: "",
          price_measure: "",
          moisturePercent: "",
          expiresAt: "",
          specification_en: "",
          specification_kn: "",
          specification_te: "",
          termsAndConditions_en: "",
          termsAndConditions_kn: "",
          termsAndConditions_te: "",
          availablePoExpiry: "",

          isActive: true,
        });
        // reset selected company
        setSelectedCompanyId("");
        setSelectedSpecificationLanguage("en");
        setSelectedTermsLanguage("en");

        // Call onSuccess callback after a short delay
        setTimeout(() => {
          onSuccess?.();
        }, 2000);
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      setError({
        message: isEditMode
          ? "Failed to update order. Please try again."
          : "Failed to create order. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Crop and other options remain the same...
  const cropOptions = [
    { value: "Banana", label: "Banana", icon: "🍌" },
    { value: "Maize", label: "Maize", icon: "🌽" },
    { value: "Dry Coconut", label: "Dry Coconut", icon: "🥥" },
    { value: "Tender Coconut", label: "Tender Coconut", icon: "🥥" },
    { value: "Turmeric", label: "Turmeric", icon: "🧡" },
    { value: "Sunflower", label: "Sunflower", icon: "🌻" },
  ];

  const varietyOptions: { [key: string]: { value: string; label: string }[] } =
    {
      Banana: [
        { value: "Nendra", label: "Nendra" },
        { value: "G9", label: "G9" },
        { value: "Yelakki", label: "Yelakki" },
        { value: "Red", label: "Red" },
        { value: "Other", label: "Other" },
      ],
      "Dry Coconut": [
        { value: "Naati", label: "Naati" },
        { value: "Orange", label: "Orange" },
        { value: "COD", label: "COD" },
        { value: "TNT", label: "TNT" },
        { value: "Ganga Bondam", label: "Ganga Bondam" },
        { value: "Malaysian Dwarf", label: "Malaysian Dwarf" },
        { value: "Kalparaksha", label: "Kalparaksha" },
        { value: "Chowghat Orange", label: "Chowghat Orange" },
        { value: "Tiptur Tall", label: "Tiptur Tall" },
        { value: "MOD", label: "MOD" },
        { value: "AGT", label: "AGT" },
        { value: "Other", label: "Other" },
      ],
      "Tender Coconut": [
        { value: "Naati", label: "Naati" },
        { value: "Orange", label: "Orange" },
        { value: "COD", label: "COD" },
        { value: "TNT", label: "TNT" },
        { value: "Ganga Bondam", label: "Ganga Bondam" },
        { value: "Malaysian Dwarf", label: "Malaysian Dwarf" },
        { value: "Kalparaksha", label: "Kalparaksha" },
        { value: "Chowghat Orange", label: "Chowghat Orange" },
        { value: "Tiptur Tall", label: "Tiptur Tall" },
        { value: "MOD", label: "MOD" },
        { value: "AGT", label: "AGT" },
        { value: "Other", label: "Other" },
      ],
      Turmeric: [
        { value: "Erode", label: "Erode" },
        { value: "Sangli", label: "Sangli" },
        { value: "Marathwada", label: "Marathwada" },
        { value: "Vizag", label: "Vizag" },
        { value: "Nizamabad", label: "Nizamabad" },
        { value: "Chamarajanagar", label: "Chamarajanagar" },
        { value: "Salem", label: "Salem" },
        { value: "Other", label: "Other" },
      ],
      Maize: [
        { value: "Yellow Maize", label: "Yellow Maize" },
        { value: "White Maize", label: "White Maize" },
        { value: "Red Maize", label: "Red Maize" },
        { value: "Jawari", label: "Jawari" },
        { value: "Hybrid", label: "Hybrid" },
        { value: "Popcorn", label: "Popcorn" },
        { value: "Other", label: "Other" },
      ],
      Sunflower: [
        { value: "Common", label: "Common" },
        { value: "Giant", label: "Giant" },
        { value: "Dwarf", label: "Dwarf" },
        { value: "Tall", label: "Tall" },
        { value: "Sunray", label: "Sunray" },
        { value: "Sunspot", label: "Sunspot" },
        { value: "Sunburst", label: "Sunburst" },
        { value: "Sunpower", label: "Sunpower" },
        { value: "Other", label: "Other" },
      ],
    };

  const qualityOptions = [
    { value: "A+", label: "A+", icon: "⭐" },
    { value: "A", label: "A", icon: "⭐" },
    { value: "B+", label: "B+", icon: "⭐" },
    { value: "B", label: "B", icon: "⭐" },
    { value: "C+", label: "C+", icon: "⭐" },
    { value: "C", label: "C", icon: "⭐" },
  ];

  const measureOptions = [
    { value: "Kg", label: "Kilogram", icon: "⚖️" },
    { value: "Quintal", label: "Quintal", icon: "⚖️" },
    { value: "Tons", label: "Tons", icon: "⚖️" },
  ];

  const priceMeasureOptions = [
    { value: "Kg", label: "Per Kg", icon: "₹" },
    { value: "Quintal", label: "Per Quintal", icon: "₹" },
    { value: "Tons", label: "Per Ton", icon: "₹" },
  ];

  // Helper to get current specification value based on selected language
  const getCurrentSpecificationValue = () => {
    switch (selectedSpecificationLanguage) {
      case "en":
        return formData.specification_en;
      case "kn":
        return formData.specification_kn || "";
      case "te":
        return formData.specification_te || "";
      default:
        return formData.specification_en;
    }
  };

  // Helper to get current terms value based on selected language
  const getCurrentTermsValue = () => {
    switch (selectedTermsLanguage) {
      case "en":
        return formData.termsAndConditions_en;
      case "kn":
        return formData.termsAndConditions_kn || "";
      case "te":
        return formData.termsAndConditions_te || "";
      default:
        return formData.termsAndConditions_en;
    }
  };

  // Helper to handle specification textarea change
  const handleSpecificationChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const { value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [`specification_${selectedSpecificationLanguage}`]: value,
      }));
    },
    [selectedSpecificationLanguage]
  );

  // Helper to handle terms textarea change
  const handleTermsChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const { value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [`termsAndConditions_${selectedTermsLanguage}`]: value,
      }));
    },
    [selectedTermsLanguage]
  );

  return (
    <div className="w-full max-w-6xl mx-auto p-0">
      {/* Header */}
      <div className="bg-slate-50 p-6 border-b border-slate-200">
        <div className="flex items-center gap-3 mb-2">
          {isEditMode ? (
            <Edit3 className="w-5 h-5 text-slate-600" />
          ) : (
            <Building2 className="w-5 h-5 text-slate-600" />
          )}
          <h2 className="text-xl font-semibold text-slate-900">
            {isEditMode ? "Edit Purchase Order" : "Create Purchase Order"}
          </h2>
        </div>
        <p className="text-sm text-slate-600">
          {isEditMode
            ? `Update the details for ${order?.companyName}`
            : "Fill in the details to create a new agricultural purchase order"}
        </p>
      </div>

      <div className="bg-white border-slate-200 overflow-hidden">
        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-8 max-h-[80vh] overflow-y-auto"
        >
          {/* Global Messages */}
          {error && !error.field && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-800 text-sm flex-1">
                  {error.message}
                </p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-green-900 font-semibold text-sm">
                    Success!
                  </p>
                  <p className="text-green-700 text-sm">
                    {isEditMode
                      ? "Purchase order updated successfully."
                      : "Purchase order created successfully."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Company Selection & Auto-filled Info */}
          <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
              <h3 className="text-base font-semibold text-slate-900">
                Company Information
              </h3>
              {isEditMode && (
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-200">
                  Can reassign company
                </span>
              )}
            </div>

            <InputField
              label="Select Company"
              name="companyId"
              value={selectedCompanyId}
              onChange={handleCompanyChange}
              required
              isSelect
              options={companyOptions}
              disabled={loadingCompanies}
              error={error?.field === "companyId" ? error.message : undefined}
            />

            {/* Auto-filled Fields Grid */}
            {selectedCompanyId && (
              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Company Name"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    disabled
                  />
                  <InputField
                    label="State"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    disabled
                  />
                  <InputField
                    label="District"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    disabled
                  />
                  <InputField
                    label="Taluk"
                    name="taluk"
                    value={formData.taluk}
                    onChange={handleChange}
                    disabled
                  />
                  <InputField
                    label="Village"
                    name="village"
                    value={formData.village}
                    onChange={handleChange}
                    disabled
                  />
                  <InputField
                    label="Latitude"
                    name="coordinates.lat"
                    value={formData.coordinates.lat}
                    onChange={handleChange}
                    disabled
                    placeholder="Auto-filled"
                  />
                  <InputField
                    label="Longitude"
                    name="coordinates.lon"
                    value={formData.coordinates.lon}
                    onChange={handleChange}
                    disabled
                    placeholder="Auto-filled"
                  />
                </div>

                {/* Logo Preview */}
                {formData.company_logo && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Company Logo
                    </label>
                    <img
                      src={formData.company_logo}
                      alt="Company Logo"
                      className="w-24 h-24 object-cover rounded-lg border shadow-sm"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Loading or Empty State */}
            {loadingCompanies && (
              <p className="text-sm text-slate-500 mt-4">Loading companies...</p>
            )}
            {!loadingCompanies && companyOptions.length === 0 && (
              <p className="text-sm text-slate-500 mt-4">
                No companies available.
              </p>
            )}
          </div>

          {/* Crop Information Section */}
          <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
              <h3 className="text-base font-semibold text-slate-900">
                Crop Information
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <InputField
                label="Crop Type"
                name="cropName"
                value={formData.cropName}
                onChange={handleChange}
                required
                isSelect
                options={cropOptions}
                error={error?.field === "cropName" ? error.message : undefined}
              />

              <InputField
                label="Crop Variety"
                name="cropVariety"
                value={formData.cropVariety}
                onChange={handleChange}
                isSelect
                options={varietyOptions[formData.cropName] || []}
                disabled={!formData.cropName}
                error={
                  error?.field === "cropVariety" ? error.message : undefined
                }
              />

              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Measure Unit"
                  name="measure"
                  value={formData.measure}
                  onChange={handleChange}
                  required
                  isSelect
                  options={measureOptions}
                  error={error?.field === "measure" ? error.message : undefined}
                />

                <InputField
                  label="Quality Grade"
                  name="quality"
                  value={formData.quality}
                  onChange={handleChange}
                  isSelect
                  options={qualityOptions}
                />
              </div>
            </div>
          </div>

          {/* Pricing and Quantity Section */}
          <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
              <h3 className="text-base font-semibold text-slate-900">
                Pricing & Quantity
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <InputField
                label="Minimum Quantity"
                name="minQuantity"
                value={formData.minQuantity}
                onChange={handleChange}
                type="number"
                required
                placeholder="0"
                icon={Package}
                error={
                  error?.field === "minQuantity" ? error.message : undefined
                }
              />

              <InputField
                label="Total Quantity"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                type="number"
                required
                placeholder="0"
                icon={Package}
                error={error?.field === "unit" ? error.message : undefined}
              />

              <InputField
                label="Price Rate"
                name="price_rate"
                value={formData.price_rate}
                onChange={handleChange}
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                icon={IndianRupee}
                error={
                  error?.field === "price_rate" ? error.message : undefined
                }
              />

              <InputField
                label="Price Measure"
                name="price_measure"
                value={formData.price_measure}
                onChange={handleChange}
                required
                isSelect
                options={priceMeasureOptions}
                error={
                  error?.field === "price_measure" ? error.message : undefined
                }
              />

              <InputField
                label="Moisture %"
                name="moisturePercent"
                value={formData.moisturePercent}
                onChange={handleChange}
                type="number"
                step="0.1"
                placeholder="0.0"
                icon={Droplets}
              />
            </div>
          </div>

          {/* Specifications Section */}
          <div className="space-y-6">
            <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                <h3 className="text-base font-semibold text-slate-900">
                  Specifications
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <LanguageSelector
                  selectedLanguage={selectedSpecificationLanguage}
                  onLanguageChange={(lang) =>
                    handleLanguageChange("specification", lang)
                  }
                  label="Select Language"
                />

                {/* Show content summary for other languages */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                    Content in Other Languages
                  </label>
                  <div className="space-y-1 text-xs text-gray-500">
                    {LANGUAGES.map((lang) => {
                      if (lang.value === selectedSpecificationLanguage)
                        return null;
                      const content = formData[
                        `specification_${lang.value}` as keyof typeof formData
                      ] as string;
                      return (
                        <div
                          key={lang.value}
                          className="flex items-center space-x-2 p-2 bg-white rounded-lg border"
                        >
                          <span className="flex items-center space-x-1">
                            {lang.icon}
                            <span>{lang.label}:</span>
                          </span>
                          <span
                            className={`ml-auto ${
                              content
                                ? "text-blue-600 font-medium"
                                : "text-slate-400"
                            }`}
                          >
                            {content ? `${content.length} chars` : "Empty"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <TextAreaField
                label={`Specifications (${
                  LANGUAGES.find(
                    (l) => l.value === selectedSpecificationLanguage
                  )?.label
                })`}
                name={`specification_${selectedSpecificationLanguage}`}
                value={getCurrentSpecificationValue()}
                onChange={handleSpecificationChange}
                placeholder={`Enter detailed specifications for the crop quality, packaging requirements, delivery conditions, etc... (in ${
                  LANGUAGES.find(
                    (l) => l.value === selectedSpecificationLanguage
                  )?.label
                })`}
                rows={4}
                language={selectedSpecificationLanguage}
                error={
                  error?.field === "specification" ? error.message : undefined
                }
              />
            </div>

            {/* Terms & Conditions Section */}
            <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                <h3 className="text-base font-semibold text-slate-900">
                  Terms & Conditions
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <LanguageSelector
                  selectedLanguage={selectedTermsLanguage}
                  onLanguageChange={(lang) =>
                    handleLanguageChange("terms", lang)
                  }
                  label="Select Language"
                />

                {/* Show content summary for other languages */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                    Content in Other Languages
                  </label>
                  <div className="space-y-1 text-xs text-gray-500">
                    {LANGUAGES.map((lang) => {
                      if (lang.value === selectedTermsLanguage) return null;
                      const content = formData[
                        `termsAndConditions_${lang.value}` as keyof typeof formData
                      ] as string;
                      return (
                        <div
                          key={lang.value}
                          className="flex items-center space-x-2 p-2 bg-white rounded-lg border"
                        >
                          <span className="flex items-center space-x-1">
                            {lang.icon}
                            <span>{lang.label}:</span>
                          </span>
                          <span
                            className={`ml-auto ${
                              content
                                ? "text-blue-600 font-medium"
                                : "text-slate-400"
                            }`}
                          >
                            {content ? `${content.length} chars` : "Empty"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <TextAreaField
                label={`Terms & Conditions (${
                  LANGUAGES.find((l) => l.value === selectedTermsLanguage)
                    ?.label
                })`}
                name={`termsAndConditions_${selectedTermsLanguage}`}
                value={getCurrentTermsValue()}
                onChange={handleTermsChange}
                placeholder={`Enter terms and conditions including payment terms, delivery schedule, quality standards, cancellation policy, etc... (in ${
                  LANGUAGES.find((l) => l.value === selectedTermsLanguage)
                    ?.label
                })`}
                rows={4}
                language={selectedTermsLanguage}
                error={
                  error?.field === "termsAndConditions"
                    ? error.message
                    : undefined
                }
              />
            </div>
          </div>

          {/* Footer Section */}

          <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="flex flex-col space-y-4 flex-shrink-0">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                  />
                  <span className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-gray-500" />
                    <span>Make this order active immediately</span>
                  </span>
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <InputField
                  label="Order Expiry Date"
                  name="expiresAt"
                  value={formData.expiresAt}
                  onChange={handleChange}
                  type="date"
                  required
                  error={
                    error?.field === "expiresAt" ? error.message : undefined
                  }
                  icon={Calendar}
                />
              </div>
            </div>
          </div>

          {/* <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="flex flex-col space-y-4 flex-shrink-0">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isPoAvailable"
                    checked={formData.isPoAvailable}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <span className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-gray-500" />
                    <span>Purchase Order Available</span>
                  </span>
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <InputField
                  label="PO Availability Expiry"
                  name="availablePoExpiry"
                  value={formData.availablePoExpiry}
                  onChange={handleChange}
                  type="date"
                  error={
                    error?.field === "availablePoExpiry"
                      ? error.message
                      : undefined
                  }
                  icon={Calendar}
                />
              </div>
            </div>
          </div> */}

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md font-semibold text-sm transition-colors duration-150 ${
                isSubmitting
                  ? "bg-slate-400 cursor-not-allowed text-white"
                  : "bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>
                    {isEditMode
                      ? "Updating..."
                      : "Creating..."}
                  </span>
                </>
              ) : (
                <>
                  {isEditMode ? (
                    <Edit3 className="w-5 h-5" />
                  ) : (
                    <Package className="w-5 h-5" />
                  )}
                  <span>
                    {isEditMode
                      ? "Update Purchase Order"
                      : "Create Purchase Order"}
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

export default OrderForm;
