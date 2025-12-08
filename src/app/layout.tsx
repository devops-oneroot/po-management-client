import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/SideBar";
import TopBar from "../components/TopBar";

// Primary Font - Inter for body text
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  fallback: ["system-ui", "-apple-system", "sans-serif"],
  adjustFontFallback: true,
});

// Heading Font - Plus Jakarta Sans for headings
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  fallback: ["system-ui", "-apple-system", "sans-serif"],
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "PO Management - Dashboard",
  description: "Modern minimal purchase order management dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jakarta.variable} antialiased bg-slate-50`}
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
            <main className="flex-1 overflow-y-auto bg-slate-50">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
