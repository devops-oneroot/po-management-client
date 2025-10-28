"use client";
import React from "react";
import Link from "next/link";
import { Building2, User } from "lucide-react";

interface Stage {
  id: number;
  name: string;
  completed: boolean;
}

interface Buyer {
  id: number;
  name: string;
  orderQuantity: string;
  stages: Stage[];
}

interface Company {
  id: number;
  name: string;
  buyers: Buyer[];
}

const data: Company[] = [
  {
    id: 1,
    name: "ABC Agro Pvt Ltd",
    buyers: [
      {
        id: 101,
        name: "Ramesh Traders",
        orderQuantity: "50 Tons",
        stages: [
          { id: 1, name: "Loading Truck", completed: true },
          { id: 2, name: "Gate Pass", completed: true },
          { id: 3, name: "Unloading", completed: false },
          { id: 4, name: "GRN", completed: false },
          { id: 5, name: "Payment", completed: false },
        ],
      },
      {
        id: 102,
        name: "Patel Distributors",
        orderQuantity: "30 Tons",
        stages: [
          { id: 1, name: "Loading Truck", completed: true },
          { id: 2, name: "Gate Pass", completed: false },
          { id: 3, name: "Unloading", completed: false },
        ],
      },
    ],
  },
  {
    id: 2,
    name: "GreenLeaf Exporters",
    buyers: [
      {
        id: 201,
        name: "Nature Line Pvt Ltd",
        orderQuantity: "45 Tons",
        stages: [
          { id: 1, name: "Loading Truck", completed: true },
          { id: 2, name: "Gate Pass", completed: true },
          { id: 3, name: "Unloading", completed: true },
          { id: 4, name: "GRN", completed: true },
          { id: 5, name: "Payment", completed: false },
        ],
      },
    ],
  },
];

const Page = () => {
  const [selectedCompany, setSelectedCompany] = React.useState<Company>(
    data[0]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-purple-700 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5" /> Companies
        </h2>
        {data.map((company) => (
          <button
            key={company.id}
            onClick={() => setSelectedCompany(company)}
            className={`w-full text-left px-4 py-3 mb-2 rounded-lg border transition-all ${
              selectedCompany.id === company.id
                ? "bg-purple-100 border-purple-300 text-purple-700 font-medium"
                : "bg-white hover:bg-purple-50 border-gray-200 text-gray-700"
            }`}
          >
            {company.name}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10">
        <h1 className="text-2xl font-bold text-purple-700 mb-8">
          {selectedCompany.name} - Buyers
        </h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {selectedCompany.buyers.map((buyer) => {
            const progress =
              (buyer.stages.filter((s) => s.completed).length /
                buyer.stages.length) *
              100;

            return (
              <Link
                key={buyer.id}
                href={`/po/${buyer.id}`}
                className="p-6 bg-white rounded-2xl shadow hover:shadow-lg border border-gray-100 transition-all block"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-500" /> {buyer.name}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {buyer.orderQuantity}
                  </span>
                </div>

                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-2 bg-purple-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <p className="mt-2 text-sm text-gray-500">
                  {buyer.stages.find((s) => !s.completed)?.name ||
                    "✅ Completed"}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Page;
