import type { Metadata } from "next";
import { SceneStages } from "@/components/Scene";
import { Reveal } from "@/components/Reveal";
import PageHero from "@/components/PageHero";
import { contact } from "@/content/site";

export const metadata: Metadata = {
  title: "Start your search",
  description: "A refundable $1,000 deposit starts your search for the right Expert.",
};

const after = [
  { title: "You pay the deposit", body: "Secure online payment. This authorizes us to begin." },
  { title: "We prepare one document", body: "Your final job description and our client agreement, together." },
  { title: "You sign online", body: "A simple click-to-sign." },
  { title: "We start the search", body: "Sourcing, screening and interviews begin right away." },
];

const covers = [
  { title: "Setup", items: ["Role calibration", "Final job description", "Engagement agreement"] },
  { title: "Search", items: ["Sourcing and outreach", "Resume review", "Screening and interviews", "Finalist vetting", "Qualified candidates presented to you"] },
  { title: "Selection & transition", items: ["Interview coordination", "Onboarding your pick", "Initial and ongoing training support"] },
];

function PayButton() {
  return (
    <div>
      <a href={contact.depositLink} target="_blank" rel="noopener noreferrer" className="btn-primary">
        Pay the $1,000 deposit ↗
      </a>
      <p className="mt-3 text-xs text-muted">By paying, you authorize GVE to start your search.</p>
    </div>
  );
}

export default function StartPage() {
  return (
    <>
      <SceneStages
        stages={[
          { shape: "spiral", x: 2.8, scale: 0.85, dim: 0.85 },
          { shape: "grid", scale: 0.9, dim: 0.3 },
          { shape: "clock", x: 2.8, scale: 0.8, dim: 0.6 },
        ]}
      />
      <PageHero
        eyebrow="Start your search"
        title="Ready? Let's find your Expert."
        accent={["your", "Expert."]}
        body="A $1,000 deposit gets us working on your role. It's 100% refundable if we don't deliver."
      >
        <PayButton />
      </PageHero>

      <section data-stage={1} className="px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-6xl space-y-24">
          <div>
            <Reveal>
              <h2 className="display text-4xl sm:text-5xl">What happens next</h2>
            </Reveal>
            <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {after.map((a, i) => (
                <Reveal as="li" key={a.title} delay={i * 0.08} className="card p-6">
                  <p className="font-serif text-2xl italic text-amber">{i + 1}</p>
                  <p className="mt-3 font-medium">{a.title}</p>
                  <p className="mt-2 text-sm text-muted">{a.body}</p>
                </Reveal>
              ))}
            </ol>
          </div>

          <div>
            <Reveal>
              <h2 className="display text-4xl sm:text-5xl">What the deposit covers</h2>
            </Reveal>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {covers.map((c, i) => (
                <Reveal key={c.title} delay={i * 0.08} className="card p-7">
                  <p className="text-lg font-medium">{c.title}</p>
                  <ul className="mt-4 space-y-2 text-sm text-muted">
                    {c.items.map((it) => (
                      <li key={it} className="flex gap-3">
                        <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-amber" />
                        {it}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section data-stage={2} className="px-4 py-32 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[1.3fr_1fr]">
          <Reveal className="card p-8 sm:p-10">
            <p className="eyebrow">Refund policy</p>
            <h2 className="display mt-4 text-3xl sm:text-4xl">100% back if we don&apos;t perform.</h2>
            <p className="mt-4 text-muted">
              &ldquo;Don&apos;t perform&rdquo; means we don&apos;t present at least two qualified candidates who match the job description we both approved:
            </p>
            <ul className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {["Responsibilities", "Experience level", "Capabilities", "Compensation"].map((x) => (
                <li key={x} className="rounded-full border border-line px-4 py-2 text-center">
                  {x}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1} className="card flex flex-col justify-between gap-8 p-8 sm:p-10">
            <div>
              <p className="eyebrow">Good to know</p>
              <p className="mt-4 text-muted">
                The deposit covers the search only. It isn&apos;t your ongoing service fee. Your Expert&apos;s pricing is set in the agreement.
              </p>
              <p className="mt-4 text-muted">
                Questions first? Call sales at{" "}
                <a href={contact.salesPhoneHref} className="text-ink hover:underline">
                  {contact.salesPhone}
                </a>
                .
              </p>
            </div>
            <PayButton />
          </Reveal>
        </div>
      </section>
    </>
  );
}
