import type { Metadata } from 'next';
import Link from 'next/link';
import PageHero from '@/components/PageHero';
import ClientStoryCard from '@/components/ClientStoryCard';
import FounderStory from '@/components/FounderStory';
import CTA from '@/components/CTA';
import { Reveal } from '@/components/Reveal';
import { clientStories } from '@/content/client-stories';
import styles from '@/components/ClientStories.module.css';

export const metadata: Metadata = { title: 'Client stories', description: 'Hear how GVE clients delegate work, build trusted support, and make more room for their businesses.' };

export default function ClientStoriesPage() {
  return <>
    <PageHero eyebrow="Client stories" title="Real businesses. Real support." body="Hear what changed when our clients brought an Expert into their day." />
    <section className={styles.collection} aria-label="Client video stories"><div className="studio-wrap">
      <nav className={styles.collectionNav} aria-label="Choose a client story">{clientStories.map(story => <a key={story.id} href={`#${story.id}`}>{story.company || 'Architecture'}</a>)}<a href="#craig-story">From our founder</a></nav>
      <h2 className="sr-only">Client interviews</h2><div className={styles.storyGrid}>{clientStories.map(story => <Reveal key={story.id}><ClientStoryCard story={story}/></Reveal>)}</div>
    </div></section>
    <FounderStory/>
    <section className="section-rule"><div className="studio-wrap"><p>Meet the people who bring this support to life.</p><Link href="/stories" className="underlined">Meet our Experts <span aria-hidden="true">→</span></Link></div></section>
    <CTA title="What would you hand off?" body="Tell us about your workload. We’ll help you find the right Expert."/>
  </>;
}
