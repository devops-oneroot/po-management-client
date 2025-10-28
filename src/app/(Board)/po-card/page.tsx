"use client";

import React from "react";
import Link from "next/link";
import { MapPin, Pencil, CircleUser, MoreVertical } from "lucide-react";

interface CompanyCardProps {
  id: number;
  name: string;
  location: string;
  crop: string;
  moisture: string;
  quantity: string;
  price: string;
  status: string;
}

const companies: CompanyCardProps[] = [
  {
    id: 1,
    name: "Sahayadri Farms",
    location: "Maddur, Mandya",
    crop: "Maize",
    moisture: "Moisture %",
    quantity: "25 Tons",
    price: "₹20.50",
    status: "In Progress",
  },
  {
    id: 2,
    name: "GreenGrow Traders",
    location: "Hassan, Karnataka",
    crop: "Turmeric",
    moisture: "Curcumin %",
    quantity: "15 Tons",
    price: "₹68.00",
    status: "In Progress",
  },
  {
    id: 2,
    name: "GreenGrow Traders",
    location: "Hassan, Karnataka",
    crop: "Turmeric",
    moisture: "Curcumin %",
    quantity: "15 Tons",
    price: "₹68.00",
    status: "In Progress",
  },
  {
    id: 2,
    name: "GreenGrow Traders",
    location: "Hassan, Karnataka",
    crop: "Turmeric",
    moisture: "Curcumin %",
    quantity: "15 Tons",
    price: "₹68.00",
    status: "In Progress",
  },
  {
    id: 2,
    name: "GreenGrow Traders",
    location: "Hassan, Karnataka",
    crop: "Turmeric",
    moisture: "Curcumin %",
    quantity: "15 Tons",
    price: "₹68.00",
    status: "In Progress",
  },
  {
    id: 2,
    name: "GreenGrow Traders",
    location: "Hassan, Karnataka",
    crop: "Turmeric",
    moisture: "Curcumin %",
    quantity: "15 Tons",
    price: "₹68.00",
    status: "In Progress",
  },
  {
    id: 2,
    name: "GreenGrow Traders",
    location: "Hassan, Karnataka",
    crop: "Turmeric",
    moisture: "Curcumin %",
    quantity: "15 Tons",
    price: "₹68.00",
    status: "In Progress",
  },
  {
    id: 2,
    name: "GreenGrow Traders",
    location: "Hassan, Karnataka",
    crop: "Turmeric",
    moisture: "Curcumin %",
    quantity: "15 Tons",
    price: "₹68.00",
    status: "In Progress",
  },
  {
    id: 2,
    name: "GreenGrow Traders",
    location: "Hassan, Karnataka",
    crop: "Turmeric",
    moisture: "Curcumin %",
    quantity: "15 Tons",
    price: "₹68.00",
    status: "In Progress",
  },
  {
    id: 2,
    name: "GreenGrow Traders",
    location: "Hassan, Karnataka",
    crop: "Turmeric",
    moisture: "Curcumin %",
    quantity: "15 Tons",
    price: "₹68.00",
    status: "In Progress",
  },
  {
    id: 2,
    name: "GreenGrow Traders",
    location: "Hassan, Karnataka",
    crop: "Turmeric",
    moisture: "Curcumin %",
    quantity: "15 Tons",
    price: "₹68.00",
    status: "In Progress",
  },
];

const CompaniesPage = () => {
  return (
    <div>
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-50 py-10 px-12">
        <div className="flex flex-wrap  gap-12">
          {companies.map((company) => (
            <Link
              href={`/po/${company.id}`}
              key={company.id}
              className="group relative w-[300px] sm:w-[340px] bg-white rounded-3xl border border-purple-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            >
              {/* Header */}
              <div className="relative bg-gradient-to-r from-purple-100 to-purple-50 rounded-t-3xl h-28 flex items-start justify-between p-4">
                <span className="absolute top-3 right-3 text-xs font-medium bg-purple-600 text-white px-3 py-1 rounded-full shadow">
                  {company.status}
                </span>
                {/* <MoreVertical className="text-gray-400 absolute top-3 left-3 w-4 h-4" /> */}

                <div className="absolute left-1/2 -bottom-8 transform -translate-x-1/2 w-20 h-20 rounded-full bg-gradient-to-tr from-gray-100 to-gray-50 flex items-center justify-center ring-4 ring-white shadow-inner">
                  <CircleUser className="w-10 h-10 text-gray-500" />
                </div>
              </div>

              {/* Content */}
              <div className="pt-12 pb-6 px-6 text-center">
                <h2 className="text-lg font-semibold text-gray-800 tracking-tight group-hover:text-purple-700 transition-colors">
                  {company.name}
                </h2>
                <p className="text-sm text-gray-500 flex items-center justify-center gap-1 mt-1">
                  <MapPin className="w-4 h-4 text-purple-400" />
                  {company.location}
                </p>

                {/* Crop Details */}
                <div className="mt-6 border border-gray-100 rounded-2xl bg-gradient-to-br from-gray-50 to-white p-4 text-left transition-all duration-300 group-hover:shadow-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800">
                        {company.crop}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {company.moisture}
                      </p>
                    </div>
                    {/* <Pencil className="w-4 h-4 text-gray-400 hover:text-purple-600 cursor-pointer transition" /> */}
                  </div>

                  <div className="flex justify-between items-center mt-4 text-gray-700 text-sm">
                    <p className="font-medium">{company.quantity}</p>
                    <p className="font-semibold text-purple-700">
                      {company.price}
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-5 flex justify-center gap-3">
                  <button className="text-xs px-4 py-1.5 rounded-full bg-purple-50 text-purple-700 hover:bg-purple-100 font-medium transition">
                    Specs
                  </button>
                  <button className="text-xs px-4 py-1.5 rounded-full bg-purple-50 text-purple-700 hover:bg-purple-100 font-medium transition">
                    Terms
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompaniesPage;
