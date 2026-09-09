import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/**/*": ["./templates/**/*"],
  },
  serverExternalPackages: ["xlsx"],
};

export default nextConfig;
