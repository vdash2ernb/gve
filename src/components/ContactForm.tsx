'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { services } from '@/content/site';
import styles from './ContactForm.module.css';

// Placeholder for the Go High Level inquiry form. It mirrors the planned GHL fields
// and sends nothing; replace it with the GHL embed once that form is published.
const serviceOptions = [...services.map(s => s.name), 'Other'];

export default function ContactForm() {
  const [previewed, setPreviewed] = useState(false);

  function preview(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPreviewed(true);
  }

  return <div className="contact-form-shell">
    <p className={styles.notice}><strong>Preview form.</strong> It isn’t connected yet, so nothing you type is sent.</p>
    <form className={styles.form} onSubmit={preview} aria-label="GVE inquiry form">
      <div className={styles.pair}>
        <label className={styles.field}><span>First name<span className={styles.required} aria-hidden="true">*</span></span><input name="firstName" autoComplete="given-name" required /></label>
        <label className={styles.field}><span>Last name<span className={styles.required} aria-hidden="true">*</span></span><input name="lastName" autoComplete="family-name" required /></label>
      </div>
      <div className={styles.pair}>
        <label className={styles.field}><span>Email<span className={styles.required} aria-hidden="true">*</span></span><input name="email" type="email" autoComplete="email" required /></label>
        <label className={styles.field}><span>Phone</span><input name="phone" type="tel" autoComplete="tel" /></label>
      </div>
      <label className={styles.field}><span>Company name</span><input name="company" autoComplete="organization" /></label>
      <fieldset className={styles.services}>
        <legend>Services you need</legend>
        <div className={styles.options}>
          {serviceOptions.map(name => <label key={name} className={styles.option}><input type="checkbox" name="services" value={name} />{name}</label>)}
        </div>
      </fieldset>
      <label className={styles.field}><span>Hours needed per day</span>
        <select name="hours" defaultValue="">
          <option value="" disabled>Choose one</option>
          <option>Part-time (4 hours)</option>
          <option>Full-time (8 hours)</option>
          <option>Not sure yet</option>
        </select>
      </label>
      <label className={styles.field}><span>Tell us about the tasks you need help with<span className={styles.required} aria-hidden="true">*</span></span><textarea name="message" rows={5} required /></label>
      <p className={styles.consent}>By sending this form, you agree that GVE may contact you about your inquiry. Read our <Link href="/privacypolicy/" className={styles.policyLink}>Privacy Policy</Link>.</p>
      <button type="submit" className="button amber">Send inquiry</button>
      {previewed && <p role="status" className={styles.previewed}>This preview form looks complete. Nothing was sent. Your real Go High Level form will replace it.</p>}
    </form>
  </div>;
}
