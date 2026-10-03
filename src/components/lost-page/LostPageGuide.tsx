'use client';

import dynamic from 'next/dynamic';
import { Component, useEffect, useRef, useState, type ReactNode } from 'react';
import { useReducedMotion } from 'motion/react';
import styles from './LostPage.module.css';

export function GuideFallback() {
  return <div className={styles.fallback} aria-hidden="true"><svg viewBox="0 0 360 360" fill="none">
    <ellipse cx="180" cy="308" rx="130" ry="15" fill="#dbe4ea"/>
    <rect x="108" y="160" width="144" height="114" rx="44" fill="#00203d"/>
    <circle cx="180" cy="128" r="62" fill="#dcb096"/>
    <path d="M117 134V116a63 63 0 0 1 126 0v18" stroke="#00203d" strokeWidth="12"/>
    <circle cx="160" cy="126" r="5" fill="#00203d"/><circle cx="200" cy="126" r="5" fill="#00203d"/>
    <path d="M166 151q14 13 28 0" stroke="#00203d" strokeWidth="3" strokeLinecap="round"/>
    <rect x="78" y="218" width="204" height="78" rx="10" fill="#00203d" stroke="#b5c8d5" strokeWidth="5"/>
    <text x="180" y="274" textAnchor="middle" fill="#ffa600" fontFamily="sans-serif" fontSize="48" fontWeight="600">404</text>
    <path d="M65 298h230" stroke="#b5c8d5" strokeWidth="12" strokeLinecap="round"/>
  </svg></div>;
}

const GuideCanvas = dynamic(() => import('./GuideCanvas'), { ssr: false, loading: GuideFallback });

class GuideGuard extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <GuideFallback/> : this.props.children; }
}

export default function LostPageGuide() {
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [wave, setWave] = useState(0);
  const [visible, setVisible] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const scene = useRef<HTMLDivElement>(null);
  const motionEnabled = !reduced && !paused;
  const active = motionEnabled && visible && tabVisible;
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .05 });
    if (scene.current) observer.observe(scene.current);
    const visibility = () => setTabVisible(document.visibilityState === 'visible');
    visibility();
    document.addEventListener('visibilitychange', visibility);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', visibility); };
  }, []);
  return <div className={styles.guide}>
    <div ref={scene} className={styles.scene} role="img" aria-label="A GVE virtual-assistant character wearing a headset, at a desk with a laptop showing 404.">
      <GuideGuard><GuideCanvas active={active} wave={wave}/></GuideGuard>
    </div>
    <div className={styles.controls}>
      <button type="button" onClick={() => setWave(n => n + 1)} disabled={!motionEnabled}>Wave hello <span aria-hidden="true">↗</span></button>
      {!reduced && <button type="button" className={styles.pause} onClick={() => setPaused(p => !p)}>{paused ? 'Play animation' : 'Pause animation'}</button>}
    </div>
    <p className={styles.hint}>{reduced ? 'Animation is off for your motion preference.' : paused ? 'Animation paused.' : <><span className={styles.mouseHint}>Move your mouse. Our guide will follow.</span><span className={styles.touchHint}>Tap “Wave hello” to say hi.</span></>}</p>
  </div>;
}
