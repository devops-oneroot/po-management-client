"use client";

import React, { useEffect, useState } from "react";
import { X, Upload, Building2 } from "lucide-react";

interface Company {
  id: string;
  name: string;
  village: string;
  taluk: string;
}

const POForm = ({ onClose }: { onClose: () => void }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await fetch(
          "https://markhet-internal-dev.onrender.com/po-companies"
        );
        const data = await res.json();
        setCompanies(data);
        setFiltered(data);
      } catch (err) {
        console.error("Error fetching companies", err);
      }
    };
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(companies);
    } else {
      setFiltered(
        companies.filter((c) =>
          c.name.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, companies]);

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    setSearch(company.name);
    setFiltered([]);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl p-6 relative shadow-xl border border-gray-100 transition-all animate-in fade-in-50 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
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

        {/* Search Company */}
        <div className="mb-4 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedCompany(null);
            }}
            placeholder="Search company name..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 transition text-sm"
          />

          {/* Company Suggestions */}
          {filtered.length > 0 && !selectedCompany && (
            <div className="absolute w-full mt-1 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto z-20">
              {filtered.map((company) => (
                <div
                  key={company.id}
                  onClick={() => handleCompanySelect(company)}
                  className="px-4 py-2 hover:bg-purple-50 cursor-pointer transition text-sm border-b last:border-none"
                >
                  <p className="font-medium text-gray-800">{company.name}</p>
                  <p className="text-xs text-gray-500">
                    {company.village} ({company.taluk})
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Company Details */}
        {selectedCompany && (
          <div className="mb-4 grid grid-cols-1 gap-3 animate-in fade-in duration-150">
            <div>
              <label className="text-xs text-gray-500 font-medium">
                Company Name
              </label>
              <input
                type="text"
                value={selectedCompany.name}
                readOnly
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 text-gray-700 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">
                  Village
                </label>
                <input
                  type="text"
                  value={selectedCompany.village}
                  readOnly
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 text-gray-700 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">
                  Taluk
                </label>
                <input
                  type="text"
                  value={selectedCompany.taluk}
                  readOnly
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 text-gray-700 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* PO Dates */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs text-gray-500 font-medium">
              PO Issued Date
            </label>
            <input
              type="date"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium">
              Expiry Date
            </label>
            <input
              type="date"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Quantity & Price */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input
            type="number"
            placeholder="Enter Quantity (Tons)"
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="text"
            placeholder="Enter Price (₹ per ton)"
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Text Areas */}
        <textarea
          placeholder="Specifications"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-3 focus:ring-2 focus:ring-purple-500"
          rows={2}
        />
        <textarea
          placeholder="Terms & Conditions"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-4 focus:ring-2 focus:ring-purple-500"
          rows={2}
        />

        {/* Upload & Submit */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer border border-gray-200 px-4 py-2 rounded-xl text-sm text-gray-700 hover:bg-purple-50 transition-all">
            <Upload size={18} className="text-purple-600" />
            Upload PO Copy
            <input type="file" className="hidden" />
          </label>

          <button className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:from-purple-700 hover:to-purple-800 shadow-md active:scale-[0.98] transition-all">
            Create PO
          </button>
        </div>
      </div>
    </div>
  );
};

export default POForm;
