'use client';

import Script from 'next/script';
import { useRef, useState } from 'react';
import { contact } from '@/content/site';
import styles from './CalendlyBooking.module.css';

type CalendlyWindow = Window & {
  Calendly?: { initInlineWidget: (options: { url: string; parentElement: HTMLElement; resize?: boolean }) => void };
};

// The inquiry form can send visitors here with their details in the address. Calendly
// reads name and email from its own link, so the scheduler starts with them filled in.
function bookingUrl() {
  const params = new URLSearchParams(window.location.search);
  const read = (...keys: string[]) => keys.map(k => params.get(k)?.trim()).find(Boolean);
  const firstName = read('first_name', 'firstName');
  const lastName = read('last_name', 'lastName');
  const name = read('full_name', 'name') || [firstName, lastName].filter(Boolean).join(' ');
  const email = read('email');
  // Built by hand: Calendly reads "+" literally, so spaces must be encoded as %20.
  const fields: [string, string | undefined][] = [['primary_color', '00203d'], ['name', name], ['first_name', firstName], ['last_name', lastName], ['email', email]];
  return contact.calendly + '?' + fields.filter(([, v]) => v).map(([k, v]) => k + '=' + encodeURIComponent(v!)).join('&');
}

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
      calendly.initInlineWidget({ url: bookingUrl(), parentElement: host.current, resize: true });
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
