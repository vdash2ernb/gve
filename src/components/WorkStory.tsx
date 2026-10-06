"use client";

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { HandoffScene } from './folio/FolioScene';
import { Reveal } from './Reveal';

export default function WorkStory({ proof }: { proof?: ReactNode }) {
  const [paused, setPaused] = useState(false);
  const visual = useRef<HTMLDivElement>(null);
  // Phones and tablets: the 3D sits in the space below one chapter's copy and scrolls
  // with the page. It only moves to another chapter once its current spot is off
  // screen, fading across, so it never chases the scroll position.
  useEffect(() => {
    const story = document.getElementById('work-story');
    const el = visual.current;
    if (!story || !el) return;
    const narrow = window.matchMedia('(max-width: 900px)');
    let slots: { top: number; height: number }[] = [];
    let current = -1, swap = 0, measure = 0;

    const place = (index: number, fade: boolean) => {
      const slot = slots[index];
      if (!slot) return;
      current = index;
      const apply = () => {
        el.style.setProperty('--visual-top', `${slot.top}px`);
        el.style.setProperty('--visual-height', `${slot.height}px`);
        el.classList.remove('is-moving');
      };
      clearTimeout(swap);
      if (fade) { el.classList.add('is-moving'); swap = window.setTimeout(apply, 250); } else apply();
    };
    const choose = () => {
      if (!narrow.matches || !slots.length) return;
      const offset = story.getBoundingClientRect().top;
      const visible = (s: { top: number; height: number }) => Math.max(0, Math.min(offset + s.top + s.height, window.innerHeight) - Math.max(offset + s.top, 0));
      if (current >= 0 && visible(slots[current]) > 0) return;
      const centre = window.innerHeight / 2 - offset;
      const next = slots.reduce((best, s, i) => Math.abs(s.top + s.height / 2 - centre) < Math.abs(slots[best].top + slots[best].height / 2 - centre) ? i : best, 0);
      if (next !== current) place(next, current >= 0);
    };
    const remeasure = () => {
      measure = 0;
      if (!narrow.matches) {
        slots = []; current = -1; clearTimeout(swap);
        el.classList.remove('is-moving');
        el.style.removeProperty('--visual-top'); el.style.removeProperty('--visual-height');
        return;
      }
      const base = story.getBoundingClientRect().top;
      // CSS also caps the height at 45svh, so the browser bar showing or hiding never resizes the 3D.
      const max = Math.min(365, window.innerHeight * .45);
      slots = Array.from(story.querySelectorAll<HTMLElement>('.story-chapter')).flatMap(chapter => {
        const copy = chapter.querySelector<HTMLElement>('.story-copy');
        if (!copy) return [];
        const top = copy.getBoundingClientRect().bottom - base + 24;
        // Stop above the scroll cue in the opening chapter, otherwise at the chapter's end.
        const cue = chapter.querySelector<HTMLElement>('.scroll-cue');
        const limit = (cue ? cue.getBoundingClientRect().top - 12 : chapter.getBoundingClientRect().bottom) - base;
        return [{ top, height: Math.max(180, Math.min(max, limit - top)) }];
      });
      const keep = current;
      current = -1;
      if (keep >= 0 && slots[keep]) place(keep, false);
      choose();
    };
    const queueMeasure = () => { if (!measure) measure = requestAnimationFrame(remeasure); };

    window.addEventListener('scroll', choose, { passive: true });
    window.addEventListener('resize', queueMeasure);
    narrow.addEventListener('change', queueMeasure);
    const observer = new ResizeObserver(queueMeasure);
    story.querySelectorAll('.story-chapter').forEach(chapter => observer.observe(chapter));
    remeasure();
    return () => {
      cancelAnimationFrame(measure); clearTimeout(swap); observer.disconnect();
      window.removeEventListener('scroll', choose); window.removeEventListener('resize', queueMeasure);
      narrow.removeEventListener('change', queueMeasure);
    };
  }, []);
  return <div className="work-story" id="work-story">
    <div className="story-stage" aria-hidden="true"><div ref={visual} className="story-visual"><HandoffScene paused={paused}/></div></div>
    <section className="story-chapter story-opening" aria-labelledby="opening-title">
      <div className="story-content studio-wrap"><div className="story-copy">
        <p className="kicker light">Virtual support for your business</p>
        <h1 id="opening-title">Virtual assistants.<br/>More time <em>for you.</em></h1>
        <p className="story-lede">Get help with admin, bookkeeping, and other business tasks. We find the right person and support you along the way.</p>
        <div className="hero-actions"><Link href="/contact-us" className="button amber">Find your Expert</Link><Link href="/services" className="underlined light">Explore our services</Link></div>
        <p className="story-origin">Based in Seattle.<br/>Experts in the Philippines.</p>
      </div></div>
      <div className="scroll-cue studio-wrap"><a href="#clients"><span className="scroll-line"/>Meet our clients</a><button className="motion-control" onClick={() => setPaused(!paused)} aria-pressed={paused}>{paused ? 'Restore 3D motion' : 'Reduce 3D motion'}</button></div>
    </section>
    {proof}
    <section className="story-chapter story-right" id="the-work" aria-labelledby="work-title">
      <div className="story-content studio-wrap"><Reveal className="story-copy"><p className="kicker light">01 / The work</p><h2 id="work-title">Help with<br/><em>daily tasks.</em></h2><p className="story-lede">Start with the tasks that take up most of your day.</p><div className="work-tags"><span>Admin & inbox</span><span>Books & billing</span><span>Projects & plans</span><span>Sales & customers</span></div></Reveal></div>
    </section>
    <section className="story-chapter story-handoff" aria-labelledby="handoff-title">
      <div className="story-content studio-wrap"><Reveal className="story-copy"><p className="kicker light">02 / Choosing your assistant</p><h2 id="handoff-title">Choose your<br/><em>Expert.</em></h2><p className="story-lede">Interview screened candidates and choose who you work with. You set the tasks, tools, and hours. GVE helps with onboarding and ongoing support.</p><Link href="/how-it-works" className="underlined light">See the hiring process</Link></Reveal></div>
    </section>
  </div>;
}
