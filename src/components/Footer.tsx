import Image from 'next/image';
import Link from 'next/link';
import { contact } from '@/content/site';
import styles from './Footer.module.css';

const groups = [
  { title: 'Get started', links: [
    { href: '/services', label: 'Services' },
    { href: '/how-it-works', label: 'How it works' },
    { href: '/faq', label: 'FAQ' },
    { href: '/start', label: 'Start your search' },
  ] },
  { title: 'Company', links: [
    { href: '/about', label: 'About GVE' },
    { href: '/stories', label: 'Meet the Experts' },
    { href: '/client-stories', label: 'Client stories' },
  ] },
];

export default function Footer() {
  return <footer className={styles.footer} id="site-footer">
    <div className="studio-wrap">
      <div className={styles.grid}>
        <div className={styles.brand}>
          <Image src="/brand/gve-original-logo.png" alt="Global Virtual Experts" width={500} height={500}/>
          <p>Real People. AI Powered.<br/>Building Your Success.</p>
        </div>
        <nav className={styles.navigation} aria-label="Footer">
          {groups.map(group => <div key={group.title}><h3>{group.title}</h3>
            <ul>{group.links.map(link => <li key={link.href}><Link href={link.href}>{link.label}</Link></li>)}</ul>
          </div>)}
        </nav>
        <div className={styles.contact}>
          <h3>Let’s talk</h3>
          <a className={styles.email} href={'mailto:' + contact.email}>{contact.email}</a>
          <dl className={styles.phones}>
            <div><dt>Sales</dt><dd><a href={contact.salesPhoneHref}>{contact.salesPhone}</a></dd></div>
            <div><dt>Office</dt><dd><a href={contact.phoneHref}>{contact.phone}</a></dd></div>
          </dl>
          <p className={styles.location}>{contact.location}</p>
        </div>
      </div>
      <div className={styles.bottom}><span>© {new Date().getFullYear()} Global Virtual Experts</span><Link href="/privacypolicy" className={styles.privacy}>Privacy Policy</Link></div>
    </div>
  </footer>;
}
