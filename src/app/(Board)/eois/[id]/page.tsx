"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Package,
  IndianRupee,
  Droplets,
  FileText,
  Shield,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Users,
  Phone,
  Clock,
  UserCheck,
  UserX,
  Eye,
  Check,
  Map,
  Globe,
  Languages,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle,
  X,
  Link2,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

import { useRouter } from "next/navigation";
import OrderForm from "@/src/components/form/OrderForm";

const cropNamesKannada: Record<string, string> = {
  maize: "ಮೆಕ್ಕೆಜೋಳ",
  sunflower: "ಸೂರ್ಯಕಾಂತಿ",
  banana: "ಬಾಳೆಣ್ಣು",
  turmeric: "ಅರಿಶಿನ",
  "dry coconut": "ಒಣ ತೆಂಗು",
  "tender coconut": "ಎಳನೀರು",
};

// CompanyOrderMessage Component
const CompanyOrderMessage = ({ order }: { order: PurchaseOrder }) => {
  const [isCopying, setIsCopying] = useState(false);

  const generateMessage = () => {
    const link = `https://oneroot.farm/buyer/order/${order.id}`;
    const cropNameKannada =
      cropNamesKannada[order.cropName.toLowerCase()] || order.cropName;

    const message = `${
      order.companyName
    } ಕಂಪನಿ ಈಗ ${cropNameKannada} ಖರೀದಿಗೆ ಸಿದ್ಧವಾಗಿದೆ! .

🏢 ಕಂಪನಿ: ${order.companyName}
💰 ಬೆಲೆ: ₹${order.price_rate?.toLocaleString()} / ${order.price_measure}
📦 ಪರಿಮಾಣ: ${order.minQuantity} ${order.measure}

📍 ಲಿಂಕ್: ${link}
ಹೆಚ್ಚಿನ ಮಾಹಿತಿಗಾಗಿ ಲಿಂಕ್ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ.

ಧನ್ಯವಾದಗಳು!! ಮಾರಖೇತ್ ಆಪ್‌ !!`;

    console.log("📝 GENERATED MESSAGE:", message);
    return message;
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    console.log("🖱️ COPY BUTTON CLICKED!");
    setIsCopying(true);

    try {
      const message = generateMessage();

      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(message);
        console.log("✅ CLIPBOARD API SUCCESS!");
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = message;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
        console.log("✅ FALLBACK COPY SUCCESS!");
      }

      toast.success(
        (t) => (
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <div className="font-bold text-sm">✅ COPIED TO CLIPBOARD!</div>
              <div className="text-xs text-green-700 mt-1 truncate max-w-[250px]">
                "{message.substring(0, 50)}..."
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Paste in WhatsApp 👆
              </div>
            </div>
          </div>
        ),
        {
          duration: 6000,
          position: "top-center",
          style: {
            background: "white",
            padding: "12px 16px",
            borderRadius: "12px",
            border: "2px solid #10b981",
            boxShadow: "0 10px 25px rgba(16, 185, 129, 0.2)",
          },
        }
      );
    } catch (err) {
      console.error("❌ COPY FAILED:", err);
      toast.error(
        (t) => (
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <div>
              <div className="font-bold">❌ Copy Failed!</div>
              <div className="text-xs text-gray-600">
                Try again or copy manually
              </div>
            </div>
          </div>
        ),
        {
          duration: 4000,
          position: "top-center",
          style: {
            background: "white",
            padding: "12px 16px",
            borderRadius: "12px",
            border: "2px solid #ef4444",
          },
        }
      );
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <button
      onClick={handleCopy}
      disabled={isCopying}
      className={`w-44  mt-2 relative overflow-hidden transition-all duration-300 ease-out group  ${
        isCopying ? "scale-95" : "border biorder-black hover:scale-105"
      } text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl z-50`}
    >
      <div className="flex items-center justify-center space-x-2 relative z-10">
        {isCopying ? (
          <CheckCircle className="w-4 h-4 animate-pulse" />
        ) : (
          <Copy className="w-4 h-4 group-hover:scale-110 transition-transform" />
        )}
        <span className="text-sm text-black">
          {isCopying ? "✅ Copied!" : "📋 Copy Message"}
        </span>
      </div>
      {isCopying && (
        <div className="absolute inset-0 bg-white/20 animate-ping rounded-xl"></div>
      )}
    </button>
  );
};

interface Interest {
  id: string;
  quantity: string;
  commitDate: string;
  user: {
    id: string;
    name: string;
    profileImage: string | null;
    userStatus: string;
    notes: string | null;
    latitude: number;
    longitude: number;
    village: string;
    taluk: string;
    district: string;
    state: string;
    pincode: string;
    mobileNumber: string;
    language: string;
    identity: string;
    isVerified: boolean;
    onApp: boolean;
    cropNames: string[];
    activity: number;
    lastActiveAt: string;
    score: number;
    userPlan: string;
    createdAt: string;
    updatedAt: string;
  };
}

