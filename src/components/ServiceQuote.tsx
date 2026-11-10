import Link from 'next/link';
import { clientStories } from '@/content/client-stories';
import type { Service } from '@/content/site';
import styles from './ServiceQuote.module.css';

type ServiceGroup = Service['group'];

// One real client quote under the services list, matched to the group the
// visitor is looking at: River Roofing is a trades business whose Expert does
// the bookkeeping and paperwork; MW Design Workshop is a design business whose
// Expert handles social media and research.
const quoteFor: Record<ServiceGroup, string> = {
  'Construction & trades': 'river-roofing',
  'Admin & operations': 'river-roofing',
  'Sales & marketing': 'mw-design',
  'Design & web': 'mw-design',
};

export default function ServiceQuote({ group }: { group: ServiceGroup }) {
  const story = clientStories.find(s => s.id === quoteFor[group]);
  if (!story?.quote) return null;
  return <figure className={styles.quote} key={story.id}>
    <blockquote cite={'https://www.youtube.com/watch?v=' + story.video}>
      <span className={styles.mark} aria-hidden="true">“</span>
      <p>“{story.quote.text}”</p>
    </blockquote>
    <figcaption className={styles.attribution}>
      <span className={styles.who}><strong>{story.name}</strong>{story.role}{story.company && ` · ${story.company}`}</span>
      <Link href={`/client-stories/#${story.id}`} className={styles.link}>
        Watch {story.name}’s interview <span aria-hidden="true">→</span>
      </Link>
    </figcaption>
  </figure>;
}
