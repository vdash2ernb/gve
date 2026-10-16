import type { Metadata } from "next";

import "./fonts.css";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { decideIntroScript } from "@/components/mission/decide";





export const metadata: Metadata = {
  // The site moves to this domain at launch; canonical links on every page resolve against it.
  metadataBase: new URL("https://globalvirtualexperts.com"),
  // /favicon.ico covers browsers and tools that only look there; Google wants a size divisible by 48.
  icons: { icon: [{url:"/favicon.ico",sizes:"16x16 32x32 48x48"},{url:"/brand/gve-favicon.png",sizes:"32x32",type:"image/png"},{url:"/brand/gve-icon-48.png",sizes:"48x48",type:"image/png"},{url:"/brand/gve-icon-192.png",sizes:"192x192",type:"image/png"}], apple:"/brand/gve-apple-icon.png" },
  title: {
    default: "Global Virtual Experts · Virtual assistants for your business",
    template: "%s · Global Virtual Experts",
  },
  description:
    "Hire virtual assistants in the Philippines for admin, bookkeeping, sales, design, and more. GVE handles screening, onboarding, and ongoing support.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        {/* Decides before first paint whether the homepage plays the first-visit intro. */}
        <script dangerouslySetInnerHTML={{ __html: decideIntroScript }} />
      </head>
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
