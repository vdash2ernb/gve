import type { Metadata } from 'next';
import { contact } from '@/content/site';
import HubSpotContactForm from '@/components/HubSpotContactForm';
import styles from '@/components/ClientStories.module.css';
export const metadata: Metadata = { title: 'Contact us', description: 'Tell Global Virtual Experts about the support your business needs.' };
export default function Contact() {
  return <section className="page-content contact-page"><div className="studio-wrap contact-layout">
    <div className="contact-intro"><p className="kicker">Contact GVE</p><h1>Tell us what<br/>you need.</h1><p className="contact-lede">Share the tasks and hours you need help with. We’ll discuss the role and pricing with you.</p>
      <dl className="contact-details"><div className="contact-email"><dt>Email us</dt><dd><a href={'mailto:' + contact.email}>{contact.email}</a></dd></div><div><dt>Talk to sales</dt><dd><a href={contact.salesPhoneHref}>{contact.salesPhone}</a></dd></div><div><dt>Our office</dt><dd><a href={contact.phoneHref}>{contact.phone}</a><span>{contact.location}</span></dd></div></dl>
      <blockquote className={styles.contactQuote}><p>“It’s allowed me to simplify my day.”</p><footer>Martha · Office Manager & Bookkeeper, River Roofing</footer></blockquote>
    </div>
    <div className="contact-booking"><div className="booking-heading"><h2>How can we help?</h2></div><HubSpotContactForm/><p className="contact-note">Prefer to talk? <a href={contact.calendly} target="_blank" rel="noopener noreferrer" className="underlined">Book a free 30-minute call</a>.</p></div>
  </div></section>;
}
