import type { Metadata } from "next";
import { SceneStages } from "@/components/Scene";
import { Reveal, Words } from "@/components/Reveal";
import { contact } from "@/content/site";

export const metadata: Metadata = {
  title: "Book a call",
  description: "Book a free 30-minute call with Global Virtual Experts.",
};

const calendlySrc = `${contact.calendly}?hide_gdpr_banner=1&background_color=0a1020&text_color=eef2f8&primary_color=ffa600`;

export default function ContactPage() {
  return (
    <>
      <SceneStages stages={[{ shape: "globe", x: -3.2, rotY: Math.PI, scale: 0.9, dim: 0.55 }]} />
      <section data-stage={0} className="px-4 pb-24 pt-32 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <Reveal>
              <p className="eyebrow">Book a call</p>
            </Reveal>
            <h1 className="display mt-5 text-5xl sm:text-7xl">
              <Words text="Let's talk." accent={["talk."]} delay={0.1} />
            </h1>
            <Reveal delay={0.3}>
              <p className="mt-6 max-w-md text-lg text-muted">
                30 minutes, free. Tell us what&apos;s taking your time and we&apos;ll show you what to hand off first.
              </p>
            </Reveal>
            <Reveal delay={0.45}>
              <dl className="mt-12 space-y-6">
                <div>
                  <dt className="eyebrow">Email</dt>
                  <dd className="mt-1 text-lg">
                    <a href={`mailto:${contact.email}`} className="hover:text-amber">
                      {contact.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow">Phone</dt>
                  <dd className="mt-1 text-lg">
                    <a href={contact.phoneHref} className="hover:text-amber">
                      {contact.phone}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow">Sales</dt>
                  <dd className="mt-1 text-lg">
                    <a href={contact.salesPhoneHref} className="hover:text-amber">
                      {contact.salesPhone}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow">Office</dt>
                  <dd className="mt-1 text-lg">{contact.location}</dd>
                </div>
              </dl>
            </Reveal>
          </div>
          <Reveal delay={0.2} className="card overflow-hidden !rounded-3xl">
            <iframe src={calendlySrc} title="Book a 30-minute call with Global Virtual Experts" className="h-[760px] w-full" loading="lazy" />
          </Reveal>
        </div>
      </section>
    </>
  );
}
