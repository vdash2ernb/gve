import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build plain HTML/CSS/JS into `out/` so Cloudflare can serve it as static files.
  output: "export",
  // The default image optimizer needs a server; serve images as-is instead.
  images: { unoptimized: true },
  // Let phones and other computers on the office network open the dev preview.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*"],
};

export default nextConfig;
