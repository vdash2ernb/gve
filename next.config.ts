import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Let phones and other computers on the office network open the dev preview.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*"],
};

export default nextConfig;
