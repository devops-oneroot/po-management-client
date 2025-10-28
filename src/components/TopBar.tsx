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
    <header className="w-full flex items-center justify-between h-14 px-6 bg-purple-950 shadow-md">
      {/* Page Title */}
      <h1 className="text-lg font-semibold text-white">
        {getPageName(pathname || "")}
      </h1>

      {/* User Info & Logout */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-white">
          <User size={20} />
          <span className="text-sm font-medium">{userName}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 px-3 py-1 text-sm text-white bg-purple-600 rounded-md hover:bg-purple-700 transition"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
};

export default TopBar;
