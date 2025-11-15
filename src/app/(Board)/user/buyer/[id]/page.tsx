"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Send, X, Copy, Link2 } from "lucide-react";

// Type definitions
interface User {
  id: string;
  name: string;
  village: string;
  taluk: string;
  district: string;
  pincode: string;
  mobileNumber: string;
  language: string;
  identity: string;
  coordinates: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
}

interface CallParty {
  name: string;
  taluk?: string;
  district?: string;
}

interface Call {
  id: string;
  callId: string;
  recordingUrl: string;
  duration: number;
  startStamp: string;
  from: CallParty;
  to: CallParty;
}

interface CallStats {
  totalCalls: number;
  answeredCalls: number;
  dialedCalls: number;
  receivedCalls: number;
  missedCalls: number;
  avgCallDuration: number;
  districtStats: Record<string, number>;
  callsByRecipient: Record<string, { name: string; count: number }>;
}

interface CallData {
  data: {
    calls: Call[];
    stats: CallStats;
  };
}

interface Crop {
  cropName: string;
}

interface Farmer {
  id: string;
  name: string;
  village: string;
  taluk: string;
  district: string;
  mobileNumber: string;
  farms: {
    crops: {
      id: string;
      cropName: string;
      cropStatus: string;
      quantity?: number;
      measure?: string;
    }[];
    distanceKm: number;
  }[];
}

