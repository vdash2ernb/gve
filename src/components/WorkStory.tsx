"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import FolioScene from './folio/FolioScene';
import { Reveal } from './Reveal';

export default function WorkStory() {
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
        <p className="kicker light">For the people building a business</p>
        <h1 id="opening-title">Your business.<br/>Moving <em>forward.</em></h1>
        <p className="story-lede">Skilled virtual support for the work that fills your day. More time for the work only you can do.</p>
        <div className="hero-actions"><Link href="/contact" className="button amber">Find your Expert</Link><Link href="/services" className="underlined light">Explore our services</Link></div>
        <p className="story-origin">Built by a Seattle business owner.<br/>Powered by talented people in the Philippines.</p>
      </div></div>
      <div className="scroll-cue studio-wrap"><a href="#the-work"><span className="scroll-line"/>See what you can hand off</a><button className="motion-control" onClick={() => setPaused(!paused)} aria-pressed={paused}>{paused ? 'Restore 3D motion' : 'Reduce 3D motion'}</button></div>
    </section>
    <section className="story-chapter story-right" id="the-work" aria-labelledby="work-title">
      <div className="story-content studio-wrap"><Reveal className="story-copy"><p className="kicker light">01 / Make room</p><h2 id="work-title">A full day.<br/>Too many <em>hats.</em></h2><p className="story-lede">The plans. The paperwork. The follow-ups. You don’t have to be the person behind every task.</p><div className="work-tags"><span>Admin & inbox</span><span>Books & billing</span><span>Projects & plans</span><span>Sales & customers</span></div></Reveal></div>
    </section>
    <section className="story-chapter story-handoff" aria-labelledby="handoff-title">
      <div className="story-content studio-wrap"><Reveal className="story-copy"><p className="kicker light">02 / Build your support</p><h2 id="handoff-title">In good hands.<br/>Still in <em>yours.</em></h2><p className="story-lede">An Expert matched to your role, working in your tools and on your hours. You set the priorities. We help keep things moving.</p><Link href="/how-it-works" className="underlined light">How we find your Expert</Link><div className="handoff-notes"><span>Matched to your work</span><span>Supported by GVE</span></div></Reveal></div>
    </section>
  </div>;
}
