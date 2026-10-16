"use client";

import Image from 'next/image';
import { useState, type CSSProperties } from 'react';
import { partners } from '@/content/site';
import marks from '@/content/client-logos.json';
import styles from './ClientLogos.module.css';

// Navy versions of the supplied logos, made by scripts/make-client-logos.py.
const mono = marks as Record<string, { src: string; width: number; height: number }>;

// Every logo gets about the same visual area, so wide wordmarks and square badges read as
// equally weighted: height = sqrt(area / aspect ratio), within a height and width limit.
const AREA = 5800, MAX_HEIGHT = 74, MAX_WIDTH = 176;
function displaySize(width: number, height: number) {
  const aspect = width / height;
  let h = Math.min(MAX_HEIGHT, Math.sqrt(AREA / aspect));
  if (h * aspect > MAX_WIDTH) h = MAX_WIDTH / aspect;
  return { width: Math.round(h * aspect), height: Math.round(h) };
}

function LogoSequence({ duplicate = false }: { duplicate?: boolean }) {
  return <ul className={`${styles.logos}${duplicate ? ` ${styles.duplicate}` : ''}`} aria-label={duplicate ? undefined : 'GVE clients'} aria-hidden={duplicate || undefined}>
    {partners.map(partner => {
      const mark = mono[partner.img.split('/').pop()!];
      const size = displaySize(mark.width, mark.height);
      return <li className={styles.item} key={partner.name}>
        <Image src={mark.src} alt={duplicate ? '' : partner.name} width={mark.width} height={mark.height} className={styles.image}
          style={{ '--logo-w': `${size.width}px`, '--logo-h': `${size.height}px` } as CSSProperties}/>
      </li>;
    })}
  </ul>;
}

export default function ClientLogos() {
  const [paused, setPaused] = useState(false);
  const [expanded, setExpanded] = useState(false);
  return <section className={styles.band} id="clients" aria-labelledby="client-heading" data-paused={paused} data-expanded={expanded}>
    <div className={`studio-wrap ${styles.headingRow}`}>
      <h2 className={styles.heading} id="client-heading">Clients we work with</h2>
      <div className={styles.controls}>
        <button className={styles.motionButton} type="button" onClick={() => setPaused(!paused)} aria-pressed={paused} aria-controls="client-logo-track">{paused ? 'Play' : 'Pause'}<span className="sr-only"> logo animation</span></button>
        <button className={styles.viewButton} type="button" onClick={() => setExpanded(!expanded)} aria-expanded={expanded} aria-controls="client-logo-track">{expanded ? 'Show less' : 'View all'}</button>
      </div>
    </div>
    <div className={expanded ? `studio-wrap ${styles.viewport}` : styles.viewport} tabIndex={0} role="region" aria-label="Client logos" aria-describedby="client-logo-help">
      <div className={styles.track} id="client-logo-track"><LogoSequence/><LogoSequence duplicate/></div>
    </div>
    <p id="client-logo-help" className="sr-only">The logos scroll on their own. Pause the animation, or choose View all to see every logo at once.</p>
  </section>;
}
