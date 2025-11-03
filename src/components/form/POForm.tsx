"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Upload,
  Building2,
  Loader2,
  CheckCircle2,
  Image as ImageIcon,
} from "lucide-react";

interface Company {
  id: string;
  companyName: string;
  village: string;
  taluk: string;
  district: string;
  company_logo?: string;
  cropName?: string;
  poCompany?: {
    id: string;
  };
}

const POForm = ({ onClose }: { onClose: () => void }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form fields
  const [cropName, setCropName] = useState("");
  const [poQuantity, setPoQuantity] = useState<number | "">("");
  const [poQuantityMeasure, setPoQuantityMeasure] = useState("QUINTAL");
  const [poPrice, setPoPrice] = useState("");
  const [poExpiryDate, setPoExpiryDate] = useState("");
  const [specification, setSpecification] = useState("");
  const [terms, setTerms] = useState("");
  const [poDocCopy, setPoDocCopy] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // ✅ Fetch Companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/po`);
        const data = await res.json();
        setCompanies(data);
        setFiltered(data);
      } catch (err) {
        console.error("Error fetching companies:", err);
      }
    };
    fetchCompanies();
  }, []);

  // ✅ Filter Companies
  useEffect(() => {
    if (!search.trim()) setFiltered(companies);
    else {
      setFiltered(
        companies.filter((c) =>
          c.companyName.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, companies]);

  // ✅ Select Company
  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    setSearch(company.companyName);
    setFiltered([]);
  };

  // ✅ Cloudinary Upload
  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ""
    );

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );

    if (!res.ok) throw new Error("Failed to upload file to Cloudinary");
    const data = await res.json();
    return data.secure_url as string;
  };

  // ✅ File upload with preview
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview locally before upload
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    try {
      setUploading(true);
      const url = await uploadToCloudinary(file);
      setPoDocCopy(url);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Check your Cloudinary preset.");
    } finally {
      setUploading(false);
    }
  };

  // ✅ Submit handler
  const handleSubmit = async () => {
    if (
      !selectedCompany ||
      !cropName ||
      !poQuantity ||
      !poPrice ||
      !poExpiryDate
    ) {
      alert("Please fill all required fields");
      return;
    }

    const payload = {
      cropName,
      poId: selectedCompany.id,
      poCompanyId: selectedCompany.poCompany?.id,
      poQuantity,
      poQuantityMeasure,
      poPrice,
      poExpiryDate,
      specification,
      termsAndConditions: terms,
      poDocCopy,
      poStatus: "INPROGRESS",
    };

    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/master-po`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to create PO");
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Error creating PO:", err);
      alert("Something went wrong while creating PO.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-xl shadow-xl border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">
              Create Purchase Order
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* Success */}
          {success && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Purchase Order created successfully!
            </div>
          )}

          {/* Search Company */}
          <div className="relative">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Search Company
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedCompany(null);
              }}
              placeholder="Search company name..."
              className="w-full border border-slate-200 rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm hover:border-slate-300 transition-colors duration-150"
            />
            {filtered.length > 0 && !selectedCompany && (
              <div className="absolute w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-40 overflow-y-auto z-20">
                {filtered.map((company) => (
                  <div
                    key={company.id}
                    onClick={() => handleCompanySelect(company)}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm border-b border-slate-100 last:border-none"
                  >
                    {company.company_logo ? (
                      <img
                        src={company.company_logo}
                        alt="logo"
                        className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-medium">
                        {company.companyName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-slate-900">
                        {company.companyName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {company.village}, {company.taluk}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Company */}
          {selectedCompany && (
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center gap-3 mb-3">
                {selectedCompany.company_logo && (
                  <img
                    src={selectedCompany.company_logo}
                    alt="Company Logo"
                    className="w-10 h-10 rounded-full border border-slate-200 object-cover"
                  />
                )}
                <div className="flex-1">
                  <label className="text-xs text-slate-500 font-medium">
                    Company Name
                  </label>
                  <p className="text-sm font-semibold text-slate-900">
                    {selectedCompany.companyName}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {["village", "taluk", "district"].map((field) => (
                  <div key={field}>
                    <label className="text-xs text-slate-500 font-medium capitalize block mb-1">
                      {field}
                    </label>
                    <p className="text-sm text-slate-700">
                      {selectedCompany[field as keyof Company] as string}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Crop Dropdown */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Crop Name
            </label>
            <select
              value={cropName}
              onChange={(e) => setCropName(e.target.value)}
              className="w-full border border-slate-200 rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 bg-white hover:border-slate-300 transition-colors duration-150"
            >
              <option value="">Select Crop</option>
              <option value="Tender Coconut">Tender Coconut</option>
              <option value="Turmeric">Turmeric</option>
              <option value="Banana">Banana</option>
              <option value="Dry Coconut">Dry Coconut</option>
              <option value="Maize">Maize</option>
              <option value="Sunflower">Sunflower</option>
            </select>
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Expiry Date
            </label>
            <input
              type="date"
              value={poExpiryDate}
              onChange={(e) => setPoExpiryDate(e.target.value)}
              className="w-full border border-slate-200 rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 hover:border-slate-300 transition-colors duration-150"
            />
          </div>

          {/* Quantity + Measure + Price */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                value={poQuantity}
                onChange={(e) => setPoQuantity(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 hover:border-slate-300 transition-colors duration-150"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Measure
              </label>
              <select
                value={poQuantityMeasure}
                onChange={(e) => setPoQuantityMeasure(e.target.value)}
                className="w-full border border-slate-200 rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 hover:border-slate-300 transition-colors duration-150"
              >
                <option value="QUINTAL">QUINTAL</option>
                <option value="TON">TON</option>
                <option value="PIECE">PIECE</option>
                <option value="KILOGRAM">KILOGRAM</option>
                <option value="GRAM">GRAM</option>
                <option value="LITRE">LITRE</option>
                <option value="BAG">BAG</option>
                <option value="BOX">BOX</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Price (₹)
              </label>
              <input
                type="text"
                value={poPrice}
                onChange={(e) => setPoPrice(e.target.value)}
                className="w-full border border-slate-200 rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 hover:border-slate-300 transition-colors duration-150"
              />
            </div>
          </div>

          {/* Specification & Terms */}
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Specifications
              </label>
              <textarea
                value={specification}
                onChange={(e) => setSpecification(e.target.value)}
                rows={3}
                placeholder="Enter specifications..."
                className="w-full border border-slate-200 rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 hover:border-slate-300 transition-colors duration-150 placeholder-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Terms & Conditions
              </label>
              <textarea
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                rows={3}
                placeholder="Enter terms..."
                className="w-full border border-slate-200 rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 hover:border-slate-300 transition-colors duration-150 placeholder-slate-400"
              />
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Upload PO Copy (Optional)
            </label>
            <label className="flex items-center justify-center gap-2 cursor-pointer border-2 border-dashed border-slate-300 hover:border-slate-400 px-4 py-6 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-all duration-150">
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 text-slate-500" />
                  <span>Click to upload</span>
                </>
              )}
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          </div>

          {/* Preview Image */}
          {previewUrl && (
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="w-4 h-4 text-slate-600" />
                <h4 className="text-sm font-medium text-slate-900">Preview</h4>
              </div>
              <img
                src={poDocCopy || previewUrl}
                alt="PO Copy Preview"
                className="rounded-lg w-full h-32 object-cover border border-slate-200"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors duration-150"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || uploading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-md font-medium shadow-sm transition-colors duration-150 text-sm"
          >
            {loading && <Loader2 className="animate-spin w-4 h-4" />}
            {loading ? "Creating..." : "Create PO"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default POForm;
