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
      setLoading(true);
      const url = await uploadToCloudinary(file);
      setPoDocCopy(url);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Check your Cloudinary preset.");
    } finally {
      setLoading(false);
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
      poQuantityMeasure, // ✅ added enum field
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl p-6 relative shadow-xl border border-gray-100 transition-all">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
        >
          <X size={22} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-5">
          <Building2 className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">
            Create Purchase Order
          </h2>
        </div>

        {/* Success */}
        {success && (
          <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
            <CheckCircle2 size={18} />
            Purchase Order created successfully!
          </div>
        )}

        {/* Search Company */}
        <div className="mb-4 relative">
          <label className="block text-xs font-medium text-gray-600 mb-1">
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
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />
          {filtered.length > 0 && !selectedCompany && (
            <div className="absolute w-full mt-1 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto z-20">
              {filtered.map((company) => (
                <div
                  key={company.id}
                  onClick={() => handleCompanySelect(company)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-purple-50 cursor-pointer text-sm border-b last:border-none"
                >
                  {company.company_logo ? (
                    <img
                      src={company.company_logo}
                      alt="logo"
                      className="w-6 h-6 rounded-full border border-gray-200 object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                      ?
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-800">
                      {company.companyName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {company.village} ({company.taluk}) ({company.district})
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Company */}
        {selectedCompany && (
          <div className="mb-4 grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3">
              {selectedCompany.company_logo && (
                <img
                  src={selectedCompany.company_logo}
                  alt="Company Logo"
                  className="w-10 h-10 rounded-full border border-gray-200 object-cover"
                />
              )}
              <div className="flex-1">
                <label className="text-xs text-gray-500 font-medium">
                  Company Name
                </label>
                <input
                  type="text"
                  value={selectedCompany.companyName}
                  readOnly
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 text-gray-700 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {["village", "taluk", "district"].map((field) => (
                <div key={field}>
                  <label className="text-xs text-gray-500 font-medium capitalize">
                    {field}
                  </label>
                  <input
                    type="text"
                    value={selectedCompany[field as keyof Company] as string}
                    readOnly
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 text-gray-700 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Crop Dropdown */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Crop Name
          </label>
          <select
            value={cropName}
            onChange={(e) => setCropName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 bg-white"
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
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Expiry Date
          </label>
          <input
            type="date"
            value={poExpiryDate}
            onChange={(e) => setPoExpiryDate(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Quantity + Measure + Price */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Quantity
            </label>
            <input
              type="number"
              value={poQuantity}
              onChange={(e) => setPoQuantity(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Measure
            </label>
            <select
              value={poQuantityMeasure}
              onChange={(e) => setPoQuantityMeasure(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500"
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
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Price (₹)
            </label>
            <input
              type="text"
              value={poPrice}
              onChange={(e) => setPoPrice(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Specification & Terms */}
        <div className="grid md:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Specifications
            </label>
            <textarea
              value={specification}
              onChange={(e) => setSpecification(e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Terms & Conditions
            </label>
            <textarea
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* File Upload + Submit */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer border border-gray-200 px-4 py-2 rounded-xl text-sm text-gray-700 hover:bg-purple-50 transition-all">
            <Upload size={18} className="text-purple-600" />
            Upload PO Copy
            <input type="file" className="hidden" onChange={handleFileUpload} />
          </label>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:from-purple-700 hover:to-purple-800 shadow-md active:scale-[0.98] transition-all flex items-center gap-2"
          >
            {loading && <Loader2 className="animate-spin w-4 h-4" />}
            {loading ? "Creating..." : "Create PO"}
          </button>
        </div>

        {/* ✅ Show Preview / Uploaded Image */}
        {previewUrl && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <ImageIcon size={16} /> Preview
            </h4>
            <img
              src={poDocCopy || previewUrl}
              alt="PO Copy Preview"
              className="rounded-xl w-20 h-20 object-cover border"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default POForm;
