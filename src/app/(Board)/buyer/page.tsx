"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  LucidePencil,
  LucideRefreshCw,
  LucideFilter,
  LucideX,
  LucideCheck,
  Copy,
  Undo2,
  Link2Icon,
  CopyIcon,
  BellRing,
  PhoneCall,
} from "lucide-react";
import Table, { TableColumn } from "@/src/components/form/table/Table";
import FarmerForm, { FormConfig } from "@/src/components/form/form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// import { formatTimestamp, handleDirectCall } from "@/utils";
import { toast } from "react-toastify";

import { redirect } from "next/navigation";
import axios from "axios";
// import { useAuth } from "@/context/userContext";
import CreateBuyerForm from "@/src/components/form/CreateBuyerForm";
import ConversionPopup from "@/src/components/form/sub-form/buyer-farmer-convo-from/ConvertionForm";

type Filter = {
  column: string;
  operator: string;
  value: string;
};

type TableData = {
  id: string;
  name: string;
  mobileNumber: string;
  isVerified: boolean;
  buyerType: string;
  cropNames: string[];
  identity: string;
  taluk: string;
  village: string;
  createdAt: string;
  district: string;

  pincode: string;
  meta?: Array<{ key: string; value: any }>;
  isActive?: boolean;
};

type TableColumns = {
  [K in keyof TableData]: boolean;
};

type BuyersResponse = {
  data: TableData[];
  meta: {
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
    prevPage: number | null;
    nextPage: number | null;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
};

const defaultColumns = {
  id: true,
  name: true,
  mobileNumber: true,
  isVerified: true,
  cropNames: true,
  identity: false,
  taluk: true,
  village: true,
  createdAt: true,
  district: true,
  buyerType: true,
  isActive: true,
  meta: true,
};

//copy number
function handleCopyNumber(mobileNumber: string) {
  if (typeof window === "undefined") return;

  // Remove +91 if it exists at the beginning of the number
  const formattedNumber = mobileNumber.startsWith("+91")
    ? mobileNumber.slice(3).trim()
    : mobileNumber;

  const textArea = document.createElement("textarea");
  textArea.value = formattedNumber;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);

  toast.success("Copied to clipboard!", { autoClose: 1000 });
}

