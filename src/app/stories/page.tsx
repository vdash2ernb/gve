import type { Metadata } from "next";
import Image from "next/image";
import { SceneStages } from "@/components/Scene";
import { Reveal } from "@/components/Reveal";
import PageHero from "@/components/PageHero";
import CTA from "@/components/CTA";
import YouTube from "@/components/YouTube";
import { contact, stories } from "@/content/site";

export const metadata: Metadata = {
  title: "Stories",
  description: "How our Experts have grown at GVE, and why it matters to the businesses they support.",
};

export default function StoriesPage() {
  return (
    <>
      <SceneStages
        stages={[
          { shape: "bridge", y: 0.4, scale: 0.85, dim: 0.85 },
          { shape: "spiral", x: 3, dim: 0.5 },
          { shape: "clock", scale: 1, dim: 0.38 },
        ]}
      />
      <PageHero
        eyebrow="Expert stories"
        title="When our Experts grow, so do you."
        accent={["grow,", "you."]}
        body="Stay-at-home parents who found flexibility. Freelancers who found steady, meaningful work. Here are a few of them."
      />

      <section data-stage={1} className="px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto mb-24 max-w-3xl">
            <YouTube id="rOlaO2CRFUA" title="Meet the GVE Team!" />
          </Reveal>
          <ul className="grid gap-4 md:grid-cols-2">
            {stories.map((s, i) => (
              <Reveal as="li" key={s.name} delay={(i % 2) * 0.1} className={`card flex gap-6 p-7 ${i % 2 ? "md:translate-y-16" : ""}`}>
                {s.img ? (
                  <Image src={s.img} alt={s.name} width={120} height={120} className="h-20 w-20 shrink-0 rounded-2xl object-cover" />
                ) : (
                  <span className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl border border-line font-serif text-3xl italic text-amber">{s.name[0]}</span>
                )}
                <div>
                  <p className="text-xl font-medium">{s.name}</p>
                  <p className="text-sm text-sky">{s.role}</p>
                  <p className="mt-3 text-muted">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </ul>
          <Reveal className="mt-36 text-center">
            <p className="text-muted">Want to join the team?</p>
            <a href={`mailto:${contact.careersEmail}`} className="mt-2 inline-block text-2xl text-ink hover:text-amber">
              {contact.careersEmail}
            </a>
            <p className="mt-6 text-sm text-muted">
              Follow us on{" "}
              <a href={contact.youtube} target="_blank" rel="noopener noreferrer" className="text-sky hover:underline">
                YouTube
              </a>{" "}
              and{" "}
              <a href={contact.instagram} target="_blank" rel="noopener noreferrer" className="text-sky hover:underline">
                Instagram
              </a>
              .
            </p>
          </Reveal>
        </div>
      </section>

      <CTA stage={2} title="Put a great Expert on your team." body="Reliable, skilled and motivated. Let's talk about what you need." />
    </>
  );
}
