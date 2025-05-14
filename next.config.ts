import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } from "next/constants";

const nextConfig: NextConfig = {
  i18n: null,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        pathname: "**",
      },
    ],
  },
};

export default function(phase: string) {
  if (phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_PRODUCTION_BUILD) {
    const withPWAConfig = withPWA({
      dest: "public",
      register: true,
      disable: process.env.NODE_ENV === "development",
      fallbacks: {
        document: "/offline",
      }
    });
    
    return withPWAConfig(nextConfig);
  }
  return nextConfig
}