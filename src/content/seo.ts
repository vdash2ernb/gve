import type { Metadata } from "next";
import { contact } from "./site";

export const siteUrl = "https://globalvirtualexperts.com";
export const siteName = "Global Virtual Experts";
export const organizationId = siteUrl + "/#organization";
// The card shown when a page is shared on LinkedIn, Facebook, Slack, or in a text message.
export const shareImage = { url: "/og-image.png", width: 1200, height: 630, alt: "Global Virtual Experts: virtual assistants for your business" };

// Search titles keep the words people search for ("virtual assistant", the service name)
// and always end with the full company name.
export function pageMeta({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: path },
    openGraph: { title: fullTitle, description, url: path, siteName, type: "website", locale: "en_US", images: [shareImage] },
  };
}

export const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": organizationId,
  name: siteName,
  alternateName: "GVE",
  url: siteUrl + "/",
  logo: siteUrl + "/brand/gve-icon-192.png",
  description:
    "Global Virtual Experts helps business owners hire skilled virtual assistants based in the Philippines, with screening, onboarding, and ongoing support.",
  email: contact.email,
  telephone: contact.phoneHref.replace("tel:", ""),
  foundingDate: "2023",
  founder: { "@type": "Person", name: "Craig Mauer" },
  address: { "@type": "PostalAddress", addressLocality: "Seattle", addressRegion: "WA", addressCountry: "US" },
  contactPoint: [
    { "@type": "ContactPoint", contactType: "sales", telephone: contact.salesPhoneHref.replace("tel:", ""), email: contact.email },
    { "@type": "ContactPoint", contactType: "customer service", telephone: contact.phoneHref.replace("tel:", ""), email: contact.email },
  ],
  // GVE's Google profile supplied by GVE identifies the same organization. No aggregate rating is claimed.
  sameAs: [contact.googleBusinessProfile, contact.youtube, contact.instagram],
};

export function jsonLd(data: object) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
