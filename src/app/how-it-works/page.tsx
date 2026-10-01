import type { Metadata } from "next";
import Link from "next/link";
import { SceneStages } from "@/components/Scene";
import { Reveal, Words } from "@/components/Reveal";
import PageHero from "@/components/PageHero";
import CTA from "@/components/CTA";
import YouTube from "@/components/YouTube";

export const metadata: Metadata = {
  title: "How it works",
  description: "From a free call to a working Expert, usually in 5–10 business days.",
};

const steps = [
  { title: "Free consultation", body: "Tell us about your business, your busy seasons and the work that eats your time." },
  { title: "Start the search", body: "A refundable $1,000 deposit gets us started. We finalize the job description and agreement, and you sign online.", link: { href: "/start", label: "About the deposit" } },
  { title: "Shortlist & interview", body: "We source, screen, interview and vet candidates. You get a shortlist, interview them yourself and choose." },
  { title: "Onboard", body: "Your Expert learns your tools and preferences. You get a client success manager." },
  { title: "Work & track", body: "A time tracker logs every hour. A daily report shows what got done." },
  { title: "Adjust as you grow", body: "Add hours or add people. If someone isn't the right fit, we replace them at no extra cost." },
];

const included = [
  { title: "Flat monthly pricing", body: "All-inclusive. No setup fees, no hidden charges. Price depends on role, experience and hours." },
  { title: "Easy payment", body: "ACH through our secure portal, or any major card. Cards carry a 3.5% fee." },
  { title: "Confidential by default", body: "Every Expert signs a strict NDA and can sign yours too." },
  { title: "Ready to work", body: "Reliable internet, a headset and a computer. We train them on your software." },
];

export default function HowItWorksPage() {
  return (
    <>
      <SceneStages
        stages={[
          { shape: "spiral", x: 2.8, scale: 0.85 },
          { shape: "spiral", x: -3, scale: 1.05, dim: 0.6 },
          { shape: "grid", scale: 0.9, dim: 0.35 },
          { shape: "clock", scale: 1, dim: 0.38 },
        ]}
      />
      <PageHero
        eyebrow="How it works"
        title="From first call to working Expert."
        accent={["working", "Expert."]}
        body="Usually 5–10 business days. Faster if a pre-vetted Expert is ready."
      />

      <section data-stage={1} className="px-4 py-24 sm:px-6">
        <div className="mx-auto grid max-w-6xl lg:grid-cols-2">
          <div className="hidden lg:block" />
          <ol className="relative space-y-14 border-l border-line pl-8 sm:pl-12">
            {steps.map((s, i) => (
              <Reveal as="li" key={s.title} className="relative">
                <span className="absolute -left-[calc(2rem+5px)] top-2 h-2.5 w-2.5 rounded-full bg-amber shadow-[0_0_20px_rgba(255,166,0,0.8)] sm:-left-[calc(3rem+5px)]" />
                <p className="font-serif text-xl italic text-amber">Step {i + 1}</p>
                <h2 className="display mt-2 text-3xl sm:text-4xl">{s.title}</h2>
                <p className="mt-3 max-w-md text-lg text-muted">{s.body}</p>
                {s.link && (
                  <Link href={s.link.href} className="mt-3 inline-block text-sky hover:underline">
                    {s.link.label} →
                  </Link>
                )}
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section data-stage={2} className="px-4 py-32 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="display text-5xl sm:text-6xl">
            <Words text="What's included." accent={["included."]} />
          </h2>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2">
            {included.map((x, i) => (
              <Reveal as="li" key={x.title} delay={(i % 2) * 0.1} className="card p-7">
                <p className="text-lg font-medium">{x.title}</p>
                <p className="mt-2 text-muted">{x.body}</p>
              </Reveal>
            ))}
          </ul>
          <Reveal className="mx-auto mt-20 max-w-3xl">
            <YouTube id="PoUcM5DTiBQ" title="Unlock the Full Potential of Your Business" />
          </Reveal>
        </div>
      </section>

      <CTA stage={3} />
    </>
  );
}
