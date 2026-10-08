import type { Metadata } from 'next';
import { contact } from '@/content/site';
import CalendlyBooking from '@/components/CalendlyBooking';
import styles from '@/components/BookCall.module.css';

// Step 2 of the inquiry: the GHL form sends visitors here after they submit.
export const metadata: Metadata = {
  title: 'Pick a time for your call',
  description: 'Choose a time for your free 30-minute call with Global Virtual Experts.',
  robots: { index: false },
};

export default function BookACall() {
  return <section className="page-content contact-page">
    <div className={'studio-wrap ' + styles.layout}>
      <div className={styles.intro}>
        <p className="kicker">Step 2 of 2</p>
        <h1>Pick a time for<br/>your free call.</h1>
        <p className={styles.lede}>Thanks, we’ve received your details. Choose a time that suits you, and we’ll talk through the role, hours, and pricing.</p>
        <p className={styles.email}>Questions before the call? Email <a href={'mailto:' + contact.email}>{contact.email}</a>.</p>
      </div>
      <div className={styles.calendar}><CalendlyBooking/></div>
    </div>
  </section>;
}
