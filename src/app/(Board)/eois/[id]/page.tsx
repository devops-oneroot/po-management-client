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
import OrderForm from "@/components/form/OrderForm";
import Poleads from "@/components/chatrace/Poleads";
import AssignInterestForm from "@/components/form/AssignInterestForm";

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

    return message;
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    setIsCopying(true);

    try {
      const message = generateMessage();

      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(message);
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
      }

      toast.success("Message copied to clipboard!", {
        duration: 3000,
        position: "top-center",
      });
    } catch (err) {
      console.error("❌ COPY FAILED:", err);
      toast.error("Failed to copy message", {
        duration: 3000,
        position: "top-center",
      });
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <button
      onClick={handleCopy}
      disabled={isCopying}
      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white rounded-md font-medium shadow-sm transition-colors duration-150 text-sm"
    >
      {isCopying ? (
        <CheckCircle className="w-4 h-4" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
      <span>{isCopying ? "Copied!" : "Copy Message"}</span>
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
  const [activeTab, setActiveTab] = useState<"interests" | "leads">("leads");
  const [editingInterest, setEditingInterest] = useState<Interest | null>(null);
  const [isInterestEditOpen, setIsInterestEditOpen] = useState(false);
  const [editQuantity, setEditQuantity] = useState("");
  const [editCommitDate, setEditCommitDate] = useState("");
  const [showModal, setShowModal] = useState(false);

  const updateInterestMutation = useMutation({
    mutationFn: async (payload: {
      interestId: string;
      quantity: number;
      commitDate: string;
    }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/po-interested/${payload.interestId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authData.accessToken}`,
          },
          body: JSON.stringify({
            userId: editingInterest?.user.id,
            poId: order?.id,
            quantity: payload.quantity,
            commitDate: payload.commitDate,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update interest");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseOrder", id] });
      toast.success("Interest updated successfully!");
      closeInterestEditModal();
    },
    onError: (error: any) => {
      toast.error(`Update failed: ${error.message}`);
    },
  });

  const {
    data: order,
    isLoading: orderLoading,
    error: orderError,
  } = useQuery<PurchaseOrder>({
    queryKey: ["purchaseOrder", id],
    queryFn: () => fetchPurchaseOrder(id as string),
  });

  useEffect(() => {
    if (order && order.interests && order.interests.length > 0) {
      setActiveTab("interests");
    } else {
      setActiveTab("leads");
    }
  }, [order]);

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

  const openInterestEditModal = (interest: Interest) => {
    setEditingInterest(interest);
    setEditQuantity(interest.quantity);
    setEditCommitDate(interest.commitDate.split("T")[0]); // Format YYYY-MM-DD
    setIsInterestEditOpen(true);
  };

  const closeInterestEditModal = () => {
    setIsInterestEditOpen(false);
    setEditingInterest(null);
    setEditQuantity("");
    setEditCommitDate("");
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
        return "bg-green-50 text-green-700 border-green-200";
      case "not_approved":
      case "notapproved":
      case "not-approved":
        return "bg-red-50 text-red-700 border-red-200";
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
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
      url.searchParams.append("limit", (payload.limit || 10).toString());

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
      limit: 10,
    });
  };

  const LoadingSkeleton = () => (
    <div className="animate-pulse space-y-4">
      <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg">
        <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-slate-200 rounded w-32"></div>
          <div className="h-3 bg-slate-100 rounded w-20"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 bg-slate-200 rounded w-16"></div>
            <div className="h-4 bg-slate-100 rounded w-full"></div>
          </div>
        ))}
      </div>
    </div>
  );

  const ErrorState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
      <div className="w-16 h-16 bg-red-50 rounded-lg flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-slate-900">
          Something went wrong
        </h3>
        <p className="text-sm text-slate-600 max-w-sm">{message}</p>
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
      <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
        <Package className="w-8 h-8 text-slate-400" />
      </div>
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-slate-900">
          Order Not Found
        </h3>
        <p className="text-sm text-slate-600">
          The purchase order doesn't exist.
        </p>
      </div>
    </div>
  );

  if (orderLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-6xl mx-auto">
          <Header />
          <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-slate-200 mt-6">
            <div className="p-6">
              <LoadingSkeleton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (orderError) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-6xl mx-auto">
          <Header />
          <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-slate-200 mt-6 flex items-center justify-center p-8">
            <ErrorState message={(orderError as Error).message} />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-6xl mx-auto">
          <Header />
          <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-slate-200 mt-6 flex items-center justify-center p-8">
            <EmptyState />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <Toaster />
      <div className="max-w-8xl mx-auto">
        <Header />

        {/* Main Card */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-slate-200 mt-6">
          {/* Company Header */}
          <div className="p-6 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex-shrink-0">
                  {order.company_logo ? (
                    <img
                      src={order.company_logo}
                      alt={`${order.companyName} logo`}
                      className="w-16 h-16 rounded-lg object-cover shadow-sm"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 bg-slate-200 rounded-lg flex items-center justify-center">
                      <span className="text-slate-600 text-xl font-bold">
                        {order.companyName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-slate-900">
                    {order.companyName}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                        order.isActive
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          order.isActive ? "bg-green-500" : "bg-slate-400"
                        }`}
                      ></div>
                      {order.isActive ? "Active" : "Inactive"}
                    </span>
                    <span className="text-xs text-slate-500">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(order)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium shadow-sm transition-colors duration-150 text-sm"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          </div>

          {/* Copy Message & Find Buyers */}
          <div className="p-6 flex justify-between items-center border-b border-slate-200">
            <CompanyOrderMessage order={order} />

            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Distance (km)"
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                className="w-32 px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-slate-300 transition-colors duration-150"
                min={1}
                max={500}
                disabled={isFindingNearbyBuyers}
              />
              <button
                onClick={() => {
                  if (!distanceKm || parseFloat(distanceKm) <= 0) {
                    toast.error("Enter valid km");
                    return;
                  }
                  fetchBuyers(1);
                }}
                disabled={isFindingNearbyBuyers}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-md font-medium shadow-sm transition-colors duration-150 text-sm"
              >
                {isFindingNearbyBuyers ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  "Find Buyers"
                )}
              </button>
            </div>
          </div>

          {/* Information Grid */}
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Location - Full Width */}
            <div className="sm:col-span-2 lg:col-span-4 bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-slate-600" />
                <h4 className="text-xs font-semibold text-slate-900 uppercase">
                  Location
                </h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="text-xs text-slate-500">Village</span>
                  <p className="font-medium text-slate-900">{order.village}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-500">Taluk</span>
                  <p className="font-medium text-slate-900">{order.taluk}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-500">District</span>
                  <p className="font-medium text-slate-900">{order.district}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-500">State</span>
                  <p className="font-medium text-slate-900">{order.state}</p>
                </div>
              </div>
            </div>

            {/* Crop Details */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-slate-600" />
                <h4 className="text-xs font-semibold text-slate-900 uppercase">
                  Crop
                </h4>
              </div>
              <p className="text-sm font-medium text-slate-900 truncate">
                {order.cropName}
              </p>
              {order.cropVariety && (
                <p className="text-xs text-slate-600 truncate">
                  {order.cropVariety}
                </p>
              )}
            </div>

            {/* Quantity */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-slate-600" />
                <h4 className="text-xs font-semibold text-slate-900 uppercase">
                  Quantity
                </h4>
              </div>
              <p className="text-sm font-semibold text-slate-900">
                {order.minQuantity.toLocaleString()}
              </p>
              <p className="text-xs text-slate-600">
                {order.unit} {order.measure}
              </p>
            </div>

            {/* Price */}
            {order.price_rate && (
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <IndianRupee className="w-4 h-4 text-slate-600" />
                  <h4 className="text-xs font-semibold text-slate-900 uppercase">
                    Price
                  </h4>
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  ₹{order.price_rate.toLocaleString()}
                </p>
                <p className="text-xs text-slate-600 truncate">
                  per {order.price_measure}
                </p>
              </div>
            )}

            {/* Moisture */}
            {order.moisturePercent && (
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="w-4 h-4 text-slate-600" />
                  <h4 className="text-xs font-semibold text-slate-900 uppercase">
                    Moisture
                  </h4>
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  {order.moisturePercent}%
                </p>
              </div>
            )}

            {/* Quality */}
            {order.quality && (
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-slate-600" />
                  <h4 className="text-xs font-semibold text-slate-900 uppercase">
                    Quality
                  </h4>
                </div>
                <p className="text-sm font-medium text-slate-900 truncate">
                  {order.quality}
                </p>
              </div>
            )}
          </div>

          {/* Specifications Section */}
          {hasAnySpecification() && (
            <div className="p-6 border-t border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-600" />
                  <h4 className="text-sm font-semibold text-slate-900 uppercase">
                    Specifications
                  </h4>
                </div>

                {/* Language Selector */}
                <div className="flex gap-1 bg-slate-100 rounded-md p-1">
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
                        className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-colors duration-150 ${
                          isSelected
                            ? "bg-slate-900 text-white"
                            : hasContent
                            ? "bg-white text-slate-700 hover:bg-slate-50"
                            : "text-slate-400"
                        }`}
                        disabled={!hasContent}
                      >
                        <span>{lang.icon}</span>
                        <span>{lang.code}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <div
                  className={`text-sm text-slate-700 leading-relaxed ${
                    isSpecificationExpanded ? "" : "line-clamp-3"
                  }`}
                >
                  {getSpecificationContent(selectedSpecificationLanguage) || (
                    <span className="text-slate-400 italic">
                      No content available in this language
                    </span>
                  )}
                </div>
                {getSpecificationContent(selectedSpecificationLanguage).length >
                  120 && (
                  <button
                    onClick={() =>
                      setIsSpecificationExpanded(!isSpecificationExpanded)
                    }
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {isSpecificationExpanded ? "Show Less" : "Show More"}
                    {isSpecificationExpanded ? (
                      <ChevronUp className="w-3 h-3 inline ml-1" />
                    ) : (
                      <ChevronDown className="w-3 h-3 inline ml-1" />
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Terms & Conditions Section */}
          {hasAnyTerms() && (
            <div className="p-6 border-t border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-600" />
                  <h4 className="text-sm font-semibold text-slate-900 uppercase">
                    Terms & Conditions
                  </h4>
                </div>

                {/* Language Selector */}
                <div className="flex gap-1 bg-slate-100 rounded-md p-1">
                  {LANGUAGES.map((lang) => {
                    const hasContent = !!getTermsContent(lang.value);
                    const isSelected = lang.value === selectedTermsLanguage;
                    return (
                      <button
                        key={lang.value}
                        onClick={() => setSelectedTermsLanguage(lang.value)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-colors duration-150 ${
                          isSelected
                            ? "bg-slate-900 text-white"
                            : hasContent
                            ? "bg-white text-slate-700 hover:bg-slate-50"
                            : "text-slate-400"
                        }`}
                        disabled={!hasContent}
                      >
                        <span>{lang.icon}</span>
                        <span>{lang.code}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <div
                  className={`text-sm text-slate-700 leading-relaxed ${
                    isTermsExpanded ? "" : "line-clamp-3"
                  }`}
                >
                  {getTermsContent(selectedTermsLanguage) || (
                    <span className="text-slate-400 italic">
                      No content available in this language
                    </span>
                  )}
                </div>
                {getTermsContent(selectedTermsLanguage).length > 120 && (
                  <button
                    onClick={() => setIsTermsExpanded(!isTermsExpanded)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {isTermsExpanded ? "Show Less" : "Show More"}
                    {isTermsExpanded ? (
                      <ChevronUp className="w-3 h-3 inline ml-1" />
                    ) : (
                      <ChevronDown className="w-3 h-3 inline ml-1" />
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Example inside a modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <AssignInterestForm
              poId="4a0dd557-a888-4529-b4b6-4acb10e568ec"
              onClose={() => setShowModal(false)}
            />
          </div>
        )}

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-black mt-10 text-white rounded-md font-medium text-sm"
        >
          Add Interest
        </button>

        {/* Buyers Modal */}
        {showBuyersModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden border border-slate-200">
              <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">
                    Nearby Buyers (
                    {buyersMeta?.totalItems || nearbyBuyers.length})
                  </h3>
                  <p className="text-sm text-slate-300">
                    Within {distanceKm}km • Page {buyersMeta?.currentPage || 1}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowBuyersModal(false);
                    setNearbyBuyers([]);
                    setDistanceKm("");
                  }}
                  className="text-white hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
                {nearbyBuyers.length > 0 ? (
                  <table className="w-full border border-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="border border-slate-200 px-4 py-3 text-left text-xs font-semibold text-slate-900">
                          Buyer
                        </th>
                        <th className="border border-slate-200 px-4 py-3 text-left text-xs font-semibold text-slate-900">
                          Village
                        </th>
                        <th className="border border-slate-200 px-4 py-3 text-left text-xs font-semibold text-slate-900">
                          Taluk
                        </th>
                        <th className="border border-slate-200 px-4 py-3 text-left text-xs font-semibold text-slate-900">
                          District
                        </th>
                        <th className="border border-slate-200 px-4 py-3 text-left text-xs font-semibold text-slate-900">
                          Mobile
                        </th>
                        <th className="border border-slate-200 px-4 py-3 text-left text-xs font-semibold text-slate-900">
                          Distance
                        </th>
                        <th className="border border-slate-200 px-4 py-3 text-left text-xs font-semibold text-slate-900">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {nearbyBuyers.map((buyer) => (
                        <tr key={buyer.id} className="hover:bg-slate-50">
                          <td className="border border-slate-200 px-4 py-3 text-sm">
                            <p className="font-semibold text-slate-900">
                              {buyer.name}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {buyer.userPlan || "Free Plan"}
                            </p>
                          </td>
                          <td className="border border-slate-200 px-4 py-3 text-sm text-slate-700">
                            {buyer.village}
                          </td>
                          <td className="border border-slate-200 px-4 py-3 text-sm text-slate-700">
                            {buyer.taluk}
                          </td>
                          <td className="border border-slate-200 px-4 py-3 text-sm text-slate-700">
                            {buyer.district}
                          </td>
                          <td className="border border-slate-200 px-4 py-3 text-sm text-slate-700">
                            {buyer.mobileNumber}
                          </td>
                          <td className="border border-slate-200 px-4 py-3 text-sm text-slate-700">
                            {buyer.distanceKm.toFixed(1)}km
                          </td>
                          <td className="border border-slate-200 px-4 py-3 text-sm">
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  const cropKey = order.cropName?.toLowerCase();
                                  const message = `🌾 ${
                                    cropNamesKannada[cropKey] || order.cropName
                                  } ಕ್ಕಾಗಿ, ಈ ಖರೀದಿದಾರರನ್ನು ಸಂಪರ್ಕಿಸಿ 👇\n\n📍 ಗ್ರಾಮ: ${
                                    buyer.village
                                  }\n🏢 ತಾಲೂಕು: ${buyer.taluk}\n🌆 ಜಿಲ್ಲೆ: ${
                                    buyer.district
                                  }\n\n🔗 ಲಿಂಕ್: https://oneroot.farm/farmer/buyer/${
                                    buyer.id
                                  }\nಲಿಂಕ್ ಮೂಲಕ ವ್ಯಾಪಾರಸ್ಥರೊಂದಿಗೆ ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸಿ ಮತ್ತು ವ್ಯವಹರಿಸಿ!\n\n🙏 ಧನ್ಯವಾದಗಳು,\nಮಾರ್ಕೆಟ್ ಆಪ್‌ 🚜`;
                                  navigator.clipboard.writeText(message);
                                  toast.success("Message copied!");
                                }}
                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Copy Message"
                              >
                                <Link2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  window.open(
                                    `https://markhet.vercel.app/user/buyer/${buyer.id}`,
                                    "_blank"
                                  );
                                }}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                              >
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-center py-12 text-slate-500">
                    No buyers found
                  </p>
                )}
              </div>

              {/* Pagination */}
              {buyersMeta && buyersMeta.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                  <div className="text-sm text-slate-600">
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
                      className="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => fetchBuyers(buyersMeta.currentPage + 1)}
                      disabled={!buyersMeta.hasNextPage}
                      className="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Interests Table */}

        {/* --------------------------------------------------------------
     TAB: Interested Buyers  |  Leads for Chatrace
   -------------------------------------------------------------- */}
        {(order.interests?.length ?? 0) > 0 || true ? ( // always render the card
          <div className="mt-6 bg-white shadow-sm rounded-lg overflow-hidden border border-slate-200">
            {/* ----- Tab Header ----- */}
            <div className="flex border-b border-slate-200">
              {[
                {
                  key: "interests",
                  label: "Interested Buyers",
                  count: order.interests?.length ?? 0,
                  icon: Users,
                },
                {
                  key: "leads",
                  label: "Leads from Chatrace",
                  count: null,
                  icon: Phone,
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
            flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium
            transition-colors duration-150
            ${
              activeTab === tab.key
                ? "bg-white text-slate-900 border-b-2 border-blue-600"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }
          `}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== null && (
                    <span className="ml-1 text-xs bg-slate-200 text-slate-700 rounded-full px-2 py-0.5">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Interest Edit Modal */}
            {isInterestEditOpen && editingInterest && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-md border border-slate-200">
                  <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Edit Buyer Interest
                    </h3>
                    <button
                      onClick={closeInterestEditModal}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Buyer
                      </label>
                      <p className="text-sm text-slate-900 font-medium">
                        {editingInterest.user.name}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Quantity in Tons
                      </label>
                      <input
                        type="number"
                        value={editQuantity}
                        onChange={(e) => setEditQuantity(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Will Filful by
                      </label>
                      <input
                        type="date"
                        value={editCommitDate}
                        onChange={(e) => setEditCommitDate(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-2">
                    <button
                      onClick={closeInterestEditModal}
                      className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 font-medium text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (!editQuantity || !editCommitDate) {
                          toast.error("Please fill all fields");
                          return;
                        }
                        updateInterestMutation.mutate({
                          interestId: editingInterest.id,
                          quantity: parseFloat(editQuantity),
                          commitDate: editCommitDate,
                        });
                      }}
                      disabled={updateInterestMutation.isPending}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md font-medium text-sm flex items-center gap-2"
                    >
                      {updateInterestMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ----- Tab Body ----- */}
            <div className="p-0">
              {/* Interested Buyers Table */}
              {activeTab === "interests" &&
                order.interests &&
                order.interests.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      {/* … SAME TABLE HEAD you already have … */}
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">
                            Interest shown on
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">
                            Buyer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">
                            Contact
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">
                            Location
                          </th>

                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">
                            Quantity
                          </th>

                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">
                            Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">
                            Will Fulfil by
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">
                            Status
                          </th>

                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">
                            Edit
                          </th>
                        </tr>
                      </thead>

                      {/* … SAME TABLE BODY you already have … */}
                      <tbody className="divide-y divide-slate-200">
                        {order.interests.map((interest) => {
                          const user = interest.user;
                          const statusClass = getStatusColor(user.userStatus);
                          const initials = getUserInitials(user.name);
                          const statusDisplay = getStatusDisplay(
                            user.userStatus
                          );
                          const cropNamesDisplay = getCropNamesDisplay(
                            user.cropNames
                          );

                          // return (
                          //   <tr key={interest.id} className="hover:bg-slate-50">
                          //     {/* ---- Buyer column ---- */}
                          //     <td className="px-6 py-4">
                          //       <div className="flex items-center gap-3">
                          //         <div className="flex-shrink-0">
                          //           {user.profileImage ? (
                          //             <img
                          //               className="w-10 h-10 rounded-full object-cover"
                          //               src={user.profileImage}
                          //               alt={user.name}
                          //             />
                          //           ) : (
                          //             <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold text-sm">
                          //               {initials}
                          //             </div>
                          //           )}
                          //         </div>
                          //         <div>
                          //           <div className="text-sm font-medium text-slate-900">
                          //             {user.name}
                          //           </div>
                          //           <div className="text-xs text-slate-500 truncate max-w-32">
                          //             {cropNamesDisplay}
                          //           </div>
                          //         </div>
                          //       </div>
                          //     </td>

                          //     {/* ---- Quantity ---- */}
                          //     <td className="px-6 py-4">
                          //       <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          //         {parseFloat(
                          //           interest.quantity
                          //         ).toLocaleString()}{" "}
                          //         {order.measure}
                          //       </span>
                          //     </td>

                          //     {/* ---- Commit Date ---- */}
                          //     <td className="px-6 py-4 text-sm text-slate-700">
                          //       <div className="flex items-center gap-2">
                          //         <Clock className="w-4 h-4 text-slate-400" />
                          //         <span>
                          //           {formatCommitDate(interest.commitDate)}
                          //         </span>
                          //       </div>
                          //     </td>

                          //     {/* ---- Status ---- */}
                          //     <td className="px-6 py-4">
                          //       <span
                          //         className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${statusClass}`}
                          //       >
                          //         {getStatusIcon(user.userStatus)}
                          //         {statusDisplay}
                          //       </span>
                          //     </td>

                          //     {/* ---- Contact ---- */}
                          //     <td className="px-6 py-4 text-sm text-slate-700">
                          //       <div className="flex items-center gap-2">
                          //         <Phone className="w-4 h-4 text-slate-400" />
                          //         <a
                          //           href={`tel:${user.mobileNumber}`}
                          //           className="text-blue-600 hover:text-blue-700 font-medium"
                          //         >
                          //           {user.mobileNumber}
                          //         </a>
                          //       </div>
                          //     </td>

                          //     {/* ---- Location ---- */}
                          //     <td className="px-6 py-4">
                          //       <div className="flex items-center gap-2">
                          //         <Map className="w-4 h-4 text-slate-400" />
                          //         <div className="text-sm">
                          //           <div className="font-medium text-slate-900">
                          //             {user.district}
                          //           </div>
                          //           <div className="text-xs text-slate-500">
                          //             {user.village}
                          //           </div>
                          //         </div>
                          //       </div>
                          //     </td>
                          //   </tr>
                          // );

                          return (
                            <tr key={interest.id} className="hover:bg-slate-50">
                              {/* ---- Buyer column ---- */}
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex-shrink-0">
                                    {user.profileImage ? (
                                      <img
                                        className="w-10 h-10 rounded-full object-cover"
                                        src={user.profileImage}
                                        alt={user.name}
                                      />
                                    ) : (
                                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold text-sm">
                                        {initials}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-slate-900">
                                      {user.name}
                                    </div>
                                    <div className="text-xs text-slate-500 truncate max-w-32">
                                      {cropNamesDisplay}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* ---- Contact ---- */}
                              <td className="px-6 py-4 text-sm text-slate-700">
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-slate-400" />
                                  <a
                                    href={`tel:${user.mobileNumber}`}
                                    className="text-blue-600 hover:text-blue-700 font-medium"
                                  >
                                    {user.mobileNumber}
                                  </a>
                                </div>
                              </td>

                              {/* ---- Location ---- */}
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <Map className="w-4 h-4 text-slate-400" />
                                  <div className="text-sm">
                                    <div className="font-medium text-slate-900">
                                      {user.district}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      {user.village}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-700">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-slate-400" />
                                  <span>
                                    {formatCommitDate(interest.user.createdAt)}
                                  </span>
                                </div>
                              </td>

                              {/* ---- Quantity ---- */}
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                  {parseFloat(
                                    interest.quantity
                                  ).toLocaleString()}{" "}
                                  {order.measure}
                                </span>
                              </td>

                              {/* ---- price---- */}
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                  {parseFloat(
                                    order.price_rate
                                  ).toLocaleString()}{" "}
                                </span>
                              </td>

                              {/* ---- Commit Date ---- */}
                              <td className="px-6 py-4 text-sm text-slate-700">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-slate-400" />
                                  <span>
                                    {formatCommitDate(interest.commitDate)}
                                  </span>
                                </div>
                              </td>

                              {/* ---- Status ---- */}
                              <td className="px-6 py-4">
                                <span
                                  className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${statusClass}`}
                                >
                                  {getStatusIcon(user.userStatus)}
                                  {statusDisplay}
                                </span>
                              </td>

                              {/* ---- Edit Action ---- */}
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() =>
                                    openInterestEditModal(interest)
                                  }
                                  className="text-blue-600 hover:text-blue-800 transition-colors"
                                  title="Edit Interest"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

              {/* Leads for Chatrace */}
              {activeTab === "leads" && (
                <div className="">
                  {/* Keep the original Poleads component – it already receives the order id */}
                  {typeof id === "string" && <Poleads id={id} />}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  Edit Purchase Order
                </h2>
                <button
                  onClick={closeEditModal}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
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
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Order Details</h1>
        <p className="text-sm text-slate-500 mt-1">Order #{params?.id}</p>
      </div>
      <Link
        href="/eois-card"
        className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 hover:border-slate-300 rounded-md font-medium shadow-sm transition-all duration-150 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Orders</span>
      </Link>
    </div>
  );
};

export default PurchaseOrderDetails;
