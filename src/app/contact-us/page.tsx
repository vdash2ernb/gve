import type { Metadata } from 'next';
import {pageMeta} from '@/content/seo';
import { contact } from '@/content/site';
import HomeFunnel from '@/components/HomeFunnel';
import ContactTestimonials from '@/components/ContactTestimonials';
import styles from '@/components/Contact.module.css';

export const metadata:Metadata=pageMeta({title:'Contact Global Virtual Experts | Request a Free Call',description:'Tell us what you need help with and request a free 30-minute call about virtual assistant support for admin, bookkeeping, marketing, and more.',path:'/contact-us/'});

export default function Contact() {
  return <section className="page-content contact-page">
    <div className={'studio-wrap contact-layout ' + styles.layout}>
      <div className={'contact-intro ' + styles.intro}>
        <p className="kicker">Contact GVE</p>
        <h1>Tell us what<br/>you need.</h1>
        <p className="contact-lede">Share the tasks and hours you need help with. We’ll talk through the role with you.</p>
        <dl className="contact-details">
          <div className="contact-email"><dt>Email us</dt><dd><a href={'mailto:' + contact.email}>{contact.email}</a></dd></div>
          <div><dt>Talk to sales</dt><dd><a href={contact.salesPhoneHref}>{contact.salesPhone}</a></dd></div>
          <div><dt>Our office</dt><dd><a href={contact.phoneHref}>{contact.phone}</a><span>{contact.location}</span></dd></div>
          <div className={styles.profile}><dt className="sr-only">Business profile</dt><dd><a className={styles.googleLink} href={contact.googleBusinessProfile} target="_blank" rel="noopener noreferrer">View GVE on Google <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span></a></dd></div>
        </dl>
      </div>
      <div className={'contact-booking ' + styles.booking}>
        {/* The same four questions as the homepage, ending in the request form. */}
        <div className={styles.bookAnchor} id="book"><HomeFunnel source="Contact page funnel" className={styles.funnel}/></div>
      </div>
      <ContactTestimonials/>
    </div>
  </section>;
}
