"use client";

import Image from 'next/image';
import { useState } from 'react';
import { partners } from '@/content/site';
import styles from './ClientLogos.module.css';

type Artwork = {
  canvas: [number, number];
  bounds: [number, number, number, number];
  width: number;
  surface?: 'navy' | 'charcoal';
  wide?: boolean;
};

// Display bounds omit export padding while preserving the supplied image files.
// Each mark has an optical size and, where needed, a contrasting backplate.
const artwork: Record<string, Artwork> = {
  '/partners/calistar-management.png': { canvas: [2400, 2400], bounds: [373, 264, 1655, 1656], width: 104 },
  '/partners/big-bear-logo.jpg': { canvas: [600, 600], bounds: [34, 12, 528, 570], width: 100, surface: 'charcoal' },
  '/partners/onebio.png': { canvas: [1402, 361], bounds: [23, 0, 1370, 361], width: 272, surface: 'navy', wide: true },
  '/partners/navo-builders.webp': { canvas: [2048, 2048], bounds: [333, 440, 1382, 1111], width: 130 },
  '/partners/high-desert-homes.png': { canvas: [1202, 624], bounds: [209, 136, 802, 355], width: 152, surface: 'navy' },
  '/partners/hill-mortgage.png': { canvas: [150, 150], bounds: [5, 6, 140, 138], width: 80 },
  '/partners/window-door-shoppe.png': { canvas: [150, 150], bounds: [3, 45, 147, 47], width: 150 },
  '/partners/izozi.png': { canvas: [150, 150], bounds: [3, 43, 145, 60], width: 140 },
  '/partners/silver-peak.png': { canvas: [150, 150], bounds: [7, 9, 137, 128], width: 82 },
  '/partners/antler.png': { canvas: [150, 150], bounds: [3, 6, 144, 133], width: 78 },
  '/partners/mw-design.png': { canvas: [2356, 2160], bounds: [124, 203, 2109, 1754], width: 86 },
  '/partners/river-roofing.png': { canvas: [150, 150], bounds: [4, 47, 142, 57], width: 150 },
  '/partners/truss.png': { canvas: [150, 150], bounds: [4, 29, 142, 85], width: 126 },
};

function LogoSequence({ duplicate = false }: { duplicate?: boolean }) {
  return <ul className={`${styles.logos}${duplicate ? ` ${styles.duplicate}` : ''}`} aria-label={duplicate ? undefined : 'GVE clients'} aria-hidden={duplicate || undefined}>
    {partners.map(partner => {
      const mark = artwork[partner.img];
      const [x, y, width, height] = mark.bounds;
      const className = [styles.item, mark.surface && styles[mark.surface], mark.wide && styles.wide].filter(Boolean).join(' ');
      return <li className={className} key={partner.name}>
        <span className={styles.mark} style={{ width: mark.width, aspectRatio: `${width} / ${height}` }}>
          <Image src={partner.img} alt={duplicate ? '' : partner.name} width={mark.canvas[0]} height={mark.canvas[1]} className={styles.image}
            style={{ width: `${mark.canvas[0] / width * 100}%`, height: `${mark.canvas[1] / height * 100}%`, left: `${-x / width * 100}%`, top: `${-y / height * 100}%` }}/>
        </span>
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
        <button className={styles.motionButton} type="button" onClick={() => setPaused(!paused)} aria-pressed={paused} aria-controls="client-logo-track">{paused ? 'Resume' : 'Pause'}<span className="sr-only"> logo animation</span></button>
        <button className={styles.viewButton} type="button" onClick={() => setExpanded(!expanded)} aria-expanded={expanded} aria-controls="client-logo-track">{expanded ? 'Show less' : 'View all'}</button>
      </div>
      <span className={styles.swipeHint} aria-hidden="true">Swipe <span>→</span></span>
    </div>
    <div className={styles.viewport} tabIndex={0} role="region" aria-label="Client logos" aria-describedby="client-logo-help">
      <div className={styles.track} id="client-logo-track"><LogoSequence/><LogoSequence duplicate/></div>
    </div>
    <p id="client-logo-help" className="sr-only">On a phone, swipe or use the arrow keys to explore the logos. On desktop, pause the animation or choose View all to inspect every logo.</p>
  </section>;
}
