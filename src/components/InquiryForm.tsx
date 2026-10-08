'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import { contact } from '@/content/site';
import styles from './InquiryForm.module.css';

// Step 1 of the inquiry: the "GVE Website Inquiry" form in Go High Level. After submitting,
// GHL sends visitors to /book-a-call/ to pick a time (set in the form's On Submit settings).
const formId = '2c3i3cmNyHMyOnHZPf15';
const formOrigin = 'https://api.leadconnectorhq.com';
const slowAfterMs = 12000;

// Attributes from GHL's "Inline" embed code.
const frameAttributes: Record<string, string> = {
  src: formOrigin + '/widget/form/' + formId,
  id: 'inline-' + formId,
  'data-layout': "{'id':'INLINE'}",
  'data-trigger-type': 'alwaysShow',
  'data-trigger-value': '',
  'data-activation-type': 'alwaysActivated',
  'data-activation-value': '',
  'data-deactivation-type': 'neverDeactivate',
  'data-deactivation-value': '',
  'data-form-name': 'GVE Website Inquiry',
  'data-height': 'undefined',
  'data-layout-iframe-id': 'inline-' + formId,
  'data-form-id': formId,
  'data-cookie-consent': 'true',
  'data-cookie-consent-provider': 'auto',
  title: 'GVE Website Inquiry',
};

export default function InquiryForm() {
  const host = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (loaded) return;
    const timer = setTimeout(() => setSlow(true), slowAfterMs);
    return () => clearTimeout(timer);
  }, [loaded]);

  // The form reports its own height. GHL's script doesn't reliably apply it, so we do,
  // and the whole form shows without a scrollbar inside it.
  useEffect(() => {
    const resize = (e: MessageEvent) => {
      if (e.origin !== formOrigin || typeof e.data !== 'string' || !e.data.startsWith('[iFrameSizer]inline-' + formId)) return;
      const height = Number(e.data.split(':')[1]);
      const frame = host.current?.querySelector('iframe');
      if (frame && height > 0) frame.style.height = height + 'px';
    };
    window.addEventListener('message', resize);
    const el = host.current;
    return () => { window.removeEventListener('message', resize); el?.replaceChildren(); };
  }, []);

  // GHL's script wraps and moves the frame, so React never renders it; it is created inside `host`
  // once the script is ready, so the script can connect to it as it loads.
  function addForm() {
    const el = host.current;
    if (!el || el.querySelector('iframe')) return;
    const frame = document.createElement('iframe');
    for (const [name, value] of Object.entries(frameAttributes)) frame.setAttribute(name, value);
    frame.className = styles.frame;
    frame.addEventListener('load', () => setLoaded(true), { once: true });
    el.appendChild(frame);
  }

  return <div className={styles.shell}>
    {!loaded && <p role="status" className={styles.status}>
      {slow
        ? <>The form is taking a while to load. You can also email <a href={'mailto:' + contact.email}>{contact.email}</a> or call <a href={contact.salesPhoneHref}>{contact.salesPhone}</a>.</>
        : 'Loading the form…'}
    </p>}
    <div ref={host} />
    <Script id="ghl-form-embed" src="https://link.msgsndr.com/js/form_embed.js" strategy="afterInteractive" onReady={addForm} onError={addForm} />
  </div>;
}
