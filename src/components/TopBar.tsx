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
    return last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, " ");
  };

  const handleLogout = () => {
    // Add your logout logic here
    router.push("/login");
  };

  const userName = "Haider"; // Replace with dynamic user data if available

  return (
    <header className="w-full flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200 sticky top-0 z-40">
      {/* Page Title */}
      <div>
        <h1 className="text-lg font-semibold text-slate-900">
          {getPageName(pathname || "")}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your orders efficiently
        </p>
      </div>

      {/* User Info & Logout */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-md border border-slate-200">
          <User size={16} className="text-slate-600" />
          <span className="text-sm font-medium text-slate-700">{userName}</span>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors duration-150"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
};

export default TopBar;
