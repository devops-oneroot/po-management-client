"use client";

import React, { useEffect, useState } from "react";
import { X, Upload } from "lucide-react";

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

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await fetch("https://markhet-internal-dev.onrender.com/po-companies");
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
    setFiltered(
      companies.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, companies]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 relative shadow-lg animate-in fade-in duration-300">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4">Add PO</h2>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search"
          className="w-full border rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <div className="max-h-24 overflow-y-auto border rounded-lg mb-4">
          {filtered.map((company) => (
            <div
              key={company.id}
              className="px-3 py-2 border-b hover:bg-purple-50 cursor-pointer text-sm"
            >
              <p className="font-medium text-gray-800">{company.name}</p>
              <p className="text-gray-500">
                {company.village} ({company.taluk})
              </p>
            </div>
          ))}
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-sm text-gray-600">PO Issued Date</label>
            <input type="date" className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Expiry Date</label>
            <input type="date" className="w-full border rounded-lg px-3 py-2" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <input
            type="text"
            placeholder="Enter Quantity"
            className="border rounded-lg px-3 py-2"
          />
          <input
            type="text"
            placeholder="Enter Price"
            className="border rounded-lg px-3 py-2"
          />
        </div>

        <textarea
          placeholder="Specifications"
          className="w-full border rounded-lg px-3 py-2 mb-3"
          rows={2}
        />
        <textarea
          placeholder="Terms & Conditions"
          className="w-full border rounded-lg px-3 py-2 mb-3"
          rows={2}
        />

        <div className="flex items-center justify-between mt-4">
          <label className="flex items-center gap-2 cursor-pointer border px-3 py-2 rounded-lg hover:bg-purple-50 transition">
            <Upload size={18} />
            <span className="text-sm">Upload PO Copy</span>
            <input type="file" className="hidden" />
          </label>
          <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition">
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default POForm;
