/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@aurix/core", "@aurix/score"],
  experimental: {
    optimizePackageImports: ["framer-motion"],
  },
};

export default nextConfig;
