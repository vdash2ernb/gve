import Image from 'next/image';
import Link from 'next/link';
import { contact, nav } from '@/content/site';
import styles from './Footer.module.css';

const links = [...nav, { href: '/stories', label: 'Meet the Experts' }, { href: '/start', label: 'Start your search' }, { href: '/privacypolicy', label: 'Privacy Policy' }];

export default function Footer() {
  return <footer className={styles.footer} id="site-footer">
    <div className="studio-wrap">
      <div className={styles.grid}>
        <div className={styles.brand}>
          <Image src="/brand/gve-original-logo.png" alt="Global Virtual Experts" width={500} height={500}/>
          <p>Real People. AI Powered.<br/>Building Your Success.</p>
        </div>
        <nav className={styles.navigation} aria-label="Footer">
          <h3>Explore</h3>
          <ul>{links.map(link => <li key={link.href}><Link href={link.href}>{link.label}</Link></li>)}</ul>
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
      <div className={styles.bottom}><span>© {new Date().getFullYear()} Global Virtual Experts</span><span>Real people behind the work.</span></div>
    </div>
  </footer>;
}
