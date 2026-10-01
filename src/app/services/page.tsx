import type { Metadata } from "next";
import Link from "next/link";
import { SceneStages } from "@/components/Scene";
import { Reveal, Words } from "@/components/Reveal";
import PageHero from "@/components/PageHero";
import CTA from "@/components/CTA";
import YouTube from "@/components/YouTube";
import { services } from "@/content/site";

export const metadata: Metadata = {
  title: "Services",
  description: "Admin, bookkeeping, customer support, sales, marketing, design, web, CAD drafting and dispatch, handled by dedicated virtual experts.",
};

const groups = ["Run the office", "Win more work", "Specialists"] as const;

const reasons = [
  { title: "More hours for real work", body: "Hand off the repetitive tasks. Spend your time where your expertise counts." },
  { title: "No office overhead", body: "No desk, no equipment, no extra space to pay for." },
  { title: "Help outside your hours", body: "Your Expert can cover early mornings, evenings or weekends." },
  { title: "Skills you don't have in-house", body: "Design, web, social media, drafting. Bring them in without a new hire." },
  { title: "Room to grow", body: "Add hours or people as work picks up." },
  { title: "Up to 60% saved", body: "On staffing costs, compared with hiring locally." },
];

export default function ServicesPage() {
  return (
    <>
      <SceneStages
        stages={[
          { shape: "grid", x: 2.6, scale: 0.7, dim: 0.8 },
          { shape: "grid", scale: 0.95, dim: 0.35 },
          { shape: "spiral", x: -2.8, dim: 0.7 },
          { shape: "clock", scale: 1, dim: 0.38 },
        ]}
      />
      <PageHero
        eyebrow="Services"
        title="Pick what's eating your week."
        accent={["eating", "your", "week."]}
        body="One Expert or a small team. Full-time or part-time. Here's what we cover."
      />

      <section data-stage={1} className="px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-6xl space-y-20">
          {groups.map((g) => (
            <div key={g}>
              <Reveal>
                <h2 className="display text-3xl sm:text-4xl">{g}</h2>
              </Reveal>
              <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {services
                  .filter((s) => s.group === g)
                  .map((s, i) => (
                    <Reveal as="li" key={s.slug} delay={i * 0.08}>
                      <Link href={`/services/${s.slug}`} className="card group flex h-full flex-col justify-between p-7 transition-colors hover:border-white/20">
                        <span>
                          <span className="block text-xl font-medium">{s.name}</span>
                          <span className="mt-3 block text-muted">{s.tagline}</span>
                        </span>
                        <span className="mt-8 text-sm text-sky transition-transform duration-300 group-hover:translate-x-1">Details →</span>
                      </Link>
                    </Reveal>
                  ))}
              </ul>
            </div>
          ))}
          <Reveal>
            <p className="text-muted">
              Need something not listed?{" "}
              <Link href="/contact" className="text-sky hover:underline">
                Ask us about a custom role.
              </Link>
            </p>
          </Reveal>
        </div>
      </section>

      <section data-stage={2} className="px-4 py-32 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <Reveal>
              <p className="eyebrow">Why an Expert</p>
            </Reveal>
            <h2 className="display mt-5 text-5xl sm:text-6xl">
              <Words text="What you gain." accent={["gain."]} />
            </h2>
            <Reveal delay={0.2} className="mt-10">
              <YouTube id="Qi2jDDPR2SA" title="Hire a Virtual Assistant for Your Business" />
            </Reveal>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {reasons.map((r, i) => (
              <Reveal as="li" key={r.title} delay={(i % 2) * 0.1} className="card p-6">
                <p className="font-medium">{r.title}</p>
                <p className="mt-2 text-sm text-muted">{r.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <CTA stage={3} />
    </>
  );
}
