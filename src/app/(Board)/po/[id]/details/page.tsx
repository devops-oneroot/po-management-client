"use client";

import React, { useState } from "react";
import {
  Phone,
  MessageCircle,
  CheckCircle2,
  CheckCircle,
  Upload,
  Building2,
  User,
  Truck,
  FileCheck,
  DoorOpen,
  ClipboardCheck,
  CreditCard,
  Image as ImageIcon,
  MapPin,
  CalendarDays,
  IndianRupee,
  Package,
} from "lucide-react";

import PaymentDetails from "@/src/components/details/PaymentDetails";
import WeighmentAndGRNDetails from "@/src/components/details/Weighment&GRNDetails";
import TruckDetails from "@/src/components/details/TruckDetails";
import UploadReports from "@/src/components/details/UploadReports";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function BuyerDetails() {
  const [status, setStatus] = useState("Ongoing");
  const router = useRouter();

  const [selectedBuyer, setSelectedBuyer] = useState({
    name: "Mahadevappa",
    stages: [
      { id: 1, name: "PO Created", icon: CheckCircle2, completed: true },
      {
        id: 2,
        name: "Material Dispatched",
        icon: CheckCircle2,
        completed: true,
      },
      {
        id: 3,
        name: "Material Received",
        icon: CheckCircle2,
        completed: false,
      },
      { id: 4, name: "Payment Done", icon: CheckCircle2, completed: false },
    ],
  });

  const toggleStageCompletion = (id: number) => {
    setSelectedBuyer((prev) => ({
      ...prev,
      stages: prev.stages.map((stage) =>
        stage.id === id ? { ...stage, completed: !stage.completed } : stage
      ),
    }));
  };

  const handleImageUpload = (id: number, file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setSelectedBuyer((prev) => ({
      ...prev,
      stages: prev.stages.map((stage) =>
        stage.id === id ? { ...stage, image: imageUrl } : stage
      ),
    }));
  };

  return (
    <div>
      {/* ---- Status selector (kept in the page) ---- */}
      <div className="flex justify-between px-5 mt-3">
        <button
          onClick={() => router.back()}
          className="inline-flex w-20 h-10 items-center gap-1 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition-all text-white text-xs px-3 py-1.5 rounded-lg shadow-sm"
        >
          Back
        </button>
        <div className="flex justify-end px-2 items-center gap-4">
          <div className="flex flex-col items-start">
            <label className="text-sm font-semibold text-gray-700">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 block w-36 rounded-lg border-gray-300 bg-white text-gray-700 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option>Ongoing</option>
              <option>Completed</option>
              <option>Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* ---- Whole UI (header + 3 cards) ---- */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8 font-sans text-gray-800">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          {/* Buyer Info + Quantity/Price */}
          <div className="flex flex-col md:flex-row justify-between gap-6 border-b pb-6">
            {/* Buyer Info */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center font-semibold text-gray-700">
                M
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Mahadevappa
                </h2>
                <p className="text-gray-500 text-sm">Maddur, Mandya</p>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-700">
                  <Phone className="w-4 h-4 text-blue-500" />
                  <MessageCircle className="w-4 h-4 text-green-500" />
                  <span>+91 9876543210</span>
                </div>
              </div>
            </div>

            {/* Quantity + Price + Date */}
            <div className="flex flex-wrap gap-4 items-center justify-end">
              <div className="bg-blue-50 px-5 py-3 rounded-xl text-center">
                <p className="text-sm font-medium text-gray-700">
                  Agreed Quantity
                </p>
                <p className="text-xl font-bold text-blue-600">25 Tons</p>
                <p className="text-sm font-medium mt-1 text-gray-700">
                  Accepted Quantity
                </p>
                <p className="text-xl font-bold text-blue-600">25 Tons</p>
              </div>
              <div className="bg-green-50 px-5 py-3 rounded-xl text-center">
                <p className="text-sm font-medium text-gray-700">
                  Agreed Price
                </p>
                <p className="text-xl font-bold text-green-600">₹20.25</p>
              </div>
              <div className="bg-gray-50 px-5 py-3 rounded-xl text-center">
                <p className="text-sm font-medium text-gray-700">
                  To be fulfilled by
                </p>
                <p className="text-xl font-bold text-gray-800">23rd Dec</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br mt-10 from-indigo-50 via-white to-purple-50 shadow-lg rounded-2xl border border-gray-100 p-8 mb-10 mx-auto hover:shadow-xl transition-all duration-300">
            {/* Top Info */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-4">
                <Image
                  src="/images/sahyadri-logo.png"
                  alt="Sahyadri Farms Logo"
                  width={60}
                  height={60}
                  className="rounded-full border border-gray-200 shadow-sm"
                />
                <div>
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                    Sahyadri Farms
                  </h2>
                  <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-indigo-500" />
                    Maddur, Mandya
                  </p>
                </div>
              </div>

              <div className="flex justify-center items-center text-center">
                <div className="flex items-center gap-2 text-sm text-gray-700 border border-gray-200 bg-gradient-to-br from-white to-indigo-50 shadow-sm px-5 py-2 rounded-lg">
                  <CalendarDays className="w-4 h-4 text-indigo-600" />
                  <span>
                    To be fulfilled by{" "}
                    <span className="font-semibold text-2xl md:text-3xl text-indigo-600">
                      23rd Dec
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-col md:flex-row justify-between mt-12 gap-10 md:gap-0 text-center md:text-left px-10">
              <div className="flex flex-col items-center md:items-start gap-2">
                <div className="flex items-center gap-2 text-indigo-600">
                  <IndianRupee className="w-5 h-5" />
                  <p className="text-sm font-medium text-gray-600">Our Price</p>
                </div>
                <p className="text-3xl md:text-4xl font-semibold text-gray-800">
                  ₹20.25
                </p>
              </div>

              <div className="flex flex-col items-center md:items-start gap-2">
                <div className="flex items-center gap-2 text-green-600">
                  <Package className="w-5 h-5" />
                  <p className="text-sm font-medium text-gray-600">
                    Total Quantity
                  </p>
                </div>
                <p className="text-5xl md:text-6xl font-semibold text-gray-800">
                  25 Tons
                </p>
              </div>

              <div className="flex flex-col items-center md:items-start gap-2">
                <div className="flex items-center gap-2 text-purple-600">
                  <CheckCircle2 className="w-5 h-5" />
                  <p className="text-sm font-medium text-gray-600">
                    Fulfilled Quantity
                  </p>
                </div>
                <p className="text-3xl md:text-4xl font-semibold text-gray-800">
                  25 Tons
                </p>
              </div>
            </div>

            {/* CTA Button */}
          </div>

          {/* Stages */}
          {/* <div className="flex flex-wrap justify-around mt-6 text-sm">
            {[
              "Order Started",
              "Loading",
              "Quality Check",
              "Weighment Unloading",
              "GRN",
              "Gate Pass",
            ].map((stage, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-gray-600 font-medium"
              >
                <CheckCircle2 className="w-6 h-6 text-blue-500" />
                <span className="mt-2">{stage}</span>
              </div>
            ))}
          </div> */}
          {/* ---- Stages Progress ---- */}
          <div className="relative w-full max-w-3xl mx-auto mb-12 mt-6">
            <div className="absolute top-8 left-0 w-full h-1 bg-gray-200 rounded-full">
              <div
                className="h-1 bg-purple-500 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    (selectedBuyer.stages.filter((s) => s.completed).length /
                      selectedBuyer.stages.length) *
                    100
                  }%`,
                }}
              />
            </div>

            <div className="flex justify-between items-center relative z-10">
              {selectedBuyer.stages.map((stage) => {
                const Icon = stage.icon;
                return (
                  <div
                    key={stage.id}
                    className="flex flex-col items-center text-center cursor-pointer group"
                    onClick={() => toggleStageCompletion(stage.id)}
                  >
                    <div
                      className={`w-16 h-16 flex items-center justify-center rounded-full border-4 transition-all duration-300 ${
                        stage.completed
                          ? "bg-purple-100 border-purple-500 text-purple-600"
                          : "bg-gray-100 border-gray-300 text-gray-400 group-hover:border-purple-300"
                      }`}
                    >
                      {stage.completed ? (
                        <CheckCircle className="w-8 h-8 text-purple-600" />
                      ) : (
                        <Icon className="w-8 h-8" />
                      )}
                    </div>
                    <span
                      className={`mt-3 text-sm font-medium ${
                        stage.completed ? "text-purple-600" : "text-gray-500"
                      }`}
                    >
                      {stage.name}
                    </span>

                    {/* Image Upload */}
                    <div className="mt-3">
                      <label className="cursor-pointer text-xs text-purple-600 hover:underline flex items-center gap-1">
                        <Upload className="w-3 h-3" />
                        Upload Image
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleImageUpload(stage.id, e.target.files[0]);
                            }
                          }}
                        />
                      </label>

                      {stage.image && (
                        <div className="mt-2">
                          <img
                            src={stage.image}
                            alt="Stage proof"
                            className="w-20 h-20 object-cover rounded-lg border"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-3">
          <div className="flex gap-4 ">
            <div>
              <TruckDetails />
            </div>

            <div>
              <UploadReports />
            </div>
          </div>
        </div>

        {/* ---- 3 Cards (now components) ---- */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <WeighmentAndGRNDetails />
          <PaymentDetails />
        </div>

        {/* Notes */}

        <div className="mt-6 px-12 bg-white rounded-2xl p-6 shadow border border-gray-100">
          <label className="block font-semibold mb-2 text-gray-700">
            Notes
          </label>
          <textarea
            placeholder="Add your notes..."
            className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
