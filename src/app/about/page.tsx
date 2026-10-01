import type { Metadata } from "next";
import Image from "next/image";
import { SceneStages } from "@/components/Scene";
import { Reveal, Words, Parallax } from "@/components/Reveal";
import PageHero from "@/components/PageHero";
import CTA from "@/components/CTA";
import Partners from "@/components/Partners";
import YouTube from "@/components/YouTube";
import { team } from "@/content/site";

export const metadata: Metadata = {
  title: "About",
  description: "GVE was started in 2023 by Craig Mauer, a Seattle builder who saw what virtual experts did for his own business.",
};

const story = [
  {
    year: "2020",
    title: "A builder goes remote",
    body: "Craig Mauer ran Silver Peak Design Build in North Seattle. When the pandemic hit, he moved meetings to Zoom and the books to QuickBooks Online. A mentor suggested he hire an executive assistant from the Philippines: Alma. Within a few months, his workload dropped sharply.",
  },
  {
    year: "2021",
    title: "The team grows",
    body: "Silver Peak hired Kate, a drafter with a degree and five years' experience. In her first year she was promoted to pre-production management: permits, crew documents, material orders. With systems in place, Silver Peak won larger projects, and Craig had more time for his family.",
  },
  {
    year: "2023",
    title: "GVE begins",
    body: "U.S. unemployment sat at 3.5% and small businesses couldn't find or keep good people. Nearly every growth-minded owner Craig talked to wanted a virtual assistant. So he built a company to provide them.",
  },
];

export default function AboutPage() {
  return (
    <>
      <SceneStages
        stages={[
          { shape: "bridge", y: 0.6, scale: 0.9, dim: 0.85 },
          { shape: "globe", x: 2.8, rotY: Math.PI, scale: 0.9, dim: 0.75 },
          { shape: "sphere", dim: 0.3 },
          { shape: "grid", scale: 0.9, dim: 0.3 },
          { shape: "clock", scale: 1, dim: 0.38 },
        ]}
      />
      <PageHero
        eyebrow="About GVE"
        title="Built by an owner who needed the help."
        accent={["needed", "the", "help."]}
        body="Our goal is simple: help businesses thrive, and raise the standard of living for the Experts who make it happen."
      />

      <section data-stage={1} className="px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <ol className="max-w-xl space-y-20">
            {story.map((s) => (
              <Reveal as="li" key={s.year}>
                <p className="display text-7xl text-white/10 sm:text-8xl">{s.year}</p>
                <h2 className="display -mt-6 text-3xl sm:-mt-8 sm:text-4xl">{s.title}</h2>
                <p className="mt-4 text-lg text-muted">{s.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section data-stage={2} className="px-4 py-32 sm:px-6">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-[0.8fr_1.2fr]">
          <Parallax speed={0.08}>
            <Reveal className="relative overflow-hidden rounded-3xl border border-line">
              <Image src="/team/craig.jpeg" alt="Craig Mauer, CEO and founder" width={678} height={680} className="h-auto w-full object-cover" />
            </Reveal>
          </Parallax>
          <div>
            <Reveal>
              <p className="eyebrow">CEO & founder</p>
            </Reveal>
            <h2 className="display mt-4 text-5xl sm:text-6xl">
              <Words text="Craig Mauer" />
            </h2>
            <Reveal delay={0.15}>
              <p className="mt-6 text-lg text-muted">
                A decade in hospitality and tourism, including seven years in ski area management leading more than 100 people. Then twenty years owning construction businesses, including Silver Peak Design Build since 2010.
              </p>
              <p className="mt-4 text-lg text-muted">
                He cares about work/life balance because he lives it: mountains with family, the water with friends, music, cooking, history and two dogs.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section data-stage={3} className="px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="display text-5xl sm:text-6xl">
            <Words text="Meet the Experts." accent={["Experts."]} />
          </h2>
          <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
            {team.map((m, i) => (
              <Reveal as="li" key={m.name} delay={(i % 5) * 0.06}>
                <div className="group overflow-hidden rounded-2xl border border-line">
                  <Image src={m.img} alt={m.name} width={300} height={300} className="aspect-square w-full object-cover grayscale-[35%] transition duration-700 group-hover:scale-105 group-hover:grayscale-0" />
                </div>
                <p className="mt-3 font-medium">{m.name}</p>
                <p className="text-sm text-muted">{m.role}</p>
              </Reveal>
            ))}
          </ul>
          <Reveal className="mx-auto mt-24 max-w-3xl">
            <YouTube id="rOlaO2CRFUA" title="Meet the GVE Team!" />
          </Reveal>
          <Reveal className="mt-24">
            <p className="text-center text-sm text-muted">Our partners</p>
            <Partners />
          </Reveal>
        </div>
      </section>

      <CTA stage={4} title="Let's find someone great for you." body="Growing fast, or just too busy? We'll match you with an Expert who fits." />
    </>
  );
}
