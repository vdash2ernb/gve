import Link from 'next/link';
import { type ClientStory } from '@/content/client-stories';
import YouTube from './YouTube';
import styles from './ClientStories.module.css';

// `linkToStory` sends the card's link to the client's entry on the Client stories page instead of YouTube.
export default function ClientStoryCard({ story, compact = false, linkToStory = false }: { story: ClientStory; compact?: boolean; linkToStory?: boolean }) {
  return <article className={compact ? styles.compactCard : styles.card} id={story.id}>
    <YouTube id={story.video} title={`${story.name} · ${story.company || story.role}`} showTitle={false} highResolution />
    <div className={styles.caption}>
      <p className={styles.identity}>{story.name}<span>{story.company || story.role}</span></p>
      <h3>{story.headline}</h3>
      {!compact && <>{story.company && <p className={styles.role}>{story.role}</p>}<p className={styles.summary}>{story.summary}</p></>}
      {linkToStory
        ? <Link className={styles.watchLink} href={`/client-stories/#${story.id}`}>Read {story.name.split(' ')[0]}&rsquo;s story <span aria-hidden="true">→</span></Link>
        : <a className={styles.watchLink} href={`https://www.youtube.com/watch?v=${story.video}`} target="_blank" rel="noopener noreferrer">
          Watch on YouTube <span aria-hidden="true">↗</span>
        </a>}
    </div>
  </article>;
}
