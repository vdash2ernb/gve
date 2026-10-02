"use client";

import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useRef, useState } from "react";
import { Reveal, Words } from "./Reveal";

export type BuildStep = { title: string; body: string; link?: { href: string; label: string } };

const STEP_SVH = 80;

/**
 * A pinned panel that walks through steps one at a time while the house in the
 * 3D drawing gets built. Each step owns one scroll marker (data-stage).
 */
export default function BuildSequence({
  eyebrow,
  title,
  accent = [],
  steps,
  stepPrefix,
}: {
  eyebrow: string;
  title: string;
  accent?: string[];
  steps: BuildStep[];
  /** e.g. "Step " → "Step 1". Without it steps are numbered 01, 02… */
  stepPrefix?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const n = steps.length;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => setActive(Math.min(n - 1, Math.max(0, Math.round(v * (n - 1))))));

  return (
    <section ref={ref} className="relative px-4 sm:px-6" style={{ height: `${n * STEP_SVH + 20}svh` }}>
      {steps.map((_, i) => (
        <div key={i} data-stage aria-hidden className="pointer-events-none absolute inset-x-0" style={{ top: `${i * STEP_SVH}svh`, height: `${STEP_SVH}svh` }} />
      ))}
      <div className="sticky top-0 flex h-svh items-end pb-8 lg:items-center lg:pb-0">
        <div className="mx-auto grid w-full max-w-6xl lg:grid-cols-2">
          <div className="hidden lg:block" />
          <div className="rounded-3xl bg-bg/70 p-5 backdrop-blur-md lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
            <Reveal>
              <p className="eyebrow">{eyebrow}</p>
            </Reveal>
            <h2 className="display mt-4 text-4xl sm:text-6xl">
              <Words text={title} accent={accent} />
            </h2>
            <ol className="mt-8 space-y-1 sm:mt-10">
              {steps.map((s, i) => {
                const on = i === active;
                return (
                  <li key={s.title} className={`border-l-2 py-3 pl-5 transition-colors duration-500 ${on ? "border-amber" : "border-line"} ${on ? "" : "hidden sm:block"}`}>
                    <p className={`flex items-baseline gap-3 transition-opacity duration-500 ${on ? "opacity-100" : "opacity-40"}`}>
                      <span className="font-serif text-lg italic text-amber">{stepPrefix ? `${stepPrefix}${i + 1}` : String(i + 1).padStart(2, "0")}</span>
                      <span className="text-xl font-medium sm:text-2xl">{s.title}</span>
                    </p>
                    <AnimatePresence initial={false}>
                      {on && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <p className="mt-2 max-w-md text-muted">{s.body}</p>
                          {s.link && (
                            <Link href={s.link.href} className="mt-2 inline-block text-sky hover:underline">
                              {s.link.label} →
                            </Link>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ol>
            <div className="mt-6 flex gap-1.5 sm:hidden" aria-hidden>
              {steps.map((_, i) => (
                <span key={i} className={`h-1 flex-1 rounded-full ${i <= active ? "bg-amber" : "bg-line"}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
