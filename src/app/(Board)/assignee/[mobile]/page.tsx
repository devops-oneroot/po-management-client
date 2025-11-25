// app/assignee/[mobile]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Phone,
  User,
  MapPin,
  Package,
  Truck,
  Calendar,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  Building2,
  CalendarDays,
  Weight,
} from "lucide-react";

interface AssigneeInfo {
  name: string;
  mobile: string;
  village: string;
  district: string;
  totalPOs: number;
  activePOs: number;
  cancelledPOs: number;
  totalQuantityTon: number;
  avatar?: string | null;
}

interface Assignment {
  id: string;
  cropName: string;
  companyName: string;
  companyLogo?: string;
  promisedDate: string;
  promisedQuantity: number;
  promisedQuantityMeasure: string;
  rate: string;
  status: string;
  masterPOId: string;
}

export default function AssigneeDetailPage() {
  const { mobile } = useParams() as { mobile: string };
  const router = useRouter();
  const [data, setData] = useState<AssigneeInfo | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/assignee-info/${mobile}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((response) => {
        const user = response.data.user;
        const rawAssignments = response.data.masterPoAssignments || [];

        // Filter & transform assignments
        const transformed: Assignment[] = rawAssignments.map((a: any) => ({
          id: a.id,
          cropName: a.masterPO.cropName,
          companyName: a.masterPO.poCompany.name,
          companyLogo: a.masterPO.poCompany.company_logo || undefined,
          promisedDate: a.promisedDate,
          promisedQuantity: Number(a.promisedQuantity || 0),
          promisedQuantityMeasure: a.promisedQuantityMeasure,
          rate: a.rate,
          status: a.status,
          masterPOId: a.masterPOId,
        }));

        const active = transformed.filter((a) => a.status !== "CANCELLED");
        const cancelledCount = transformed.length - active.length;

        const totalQuintal = active.reduce((sum, a) => {
          return a.promisedQuantityMeasure === "QUINTAL"
            ? sum + a.promisedQuantity
            : sum + a.promisedQuantity * 10;
        }, 0);

        setAssignments(transformed);
        setData({
          name: user.name || "Unknown",
          mobile: user.mobileNumber.replace("+91", ""),
          village: user.village || "—",
          district: user.district || "—",
          totalPOs: transformed.length,
          activePOs: active.length,
          cancelledPOs: cancelledCount,
          totalQuantityTon: Number((totalQuintal / 10).toFixed(1)),
          avatar: user.profileImage,
        });
      })
      .catch(() => {
        setData(null);
        setAssignments([]);
      })
      .finally(() => setLoading(false));
  }, [mobile]);

  // Status Badge Component
  const StatusBadge = ({ status }: { status: string }) => {
    const config: Record<
      string,
      { label: string; color: string; icon: React.ReactNode }
    > = {
      PO_ASSIGNED: {
        label: "Assigned",
        color: "bg-amber-100 text-amber-800",
        icon: <Clock className="w-4 h-4" />,
      },
      IN_TRANSIT: {
        label: "In Transit",
        color: "bg-blue-100 text-blue-800",
        icon: <Truck className="w-4 h-4" />,
      },
      DELIVERED: {
        label: "Delivered",
        color: "bg-green-100 text-green-800",
        icon: <CheckCircle2 className="w-4 h-4" />,
      },
      COMPLETED: {
        label: "Completed",
        color: "bg-emerald-100 text-emerald-800",
        icon: <CheckCircle2 className="w-4 h-4" />,
      },
      CANCELLED: {
        label: "Cancelled",
        color: "bg-red-100 text-red-800",
        icon: <XCircle className="w-4 h-4" />,
      },
      default: {
        label: status,
        color: "bg-gray-100 text-gray-800",
        icon: null,
      },
    };

    const { label, color, icon } = config[status] || config.default;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold ${color}`}
      >
        {icon}
        {label}
      </span>
    );
  };

  if (loading) return <LoadingScreen />;
  if (!data) return <NotFoundScreen mobile={mobile} router={router} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-10 flex items-center gap-3 text-emerald-700 hover:text-emerald-900 font-bold text-lg transition"
        >
          <ArrowLeft className="w-6 h-6" />
          Back to Assignees
        </button>

        {/* Profile Card */}
        <ProfileCard data={data} />

        {/* Assigned POs Section */}
        <div className="mt-16">
          <h2 className="text-4xl font-black text-slate-800 mb-8 flex items-center gap-4">
            <Package className="w-10 h-10 text-emerald-600" />
            Assigned Purchase Orders ({assignments.length})
          </h2>

          {assignments.length === 0 ? (
            <div className="text-center py-20 bg-white/70 backdrop-blur rounded-3xl">
              <Package className="w-20 h-20 text-slate-300 mx-auto mb-4" />
              <p className="text-xl text-slate-600">No assignments yet</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {assignments.map((po) => (
                <div
                  key={po.id}
                  className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-300"
                >
                  <div className="p-8">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      {/* Left: Crop + Company */}
                      <div className="flex items-start gap-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center shadow-lg">
                          {po.companyLogo ? (
                            <img
                              src={po.companyLogo}
                              alt={po.companyName}
                              className="w-16 h-16 rounded-xl object-contain"
                            />
                          ) : (
                            <Building2 className="w-12 h-12 text-emerald-700" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-slate-800">
                            {po.cropName}
                          </h3>
                          <p className="text-lg text-slate-600 font-medium flex items-center gap-2 mt-1">
                            <Building2 className="w-5 h-5" />
                            {po.companyName}
                          </p>
                        </div>
                      </div>

                      {/* Right: Details */}
                      <div className="flex flex-col md:flex-row gap-6 text-right md:text-left">
                        <div>
                          <p className="text-sm text-slate-500">
                            Promised Date
                          </p>
                          <p className="text-xl font-bold text-slate-800 flex items-center gap-2 justify-end md:justify-start">
                            <CalendarDays className="w-5 h-5 text-emerald-600" />
                            {new Date(po.promisedDate).toLocaleDateString(
                              "en-IN"
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Quantity</p>
                          <p className="text-xl font-bold text-slate-800 flex items-center gap-2 justify-end md:justify-start">
                            <Weight className="w-5 h-5 text-cyan-600" />
                            {po.promisedQuantity}{" "}
                            {po.promisedQuantityMeasure === "QUINTAL"
                              ? "Qtl"
                              : "TON"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Rate</p>
                          <p className="text-xl font-bold text-emerald-600">
                            ₹{parseFloat(po.rate).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge - Bottom */}
                    <div className="mt-8 flex justify-center md:justify-end">
                      <StatusBadge status={po.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Reusable Components
function ProfileCard({ data }: { data: AssigneeInfo }) {
  return (
    <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/40">
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 px-8 py-16 text-white">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="relative">
            <div className="w-44 h-44 bg-white/25 backdrop-blur-md rounded-full flex items-center justify-center border-8 border-white/40 shadow-2xl">
              {data.avatar ? (
                <img
                  src={data.avatar}
                  alt={data.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-28 h-28 text-white/90" />
              )}
            </div>
            <div className="absolute bottom-2 right-2 bg-green-500 text-white rounded-full p-3 shadow-xl">
              <CheckCircle2 className="w-8 h-8" />
            </div>
          </div>

          <div className="text-center md:text-left flex-1">
            <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tight">
              {data.name}
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-4 text-2xl font-mono font-bold mb-4">
              <Phone className="w-8 h-8" />
              {data.mobile}
            </div>
            <div className="flex items-center justify-center md:justify-start gap-3 text-emerald-100 text-lg">
              <MapPin className="w-7 h-7" />
              <span className="font-medium">
                {data.village}, {data.district}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 md:p-12 grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard
          icon={<Package />}
          label="Total Assignments"
          value={data.totalPOs}
          gradient="from-emerald-500 to-emerald-600"
        />
        <StatCard
          icon={<CheckCircle2 />}
          label="Active POs"
          value={data.activePOs}
          gradient="from-green-500 to-emerald-600"
        />
        <StatCard
          icon={<XCircle />}
          label="Cancelled"
          value={data.cancelledPOs}
          gradient="from-red-500 to-rose-600"
        />
        <StatCard
          icon={<Truck />}
          label="Total Qty"
          value={`${data.totalQuantityTon} TON`}
          gradient="from-cyan-500 to-blue-600"
          big
        />
      </div>

      <div className="px-12 pb-12 text-center">
        <p className="text-lg text-slate-600 flex items-center justify-center gap-3 font-medium">
          <CheckCircle2 className="w-7 h-7 text-emerald-600" />
          Field-verified assignee • Trusted supplier on Markhet
        </p>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, gradient, big = false }: any) {
  return (
    <div
      className={`bg-gradient-to-br ${gradient} text-white rounded-3xl p-8 shadow-xl hover:scale-105 transition-all duration-300`}
    >
      <div className="opacity-90 mb-4">{icon}</div>
      <p className="text-sm font-medium opacity-90">{label}</p>
      <p
        className={`font-black mt-3 ${
          big ? "text-5xl" : "text-4xl"
        } tracking-tight`}
      >
        {value}
      </p>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-28 h-28 bg-white/80 backdrop-blur rounded-full shadow-2xl mx-auto mb-6 animate-pulse flex items-center justify-center">
          <User className="w-14 h-14 text-emerald-600" />
        </div>
        <p className="text-xl font-semibold text-slate-700">
          Loading profile...
        </p>
      </div>
    </div>
  );
}

function NotFoundScreen({ mobile, router }: any) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-28 h-28 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-16 h-16 text-red-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-3">
          Assignee Not Found
        </h2>
        <p className="text-slate-600 mb-8">
          No profile found for mobile: {mobile}
        </p>
        <button
          onClick={() => router.back()}
          className="px-10 py-4 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition font-semibold shadow-lg"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
