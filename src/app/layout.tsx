import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/SideBar";
import TopBar from "../components/TopBar";
// <-- make sure you have Sidebar component

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Dashboard layout with fixed topbar and sidebar",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-50 dark:bg-black`}
      >
        {/* Layout wrapper */}
        <div className="flex h-screen">
          {/* Sidebar */}
          <Sidebar />

          {/* Main content area */}
          <div className="flex flex-col flex-1">
            {/* TopBar */}
            <TopBar />

            {/* Page content */}
            <main className="flex-1  p-3 overflow-y-auto bg-gradient-to-b from-gray-50 to-gray-100">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