interface PurchaseOrder {
  id: string;
  companyName: string;
  village: string;
  taluk: string;
  district: string;
  state: string;
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
  createdAt: string;
  updatedAt: string;
  interests: Interest[];
}

// Language configuration
const LANGUAGES = [
  { value: "en", label: "English", icon: "🇺🇸", code: "EN" },
  { value: "kn", label: "Kannada", icon: "🇮🇳", code: "KN" },
  { value: "te", label: "Telugu", icon: "🇮🇳", code: "TE" },
] as const;

type Language = (typeof LANGUAGES)[number]["value"];

const fetchPurchaseOrder = async (id: string): Promise<PurchaseOrder> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/po/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch purchase order details");
  }
  return response.json();
};

const PurchaseOrderDetails: React.FC = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(
    null
  );

  // Language selection states
  const [selectedSpecificationLanguage, setSelectedSpecificationLanguage] =
    useState<Language>("en");
  const [selectedTermsLanguage, setSelectedTermsLanguage] =
    useState<Language>("en");
  const [isSpecificationExpanded, setIsSpecificationExpanded] = useState(false);
  const [isTermsExpanded, setIsTermsExpanded] = useState(false);
  const router = useRouter();

  // New state for find buyer
  const [distanceKm, setDistanceKm] = useState("");
  const [nearbyBuyers, setNearbyBuyers] = useState<any[]>([]);
  const [buyersMeta, setBuyersMeta] = useState<any>(null);
  const [showBuyersModal, setShowBuyersModal] = useState(false);

  const {
    data: order,
    isLoading: orderLoading,
    error: orderError,
  } = useQuery<PurchaseOrder>({
    queryKey: ["purchaseOrder", id],
    queryFn: () => fetchPurchaseOrder(id as string),
  });

  // Mock authData (replace with real auth context in production)
  const authData = { accessToken: "mock-token" };

  // Determine initial language selection based on available content
  React.useEffect(() => {
    if (order) {
      // For specifications
      if (order.specification_kn && !order.specification_en) {
        setSelectedSpecificationLanguage("kn");
      } else if (
        order.specification_te &&
        !order.specification_en &&
        !order.specification_kn
      ) {
        setSelectedSpecificationLanguage("te");
      } else {
        setSelectedSpecificationLanguage("en");
      }

      // For terms
      if (order.termsAndConditions_kn && !order.termsAndConditions_en) {
        setSelectedTermsLanguage("kn");
      } else if (
        order.termsAndConditions_te &&
        !order.termsAndConditions_en &&
        !order.termsAndConditions_kn
      ) {
        setSelectedTermsLanguage("te");
      } else {
        setSelectedTermsLanguage("en");
      }
    }
  }, [order]);

  const openEditModal = (orderData: PurchaseOrder) => {
    setSelectedOrder(orderData);
    setIsEditMode(true);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedOrder(null);
    setIsEditMode(false);
  };

  const handleEditSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["purchaseOrder", id] });
    queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
    closeEditModal();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCommitDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Fixed getStatusColor function to handle actual API values
  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "not_approved":
      case "notapproved":
      case "not-approved":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Fixed status display function
  const getStatusDisplay = (status: string): string => {
    switch (status.toLowerCase()) {
      case "not_approved":
      case "notapproved":
      case "not-approved":
        return "Not Approved";
      case "approved":
        return "Approved";
      case "pending":
        return "Pending";
      default:
        return status.replace(/_/g, " ");
    }
  };

  // Fixed isNotApproved check
  const isNotApprovedStatus = (status: string): boolean => {
    const statusLower = status.toLowerCase();
    return (
      statusLower === "not_approved" ||
      statusLower === "notapproved" ||
      statusLower === "not-approved"
    );
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    if (isNotApprovedStatus(statusLower)) {
      return <UserX className="w-3 h-3 mr-1" />;
    }
    if (statusLower === "approved") {
      return <UserCheck className="w-3 h-3 mr-1" />;
    }
    return <Clock className="w-3 h-3 mr-1" />;
  };

  const getUserInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Improved crop names display
  const getCropNamesDisplay = (cropNames: string[]): string => {
    if (!cropNames || cropNames.length === 0) {
      return "General Buyer";
    }
    if (cropNames.length === 1) {
      return cropNames[0];
    }
    if (cropNames.length === 2) {
      return `${cropNames[0]}, ${cropNames[1]}`;
    }
    return `${cropNames[0]} +${cropNames.length - 1} more`;
  };

  // Get specification content for a specific language
  const getSpecificationContent = (language: Language): string => {
    if (!order) return "";
    switch (language) {
      case "en":
        return order.specification_en || "";
      case "kn":
        return order.specification_kn || "";
      case "te":
        return order.specification_te || "";
      default:
        return order.specification_en || "";
    }
  };

  // Get terms content for a specific language
  const getTermsContent = (language: Language): string => {
    if (!order) return "";
    switch (language) {
      case "en":
        return order.termsAndConditions_en || "";
      case "kn":
        return order.termsAndConditions_kn || "";
      case "te":
        return order.termsAndConditions_te || "";
      default:
        return order.termsAndConditions_en || "";
    }
  };

  // Check if any specification content exists
  const hasAnySpecification = () => {
    return !!(
      order?.specification_en ||
      order?.specification_kn ||
      order?.specification_te
    );
  };

  // Check if any terms content exists
  const hasAnyTerms = () => {
    return !!(
      order?.termsAndConditions_en ||
      order?.termsAndConditions_kn ||
      order?.termsAndConditions_te
    );
  };

  // Get language status for specifications
  const getSpecificationLanguageStatus = () => {
    const statuses = LANGUAGES.map((lang) => ({
      ...lang,
      hasContent: !!getSpecificationContent(lang.value),
      isSelected: lang.value === selectedSpecificationLanguage,
    }));
    return statuses;
  };

  // Get language status for terms
  const getTermsLanguageStatus = () => {
    const statuses = LANGUAGES.map((lang) => ({
      ...lang,
      hasContent: !!getTermsContent(lang.value),
      isSelected: lang.value === selectedTermsLanguage,
    }));
    return statuses;
  };

  // Find nearby buyers mutation
  const findNearbyBuyersMutation = useMutation({
    mutationFn: async (payload: {
      latitude: number;
      longitude: number;
      distanceKm: number;
      cropName: string;
      page?: number;
      limit?: number;
    }) => {
      const url = new URL(
        `${process.env.NEXT_PUBLIC_API_URL}/users/find-buyers-nearby`
      );
      url.searchParams.append("page", (payload.page || 1).toString());
      url.searchParams.append("limit", (payload.limit || 10).toString()); // Changed from 1 to 10

      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authData.accessToken}`,
        },
        body: JSON.stringify({
          latitude: payload.latitude,
          longitude: payload.longitude,
          distanceKm: payload.distanceKm,
          cropName: payload.cropName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to find buyers");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setNearbyBuyers(data.data.buyers || []);
      setBuyersMeta(data.data.meta);
      setShowBuyersModal(true);
      toast.success(
        `Found ${data.data.totalCount} buyers within ${data.data.searchRadius}km!`
      );
    },
    onError: (error: any) => {
      toast.error(`Failed to find buyers: ${error.message}`);
    },
  });

  // TypeScript quirk: ensure we can read isLoading reliably in this file.
  // Narrow to `any` here to avoid a mismatched generic type error from the
  // project's React Query types while preserving runtime behavior.
  const isFindingNearbyBuyers = (findNearbyBuyersMutation as any)
    .isLoading as boolean;

  const fetchBuyers = (page = 1) => {
    if (!order) return;

    let lat: number | undefined;
    let lng: number | undefined;

    if (order.coordinates?.coordinates?.length === 2) {
      [lng, lat] = order.coordinates.coordinates;
    }

    if (!lat || !lng) {
      toast.error("Coordinates not available");
      return;
    }

    findNearbyBuyersMutation.mutate({
      latitude: lat,
      longitude: lng,
      distanceKm: parseFloat(distanceKm),
      cropName: order.cropName,
      page,
      limit: 10, // Changed from 1 to 10
    });
  };

  const LoadingSkeleton = () => (
    <div className="animate-pulse space-y-4">
      {/* Company Header */}
      <div className="flex items-center space-x-3 p-4 bg-gray-100 rounded-xl">
        <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
        <div className="space-y-1 flex-1">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="flex space-x-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
        </div>
      </div>

      {/* Compact Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-1">
            <div className="h-2 bg-gray-200 rounded w-16"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>

      {/* Language Sections Skeleton */}
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    </div>
  );

  const ErrorState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center space-y-4 p-4 text-center">
      <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
        <svg
          className="w-6 h-6 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-gray-900">
          Something went wrong
        </h3>
        <p className="text-sm text-gray-600 max-w-sm">{message}</p>
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center space-y-4 p-4 text-center">
      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
        <Package className="w-6 h-6 text-gray-400" />
      </div>
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-base-semibold text-gray-900">
          Order Not Found
        </h3>
        <p className="text-sm text-gray-600">
          The purchase order doesn't exist.
        </p>
      </div>
    </div>
  );

  if (orderLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="max-w-6xl mx-auto">
          <Header />
          <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-200 mt-6">
            <div className="p-4">
              <LoadingSkeleton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (orderError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="max-w-6xl mx-auto">
          <Header />
          <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-200 mt-6 flex items-center justify-center p-8">
            <ErrorState message={(orderError as Error).message} />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="max-w-6xl mx-auto">
          <Header />
          <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-200 mt-6 flex items-center justify-center p-8">
            <EmptyState />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4">
      <Toaster />
      <div className="max-w-8xl mx-auto">
        <Header />

        {/* Compact Card - No Scroll */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200 mt-6 relative">
          {/* Company Header - Compact with Edit Button */}
          <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  {order.company_logo ? (
                    <img
                      src={order.company_logo}
                      alt={`${order.companyName} logo`}
                      className="w-12 h-12 rounded-xl object-cover shadow-md ring-1 ring-white"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md ring-1 ring-white">
                      <span className="text-white text-sm font-bold">
                        {order.companyName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold text-gray-900 truncate pr-2">
                    {order.companyName}
                  </h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        order.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full mr-1 ${
                          order.isActive ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></div>
                      <span>{order.isActive ? "Active" : "Inactive"}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Date Info */}
              <div className="flex items-center space-x-2 text-xs text-gray-500 min-w-0">
                <Calendar className="w-3 h-3" />
                <span className="truncate">{formatDate(order.createdAt)}</span>
                <span className="mx-1">•</span>
                <span className="truncate">{formatDate(order.expiresAt)}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => openEditModal(order)}
                  className="group relative inline-flex items-center space-x-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-sm shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  <Edit2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Edit</span>
                </button>

                <button
                  className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg font-medium text-sm shadow-sm transition-all duration-200 transform ${
                    order.isActive
                      ? "bg-green-500 hover:bg-green-600 text-white hover:shadow-md hover:-translate-y-0.5"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700 hover:shadow-md hover:-translate-y-0.5"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      order.isActive ? "bg-white" : "bg-gray-400"
                    }`}
                  ></div>
                  <span>{order.isActive ? "Active" : "Inactive"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* NEW COPY BUTTON - ADDED HERE */}
          <div className="p-4 flex justify-between items-center border-b border-gray-200 ">
            <CompanyOrderMessage order={order} />

            <div className=" items-center gap-2 flex justify-end  px-4">
              <input
                type="number"
                placeholder="Enter km"
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                className="w-40 px-3 py-2 text-sm border rounded-md"
                min={1}
                max={500}
              />
              <button
                onClick={() => {
                  if (!distanceKm || parseFloat(distanceKm) <= 0) {
                    toast.error("Enter valid km");
                    return;
                  }
                  fetchBuyers(1); // Always start from page 1
                }}
                disabled={isFindingNearbyBuyers}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${
                  isFindingNearbyBuyers
                    ? "bg-gray-400 text-white"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {isFindingNearbyBuyers ? "Searching..." : "Find Buyers"}
              </button>
            </div>
          </div>

          {/* Compact Information Grid */}
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Location Details - Full Width */}
            <div className="sm:col-span-2 lg:col-span-4 bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="w-4 h-4 text-gray-600" />
                <h4 className="text-xs font-semibold text-gray-800 uppercase tracking-wide">
                  Location
                </h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="text-xs text-gray-500">Village</span>
                  <p className="font-medium text-gray-900">{order.village}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-gray-500">Taluk</span>
                  <p className="font-medium text-gray-900">{order.taluk}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-gray-500">District</span>
                  <p className="font-medium text-gray-900">{order.district}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-gray-500">State</span>
                  <p className="font-medium text-gray-900">{order.state}</p>
                </div>
              </div>
            </div>

            {/* Crop Details */}
            <div className="bg-green-50 rounded-lg p-3 border border-green-100">
              <div className="flex items-center space-x-2 mb-1">
                <Package className="w-3 h-3 text-green-600" />
                <h4 className="text-xs font-semibold text-green-800 uppercase tracking-wide">
                  Crop
                </h4>
              </div>
              <p className="text-sm font-medium text-gray-900 truncate">
                {order.cropName}
              </p>
              {order.cropVariety && (
                <p className="text-xs text-green-700 truncate">
                  {order.cropVariety}
                </p>
              )}
            </div>

            {/* Quantity */}
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <div className="flex items-center space-x-2 mb-1">
                <Package className="w-3 h-3 text-blue-600" />
                <h4 className="text-xs font-semibold text-blue-800 uppercase tracking-wide">
                  Quantity
                </h4>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {order.minQuantity.toLocaleString()}
              </p>
              <p className="text-xs text-gray-600">
                {order.unit} {order.measure}
              </p>
            </div>

            {/* Price */}
            {order.price_rate && (
              <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                <div className="flex items-center space-x-2 mb-1">
                  <IndianRupee className="w-3 h-3 text-indigo-600" />
                  <h4 className="text-xs font-semibold text-indigo-800 uppercase tracking-wide">
                    Price
                  </h4>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  ₹{order.price_rate.toLocaleString()}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  per {order.price_measure}
                </p>
              </div>
            )}

            {/* Moisture */}
            {order.moisturePercent && (
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                <div className="flex items-center space-x-2 mb-1">
                  <Droplets className="w-3 h-3 text-purple-600" />
                  <h4 className="text-xs font-semibold text-purple-800 uppercase tracking-wide">
                    Moisture
                  </h4>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {order.moisturePercent}%
                </p>
              </div>
            )}

            {/* Quality */}
            {order.quality && (
              <div className="bg-rose-50 rounded-lg p-3 border border-rose-100">
                <div className="flex items-center space-x-2 mb-1">
                  <Shield className="w-3 h-3 text-rose-600" />
                  <h4 className="text-xs font-semibold text-rose-800 uppercase tracking-wide">
                    Quality
                  </h4>
                </div>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {order.quality}
                </p>
              </div>
            )}
          </div>

          {/* Multi-Language Specifications Section */}
          {hasAnySpecification() && (
            <div className="sm:col-span-2 lg:col-span-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-b-lg p-4 border-t border-yellow-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-yellow-600" />
                  <h4 className="text-sm font-semibold text-yellow-800 uppercase tracking-wide">
                    Specifications
                  </h4>
                </div>

                {/* Language Selector */}
                <div className="flex items-center space-x-1">
                  <div className="flex space-x-1 bg-white rounded-lg p-1 border border-yellow-200">
                    {LANGUAGES.map((lang) => {
                      const hasContent = !!getSpecificationContent(lang.value);
                      const isSelected =
                        lang.value === selectedSpecificationLanguage;
                      return (
                        <button
                          key={lang.value}
                          onClick={() =>
                            setSelectedSpecificationLanguage(lang.value)
                          }
                          className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs transition-all duration-200 ${
                            isSelected
                              ? "bg-yellow-500 text-white shadow-sm"
                              : hasContent
                              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                              : "text-gray-400 hover:text-gray-600"
                          }`}
                          title={`${lang.label} ${hasContent ? "✓" : "✗"}`}
                        >
                          <span>{lang.icon}</span>
                          <span>{lang.code}</span>
                          {hasContent && !isSelected && (
                            <Check className="w-3 h-3" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Content Display */}
              <div className="space-y-2">
                {/* Language Indicator */}
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <Globe className="w-3 h-3" />
                  <span className="font-medium">
                    {
                      LANGUAGES.find(
                        (l) => l.value === selectedSpecificationLanguage
                      )?.label
                    }
                  </span>
                  <span className="text-gray-400">
                    (
                    {
                      getSpecificationContent(selectedSpecificationLanguage)
                        .length
                    }{" "}
                    chars)
                  </span>
                </div>

                {/* Content */}
                <div
                  className={`text-xs text-gray-700 leading-relaxed transition-all duration-200 ${
                    isSpecificationExpanded
                      ? "max-h-none"
                      : "max-h-16 overflow-hidden"
                  }`}
                >
                  <p className={isSpecificationExpanded ? "" : "line-clamp-3"}>
                    {getSpecificationContent(selectedSpecificationLanguage) || (
                      <span className="text-gray-400 italic">
                        No content available in this language
                      </span>
                    )}
                  </p>
                </div>

                {/* Expand/Collapse Button */}
                {getSpecificationContent(selectedSpecificationLanguage).length >
                  120 && (
                  <button
                    onClick={() =>
                      setIsSpecificationExpanded(!isSpecificationExpanded)
                    }
                    className="flex items-center space-x-1 text-xs text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
                  >
                    <span>
                      {isSpecificationExpanded ? "Show Less" : "Show More"}
                    </span>
                    {isSpecificationExpanded ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>

              {/* Language Status Summary */}
              <div className="mt-3 pt-3 border-t border-yellow-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    Content in other languages:
                  </span>
                  <div className="flex space-x-2">
                    {getSpecificationLanguageStatus().map((lang) => {
                      if (lang.isSelected) return null;
                      return (
                        <span
                          key={lang.value}
                          className={`px-2 py-1 rounded-full ${
                            lang.hasContent
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {lang.code}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Multi-Language Terms & Conditions Section */}
          {hasAnyTerms() && (
            <div className="sm:col-span-2 lg:col-span-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-b-lg p-4 border-t border-rose-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-rose-600" />
                  <h4 className="text-sm font-semibold text-rose-800 uppercase tracking-wide">
                    Terms & Conditions
                  </h4>
                </div>

                {/* Language Selector */}
                <div className="flex items-center space-x-1">
                  <div className="flex space-x-1 bg-white rounded-lg p-1 border border-rose-200">
                    {LANGUAGES.map((lang) => {
                      const hasContent = !!getTermsContent(lang.value);
                      const isSelected = lang.value === selectedTermsLanguage;
                      return (
                        <button
                          key={lang.value}
                          onClick={() => setSelectedTermsLanguage(lang.value)}
                          className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs transition-all duration-200 ${
                            isSelected
                              ? "bg-rose-500 text-white shadow-sm"
                              : hasContent
                              ? "bg-rose-100 text-rose-800 hover:bg-rose-200"
                              : "text-gray-400 hover:text-gray-600"
                          }`}
                          title={`${lang.label} ${hasContent ? "✓" : "✗"}`}
                        >
                          <span>{lang.icon}</span>
                          <span>{lang.code}</span>
                          {hasContent && !isSelected && (
                            <Check className="w-3 h-3" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Content Display */}
              <div className="space-y-2">
                {/* Language Indicator */}
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <Globe className="w-3 h-3" />
                  <span className="font-medium">
                    {
                      LANGUAGES.find((l) => l.value === selectedTermsLanguage)
                        ?.label
                    }
                  </span>
                  <span className="text-gray-400">
                    ({getTermsContent(selectedTermsLanguage).length} chars)
                  </span>
                </div>

                {/* Content */}
                <div
                  className={`text-xs text-gray-700 leading-relaxed transition-all duration-200 ${
                    isTermsExpanded ? "max-h-none" : "max-h-16 overflow-hidden"
                  }`}
                >
                  <p className={isTermsExpanded ? "" : "line-clamp-3"}>
                    {getTermsContent(selectedTermsLanguage) || (
                      <span className="text-gray-400 italic">
                        No content available in this language
                      </span>
                    )}
                  </p>
                </div>

                {/* Expand/Collapse Button */}
                {getTermsContent(selectedTermsLanguage).length > 120 && (
                  <button
                    onClick={() => setIsTermsExpanded(!isTermsExpanded)}
                    className="flex items-center space-x-1 text-xs text-rose-600 hover:text-rose-700 font-medium transition-colors"
                  >
                    <span>{isTermsExpanded ? "Show Less" : "Show More"}</span>
                    {isTermsExpanded ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>

              {/* Language Status Summary */}
              <div className="mt-3 pt-3 border-t border-rose-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    Content in other languages:
                  </span>
                  <div className="flex space-x-2">
                    {getTermsLanguageStatus().map((lang) => {
                      if (lang.isSelected) return null;
                      return (
                        <span
                          key={lang.value}
                          className={`px-2 py-1 rounded-full ${
                            lang.hasContent
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {lang.code}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Buyers Modal */}
        {showBuyersModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-[1500px] max-h-[90vh] overflow-y-auto">
              <div className="p-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-xl font-bold">
                      Nearby Buyers (
                      {buyersMeta?.totalItems || nearbyBuyers.length})
                    </h3>
                    <p className="text-green-100">
                      Within {distanceKm}km of {order.cropName} • Page{" "}
                      {buyersMeta?.currentPage || 1} of{" "}
                      {buyersMeta?.totalPages || 1}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowBuyersModal(false);
                      setNearbyBuyers([]);
                      setDistanceKm("");
                    }}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                {nearbyBuyers.length > 0 ? (
                  <table className="w-full table-auto border">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border px-4 py-3 text-left text-xs font-semibold">
                          Buyer
                        </th>
                        <th className="border px-4 py-3 text-left text-xs font-semibold">
                          Village
                        </th>
                        <th className="border px-4 py-3 text-left text-xs font-semibold">
                          Taluk
                        </th>
                        <th className="border px-4 py-3 text-left text-xs font-semibold">
                          District
                        </th>
                        <th className="border px-4 py-3 text-left text-xs font-semibold">
                          Mobile
                        </th>
                        <th className="border px-4 py-3 text-left text-xs font-semibold">
                          Crops
                        </th>
                        <th className="border px-4 py-3 text-left text-xs font-semibold">
                          Distance
                        </th>
                        <th className="border px-4 py-3 text-left text-xs font-semibold">
                          Share
                        </th>
                        <th className="border px-4 py-3 text-left text-xs font-semibold">
                          Buyer Page
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {nearbyBuyers.map((buyer) => (
                        <tr key={buyer.id}>
                          <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                            {/* Name */}
                            <p className="font-semibold text-gray-900">
                              {buyer.name}
                            </p>

                            {/* Plan & Date */}
                            <div className="mt-1 text-xs text-gray-500 flex items-center gap-2">
                              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                {buyer.userPlan || "Free Plan"}
                              </span>
                              <span>•</span>
                              <span>
                                {new Date(buyer.createdAt)
                                  .toLocaleDateString("en-US", {
                                    year: "2-digit",
                                    month: "short",
                                    day: "2-digit",
                                  })
                                  .replace(",", "")
                                  .replace(" ", "-")}
                              </span>
                            </div>
                          </td>
                          <td className="border px-4 py-3 text-sm">
                            {buyer.village}
                          </td>
                          <td className="border px-4 py-3 text-sm">
                            {buyer.taluk}
                          </td>
                          <td className="border px-4 py-3 text-sm">
                            {buyer.district}
                          </td>
                          <td className="border px-4 py-3 text-sm">
                            {buyer.mobileNumber}
                          </td>
                          <td className="border px-4 py-3 text-sm">
                            {buyer.cropNames.map((c: string) => (
                              <span
                                key={c}
                                className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-1"
                              >
                                {c}
                              </span>
                            ))}
                          </td>
                          <td className="border px-4 py-3 text-sm">
                            {buyer.distanceKm.toFixed(1)}km
                          </td>
                          <td className="border px-4 py-3 text-sm">
                            <button
                              onClick={() => {
                                const cropKey = order.cropName?.toLowerCase();

                                const message = `🌾 ${
                                  cropNamesKannada[cropKey] || order.cropName
                                } ಕ್ಕಾಗಿ, ಈ ಖರೀದಿದಾರರನ್ನು ಸಂಪರ್ಕಿಸಿ 👇

📍 ಗ್ರಾಮ: ${buyer.village}
🏢 ತಾಲೂಕು: ${buyer.taluk}
🌆 ಜಿಲ್ಲೆ: ${buyer.district}

🔗 ಲಿಂಕ್: https://oneroot.farm/farmer/buyer/${buyer.id}
ಲಿಂಕ್ ಮೂಲಕ ವ್ಯಾಪಾರಸ್ಥರೊಂದಿಗೆ ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸಿ ಮತ್ತು ವ್ಯವಹರಿಸಿ!

🙏 ಧನ್ಯವಾದಗಳು,
ಮಾರ್ಕೆಟ್ ಆಪ್‌ 🚜`;

                                navigator.clipboard.writeText(message);
                                toast.success(
                                  "Message copied! 📝 Paste in WhatsApp"
                                );
                              }}
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors ml-5"
                              title="Copy Message"
                            >
                              <Link2 className="w-5 h-5" />
                            </button>
                          </td>

                          <td className="border px-4 py-3 text-sm">
                            <div
                              onClick={() => {
                                router.push(`/user/buyer/${buyer.id}`);
                              }}
                              className="text-blue-600 cursor-pointer hover:underline"
                            >
                              View Buyer Page
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-center py-12 text-gray-500">
                    No buyers found
                  </p>
                )}
              </div>

              {/* PAGINATION */}
              {buyersMeta && buyersMeta.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4 px-6">
                  <div className="text-sm text-gray-700">
                    Showing {(buyersMeta.currentPage - 1) * 10 + 1} to{" "}
                    {Math.min(
                      buyersMeta.currentPage * 10,
                      buyersMeta.totalItems
                    )}{" "}
                    of {buyersMeta.totalItems} results
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fetchBuyers(buyersMeta.currentPage - 1)}
                      disabled={!buyersMeta.hasPreviousPage}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      &lt;
                    </button>

                    {/* Dynamic Page Buttons */}
                    {(() => {
                      const maxPagesToShow = 5;
                      const currentPage = buyersMeta.currentPage || 1;
                      const totalPages = buyersMeta.totalPages || 1;
                      const halfRange = Math.floor(maxPagesToShow / 2);

                      let startPage = Math.max(1, currentPage - halfRange);
                      let endPage = Math.min(
                        totalPages,
                        startPage + maxPagesToShow - 1
                      );

                      // Adjust startPage to ensure 5 pages are shown when possible
                      if (endPage - startPage + 1 < maxPagesToShow) {
                        startPage = Math.max(1, endPage - maxPagesToShow + 1);
                      }

                      const pageNumbers = Array.from(
                        { length: endPage - startPage + 1 },
                        (_, i) => startPage + i
                      );

                      return pageNumbers.map((page) => (
                        <button
                          key={page}
                          onClick={() => fetchBuyers(page)}
                          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            buyersMeta.currentPage === page
                              ? "bg-green-600 text-white shadow-md"
                              : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      ));
                    })()}

                    <button
                      onClick={() => fetchBuyers(buyersMeta.currentPage + 1)}
                      disabled={!buyersMeta.hasNextPage}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      &gt;
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Interests Table Section */}
        {order.interests && order.interests.length > 0 && (
          <div className="mt-6 bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
            {/* Interests Header */}
            <div className="p-6 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-100 rounded-xl">
                    <Users className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Buyer Interests
                    </h3>
                    <p className="text-sm text-gray-600">
                      {order.interests.length} buyer
                      {order.interests.length !== 1 ? "s" : ""} interested
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interests Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Buyer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Commit Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      createdAt
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      updatedAt
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Location
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.interests.map((interest) => {
                    const user = interest.user;
                    const statusClass = getStatusColor(user.userStatus);
                    const isNotApproved = isNotApprovedStatus(user.userStatus);
                    const initials = getUserInitials(user.name);
                    const statusDisplay = getStatusDisplay(user.userStatus);
                    const cropNamesDisplay = getCropNamesDisplay(
                      user.cropNames
                    );

                    return (
                      <tr key={interest.id} className="hover:bg-gray-50">
                        {/* Buyer Column */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {user.profileImage ? (
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={user.profileImage}
                                  alt={user.name}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                                  {initials}
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.name}
                              </div>
                              <div className="text-xs text-gray-500 truncate max-w-32">
                                {cropNamesDisplay}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Quantity Column */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            {parseFloat(interest.quantity).toLocaleString()}{" "}
                            {order.measure}
                          </div>
                        </td>

                        {/* Commit Date Column */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 text-gray-400 mr-2" />
                            <span>{formatCommitDate(interest.commitDate)}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 text-gray-400 mr-2" />
                            <span>
                              {formatCommitDate(interest.user.createdAt)}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 text-gray-400 mr-2" />
                            <span>
                              {formatCommitDate(interest.user.updatedAt)}
                            </span>
                          </div>
                        </td>

                        {/* Status Column */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusClass}`}
                          >
                            {getStatusIcon(user.userStatus)}
                            {statusDisplay}
                          </span>
                        </td>

                        {/* Contact Column */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 text-gray-400 mr-2" />
                            <a
                              href={`tel:${user.mobileNumber}`}
                              className="text-indigo-600 hover:text-indigo-900 font-medium"
                            >
                              {user.mobileNumber}
                            </a>
                          </div>
                        </td>

                        {/* Location Column */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Map className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                            <div className="text-sm text-gray-900">
                              <div className="font-medium">{user.district}</div>
                              <div className="text-xs text-gray-500">
                                {user.village}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Empty Interests State */}
            {(!order.interests || order.interests.length === 0) && (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No buyer interests yet
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Share this listing with potential buyers to get interest
                  requests.
                </p>
              </div>
            )}
          </div>
        )}

        <div></div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden relative animate-slide-up border border-white/30">
            <div className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-white/30 z-20">
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Edit Purchase Order
                    </h2>
                    <p className="text-sm text-gray-600">
                      Updating order for{" "}
                      <span className="font-medium">
                        {selectedOrder?.companyName}
                      </span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeEditModal}
                  className="group p-2 rounded-2xl bg-white/80 hover:bg-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                >
                  <svg
                    className="w-6 h-6 text-gray-600 group-hover:text-gray-800 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-8 max-h-[75vh] overflow-y-auto">
              <OrderForm
                order={selectedOrder}
                isEditMode={isEditMode}
                onSuccess={handleEditSuccess}
              />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            backdrop-filter: blur(0px);
          }
          to {
            opacity: 1;
            backdrop-filter: blur(12px);
          }
        }
        @keyframes slide-up {
          from {
            transform: translateY(40px) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-slide-up {
          animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

const Header: React.FC = () => {
  const params = useParams();
  return (
    <div className="flex items-center justify-between mb-6 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md border border-white/30">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          Order Details
        </h1>
        <p className="text-sm text-gray-600">Order #{params?.id}</p>
      </div>
      <Link
        href="/eois-card"
        className="group flex items-center space-x-2 px-3 py-2 bg-white hover:bg-gray-50 rounded-lg shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 text-sm"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium text-gray-700 group-hover:text-emerald-600">
          Back to Orders
        </span>
      </Link>
    </div>
  );
};

export default PurchaseOrderDetails;
