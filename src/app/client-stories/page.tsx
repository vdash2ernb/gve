import type { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import ClientStoryCard from '@/components/ClientStoryCard';
import FounderStory from '@/components/FounderStory';
import CTA from '@/components/CTA';
import { Reveal } from '@/components/Reveal';
import { clientStories } from '@/content/client-stories';
import styles from '@/components/ClientStories.module.css';

export const metadata: Metadata = { title: 'Client stories', description: 'Client interviews about virtual assistants for bookkeeping, drafting, marketing, and nonprofit work.' };

export default function ClientStoriesPage() {
  return <>
    <PageHero eyebrow="Client stories" title={<span className={styles.clientHeading}>Real businesses.<br/><span className={styles.keepTogether}>Real support.</span></span>} body="Watch four clients explain the tasks their virtual assistants handle." />
    <section className={styles.collection} aria-label="Client video stories"><div className="studio-wrap">
      <h2 className="sr-only">Client interviews</h2><div className={styles.storyGrid}>{clientStories.map(story => <Reveal key={story.id}><ClientStoryCard story={story}/></Reveal>)}</div>
    </div></section>
    <FounderStory/>
    <CTA/>
  </>;
}
