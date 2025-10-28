"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboardIcon,
  Calendar,
  Leaf,
  User2,
  UserCheck2,
  ListTodoIcon,
  BarChart2,
  PhoneCall,
  ShieldCheck,
  WatchIcon,
  DollarSign,
  MapPin,
  Building2,
  ShoppingBasket,
  ShoppingCart,
} from "lucide-react";
import Image from "next/image";

const supervisorNavItems = [
  { label: "Company", icon: Building2, href: "/company" },
  { label: "Po", icon: ShoppingCart, href: "/po-card" },
  { label: "Eois", icon: ShoppingBasket, href: "/eois-card" },
];

const Sidebar: React.FC = () => {
  const pathname = usePathname();

  // Sidebar open/close state
  const [isOpen, setIsOpen] = React.useState(true);
  const toggleSidebar = () => setIsOpen((prev) => !prev);

  return (
    <aside
      className={`z-40 h-screen shadow-xl bg-purple-950 text-white transition-all duration-300 ease-in-out ${
        isOpen ? "w-52" : "w-20"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-2 bg-gradient-to-r from-purple-950 to-purple-900 shadow-md">
        <Image
          src="/marKhet  Logo white.png"
          width={isOpen ? 140 : 40}
          height={20}
          alt="markhet logo"
          className="rounded-md"
        />
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-full bg-purple-700 hover:bg-purple-800"
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-6 space-y-2 px-3">
        {supervisorNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center p-2 rounded-md transition-all duration-200 hover:scale-105 ${
              pathname === item.href
                ? "bg-purple-800 text-white shadow-md"
                : "text-purple-100 hover:bg-purple-700"
            }`}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {isOpen && (
              <span className="text-sm font-medium">{item.label}</span>
            )}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      {isOpen && (
        <div className=" p-3 bg-gradient-to-r from-purple-950 to-purple-900 mt-[600px]">
          {/* <a
            href="https://oneroot.vercel.app/regions"
            target="_blank"
            rel="noopener noreferrer"
            className="block mb-2 px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm font-medium text-center"
          >
            View All Regions Prices
          </a> */}
          <p className="text-sm font-semibold">Order Dashboard</p>
          <p className="text-xs text-purple-200">markhet.farm</p>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
