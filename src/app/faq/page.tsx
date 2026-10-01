import type { Metadata } from "next";
import { SceneStages } from "@/components/Scene";
import { Reveal } from "@/components/Reveal";
import PageHero from "@/components/PageHero";
import CTA from "@/components/CTA";
import Accordion from "@/components/Accordion";
import { faq } from "@/content/site";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Hours, hiring, pricing, tracking and data security: what to expect when you work with a GVE Expert.",
};

export default function FAQPage() {
  return (
    <>
      <SceneStages
        stages={[
          { shape: "chaos", x: 2.6, scale: 0.8, dim: 0.8 },
          { shape: "grid", scale: 0.9, dim: 0.25 },
          { shape: "clock", scale: 1, dim: 0.38 },
        ]}
      />
      <PageHero eyebrow="FAQ" title="Questions, answered." accent={["answered."]} body="Short answers to what owners ask us most." />

      <section data-stage={1} className="px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-6xl space-y-16">
          {faq.map((g) => (
            <Reveal key={g.topic} className="grid gap-6 md:grid-cols-[1fr_2.2fr]">
              <h2 className="display text-3xl">{g.topic}</h2>
              <Accordion items={g.items} />
            </Reveal>
          ))}
        </div>
      </section>

      <CTA stage={2} title="Still curious? Ask us." body="A free call is the quickest way to get answers about your business." />
    </>
  );
}
