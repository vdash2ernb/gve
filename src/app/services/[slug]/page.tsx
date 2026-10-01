import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SceneStages } from "@/components/Scene";
import { Reveal } from "@/components/Reveal";
import PageHero from "@/components/PageHero";
import CTA from "@/components/CTA";
import { services, team } from "@/content/site";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const s = services.find((x) => x.slug === slug);
  return s ? { title: s.name, description: s.intro } : {};
}

const promise = [
  { title: "Vetted and trained", body: "Multi-step screening, assessments and interviews before anyone reaches you." },
  { title: "Works your way", body: "Your tools, your time zone, your preferences." },
  { title: "Fully visible", body: "Time tracking plus a daily report of finished tasks." },
  { title: "Free replacement", body: "Not the right fit? We'll replace your Expert at no extra cost." },
];

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const idx = services.findIndex((x) => x.slug === slug);
  if (idx < 0) notFound();
  const s = services[idx];
  const next = services[(idx + 1) % services.length];
  const person = s.proof?.person ? team.find((t) => t.name.toLowerCase() === s.proof!.person) : undefined;
  const lastWord = s.tagline.replace(/\.$/, "").split(" ").pop()!;

  return (
    <>
      <SceneStages
        stages={[
          { shape: "chaos", x: 2.8, scale: 0.75, dim: 0.75 },
          { shape: "grid", scale: 0.9, dim: 0.3 },
          { shape: "bridge", y: 1.2, dim: 0.55 },
          { shape: "clock", scale: 1, dim: 0.38 },
        ]}
      />
      <PageHero eyebrow={s.name} title={s.tagline} accent={[lastWord + "."]} body={s.intro}>
        <div className="flex flex-wrap gap-3">
          <Link href="/contact" className="btn-primary">
            Book a free call
          </Link>
          <Link href="/services" className="btn-ghost">
            All services
          </Link>
        </div>
      </PageHero>

      <section data-stage={1} className="px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <h2 className="display text-4xl sm:text-5xl">What you can hand off</h2>
          </Reveal>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {s.groups.map((g, i) => (
              <Reveal as="li" key={g.title} delay={(i % 3) * 0.08} className="card p-7">
                <p className="text-lg font-medium">{g.title}</p>
                <ul className="mt-4 space-y-2 text-sm text-muted">
                  {g.items.map((it) => (
                    <li key={it} className="flex gap-3">
                      <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-amber" />
                      {it}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </ul>

          {s.proof && (
            <Reveal className="card mt-10 flex flex-col items-start gap-6 p-7 sm:flex-row sm:items-center">
              {person && <Image src={person.img} alt={person.name} width={96} height={96} className="h-20 w-20 rounded-full object-cover" />}
              <div>
                <p className="eyebrow">On our team</p>
                <p className="mt-2 text-lg">{s.proof.text}</p>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      <section data-stage={2} className="px-4 pb-24 pt-[30svh] sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <h2 className="display text-4xl sm:text-5xl">Every Expert comes with</h2>
          </Reveal>
          <ul className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {promise.map((p, i) => (
              <Reveal as="li" key={p.title} delay={i * 0.08} className="bg-bg/85 p-7 backdrop-blur-sm">
                <p className="font-medium">{p.title}</p>
                <p className="mt-2 text-sm text-muted">{p.body}</p>
              </Reveal>
            ))}
          </ul>
          <Reveal className="mt-12">
            <Link href={`/services/${next.slug}`} className="group inline-flex items-center gap-3 text-muted hover:text-ink">
              Next: <span className="text-ink">{next.name}</span>
              <span aria-hidden className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </Reveal>
        </div>
      </section>

      <CTA stage={3} />
    </>
  );
}
