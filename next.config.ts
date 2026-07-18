import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Stencil-based iX components must be transpiled by Next.js
  transpilePackages: ["@siemens/ix", "@siemens/ix-react", "@siemens/ix-icons"],
};

export default nextConfig;
