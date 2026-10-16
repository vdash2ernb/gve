import type { Metadata } from "next";

import "./fonts.css";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Header from "@/components/Header";
import Footer from "@/components/Footer";





export const metadata: Metadata = {
  // The site moves to this domain at launch; canonical links on every page resolve against it.
  metadataBase: new URL("https://globalvirtualexperts.com"),
  icons: { icon: [{url:"/brand/gve-favicon.png",sizes:"32x32",type:"image/png"},{url:"/brand/gve-icon-192.png",sizes:"192x192",type:"image/png"}], apple:"/brand/gve-apple-icon.png" },
  title: {
    default: "Global Virtual Experts · Virtual assistants for your business",
    template: "%s · Global Virtual Experts",
  },
  description:
    "Hire virtual assistants in the Philippines for admin, bookkeeping, sales, design, and more. GVE handles screening, onboarding, and ongoing support.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-svh">
        <SmoothScroll>

          <Header />
          <main id="main-content" className="relative">{children}</main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
