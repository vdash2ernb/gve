import type { Metadata } from "next";
import { Geist, Instrument_Serif } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SceneCanvas } from "@/components/Scene";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const serif = Instrument_Serif({ variable: "--font-serif", subsets: ["latin"], weight: "400", style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: {
    default: "Global Virtual Experts: virtual assistants for busy business owners",
    template: "%s · Global Virtual Experts",
  },
  description:
    "Skilled virtual experts in the Philippines, backed by AI tools, take admin, bookkeeping, sales support and more off your plate.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${serif.variable} antialiased`}>
      <body className="min-h-svh">
        <SmoothScroll>
          <SceneCanvas />
          <Header />
          <main className="relative">{children}</main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
