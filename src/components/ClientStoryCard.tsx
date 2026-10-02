import { type ClientStory } from '@/content/client-stories';
import YouTube from './YouTube';
import styles from './ClientStories.module.css';

export default function ClientStoryCard({ story, compact = false }: { story: ClientStory; compact?: boolean }) {
  return <article className={compact ? styles.compactCard : styles.card} id={story.id}>
    <YouTube id={story.video} title={`${story.name} · ${story.company || story.role}`} showTitle={false} highResolution />
    <div className={styles.caption}>
      <p className={styles.identity}>{story.name}<span>{story.company || story.role}</span></p>
      <h3>{story.headline}</h3>
      {!compact && <>{story.company && <p className={styles.role}>{story.role}</p>}<p className={styles.summary}>{story.summary}</p></>}
      <a className={styles.watchLink} href={`https://www.youtube.com/watch?v=${story.video}`} target="_blank" rel="noopener noreferrer">
        Watch on YouTube <span aria-hidden="true">↗</span><span className={styles.duration}>{story.duration}</span>
      </a>
    </div>
  </article>;
}
