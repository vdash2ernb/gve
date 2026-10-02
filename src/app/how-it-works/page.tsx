import type { Metadata } from "next";
import { SceneStages } from "@/components/Scene";
import { VIEW } from "@/components/three/shapes";
import BuildSequence from "@/components/BuildSequence";
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
          { shape: "house0", x: 2.6, rotY: -0.6, rotX: 0.42, scale: 0.9, my: 1.45, mscale: 0.5 },
          // Six steps, six stages of the build: plan, foundation, frame, roof, lights on, extension.
          ...([0, 1, 2, 3, 4, 5] as const).map((l) => ({ shape: `house${l}` as const, x: -2.1, rotY: -0.6, rotX: 0.42, scale: 0.92, my: 1.5, mscale: 0.55 })),
          // What's included: you, your Expert, and clear lines between you.
          { shape: "handoff", x: 2.6, y: 1.3, scale: 0.7, dim: 0.55, my: 1.9, mscale: 0.4 },
          { shape: "globe", scale: 1.15, ...VIEW.logo, dim: 0.4, labels: "none", sway: 0.25 },
        ]}
      />
      <PageHero
        eyebrow="How it works"
        title="From first call to working Expert."
        accent={["working", "Expert."]}
        body="Usually 5–10 business days. Faster if a pre-vetted Expert is ready."
      />

      <BuildSequence eyebrow="Step by step" title="Built the way you build." accent={["you", "build."]} steps={steps} stepPrefix="Step " />

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
