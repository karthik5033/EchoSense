/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "three",
      "framer-motion",
      "clsx",
      "tailwind-merge",
      "class-variance-authority",
    ],
  },
};

export default nextConfig;
