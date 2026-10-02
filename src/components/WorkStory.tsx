"use client";

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import FolioScene from './folio/FolioScene';
import { Reveal } from './Reveal';

export default function WorkStory({ proof }: { proof?: ReactNode }) {
  const [paused, setPaused] = useState(false);
  const visual = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    const positionVisual = () => {
      frame = 0;
      if (!visual.current) return;
      if (window.innerWidth > 900) { visual.current.style.removeProperty('--visual-top'); return; }
      const copies = Array.from(document.querySelectorAll<HTMLElement>('.story-copy'));
      const height = Math.min(365, window.innerHeight * .45);
      const slots = copies.map(copy => copy.getBoundingClientRect().bottom + 24);
      const top = slots.sort((a, b) => Math.abs(a + height / 2 - window.innerHeight / 2) - Math.abs(b + height / 2 - window.innerHeight / 2))[0] ?? 480;
      visual.current.style.setProperty('--visual-top', `${top}px`);
    };
    const update = () => { if (!frame) frame = requestAnimationFrame(positionVisual); };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    const observer = new ResizeObserver(update);
    document.querySelectorAll('.story-copy').forEach(copy => observer.observe(copy));
    positionVisual();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, []);
  return <div className="work-story" id="work-story">
    <div className="story-stage" aria-hidden="true"><div ref={visual} className="story-visual"><FolioScene paused={paused}/></div></div>
    <section className="story-chapter story-opening" aria-labelledby="opening-title">
      <div className="story-content studio-wrap"><div className="story-copy">
        <p className="kicker light">Virtual support for your business</p>
        <h1 id="opening-title">Virtual assistants.<br/>More time <em>for you.</em></h1>
        <p className="story-lede">Get help with admin, bookkeeping, and other business tasks. We find the right person and support you along the way.</p>
        <div className="hero-actions"><Link href="/contact" className="button amber">Find your Expert</Link><Link href="/services" className="underlined light">Explore our services</Link></div>
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
