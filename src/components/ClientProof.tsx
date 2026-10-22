import Link from 'next/link';
import { clientStories, type ClientStory } from '@/content/client-stories';
import ClientStoryCard from './ClientStoryCard';
import { Reveal } from './Reveal';
import styles from './ClientStories.module.css';

// Martha's line is from her interview at 2:21 (also on the Contact page). John's and Sarah's are from the
// written reviews in `testimonials` (site.ts); Sarah's is cut to its first clause to keep the homepage positive.
const quotes = [
  { quote: 'It’s allowed me to simplify my day.', name: 'Martha', role: 'Office Manager & Bookkeeper · River Roofing' },
  { quote: 'Their team came in like a calm breeze, organizing my digital life and taking small—but essential—tasks off my plate.', name: 'John', role: 'Service Provider' },
  { quote: 'I’ve reclaimed my evenings.', name: 'Sarah', role: 'Founder' },
];

export default function ClientProof() {
  return <section className={styles.proof} id="client-proof" aria-labelledby="client-proof-title">
    <div className="studio-wrap">
      <div className={styles.intro}><div><p className="kicker">Client interviews</p><h2 id="client-proof-title">How our clients<br/>use GVE.</h2></div></div>
      <div className={styles.homeGrid}>
        <Reveal><ClientStoryCard story={clientStories[0]} linkToStory/></Reveal>
        <div className={styles.sideStories}>{clientStories.slice(1, 3).map(story => <Reveal key={story.id}><ClientStoryCard story={story} compact linkToStory/></Reveal>)}
          <div className={styles.moreStories}><Link href="/client-stories" className="underlined">See all client stories <span aria-hidden="true">→</span></Link></div>
        </div>
      </div>
      <div className={styles.quotes} role="group" aria-labelledby="client-quotes-title">
        <p className="kicker" id="client-quotes-title">In their words</p>
        <div className={styles.quoteGrid}>
          {quotes.map(item => <Reveal key={item.name}><figure className={styles.quote}>
            <blockquote><p>“{item.quote}”</p></blockquote>
            <figcaption><strong>{item.name}</strong><span>{item.role}</span></figcaption>
          </figure></Reveal>)}
        </div>
      </div>
    </div>
  </section>;
}

export function ServiceClientProof({ story }: { story: ClientStory }) {
  return <section className={styles.serviceProof} aria-label={`Client story from ${story.name}`}>
    <div><p className="kicker">From a client</p><h2>{story.headline}</h2><p>{story.summary}</p><p className={styles.serviceIdentity}><strong>{story.name}</strong><br/>{story.role}{story.company && ` · ${story.company}`}</p><Link href={`/client-stories/#${story.id}`} className="underlined">More client stories <span aria-hidden="true">→</span></Link></div>
    <div><ClientStoryCard story={story} compact/></div>
  </section>;
}
