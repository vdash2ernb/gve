import { founderStory } from '@/content/client-stories';
import YouTube from './YouTube';
import styles from './ClientStories.module.css';

export default function FounderStory() {
  return <section className={styles.founderStory} id="craig-story" aria-labelledby="craig-story-title">
    <div className="studio-wrap">
      <div className={styles.founderGrid}>
        <div><p className="kicker">From our founder</p><h2 id="craig-story-title">{founderStory.headline}</h2><p className={styles.summary}>{founderStory.summary}</p>
          <p className={styles.founderIdentity}><strong>Craig Mauer</strong><span>CEO, Global Virtual Experts</span><span>Owner, Silver Peak Design Build</span></p>
          <a className={styles.watchLink} href={`https://www.youtube.com/watch?v=${founderStory.video}`} target="_blank" rel="noopener noreferrer">Watch on YouTube <span aria-hidden="true">↗</span></a>
        </div>
        <YouTube id={founderStory.video} title="Craig Mauer · Why he built Global Virtual Experts" showTitle={false} highResolution />
      </div>
    </div>
  </section>;
}
