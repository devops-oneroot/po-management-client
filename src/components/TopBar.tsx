"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";

const TopBar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  const getPageName = (path: string) => {
    if (path === "/" || path === "/dashboard") return "Dashboard";
    const last = path.split("/").pop() || "";
    return last.charAt(0).toUpperCase() + last.slice(1);
  };

  const handleLogout = () => {
    // Add your logout logic here
    router.push("/login");
  };

  const userName = "Haider"; // Replace with dynamic user data if available

  return (
    <header className="w-full flex items-center justify-between h-14 px-4 bg-purple-950 shadow-lg border-b border-purple-800/30">
      {/* Page Title */}
      <div className="flex items-center gap-1.5">
        <div className="w-0.5 h-5 bg-purple-400 rounded-full"></div>
        <h1 className="text-base font-bold text-white tracking-tight">
          {getPageName(pathname || "")}
        </h1>
      </div>

      {/* User Info & Logout */}
      <div className="flex items-center gap-3">
        {/* User Profile */}
        <div className="flex items-center gap-2 px-2.5 py-1 bg-purple-900/50 rounded-md border border-purple-800/30 hover:border-purple-700/50 transition-colors">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-md">
            <User size={14} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-white">{userName}</span>
            <span className="text-[9px] text-purple-300">Administrator</span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="group flex items-center gap-1 px-3 py-1.5 text-[10px] font-medium text-white bg-purple-700 hover:bg-purple-600 rounded-md shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <LogOut size={12} className="group-hover:rotate-12 transition-transform" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default TopBar;
