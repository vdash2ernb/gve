'use client';

import { useEffect, useRef } from 'react';
import styles from './Contact.module.css';

// Preserve client words and identify whether they come from an interview or
// written feedback. Josiah's full review also exists in the original site export.
const feedback = [
  {
    name: 'Martha',
    role: 'Office Manager & Bookkeeper',
    company: 'River Roofing',
    quote: 'It’s allowed me to simplify my day.',
    source: 'https://www.youtube.com/watch?v=nhq0_DsNkuM',
    sourceLabel: 'Watch her interview',
    sourceType: 'Video interview excerpt',
  },
  {
    name: 'Josiah',
    role: 'CEO',
    company: 'MW Design Workshop',
    quote: 'GVE is fantastic, they have helped me to get started with my first VEA and given her all the support for her to be successful in helping me run my business and support my team.',
    source: 'https://globalvirtualexperts.com/whoweare/',
    sourceLabel: 'Read the original review',
    sourceType: 'Written testimonial',
  },
];

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
          <a href={item.source} target="_blank" rel="noopener noreferrer" className={styles.sourceLink}>
            {item.sourceLabel} <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span>
          </a>
        </figcaption>
      </figure>)}
    </div>
    </div>
  </aside>;
}