interface FarmersMeta {
  totalItems: number;
  currentPage: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// Crop names in Kannada and API-compatible names
const cropNames = {
  banana: { display: "ಬಾಳೆಹಣ್ಣು (Banana)", api: "Banana", url: "banana" },
  tender_coconut: {
    display: "ಎಳನೀರು (Tender Coconut)",
    api: "Tender Coconut",
    url: "tender_coconut",
  },
  dry_coconut: {
    display: "ಒಣ ತೆಂಗಿನಕಾಯಿ (Dry Coconut)",
    api: "Dry Coconut",
    url: "dry_coconut",
  },
  turmeric: { display: "ಅರಶಿನ (Turmeric)", api: "Turmeric", url: "turmeric" },
  maize: { display: "ಮೆಕ್ಕೆಜೋಳ (Maize)", api: "Maize", url: "maize" },
  sunflower: {
    display: "ಸೂರ್ಯಕಾಂತಿ (Sunflower)",
    api: "Sunflower",
    url: "sunflower",
  },
};

// NearbyFarmersModal Component
interface NearbyFarmersModalProps {
  showFarmersModal: boolean;
  setShowFarmersModal: (value: boolean) => void;
  nearbyFarmers: Farmer[];
  distanceKm: string;
  crop: Crop;
  setNearbyFarmers: (value: Farmer[]) => void;
  setDistanceKm: (value: string) => void;
  farmersMeta: FarmersMeta | null;
  setFarmersMeta: (value: FarmersMeta | null) => void;
  fetchFarmers: (page: number) => void;
}

const NearbyFarmersModal: React.FC<NearbyFarmersModalProps> = ({
  showFarmersModal,
  setShowFarmersModal,
  nearbyFarmers,
  distanceKm,
  crop,
  setNearbyFarmers,
  setDistanceKm,
  farmersMeta,
  setFarmersMeta,
  fetchFarmers,
}) => {
  if (!showFarmersModal) return null;

  // Calculate pagination range (show 5 pages centered around current page)
  const maxPagesToShow = 5;
  const currentPage = farmersMeta?.currentPage || 1;
  const totalPages = farmersMeta?.totalPages || 1;
  const halfRange = Math.floor(maxPagesToShow / 2);

  let startPage = Math.max(1, currentPage - halfRange);
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  // Adjust startPage if endPage is at the max to ensure 5 pages are shown
  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  const pageNumbers = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-green-600 to-emerald-600 rounded-t-2xl text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Send className="w-6 h-6" />
              <div>
                <h3 className="text-xl font-bold">
                  Nearby Farmers (
                  {farmersMeta?.totalItems || nearbyFarmers.length})
                </h3>
                <p className="text-green-100">
                  Within {distanceKm}km of {crop.cropName} • Page{" "}
                  {farmersMeta?.currentPage} of {farmersMeta?.totalPages}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowFarmersModal(false);
                setNearbyFarmers([]);
                setDistanceKm("");
                setFarmersMeta(null);
              }}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="p-6">
          {nearbyFarmers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border w-56 border-gray-300 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Village
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Taluk
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      District
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Mobile
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Crops
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Distance
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Share On WhatsApp
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {nearbyFarmers.map((farmer) => {
                    const distance =
                      farmer?.farms?.[0]?.distanceKm != null
                        ? `${farmer.farms[0].distanceKm.toFixed(2)} km`
                        : "N/A";

                    return (
                      <tr key={farmer.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                          <p className="font-semibold text-gray-900">
                            {farmer.name || "—"}
                          </p>
                          {farmer?.farms?.[0]?.crops?.[0] && (
                            <div className="mt-1 text-xs text-gray-500 flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded-full ${
                                  farmer.farms[0].crops[0].cropStatus ===
                                  "Pakka Ready"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {farmer.farms[0].crops[0].cropStatus ||
                                  "Unknown"}
                              </span>
                              <span>•</span>
                              {/* <span>
                                {farmer.farms[0].crops[0].quantity != null
                                  ? `${farmer.farms[0].crops[0].quantity}`
                                  : "-"}
                              </span> */}
                              <span>
                                {farmer.farms[0].crops[0].quantity != null
                                  ? `${farmer.farms[0].crops[0].quantity} ${
                                      farmer.farms[0].crops[0].measure || ""
                                    }`
                                  : "-"}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                          {farmer.village || "—"}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                          {farmer.taluk || "—"}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                          {farmer.district || "—"}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-green-700">
                              {farmer.mobileNumber || "—"}
                            </span>
                            {farmer.mobileNumber && (
                              <button
                                onClick={() => {
                                  const cleanNumber =
                                    farmer.mobileNumber.replace("+91", "");
                                  navigator.clipboard.writeText(cleanNumber);
                                  toast.success(`Copied: ${cleanNumber} ✅`);
                                }}
                                className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                title="Copy Number"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-sm">
                          <div className="flex flex-wrap gap-1">
                            {farmer.farms?.length ? (
                              farmer.farms.flatMap((farm) =>
                                farm.crops?.map((crop) => (
                                  <span
                                    key={crop.id}
                                    className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
                                  >
                                    {crop.cropName}
                                  </span>
                                ))
                              )
                            ) : (
                              <span className="text-xs text-gray-500">
                                No crops
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-sm text-blue-600 font-medium">
                          {distance}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-sm">
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                const cropDisplay =
                                  cropNames[crop.cropName.toLowerCase()]
                                    ?.display || crop.cropName;
                                const cropUrl =
                                  cropNames[crop.cropName.toLowerCase()]?.url ||
                                  crop.cropName.toLowerCase();
                                const message = `🌾 ${cropDisplay} ಕ್ಕಾಗಿ, ಈ ರೈತರನ್ನು ಸಂಪರ್ಕಿಸಿ 👇

📍 ಗ್ರಾಮ: ${farmer.village || "—"}
🏢 ತಾಲೂಕು: ${farmer.taluk || "—"}
🌆 ಜಿಲ್ಲೆ: ${farmer.district || "—"}

📍 ಲಿಂಕ್: https://oneroot.farm/buyer/${cropUrl}/${farmer.id}
ಲಿಂಕ್ ಮೂಲಕ ರೈತರೊಂದಿಗೆ ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸಿ ಮತ್ತು ವ್ಯವಹರಿಸಿ!

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
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No farmers found nearby 😔
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {farmersMeta && farmersMeta.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4 px-6">
            <div className="text-sm text-gray-700">
              Showing {(farmersMeta.currentPage - 1) * 10 + 1} to{" "}
              {Math.min(farmersMeta.currentPage * 10, farmersMeta.totalItems)}{" "}
              of {farmersMeta.totalItems.toLocaleString()} records
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchFarmers(farmersMeta.currentPage - 1)}
                disabled={!farmersMeta.hasPreviousPage}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                &lt;
              </button>
              {pageNumbers.map((page) => (
                <button
                  key={page}
                  onClick={() => fetchFarmers(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    farmersMeta.currentPage === page
                      ? "bg-green-600 text-white shadow-md"
                      : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => fetchFarmers(farmersMeta.currentPage + 1)}
                disabled={!farmersMeta.hasNextPage}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                &gt;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Reusable UI Components
const StatCard = ({
  title,
  value,
  isRed = false,
}: {
  title: string;
  value: string | number;
  isRed?: boolean;
}) => (
  <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
    <p className="text-gray-500 text-sm">{title}</p>
    <p
      className={`text-3xl font-bold ${
        isRed ? "text-red-600" : "text-green-700"
      }`}
    >
      {value}
    </p>
  </div>
);

const LocationCard = ({
  location,
  count,
}: {
  location: string;
  count: number;
}) => (
  <div className="bg-white rounded-lg shadow-md p-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
    <p className="font-medium text-green-700">{location}</p>
    <p className="text-2xl text-gray-700">{count}</p>
  </div>
);

const SectionHeader = ({ title }: { title: string }) => (
  <h3 className="text-3xl font-bold text-green-800 mb-6 border-b-2 border-green-200 pb-3 flex items-center">
    <svg
      className="w-6 h-6 mr-2"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" />
      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" />
    </svg>
    {title}
  </h3>
);

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center">
      <div
        className="w-16 h-16 border-4 border-green-200 border-t-green-700 rounded-full animate-spin"
        aria-hidden="true"
      ></div>
      <p className="mt-4 text-xl font-semibold text-green-700">Loading...</p>
    </div>
  </div>
);

const BuyerProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [callData, setCallData] = useState<CallData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFarmersModal, setShowFarmersModal] = useState(false);
  const [nearbyFarmers, setNearbyFarmers] = useState<Farmer[]>([]);
  const [distanceKm, setDistanceKm] = useState("");
  const [selectedCrop, setSelectedCrop] = useState<Crop>({ cropName: "" });
  const [farmersMeta, setFarmersMeta] = useState<FarmersMeta | null>(null);

  useEffect(() => {
    if (!id) {
      setError("No user ID provided");
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) throw new Error("API URL is not defined");

        const userResponse = await axios.get(`${apiUrl}/users/getbyid/${id}`);
        const userData = userResponse.data.data as User;
        setUser(userData);

        const callResponse = await axios.get(
          `${apiUrl}/call/calls-by-userid/${id}`
        );
        setCallData(callResponse.data);
      } catch (error) {
        console.error("Error fetching buyer data:", error);
        setError("Failed to load buyer data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const findNearbyFarmersMutation = useMutation({
    mutationFn: async (payload: {
      latitude: number;
      longitude: number;
      distanceKm: number;
      cropName: string;
      page?: number;
      limit?: number;
    }) => {
      const url = new URL(
        `${process.env.NEXT_PUBLIC_API_URL}/users/find-farmers-nearby`
      );
      url.searchParams.append("page", (payload.page || 1).toString());
      url.searchParams.append("limit", (payload.limit || 10).toString()); // Changed to 10

      const response = await axios.post(
        url.toString(),
        {
          latitude: payload.latitude,
          longitude: payload.longitude,
          distanceKm: payload.distanceKm,
          cropName: payload.cropName,
        },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      // Assume 200+ status is success; only throw if there's an HTTP error or explicit error message
      if (response.status < 200 || response.status >= 300) {
        throw new Error(
          response.data.message || `Failed to find farmers: ${response.status}`
        );
      }

      // Check for explicit error in response body
      if (
        response.data.message &&
        response.data.message.toLowerCase().includes("error")
      ) {
        throw new Error(response.data.message);
      }

      return response.data;
    },
    onSuccess: (data) => {
      // Safely handle potential response structures
      const farmers = data.data?.farmers || data.farmers || [];
      const meta = data.data?.meta || data.meta || null;
      const totalCount =
        data.data?.totalCount || data.totalCount || farmers.length;
      const searchRadius =
        data.data?.searchRadius || data.searchRadius || parseFloat(distanceKm);

      setNearbyFarmers(farmers);
      setFarmersMeta(meta);
      setShowFarmersModal(true);
      toast.success(`Found ${totalCount} farmers within ${searchRadius}km! 📋`);
    },
    onError: (error: any) => {
      console.error("Full error details:", error); // Debug log
      toast.error(`Failed to find farmers: ${error.message}`);
    },
  });

  const fetchFarmers = (page: number = 1) => {
    if (!selectedCrop.cropName || !distanceKm) {
      toast.error("Please select a crop and enter a distance.");
      return;
    }

    if (!user?.coordinates?.coordinates) {
      toast.error("User coordinates are not available.");
      return;
    }

    const [longitude, latitude] = user.coordinates.coordinates;

    findNearbyFarmersMutation.mutate({
      latitude,
      longitude,
      distanceKm: parseFloat(distanceKm),
      cropName:
        cropNames[selectedCrop.cropName.toLowerCase()]?.api ||
        selectedCrop.cropName,
      page,
      limit: 10, // Changed to 10
    });
  };

  const handleFindFarmers = () => {
    fetchFarmers(1);
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="bg-green-50 min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="mt-6 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const talukStats =
    callData?.data?.calls?.reduce((acc, call) => {
      const taluk = call.to?.taluk || "Unknown";
      acc[taluk] = (acc[taluk] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return "N/A";
    }
  };

  return (
    <div className="bg-green-50 min-h-screen p-4 md:p-8">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl p-6 md:p-8 shadow-xl mb-8 transition-all duration-300 hover:shadow-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Buyer Profile</h1>
            <h2 className="text-2xl mt-2 font-semibold">
              {user?.name || "N/A"}
            </h2>
            <p className="mt-1 text-green-100">
              {[user?.village, user?.taluk, user?.district]
                .filter(Boolean)
                .join(", ")}{" "}
              {user?.pincode ? `- ${user.pincode}` : ""}
            </p>
            <p className="mt-1 text-green-100 flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16 2H8C6.9 2 6 2.9 6 4V20C6 21.1 6.9 22 8 22H16C17.1 22 18 21.1 18 20V4C18 2.9 17.1 2 16 2ZM12 21C11.45 21 11 20.55 11 20C11 19.45 11.45 19 12 19C12.55 19 13 19.45 13 20C13 20.55 12.55 21 12 21ZM16 17H8V5H16V17Z"
                  fill="currentColor"
                />
              </svg>
              {user?.mobileNumber || "N/A"}
            </p>
          </div>
        </div>
      </header>

      {/* Find Farmers Section */}
      <section className="mb-8 bg-white rounded-xl shadow-lg p-6 md:p-8">
        <SectionHeader title="Find Nearby Farmers" />
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label
              htmlFor="crop"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Select Crop
            </label>
            <select
              id="crop"
              value={selectedCrop.cropName}
              onChange={(e) => setSelectedCrop({ cropName: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Select a crop</option>
              {Object.entries(cropNames).map(([key, { display }]) => (
                <option key={key} value={key}>
                  {display}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label
              htmlFor="distance"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Distance (km)
            </label>
            <input
              id="distance"
              type="number"
              value={distanceKm}
              onChange={(e) => setDistanceKm(e.target.value)}
              placeholder="Enter distance in km"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleFindFarmers}
              disabled={findNearbyFarmersMutation.isLoading}
              className={`px-4 py-2 text-white rounded-md transition-colors ${
                findNearbyFarmersMutation.isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {findNearbyFarmersMutation.isLoading
                ? "Searching..."
                : "Find Farmers"}
            </button>
          </div>
        </div>
      </section>

      {/* Nearby Farmers Modal */}
      <NearbyFarmersModal
        showFarmersModal={showFarmersModal}
        setShowFarmersModal={setShowFarmersModal}
        nearbyFarmers={nearbyFarmers}
        distanceKm={distanceKm}
        crop={selectedCrop}
        setNearbyFarmers={setNearbyFarmers}
        setDistanceKm={setDistanceKm}
        farmersMeta={farmersMeta}
        setFarmersMeta={setFarmersMeta}
        fetchFarmers={fetchFarmers}
      />

      {/* Call Statistics */}
      <section className="mb-8 bg-white rounded-xl shadow-lg p-6 md:p-8">
        <SectionHeader title="Call Statistics" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Dialed Calls"
            value={callData?.data?.stats?.dialedCalls ?? 0}
          />
          <StatCard
            title="Received Calls"
            value={callData?.data?.stats?.receivedCalls ?? 0}
          />
          <StatCard
            title="Total Calls"
            value={callData?.data?.stats?.totalCalls ?? 0}
          />
          <StatCard
            title="Answered Calls"
            value={callData?.data?.stats?.answeredCalls ?? 0}
          />
          <StatCard
            title="Missed Calls"
            value={callData?.data?.stats?.missedCalls ?? 0}
            isRed
          />
          <StatCard
            title="Avg. Duration (sec)"
            value={callData?.data?.stats?.avgCallDuration?.toFixed(2) ?? "0"}
          />
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-2xl font-semibold text-green-700 mb-4 flex items-center">
              <svg
                className="w-6 h-6 mr-2"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z"
                  fill="currentColor"
                />
              </svg>
              Calls by District
            </h4>
            <div className="flex flex-wrap gap-4">
              {Object.entries(callData?.data?.stats?.districtStats || {}).map(
                ([district, count]) => (
                  <LocationCard
                    key={district}
                    location={district}
                    count={count}
                  />
                )
              )}
              {!Object.keys(callData?.data?.stats?.districtStats || {})
                .length && (
                <p className="text-gray-500 italic">
                  No district data available
                </p>
              )}
            </div>
          </div>
          <div>
            <h4 className="text-2xl font-semibold text-green-700 mb-4 flex items-center">
              <svg
                className="w-6 h-6 mr-2"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20.5 3L20.34 3.03L15 5.1L9 3L3.36 4.9C3.15 4.97 3 5.15 3 5.38V20.5C3 20.78 3.22 21 3.5 21L3.66 20.97L9 18.9L15 21L20.64 19.1C20.85 19.03 21 18.85 21 18.62V3.5C21 3.22 20.78 3 20.5 3ZM15 19L9 16.89V5L15 7.11V19Z"
                  fill="currentColor"
                />
              </svg>
              Calls by Taluk
            </h4>
            <div className="flex flex-wrap gap-4">
              {Object.entries(talukStats).map(([taluk, count]) => (
                <LocationCard key={taluk} location={taluk} count={count} />
              ))}
              {!Object.keys(talukStats).length && (
                <p className="text-gray-500 italic">No taluk data available</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h4 className="text-2xl font-semibold text-green-700 mb-4 flex items-center">
            <svg
              className="w-6 h-6 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z"
                fill="currentColor"
              />
            </svg>
            Calls by Recipient
          </h4>
          <div className="flex flex-wrap gap-4">
            {Object.entries(callData?.data?.stats?.callsByRecipient || {}).map(
              ([id, info]) => (
                <LocationCard
                  key={id}
                  location={info?.name || "Unknown"}
                  count={info?.count ?? 0}
                />
              )
            )}
            {!Object.keys(callData?.data?.stats?.callsByRecipient || {})
              .length && (
              <p className="text-gray-500 italic">
                No recipient data available
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Call Logs */}
      <section className="mb-8 bg-white rounded-xl shadow-lg p-6 md:p-8">
        <SectionHeader title="Call Logs" />
        <div className="overflow-x-auto">
          <table className="min-w-full rounded-lg">
            <thead>
              <tr>
                <th className="px-6 py-4 bg-green-100 text-left rounded-tl-lg font-semibold text-green-800">
                  Call ID
                </th>
                <th className="px-6 py-4 bg-green-100 text-left font-semibold text-green-800">
                  From
                </th>
                <th className="px-6 py-4 bg-green-100 text-left font-semibold text-green-800">
                  To
                </th>
                <th className="px-6 py-4 bg-green-100 text-left font-semibold text-green-800">
                  Duration
                </th>
                <th className="px-6 py-4 bg-green-100 text-left font-semibold text-green-800">
                  Date & Time
                </th>
                <th className="px-6 py-4 bg-green-100 text-left font-semibold text-green-800">
                  Taluk
                </th>
                <th className="px-6 py-4 bg-green-100 text-left font-semibold text-green-800">
                  District
                </th>
                <th className="px-6 py-4 bg-green-100 text-left rounded-tr-lg font-semibold text-green-800">
                  Recording
                </th>
              </tr>
            </thead>
            <tbody>
              {callData?.data?.calls && callData.data.calls.length > 0 ? (
                callData.data.calls.map((call, index) => (
                  <tr
                    key={call?.id}
                    className={`border-b hover:bg-green-50 transition-colors duration-200 ${
                      index % 2 === 0 ? "bg-green-50/50" : ""
                    }`}
                  >
                    <td className="px-6 py-4">{call?.callId || "N/A"}</td>
                    <td className="px-6 py-4">
                      {call?.from?.name || "Unknown"}
                    </td>
                    <td className="px-6 py-4">{call?.to?.name || "Unknown"}</td>
                    <td className="px-6 py-4">{call?.duration ?? 0}s</td>
                    <td className="px-6 py-4">
                      {call?.startStamp ? formatDate(call.startStamp) : "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      {call?.to?.taluk || "Unknown"}
                    </td>
                    <td className="px-6 py-4">
                      {call?.to?.district || "Unknown"}
                    </td>
                    <td className="px-6 py-4">
                      {call?.recordingUrl ? (
                        <a
                          href={call.recordingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-green-600 hover:text-green-800 hover:underline transition-colors duration-200"
                        >
                          <svg
                            className="w-5 h-5 mr-2"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12 3C7.03 3 3 7.03 3 12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12C21 7.03 16.97 3 12 3ZM11 17V7L16 12L11 17Z"
                              fill="currentColor"
                            />
                          </svg>
                          Listen
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No call logs available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default BuyerProfilePage;
