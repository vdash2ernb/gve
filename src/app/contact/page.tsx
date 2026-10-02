import type { Metadata } from 'next';
import { contact } from '@/content/site';
export const metadata: Metadata = { title: 'Book a free call', description: 'Book a free 30-minute call with Global Virtual Experts to discuss the support your business needs.' };
const schedule = contact.calendly + '?background_color=ffffff&text_color=00203d&primary_color=00203d';
export default function Contact() {
  return <section className="page-content contact-page"><div className="studio-wrap contact-layout">
    <div className="contact-intro"><p className="kicker">Start with a conversation</p><h1>Find the<br/>right support.</h1><p className="contact-lede">A free 30-minute call about your workload and the Expert who could help.</p>
      <dl className="contact-details"><div className="contact-email"><dt>Email us</dt><dd><a href={'mailto:' + contact.email}>{contact.email}</a></dd></div><div><dt>Talk to sales</dt><dd><a href={contact.salesPhoneHref}>{contact.salesPhone}</a></dd></div><div><dt>Our office</dt><dd><a href={contact.phoneHref}>{contact.phone}</a><span>{contact.location}</span></dd></div></dl>
    </div>
    <div className="contact-booking"><div className="booking-heading"><h2>Choose a time that works for you.</h2><p>30 minutes · Free consultation</p></div><div className="scheduler"><iframe src={schedule} title="Book a free 30-minute GVE call" loading="lazy"/></div><p className="contact-note">You can also <a href={contact.calendly} target="_blank" rel="noopener noreferrer" className="underlined">open the booking calendar</a>.</p></div>
  </div></section>;
}
