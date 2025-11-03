import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["res.cloudinary.com"], // ✅ Allow Cloudinary images
  },
  typescript: {
    ignoreBuildErrors: true, // ✅ Disable type checking during build
  },
  eslint: {
    ignoreDuringBuilds: true, // ✅ Disable ESLint during build
  },
};

export default nextConfig;