const tableColumns: TableColumn<TableData>[] = [
  {
    key: "name",
    header: "Name",
    filterOperators: ["equals", "contains"],
  },
  {
    key: "createdAt",
    header: "Registration Date",
    filterOperators: ["equals", "after", "before"],
    // render: (value) => value && formatTimestamp(value),
  },
  {
    key: "mobileNumber",
    header: "Mobile Number",
    filterOperators: ["equals", "contains"],
    render(value) {
      return (
        <div className="flex items-center space-x-2">
          <span>{value}</span>
          <button
            onClick={() => handleCopyNumber(value)}
            className="text-blue-500 hover:text-blue-600"
          >
            <CopyIcon className="w-4 h-4" />
          </button>
        </div>
      );
    },
  },
  {
    key: "identity",
    header: "Identity",
    filterOperators: ["equals", "contains"],
  },
  {
    key: "village",
    header: "Village",
    filterOperators: ["equals", "contains"],
  },
  {
    key: "taluk",
    header: "Taluka",
    filterOperators: ["equals", "contains"],
  },
  {
    key: "district",
    header: "District",
    filterOperators: ["equals", "contains"],
  },
  {
    key: "buyerType",
    header: "Buyer Type",
    filterOperators: ["equals", "contains"],
  },
  {
    key: "cropNames",
    header: "Preferred Crops",
    filterOperators: ["contains"],
    render: (value: string | boolean | string[]) =>
      Array.isArray(value) ? value.join(", ") : "",
  },
  {
    key: "isVerified",
    header: "Verification",
    filterOperators: ["equals"],
    render: (value: string | boolean | string[]) => {
      const isVerified = Boolean(value);
      return (
        <span
          className={`px-2 py-1 rounded-full text-sm ${
            isVerified
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {isVerified ? "Verified" : "Not Verified"}
        </span>
      );
    },
  },
  {
    key: "meta",
    header: "Status",
    filterOperators: ["equals"],
    render: (value) => {
      // Get isActive from meta array if it exists
      const isActiveObj = value.find((item) => item.key === "isActive");
      const isActive = isActiveObj ? isActiveObj.value : false;
      return (
        <span
          className={`px-2 py-1 rounded-full text-sm ${
            isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      );
    },
  },
  {
    key: "meta",
    header: "Preferred Locations",
    filterOperators: ["contains"],
    render: (value) => {
      const preferredLocation = value?.find(
        (item) => item.key === "preferred_location"
      )?.value;
      return preferredLocation?.join(", ");
    },
  },
];

const BuyersPage: React.FC = () => {
  const queryClient = useQueryClient();
  // const { authData } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof TableData;
    direction: "asc" | "desc";
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Filter[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isColumnsOpen, setIsColumnsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState<TableData | null>(null);
  const [pivotForm, setPivotForm] = useState(false);

  const { control, watch } = useForm({
    defaultValues: {
      density: "compact",
      columns: defaultColumns,
    },
  });
  const watchColumns = watch("columns") as TableColumns;

  const { data: BuyerData, isLoading } = useQuery<BuyersResponse>({
    queryKey: ["BuyerData", currentPage, pageSize, filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
      });

      filters.forEach((filter) => {
        if (filter.value) {
          if (filter.column === "cropNames") {
            queryParams.append("cropName", filter.value);
          } else if (filter.column === "mobileNumber") {
            queryParams.append("mobileNumber", filter.value);
          } else if (filter.column === "name") {
            queryParams.append("name", filter.value); // Map name filter to name
          } else if (filter.column === "createdAt") {
            // Format date to match backend expectation (YYYY-MM-DD)
            const dateValue = filter.value;
            const [year, month, day] = dateValue.split("-");
            if (year && month && day) {
              queryParams.append("createdAt", `${year}-${month}-${day}`);
            }
          } else if (["village", "district", "taluk"].includes(filter.column)) {
            queryParams.append(filter.column, filter.value);
          } else if (filter.column === "isVerified") {
            queryParams.append("isVerified", filter.value);
          } else if (filter.column === "buyerType") {
            queryParams.append("buyerType", filter.value);
          }
        }
      });

      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/users/buyer?${queryParams.toString()}`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch buyers data");
      }
      const response = await res.json();

      // Ensure data is an array
      if (!Array.isArray(response.data)) {
        console.error("API response data is not an array:", response.data);
        return { data: [], meta: response.meta || {} };
      }

      return response;
    },
  });

  const allowedCropNames = [
    "Tender Coconut",
    "Dry Coconut",
    "Banana",
    "Turmeric",
    "Maize",
    "Sunflower",
  ];

  const uniqueCropNames = useMemo(() => {
    if (!BuyerData?.data || !Array.isArray(BuyerData.data))
      return allowedCropNames;
    const cropNames = new Set<string>();
    BuyerData.data.forEach((buyer: TableData) => {
      if (buyer.cropNames && Array.isArray(buyer.cropNames)) {
        buyer.cropNames.forEach((crop) => {
          if (allowedCropNames.includes(crop)) {
            cropNames.add(crop);
          }
        });
      }
    });
    // Ensure all allowed crops are included, even if not in data
    return allowedCropNames.filter((crop) => cropNames.has(crop) || true);
  }, [BuyerData]);

  const isCropFilterActive = useCallback(
    (cropName: string) =>
      filters.some(
        (filter) =>
          filter.column === "cropNames" &&
          filter.operator === "contains" &&
          filter.value === cropName
      ),
    [filters]
  );

  const toggleCropFilter = useCallback((cropName: string) => {
    if (!allowedCropNames.includes(cropName)) return;
    setFilters((currentFilters) => {
      if (
        currentFilters.some(
          (filter) =>
            filter.column === "cropNames" &&
            filter.operator === "contains" &&
            filter.value === cropName
        )
      ) {
        return currentFilters.filter(
          (filter) =>
            !(
              filter.column === "cropNames" &&
              filter.operator === "contains" &&
              filter.value === cropName
            )
        );
      }
      return [
        ...currentFilters.filter((filter) => filter.column !== "cropNames"),
        { column: "cropNames", operator: "contains", value: cropName },
      ];
    });
    setCurrentPage(1);
  }, []);

  const filteredData = useMemo(() => {
    if (!BuyerData?.data || !Array.isArray(BuyerData.data)) return [];

    let data = BuyerData.data;

    if (searchQuery) {
      data = data.filter(
        (item: TableData) =>
          item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.mobileNumber.includes(searchQuery)
      );
    }

    if (sortConfig) {
      data = [...data].sort((a: TableData, b: TableData) => {
        const aValue = a[sortConfig.key]!;
        const bValue = b[sortConfig.key]!;
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [BuyerData, searchQuery, sortConfig]);

  const handleSort = useCallback((key: keyof TableData) => {
    setSortConfig((prev) => {
      let direction: "asc" | "desc" = "asc";
      if (prev?.key === key && prev.direction === "asc") {
        direction = "desc";
      }
      return { key, direction };
    });
  }, []);

  const addFilter = useCallback(() => {
    setFilters((prev) => [
      ...prev,
      { column: "name", operator: "contains", value: "" },
    ]);
  }, []);

  const updateFilter = useCallback(
    (index: number, field: keyof Filter, value: string) => {
      setFilters((prev) =>
        prev.map((filter, i) =>
          i === index ? { ...filter, [field]: value } : filter
        )
      );
      setCurrentPage(1);
    },
    []
  );

  const removeFilter = useCallback((index: number) => {
    setFilters((prev) => prev.filter((_, i) => i !== index));
    setCurrentPage(1);
  }, []);

  const filteredColumns = useMemo(
    () =>
      tableColumns.filter((col) => watchColumns[col.key as keyof TableData]),
    [watchColumns]
  );

  const BuyerConfig: FormConfig = {
    sections: [
      {
        title: "Buyer Details",
        fields: [
          {
            label: "Name",
            name: "name",
            type: "multiselect",
            required: true,
          },
          {
            label: "Buyer Type",
            name: "buyerType",
            type: "select",
            options: ["VILLAGE_BUYER", "MANDI_BUYER"],
            required: true,
          },
          {
            label: "Preferred Crops",
            name: "cropNames",
            type: "multiselect",
            isMulti: true,
            options: [
              "Banana",
              "Turmeric",
              "Tender Coconut",
              "Dry Coconut",
              "Maize",
              "Sunflower",
            ],
            required: true,
          },
          {
            label: "Village",
            name: "village",
            type: "text",
            required: true,
          },
          {
            label: "Mobile Number",
            name: "mobileNumber",
            type: "multiselect",
            required: true,
          },
          {
            label: "Verified",
            name: "isVerified",
            type: "checkbox",
            required: true,
          },
          {
            label: "Active",
            name: "isActive",
            type: "checkbox",
            required: false,
            metaKey: "isActive", // used to update/read this entry in the meta array
          },
          {
            label: "Preferred Location",
            name: "meta",
            type: "array",
            metaKey: "preferred_location", // used to update/read this entry in the meta array
          },
        ],
      },
    ],
  };

  const { mutate } = useMutation({
    mutationFn: async ({
      id,
      name,
      isVerified,
      buyerType,
      mobileNumber,
      village,
      cropNames,
      dailyPrices,
      meta,
      isActive,
    }: {
      id: string;
      name: string;
      mobileNumber: string;
      village: string;
      cropNames: string[];
      dailyPrices: string[];
      isVerified: boolean;
      buyerType: string;
      meta: any[];
      isActive?: boolean;
    }) => {
      // Process meta array to include isActive if it doesn't exist already
      let updatedMeta = meta || [];

      // Check if isActive exists in meta
      const isActiveIndex = updatedMeta.findIndex(
        (item) => item.key === "isActive"
      );

      if (isActiveIndex >= 0) {
        // Update existing isActive entry
        updatedMeta[isActiveIndex].value = isActive;
      } else {
        // Add new isActive entry
        updatedMeta.push({
          key: "isActive",
          value: isActive,
        });
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/update-buyer/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            isVerified,
            buyerType,
            mobileNumber,
            village,
            cropNames,
            dailyPrices,
            meta: updatedMeta,
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to update buyer");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["BuyerData"]);
      setIsFormOpen(false);
    },
  });

  const handleSubmit = useCallback(
    (data: any) => {
      const { isActive, ...restData } = data;
      mutate({ ...restData, isActive });
    },
    [mutate]
  );

  const handlePivot = useCallback((row: TableData) => {
    setPivotForm(true);
    setSelectedBuyer(row);
  }, []);

  const handleEdit = useCallback((row: TableData) => {
    const isActiveMeta =
      row.meta?.find((item) => item.key === "isActive")?.value ?? false;
    setSelectedBuyer({ ...row, isActive: isActiveMeta });
    setIsFormOpen(true);
  }, []);

  const handleCopyId = useCallback((id: string, row: any) => {
    if (typeof window === "undefined") return;

    const link = `https://oneroot.farm/farmer/buyer/${id}`;

    // Determine the crop name(s) dynamically
    const crops = row.cropNames?.length ? row.cropNames : ["ವಿವಿಧ ಬೆಳೆಗಳು"];
    let cropNameDisplay = "";
    crops.forEach((crop: string) => {
      if (crop.toLowerCase().includes("banana")) {
        cropNameDisplay += "ಬಾಳೆಹಣ್ಣಿನ, ";
      } else if (crop.toLowerCase().includes("tender coconut")) {
        cropNameDisplay += "ಎಳನೀರಿನ, ";
      } else if (crop.toLowerCase().includes("dry coconut")) {
        cropNameDisplay += "ತೇಂಗಿನಕಾಯಿಯ, ";
      } else if (crop.toLowerCase().includes("turmeric")) {
        cropNameDisplay += "ಅರಿಶಿನ, ";
      } else if (crop.toLowerCase().includes("maize")) {
        cropNameDisplay += "ಮೆಕ್ಕೆಜೋಳ, ";
      } else if (crop.toLowerCase().includes("sunflower")) {
        cropNameDisplay += "ಸೂರ್ಯಕಾಂತಿ, ";
      } else {
        cropNameDisplay += `${crop}, `;
      }
    });
    cropNameDisplay = cropNameDisplay.replace(/, $/, ""); // Remove trailing comma and space

    const message = `${cropNameDisplay} ತೋಟ ಕೊಯ್ಲಿಗೆ ಸಿದ್ದವಾಗಿದ್ದರೆ ,ಈ ಖರೀದಿದಾರರನ್ನು ಸಂಪರ್ಕಿಸಿ :

  ಬೆಲೆ: ${row.district}
  ತಾಲ್ಲೂಕು: ${row.taluk}

  ಲಿಂಕ್: ${link}

  ಲಿಂಕ್ ನಾ ಮೂಲಕ ವ್ಯಾಪಾರಸ್ಥರೊಂದಿಗೆ ನೇರವಾಗಿ ಮಾತನಾಡಿ!!

  ಧನ್ಯವಾದಗಳು,
  ಮಾರ್ಕೆಟ್ ಆಪ್‌ !! 🙏🏻`;

    navigator.clipboard
      .writeText(message)
      .then(() => {
        toast.success("WhatsApp message copied successfully!", {
          autoClose: 2000,
        });
      })
      .catch(() => {
        toast.error("❌ Error while copying the text", { autoClose: 2000 });
      });
  }, []);

  const toggleFilterOpen = useCallback(
    () => setIsFilterOpen((prev) => !prev),
    []
  );
  const toggleColumnsOpen = useCallback(
    () => setIsColumnsOpen((prev) => !prev),
    []
  );

  const handleNotify = async (row: TableData) => {
    const payload = {
      title: `${row.cropNames[0]} ತೋಟ ಖರೀದಿದಾರರನ್ನು ಸಂಪರ್ಕಿಸಿ`,
      body: `${row.taluk || "ನಿಮ್ಮ ತಾಲ್ಲೂಕು"}, ${
        row.district || "ನಿಮ್ಮ ಜಿಲ್ಲೆ"
      } ಖರೀದಿದಾರರು ${row.cropNames[0]} ತೋಟವನ್ನು ಖರೀದಿಸಲು ಸಿದ್ದರಾಗಿದ್ದಾರೆ.`,
      pincodes: [row.pincode],
      target: "FARMER",
      id: row.id,
      language: "kn",
      entity: "Buyer",
      cropName: row.cropNames[0],
    };

    const confirmNotify = confirm(
      "Are you sure you want to notify this buyer?"
    );
    if (confirmNotify) {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/event`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (response.status === 201) {
          toast.success("Notification sent successfully!", { autoClose: 1000 });
        } else if (response.status === 404) {
          toast.error("No farmers found in the area", { autoClose: 1000 });
        } else {
          console.log(response.status);
          toast.error("Failed to send notification. Please try again.", {
            autoClose: 1000,
          });
        }
      } catch (error) {
        toast.error(`Error: ${error.message}`, { autoClose: 1000 });
      }
    }
  };

  const tableActions = useMemo(
    () => [
      {
        name: "Go to",
        icon: <Link2Icon />,
        onClick: (row: TableData) => redirect("/user/buyer/" + row.id),
      },
      {
        name: "Copy ID",
        icon: <Copy />,
        onClick: (row: TableData) => handleCopyId(row.id, row),
      },
      {
        name: "Edit",
        icon: <LucidePencil />,
        onClick: (row: TableData) => handleEdit(row),
      },
      {
        name: "Pivot",
        icon: <Undo2 />,
        onClick: (row: TableData) => handlePivot(row),
      },
      {
        name: "Push",
        icon: <BellRing />,
        onClick: (row: TableData) => handleNotify(row),
      },
      {
        name: "Call",
        icon: <PhoneCall />,
        onClick: (row: TableData) => handleDirectCall(row),
      },
    ],
    [handleCopyId, handleEdit, handlePivot]
  );

  return (
    <div className="px-8 mt-2">
      {isFormOpen && (
        <FarmerForm
          config={BuyerConfig}
          onCancel={() => setIsFormOpen(false)}
          initialData={selectedBuyer}
          onSubmit={handleSubmit}
        />
      )}
      {pivotForm && (
        <ConversionPopup
          currentIdentity="BUYER"
          isOpen
          onClose={() => setPivotForm(false)}
          userId={selectedBuyer?.id!}
        />
      )}
      <CreateBuyerForm />
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => queryClient.refetchQueries(["BuyerData"])}
          className="p-2 hover:bg-gray-100 rounded-full"
          title="Refresh"
        >
          <LucideRefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="flex mb-4 gap-2">
        {/* Search by Name */}
        <input
          type="text"
          placeholder="Search by name..."
          onChange={(e) => {
            const value = e.target.value.trim();
            setCurrentPage(1);

            if (value) {
              setFilters((prevFilters) => {
                const otherFilters = prevFilters.filter(
                  (f) => f.column !== "name"
                );
                return [
                  ...otherFilters,
                  { column: "name", operator: "contains", value },
                ];
              });
            } else {
              setFilters((prevFilters) =>
                prevFilters.filter((f) => f.column !== "name")
              );
            }
          }}
          className="w-full p-2 border rounded-md text-sm"
        />

        {/* Search by Mobile Number */}
        <input
          type="number"
          inputMode="numeric"
          pattern="\d*"
          maxLength={10}
          placeholder="Search by mobile number (10 digits)..."
          onInput={(e: React.FormEvent<HTMLInputElement>) => {
            const input = e.currentTarget;
            if (input.value.length > 10) {
              input.value = input.value.slice(0, 10);
            }
          }}
          onChange={(e) => {
            let value = e.target.value.replace(/\D/g, ""); // Remove non-digits
            if (value.length > 10) value = value.slice(0, 10);
            setCurrentPage(1);

            if (/^\d{10}$/.test(value)) {
              setFilters((prevFilters) => {
                const otherFilters = prevFilters.filter(
                  (f) => f.column !== "mobileNumber"
                );
                return [
                  ...otherFilters,
                  { column: "mobileNumber", operator: "contains", value },
                ];
              });
            } else {
              setFilters((prevFilters) =>
                prevFilters.filter((f) => f.column !== "mobileNumber")
              );
            }
          }}
          className="w-full p-2 border rounded-md text-sm"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {uniqueCropNames.map((cropName) => (
          <button
            key={cropName}
            onClick={() => toggleCropFilter(cropName)}
            className={`flex items-center space-x-2 rounded px-2 py-1 text-sm ${
              isCropFilterActive(cropName)
                ? "bg-green-100 text-green-600"
                : "bg-gray-100 text-gray-600"
            } hover:bg-green-200`}
          >
            <span>{cropName}</span>
            {isCropFilterActive(cropName) ? (
              <LucideCheck className="w-4 h-4" />
            ) : (
              <LucideX className="w-4 h-4" />
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <Controller
            name="density"
            control={control}
            render={({ field }) => (
              <div className="flex items-center space-x-2">
                <label>Density:</label>
                <select {...field} className="border rounded-md p-1 text-sm">
                  <option value="comfortable">Comfortable</option>
                  <option value="compact">Compact</option>
                </select>
              </div>
            )}
          />

          <div className="relative z-20">
            <button
              className={`flex items-center space-x-1 p-1.5 border rounded-md text-sm ${
                isFilterOpen ? "bg-blue-50 border-blue-200" : ""
              }`}
              onClick={toggleFilterOpen}
            >
              <LucideFilter
                className={`w-3.5 h-3.5 ${isFilterOpen ? "text-blue-500" : ""}`}
              />
              <span>Filters {filters.length > 0 && `(${filters.length})`}</span>
            </button>
            {isFilterOpen && (
              <div className="absolute left-0 bg-white border rounded-lg p-4 shadow-lg w-[450px] mt-2 z-30">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Filter Data</h3>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <LucideX className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {filters.map((filter, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md"
                    >
                      <select
                        value={filter.column}
                        onChange={(e) =>
                          updateFilter(index, "column", e.target.value)
                        }
                        className="border rounded-md p-1.5 text-sm flex-1 bg-white"
                      >
                        <option value="">Select Column</option>
                        {tableColumns.map((col) => (
                          <option key={String(col.key)} value={String(col.key)}>
                            {col.header}
                          </option>
                        ))}
                      </select>

                      <select
                        value={filter.operator}
                        onChange={(e) =>
                          updateFilter(index, "operator", e.target.value)
                        }
                        className="border rounded-md p-1.5 text-sm flex-1 bg-white"
                      >
                        <option value="">Select Operator</option>
                        {tableColumns
                          .find((col) => col.key === filter.column)
                          ?.filterOperators?.map((op) => (
                            <option key={op} value={op}>
                              {op}
                            </option>
                          ))}
                      </select>

                      <input
                        type={filter.column === "createdAt" ? "date" : "text"}
                        value={filter.value}
                        onChange={(e) =>
                          updateFilter(index, "value", e.target.value)
                        }
                        className="border rounded-md p-1.5 text-sm flex-1 bg-white"
                        placeholder={
                          filter.column === "createdAt" ? "YYYY-MM-DD" : "Value"
                        }
                      />

                      <button
                        onClick={() => removeFilter(index)}
                        className="text-gray-400 hover:text-red-500 p-1"
                      >
                        <LucideX className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={addFilter}
                  className="mt-4 text-blue-500 hover:text-blue-600 text-sm font-medium"
                >
                  + Add Filter
                </button>
              </div>
            )}
          </div>
        </div>

        <Controller
          name="columns"
          control={control}
          render={({ field }) => (
            <div className="relative z-20">
              <button
                className="flex items-center space-x-1 p-1.5 border rounded-md text-sm"
                onClick={toggleColumnsOpen}
              >
                <LucideFilter className="w-3.5 h-3.5" />
                <span>Columns</span>
              </button>
              {isColumnsOpen && (
                <div className="absolute right-0 bg-white border rounded-md p-3 shadow-sm w-44 mt-1 z-30 max-h-[300px] overflow-y-auto">
                  {tableColumns.map((col) => (
                    <div
                      key={String(col.key)}
                      className="flex items-center space-x-2 mb-1.5"
                    >
                      <input
                        type="checkbox"
                        checked={
                          field.value[col.key as keyof TableData] || false
                        }
                        onChange={() =>
                          field.onChange({
                            ...field.value,
                            [col.key]: !field.value[col.key as keyof TableData],
                          })
                        }
                      />
                      <label className="text-sm">{col.header}</label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        />
      </div>

      <Table
        data={filteredData}
        columns={filteredColumns}
        onSort={handleSort}
        sortConfig={sortConfig}
        isLoading={isLoading}
        pageSize={pageSize}
        meta={BuyerData?.meta}
        onPageChange={(page: number) => setCurrentPage(page)}
        actions={tableActions}
        density={watch("density") as "compact" | "comfortable" | undefined}
      />
    </div>
  );
};

export default BuyersPage;
