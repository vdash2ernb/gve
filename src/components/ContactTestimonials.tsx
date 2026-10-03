'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './Contact.module.css';

// Exact excerpts from the supplied interviews: Martha at 2:21 and Josiah at
// 4:17. Keep the quotation source separate from each link to the client story.
const feedback = [
  {
    name: 'Martha',
    role: 'Office Manager & Bookkeeper',
    company: 'River Roofing',
    quote: 'It’s allowed me to simplify my day.',
    source: 'https://www.youtube.com/watch?v=nhq0_DsNkuM',
    href: '/client-stories/#river-roofing',
    sourceLabel: 'Watch Martha’s interview',
    sourceType: 'Video interview excerpt',
  },
  {
    name: 'Josiah',
    role: 'CEO',
    company: 'MW Design Workshop',
    quote: 'I just wish I would have done it earlier.',
    source: 'https://www.youtube.com/watch?v=XqHtApU0Qno',
    href: '/client-stories/#mw-design',
    sourceLabel: 'Watch Josiah’s interview',
    sourceType: 'Video interview excerpt',
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
          <Link href={item.href} className={styles.sourceLink}>
            {item.sourceLabel} <span aria-hidden="true">→</span>
          </Link>
        </figcaption>
      </figure>)}
    </div>
    </div>
  </aside>;
}
