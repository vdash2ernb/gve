import Link from 'next/link';
import { stories } from '@/content/site';
import YouTube from './YouTube';
import styles from './ExpertSpotlight.module.css';

const featured = ['Kate', 'Hannah', 'Loury'].map(name => stories.find(story => story.name === name)!);

export default function ExpertSpotlight() {
  return <section className={styles.section} id="meet-the-experts" aria-labelledby="expert-spotlight-title">
    <div className={styles.heading}>
      <div><p className="kicker">Expert stories</p><h2 id="expert-spotlight-title">Meet our Experts.</h2></div>
      <Link href="/stories" className="underlined">View all Expert stories <span aria-hidden="true">→</span></Link>
    </div>
    <div className={styles.grid}>
      {featured.map(expert => <article className={styles.card} key={expert.name}>
        <YouTube id={expert.video} title={`${expert.name} · ${expert.role}`} showTitle={false}/>
        <h3><Link href={`/stories/#${expert.name.toLowerCase()}`}>{expert.name} <span aria-hidden="true">→</span></Link></h3>
        <p>{expert.role}</p>
      </article>)}
    </div>
  </section>;
}
