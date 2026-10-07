import type { Metadata } from 'next';
import { contact } from '@/content/site';
import ContactForm from '@/components/ContactForm';
import CalendlyBooking from '@/components/CalendlyBooking';
import ContactTestimonials from '@/components/ContactTestimonials';
import styles from '@/components/Contact.module.css';

export const metadata: Metadata = {
  title: 'Contact us',
  description: 'Tell Global Virtual Experts about the support your business needs.',
  alternates: { canonical: '/contact-us/' },
};

export default function Contact() {
  return <section className="page-content contact-page">
    <div className={'studio-wrap contact-layout ' + styles.layout}>
      <div className={'contact-intro ' + styles.intro}>
        <p className="kicker">Contact GVE</p>
        <h1>Tell us what<br/>you need.</h1>
        <p className="contact-lede">Share the tasks and hours you need help with. We’ll discuss the role and pricing with you.</p>
        <dl className="contact-details">
          <div className="contact-email"><dt>Email us</dt><dd><a href={'mailto:' + contact.email}>{contact.email}</a></dd></div>
          <div><dt>Talk to sales</dt><dd><a href={contact.salesPhoneHref}>{contact.salesPhone}</a></dd></div>
          <div><dt>Our office</dt><dd><a href={contact.phoneHref}>{contact.phone}</a><span>{contact.location}</span></dd></div>
          <div className={styles.profile}><dt className="sr-only">Business profile</dt><dd><a className={styles.googleLink} href={contact.googleBusinessProfile} target="_blank" rel="noopener noreferrer">View GVE on Google <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span></a></dd></div>
        </dl>
      </div>
      <div className={'contact-booking ' + styles.booking}>
        <div className={'booking-heading ' + styles.bookAnchor} id="book"><h2>Book a free 30-minute call</h2><p>Pick a time that suits you. We’ll talk through the role, hours, and pricing.</p></div>
        <CalendlyBooking/>
        <div className={'booking-heading ' + styles.messageHeading}><h2>Or send us a message</h2><p>Tell us what you need and we’ll reply by email.</p></div>
        <ContactForm/>
      </div>
      <ContactTestimonials/>
    </div>
  </section>;
}
