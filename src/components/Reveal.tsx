"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

/** Fades and lifts content into place when it scrolls into view. */
export function Reveal({
  children,
  delay = 0,
  y = 16,
  className,
  id,
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  id?: string;
  as?: "div" | "li" | "section" | "p" | "span";
}) {
  const reduce = useReducedMotion();
  const M = motion[as];
  return (
    <M
      id={id}
      className={className}
      initial={reduce ? false : { opacity: .88, y, filter: "blur(0px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.4, ease, delay }}
    >
      {children}
    </M>
  );
}

/** Headline that rises in word by word. */
export function Words({
  text,
  className,
  delay = 0,
  accent = [],
}: {
  text: string;
  className?: string;
  delay?: number;
  /** Words to set in the accent style. */
  accent?: string[];
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  const strip = (w: string) => w.replace(/[.,!?:;]/g, "");
  const accents = new Set(accent.map(strip));
  return (
    <span className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.12em] align-top">
          <motion.span
            className={`inline-block ${accents.has(strip(w)) ? "accent" : ""}`}
            initial={reduce ? false : { y: "105%" }}
            whileInView={{ y: "0%" }}
            viewport={{ once: true, margin: "0px 0px -8% 0px" }}
            transition={{ duration: 0.6, ease, delay: delay + i * 0.06 }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/** Moves its children slower or faster than the page for depth. */
export function Parallax({ children, speed = 0.15, className }: { children: React.ReactNode; speed?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`${speed * 100}%`, `${-speed * 100}%`]);
  return (
    <motion.div ref={ref} style={reduce ? undefined : { y }} className={className}>
      {children}
    </motion.div>
  );
}
