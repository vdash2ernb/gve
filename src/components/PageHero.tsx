import { Reveal, Words } from "./Reveal";

export default function PageHero({
  eyebrow,
  title,
  accent = [],
  body,
  stage = 0,
  children,
}: {
  eyebrow: string;
  title: string;
  accent?: string[];
  body?: string;
  stage?: number;
  children?: React.ReactNode;
}) {
  return (
    <section data-stage={stage} className="relative flex min-h-[85svh] items-center px-4 pb-16 pt-32 sm:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <div className="max-w-3xl">
          <Reveal>
            <p className="eyebrow">{eyebrow}</p>
          </Reveal>
          <h1 className="display mt-5 text-5xl sm:text-7xl lg:text-8xl">
            <Words text={title} accent={accent} delay={0.1} />
          </h1>
          {body && (
            <Reveal delay={0.4}>
              <p className="mt-6 max-w-xl text-lg text-muted sm:text-xl">{body}</p>
            </Reveal>
          )}
          {children && (
            <Reveal delay={0.55} className="mt-9">
              {children}
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
