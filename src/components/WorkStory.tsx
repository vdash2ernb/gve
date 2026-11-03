"use client";

import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import Link from 'next/link';
import { HandoffScene } from './folio/FolioScene';
import HomeFunnel from './HomeFunnel';
import { Reveal } from './Reveal';
import { useIntroOpen } from './mission/introState';
import { segments, generalCaption, generalChips, readSegment, subscribeSegment } from '@/content/segments';
import styles from './WorkStory.module.css';

export default function WorkStory({ proof }: { proof?: ReactNode }) {
  const [paused, setPaused] = useState(false);
  // The homepage 3D rests while the first-visit intro covers it.
  const introOpen = useIntroOpen();
  // Without WebGL the scenes show a still fallback, so the motion button has nothing to control.
  const [sceneFailed, setSceneFailed] = useState(false);
  const sceneFail = () => setSceneFailed(true);
  // The business type chosen in the opening questions swaps the 3D sheets, their caption and the chapter 01 chips.
  const segmentId = useSyncExternalStore(subscribeSegment, readSegment, () => null);
  const segment = segments.find(s => s.id === segmentId);
  // The opening holds the "Find your Expert" questions; the 3D tells the hand-off story beside
  // chapters 01 and 02. Desktop pins it to the right half; phones and tablets pin a panel below the copy.
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 900px)');
    const update = () => setNarrow(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return <div className="work-story" id="work-story">
    <section className={'story-chapter story-opening ' + styles.openingChapter} aria-labelledby="opening-title">
      <div className={'story-content studio-wrap ' + styles.opening}>
        <div className="story-copy">
          <p className="kicker light">Virtual support for builders, trades, and service businesses</p>
          <h1 id="opening-title">Virtual assistants.<br/>More time <em>for you.</em></h1>
          <p className="story-lede">Get help with permits, estimates, job schedules, bookkeeping, and customer calls. We find the right person and support you along the way.</p>
        </div>
        <HomeFunnel className={styles.funnel}/>
        <div className={styles.openingMore}>
          <Link href="/services" className={'underlined light ' + styles.servicesLink}>Explore our services</Link>
          <p className={styles.founderNote}><strong>Built by a builder.</strong> Craig hired his first virtual assistant for Silver Peak Design Build in 2021, then started GVE to help other owners do the same.</p>
          <p className="story-origin">Based in Seattle.<br/>Experts in the Philippines.</p>
        </div>
      </div>
      <div className="scroll-cue studio-wrap"><a href="#clients"><span className="scroll-line"/>Meet our clients</a></div>
    </section>
    {proof}
    <div className="story-pair">
    {!narrow && <div className="story-stage" aria-hidden="true"><div className="story-visual"><HandoffScene paused={paused || introOpen} sheets={segment?.sheets} caption={segment?.caption ?? generalCaption} onFail={sceneFail}/></div></div>}
    {narrow && <div className="pair-stage" aria-hidden="true"><HandoffScene paused={paused || introOpen} panel sheets={segment?.sheets} onFail={sceneFail}/></div>}
    <section className="story-chapter story-right" id="the-work" aria-labelledby="work-title">
      <div className="story-content studio-wrap"><Reveal className="story-copy"><p className="kicker light">01 / The work</p><h2 id="work-title">Help with<br/><em>daily tasks.</em></h2><p className="story-lede">Start with the office work behind every job.</p><div className="work-tags">{(segment?.chips ?? generalChips).map(chip => <span key={chip}>{chip}</span>)}</div>{!sceneFailed && <button className={'motion-control ' + styles.motion} onClick={() => setPaused(!paused)} aria-pressed={paused}>{paused ? 'Restore 3D motion' : 'Reduce 3D motion'}</button>}</Reveal></div>
    </section>
    <section className="story-chapter story-handoff" aria-labelledby="handoff-title">
      <div className="story-content studio-wrap"><Reveal className="story-copy"><p className="kicker light">02 / Choosing your assistant</p><h2 id="handoff-title">Choose your<br/><em>Expert.</em></h2><p className="story-lede">Interview screened candidates and choose who you work with. You set the tasks, tools, and hours. GVE helps with onboarding and ongoing support.</p><Link href="/how-it-works" className="underlined light">See the hiring process</Link></Reveal></div>
    </section>
    </div>
  </div>;
}
