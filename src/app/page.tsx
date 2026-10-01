import Image from "next/image";
import Link from "next/link";
import { SceneStages } from "@/components/Scene";
import { Reveal, Words } from "@/components/Reveal";
import CTA from "@/components/CTA";
import Partners from "@/components/Partners";
import { services, team, testimonials } from "@/content/site";

const steps = [
  { n: "01", title: "Talk", body: "A quick call about your business, your busy seasons and where your hours go." },
  { n: "02", title: "Meet your match", body: "We shortlist and vet candidates. You interview them and pick." },
  { n: "03", title: "Hand it off", body: "Your Expert learns your tools in days, not weeks, then takes the overflow." },
];

const facts = [
  { big: "5–10", small: "business days to hire" },
  { big: "4 or 8", small: "hour shifts, your time zone" },
  { big: "$0", small: "setup fees" },
  { big: "60%", small: "up to this much saved on staffing" },
];

export default function Home() {
  return (
    <>
      <SceneStages
        stages={[
          { shape: "globe", x: 2.4, rotY: Math.PI, scale: 1.05 },
          { shape: "chaos", dim: 0.9 },
          { shape: "grid", scale: 0.95, dim: 0.75 },
          { shape: "spiral", x: -2.8, dim: 0.85 },
          { shape: "bridge", y: 0.9, dim: 0.75 },
          { shape: "sphere", x: 2.8, dim: 0.5 },
          { shape: "clock", scale: 1, dim: 0.38 },
        ]}
      />

      {/* 0 · Hero */}
      <section data-stage={0} className="relative flex min-h-svh items-center px-4 pt-24 sm:px-6">
        <div className="mx-auto w-full max-w-6xl">
          <div className="max-w-2xl">
            <Reveal>
              <p className="eyebrow">Real people · AI powered</p>
            </Reveal>
            <h1 className="display mt-5 text-6xl sm:text-8xl">
              <Words text="Get your time back." accent={["time"]} delay={0.1} />
            </h1>
            <Reveal delay={0.45}>
              <p className="mt-6 max-w-lg text-lg text-muted sm:text-xl">
                Skilled virtual experts in the Philippines, backed by AI tools, take the admin off your plate. You get back to the work you&apos;re best at.
              </p>
            </Reveal>
            <Reveal delay={0.6} className="mt-9 flex flex-wrap gap-3">
              <Link href="/contact" className="btn-primary">
                Book a free call
              </Link>
              <Link href="/services" className="btn-ghost">
                See what we do
              </Link>
            </Reveal>
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs text-muted sm:flex">
          <span>Scroll</span>
          <span className="h-10 w-px animate-pulse bg-gradient-to-b from-muted to-transparent" />
        </div>
      </section>

      {/* 1 · The problem */}
      <section data-stage={1} className="relative flex min-h-[130svh] items-center px-4 sm:px-6">
        <div className="mx-auto w-full max-w-6xl">
          <Reveal>
            <p className="eyebrow">Sound familiar?</p>
          </Reveal>
          <h2 className="display mt-5 text-5xl sm:text-7xl">
            <Words text="Still the hub for everything?" accent={["everything"]} />
          </h2>
          <ul className="mt-12 space-y-3 text-2xl text-ink/80 sm:text-4xl">
            {["Chasing follow-ups.", "Fixing the schedule.", "Catching up on weekends."].map((t, i) => (
              <Reveal as="li" key={t} delay={0.15 * i} className="display !font-medium">
                {t}
              </Reveal>
            ))}
          </ul>
          <Reveal delay={0.2}>
            <p className="mt-14 max-w-md text-lg text-muted">
              Being busy isn&apos;t the real cost. Losing another quarter to admin that doesn&apos;t pay you is.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 2 · The fix */}
      <section data-stage={2} className="relative px-4 py-32 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <Reveal>
              <p className="eyebrow">What changes</p>
            </Reveal>
            <h2 className="display mt-5 text-5xl sm:text-7xl">
              <Words text="Hand it off. Stay in control." accent={["control"]} />
            </h2>
            <Reveal delay={0.2}>
              <p className="mt-6 text-lg text-muted">
                Your Expert takes follow-ups, scheduling, billing and project coordination. You get clear updates and sign off on what matters.
              </p>
            </Reveal>
          </div>
          <ul className="mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <Reveal as="li" key={s.slug} delay={(i % 3) * 0.08}>
                <Link href={`/services/${s.slug}`} className="card group flex h-full items-center justify-between gap-4 p-5 transition-colors hover:border-white/20">
                  <span>
                    <span className="block font-medium">{s.name}</span>
                    <span className="mt-1 block text-sm text-muted">{s.short}</span>
                  </span>
                  <span aria-hidden className="text-muted transition-transform duration-300 group-hover:translate-x-1 group-hover:text-amber">
                    →
                  </span>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* 3 · How it works */}
      <section data-stage={3} className="relative px-4 py-32 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
          <div className="hidden lg:block" />
          <div>
            <Reveal>
              <p className="eyebrow">How it works</p>
            </Reveal>
            <h2 className="display mt-5 text-5xl sm:text-6xl">
              <Words text="Three steps. No upheaval." accent={["No", "upheaval"]} />
            </h2>
            <ol className="mt-12 space-y-4">
              {steps.map((s, i) => (
                <Reveal as="li" key={s.n} delay={i * 0.12} className="card flex gap-5 p-6">
                  <span className="font-serif text-3xl italic text-amber">{s.n}</span>
                  <span>
                    <span className="block text-xl font-medium">{s.title}</span>
                    <span className="mt-1 block text-muted">{s.body}</span>
                  </span>
                </Reveal>
              ))}
            </ol>
            <Reveal delay={0.2}>
              <Link href="/how-it-works" className="mt-8 inline-block text-sky underline-offset-4 hover:underline">
                The full process →
              </Link>
            </Reveal>
          </div>
        </div>
        <div className="mx-auto mt-24 grid max-w-6xl grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line lg:grid-cols-4">
          {facts.map((f, i) => (
            <Reveal key={f.small} delay={i * 0.08} className="bg-bg/80 p-6 backdrop-blur-sm sm:p-8">
              <p className="display text-4xl sm:text-5xl">{f.big}</p>
              <p className="mt-2 text-sm text-muted">{f.small}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 4 · The people */}
      <section data-stage={4} className="relative flex min-h-[110svh] items-end px-4 pb-24 pt-[45svh] sm:px-6">
        <div className="mx-auto w-full max-w-6xl text-center">
          <Reveal>
            <p className="eyebrow">Seattle ⇄ Philippines</p>
          </Reveal>
          <h2 className="display mt-5 text-5xl sm:text-7xl">
            <Words text="Real people, on your hours." accent={["your", "hours"]} />
          </h2>
          <Reveal delay={0.2}>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
              GVE is based in Seattle. Our Experts work from the Philippines, speak fluent English and keep your time zone. Weekends too, if you need it.
            </p>
          </Reveal>
          <Reveal delay={0.3} className="mt-10 flex justify-center">
            <Link href="/about" className="group flex items-center gap-4">
              <span className="flex -space-x-3">
                {team.slice(0, 7).map((m) => (
                  <Image key={m.name} src={m.img} alt={m.name} width={56} height={56} className="h-12 w-12 rounded-full border-2 border-bg object-cover sm:h-14 sm:w-14" />
                ))}
              </span>
              <span className="text-sky group-hover:underline">Meet the team →</span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* 5 · Proof */}
      <section data-stage={5} className="relative px-4 py-32 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <p className="eyebrow">From our clients</p>
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-6">
            {testimonials.map((t, i) => (
              <Reveal
                key={t.name}
                delay={(i % 3) * 0.1}
                className={`card flex flex-col justify-between p-7 ${i < 2 ? "md:col-span-3" : "md:col-span-2"}`}
              >
                <p className={`${i < 2 ? "text-2xl sm:text-3xl" : "text-lg"} leading-snug`}>&ldquo;{t.quote}&rdquo;</p>
                <p className="mt-6 text-sm text-muted">
                  <span className="text-ink">{t.name}</span> · {t.role}
                </p>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-20">
            <p className="text-center text-sm text-muted">Working with businesses like</p>
            <Partners />
          </Reveal>
        </div>
      </section>

      <CTA stage={6} />
    </>
  );
}
