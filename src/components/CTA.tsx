import Link from "next/link";
import { Reveal, Words } from "./Reveal";

export default function CTA({
  title = "It starts with a free call.",
  body = "Tell us where your time goes. We'll show you what to hand off first. If we're not a fit, we'll say so.",
  stage,
}: {
  title?: string;
  body?: string;
  stage?: number;
}) {
  return (
    <section data-stage={stage} className="relative flex min-h-[90svh] items-center px-4 py-28 sm:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="display text-5xl sm:text-7xl">
          <Words text={title} accent={["free", "call"]} />
        </h2>
        <Reveal delay={0.25}>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted">{body}</p>
        </Reveal>
        <Reveal delay={0.4} className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/contact" className="btn-primary">
            Book a free call
          </Link>
          <Link href="/how-it-works" className="btn-ghost">
            How it works
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
