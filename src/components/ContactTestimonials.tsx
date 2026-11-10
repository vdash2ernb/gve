'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { clientStories } from '@/content/client-stories';
import styles from './Contact.module.css';

// Exact excerpts from the supplied interviews (the quotes and their times live
// in client-stories.ts). Keep the quotation source separate from each link to
// the client story.
const feedback = ['river-roofing', 'mw-design'].map(id => {
  const story = clientStories.find(s => s.id === id)!;
  return {
    name: story.name,
    role: story.role,
    company: story.company,
    quote: story.quote!.text,
    source: 'https://www.youtube.com/watch?v=' + story.video,
    href: '/client-stories/#' + story.id,
    sourceLabel: `Watch ${story.name}’s interview`,
    sourceType: 'Video interview excerpt',
  };
});

export default function ContactTestimonials() {
  const sticky = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = sticky.current;
    if (!element) return;
    // A tall sidebar scrolls far enough to reveal its last quote before it
    // sticks. Font loading and viewport changes can alter its actual height.
    const observer = new ResizeObserver(() => {
      element.style.setProperty('--feedback-height', element.getBoundingClientRect().height + 'px');
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <aside className={styles.feedback} aria-labelledby="contact-feedback-title">
    <div ref={sticky} className={styles.sticky}>
    <h2 id="contact-feedback-title" className={styles.feedbackHeading}>Client feedback</h2>
    <div className={styles.quotes}>
      {feedback.map((item, index) => <figure className={styles.testimonial} key={item.name}>
        <blockquote cite={item.source} className={styles.bubble + (index === 0 ? ' ' + styles.primary : '')}>
          <span className={styles.quoteMark} aria-hidden="true">“</span>
          <p>“{item.quote}”</p>
        </blockquote>
        <figcaption className={styles.attribution}>
          <strong>{item.name}</strong>
          <span>{item.role} · {item.company}</span>
          <span className={styles.sourceType}>{item.sourceType}</span>
          <Link href={item.href} className={styles.sourceLink}>
            {item.sourceLabel} <span aria-hidden="true">→</span>
          </Link>
        </figcaption>
      </figure>)}
    </div>
    </div>
  </aside>;
}
