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
  { label: "Eois", icon: ShoppingBasket, href: "/eois-card" },
  { label: "Po", icon: ShoppingCart, href: "/po-card" },
];

const Sidebar: React.FC = () => {
  const pathname = usePathname();

  // Sidebar open/close state
  const [isOpen, setIsOpen] = React.useState(true);
  const toggleSidebar = () => setIsOpen((prev) => !prev);

  return (
    <aside
      className={`z-40 h-screen shadow-2xl bg-purple-950 text-white transition-all duration-300 ease-in-out ${
        isOpen ? "w-48" : "w-14"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-14 px-2 bg-gradient-to-br from-purple-950 via-purple-900 to-purple-950 shadow-lg border-b border-purple-800/30">
        <Image
          src="/marKhet  Logo white.png"
          width={isOpen ? 110 : 32}
          height={18}
          alt="markhet logo"
          className="rounded-md transition-all duration-300"
        />
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-md bg-purple-800/50 hover:bg-purple-700 transition-all duration-200 hover:scale-105 active:scale-95"
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-3 space-y-0.5 px-1.5">
        {supervisorNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`group flex items-center gap-2 px-2.5 py-2 rounded-md transition-all duration-200 hover:scale-[1.01] ${
              pathname === item.href
                ? "bg-purple-700 text-white shadow-md shadow-purple-900/50 font-semibold"
                : "text-purple-100 hover:bg-purple-800/60 hover:text-white"
            }`}
          >
            <item.icon className={`w-3.5 h-3.5 transition-transform group-hover:scale-110 ${
              pathname === item.href ? "text-purple-200" : "text-purple-300"
            }`} />
            {isOpen && (
              <span className="text-[11px] font-medium tracking-wide">{item.label}</span>
            )}
            {pathname === item.href && isOpen && (
              <div className="ml-auto w-0.5 h-0.5 rounded-full bg-purple-300 animate-pulse"></div>
            )}
          </Link>
        ))}
      </nav>

      {/* Footer - Hidden */}
    </aside>
  );
};

export default Sidebar;
