import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    BASE_URL: process.env.BASE_URL,
  },

  images: {
remotePatterns: [
    {
      protocol: "http",
      hostname: "api.zeonixpay.com",
      pathname: "/media/**",   // matches /media/... paths
    },
  ],
  },
};

export default nextConfig;
