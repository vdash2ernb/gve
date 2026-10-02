import Link from 'next/link';
import { clientStories, type ClientStory } from '@/content/client-stories';
import ClientStoryCard from './ClientStoryCard';
import { Reveal } from './Reveal';
import styles from './ClientStories.module.css';

export default function ClientProof() {
  return <section className={styles.proof} id="client-proof" aria-labelledby="client-proof-title">
    <div className="studio-wrap">
      <div className={styles.intro}><div><p className="kicker">Client interviews</p><h2 id="client-proof-title">How our clients<br/>use GVE.</h2></div></div>
      <div className={styles.homeGrid}>
        <Reveal><ClientStoryCard story={clientStories[0]}/></Reveal>
        <div className={styles.sideStories}>{clientStories.slice(1, 3).map(story => <Reveal key={story.id}><ClientStoryCard story={story} compact/></Reveal>)}
          <div className={styles.moreStories}><Link href="/client-stories" className="underlined">See all client stories <span aria-hidden="true">→</span></Link></div>
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
