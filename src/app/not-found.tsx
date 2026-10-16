import Link from 'next/link';
import LostPageGuide from '@/components/lost-page/LostPageGuide';
import styles from '@/components/lost-page/LostPage.module.css';

export default function NotFound() {
  return <section className={styles.page}>
    <div className={'studio-wrap ' + styles.layout}>
      <div className={styles.copy}>
        <p className="kicker">404 · Page not found</p>
        <h1>We can’t find<br/>this page.</h1>
        <p className={styles.description}>The link may have changed. Here are a few places to start.</p>
        <div className={styles.actions}><Link href="/" className="button navy">Back to home</Link><Link href="/services" className="underlined">View services</Link></div>
        <p className={styles.contact}>Need help? <Link href="/contact-us">Contact us</Link>.</p>
      </div>
      <LostPageGuide/>
    </div>
  </section>;
}
