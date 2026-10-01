import Image from "next/image";
import Link from "next/link";
import { contact, nav } from "@/content/site";

export default function Footer() {
  return (
    <footer className="relative border-t border-line bg-bg/80 backdrop-blur-sm">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Image src="/brand/gve-logo.webp" alt="Global Virtual Experts" width={1536} height={384} className="h-9 w-auto" />
          <p className="mt-4 max-w-xs text-sm text-muted">Real people. AI powered. Building your success.</p>
        </div>
        <div>
          <p className="eyebrow">Explore</p>
          <ul className="mt-4 space-y-2 text-sm">
            {[...nav, { href: "/start", label: "Start your search" }, { href: "/privacy", label: "Privacy" }].map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="text-muted transition-colors hover:text-ink">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow">Contact</p>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li>{contact.location}</li>
            <li>
              <a href={`mailto:${contact.email}`} className="hover:text-ink">
                {contact.email}
              </a>
            </li>
            <li>
              <a href={contact.phoneHref} className="hover:text-ink">
                {contact.phone}
              </a>
            </li>
            <li>
              Sales:{" "}
              <a href={contact.salesPhoneHref} className="hover:text-ink">
                {contact.salesPhone}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl flex-col gap-2 border-t border-line px-4 py-6 text-xs text-muted sm:flex-row sm:justify-between sm:px-6">
        <p>© {new Date().getFullYear()} Global Virtual Experts</p>
        <p>Demo redesign. Not the live site.</p>
      </div>
    </footer>
  );
}
