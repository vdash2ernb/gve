import Link from 'next/link';
import { clientStories } from '@/content/client-stories';
import YouTube from './YouTube';
import styles from './Contact.module.css';

// Under the Contact page funnel card. Martha and Josiah are already quoted in
// "Client feedback" beside the form, so their videos are not repeated here:
// the other two interviews fill the column and all four clients appear once.
const shown = ['architect', 'earthwin'];

export default function ContactInterviews() {
  const stories = clientStories.filter(story => shown.includes(story.id));
  return <section className={styles.interviews} aria-labelledby="contact-interviews-title">
    <h2 id="contact-interviews-title" className={styles.feedbackHeading}>Client interviews</h2>
    <div className={styles.interviewList}>
      {stories.map(story => <article className={styles.interview} key={story.id}>
        {/* The video plays in place, so watching never takes the visitor away from the form. */}
        <YouTube id={story.video} title={`${story.name} · ${story.company || story.role}`} showTitle={false} highResolution />
        <div className={styles.interviewText}>
          <p className={styles.interviewName}>{story.name}<span>{story.company ? `${story.role} · ${story.company}` : story.role}</span></p>
          <h3>{story.headline}</h3>
        </div>
      </article>)}
    </div>
    <Link href="/client-stories" className={styles.allStories}>See all client stories <span aria-hidden="true">→</span></Link>
  </section>;
}
