"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Building2,
  ShoppingBasket,
  ShoppingCart,
  LayoutDashboard,
  UserCog,
} from "lucide-react";

const supervisorNavItems = [
  { label: "Overview", icon: LayoutDashboard, href: "/" },
  { label: "Companies", icon: Building2, href: "/company" },
  { label: "EOIs", icon: ShoppingBasket, href: "/eois-card" },
  { label: "POs", icon: ShoppingCart, href: "/po-card" },
  { label: "Buyers", icon: UserCog , href: "/aggregators-leads" },
];

const Sidebar: React.FC = () => {
  const pathname = usePathname();

  // Sidebar open/close state
  const [isOpen, setIsOpen] = React.useState(true);
  const toggleSidebar = () => setIsOpen((prev) => !prev);

  return (
    <aside
      className={`z-40 h-screen bg-slate-950 text-white transition-all duration-300 ease-in-out border-r border-slate-800 ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
        {isOpen ? (
          <span className="text-lg font-bold text-white">MarkhetB2B</span>
        ) : (
          <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center mx-auto">
            <span className="text-white text-lg font-bold">M</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 transition-colors duration-150"
        >
          {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-6 space-y-2 px-3">
        {supervisorNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-150 ${
              pathname === item.href
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
            }`}
          >
            <item.icon
              className={`w-5 h-5 flex-shrink-0 ${
                pathname === item.href ? "text-blue-400" : "text-slate-400"
              }`}
            />
            {isOpen && (
              <span className="text-sm font-medium">
                {item.label}
              </span>
            )}
            {pathname === item.href && isOpen && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500"></div>
            )}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
