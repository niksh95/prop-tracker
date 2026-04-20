import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/*": ["./prisma/dev.db", "./prisma/migrations/**/*"],
  },
};

export default nextConfig;
