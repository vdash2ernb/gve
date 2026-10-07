'use client';

import Script from 'next/script';
import { useRef, useState } from 'react';
import { contact } from '@/content/site';
import styles from './CalendlyBooking.module.css';

type CalendlyWindow = Window & {
  Calendly?: { initInlineWidget: (options: { url: string; parentElement: HTMLElement; resize?: boolean }) => void };
};

const bookingUrl = contact.calendly + '?primary_color=00203d';

// Shows the Calendly scheduler in the page. The plain link underneath always works,
// including when the scheduler is blocked or slow to load.
export default function CalendlyBooking() {
  const host = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  function mount() {
    const calendly = (window as CalendlyWindow).Calendly;
    if (!calendly || !host.current) { setFailed(true); return; }
    host.current.replaceChildren();
    try {
      calendly.initInlineWidget({ url: bookingUrl, parentElement: host.current, resize: true });
    } catch { setFailed(true); }
  }

  return <>
    {!failed && <div ref={host} className={styles.scheduler} />}
    <p className={styles.direct}>
      {failed ? 'The calendar couldn’t load here. ' : 'Calendar not showing? '}
      <a href={contact.calendly} target="_blank" rel="noopener noreferrer" className="underlined">Open it in a new tab<span className="sr-only"> (opens in a new tab)</span></a>
    </p>
    <Script id="calendly-widget" src="https://assets.calendly.com/assets/external/widget.js" strategy="afterInteractive"
      onReady={mount} onError={() => setFailed(true)} />
  </>;
}
