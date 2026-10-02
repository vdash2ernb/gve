'use client';

import Script from 'next/script';
import { useRef, useState } from 'react';

type HubSpotWindow = Window & {
  hbspt?: { forms: { create: (options: {
    portalId: string;
    formId: string;
    target: string;
    onFormReady: () => void;
  }) => void } };
};

export default function HubSpotContactForm() {
  const mounted = useRef(false);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  function mountForm() {
    if (mounted.current) return;
    const forms = (window as HubSpotWindow).hbspt?.forms;
    if (!forms) { setStatus('error'); return; }
    mounted.current = true;
    try {
      forms.create({
        portalId: '43705376',
        formId: '8819bc6b-38c7-4c9f-9eb3-01d6e362cc20',
        target: '#gve-contact-form',
        onFormReady: () => setStatus('ready'),
      });
    } catch { setStatus('error'); }
  }

  return <>
    <div className="contact-form-shell">
      {status !== 'ready' && <p role="status" className="form-status">
        {status === 'error' ? <>The form couldn’t load. <a href="https://globalvirtualexperts.com/contactus/" className="underlined">Open our contact form</a> or email us.</> : 'Loading the contact form…'}
      </p>}
      <div id="gve-contact-form" />
      <noscript><p>Please <a href="mailto:hello@globalvirtualexperts.com">email us</a> to get in touch.</p></noscript>
    </div>
    <Script id="hubspot-contact-embed" src="https://js.hsforms.net/forms/embed/v2.js" strategy="afterInteractive"
      onReady={mountForm} onError={() => setStatus('error')} />
  </>;
}
