import Image from 'next/image';
import Link from 'next/link';
import { services, faq } from '@/content/site';
import { Reveal } from './Reveal';
import Accordion from './Accordion';
import CTA from './CTA';
const groups = [
  { name: 'Run the office', text: 'Clear the everyday workload.' },
  { name: 'Win more work', text: 'Keep your business in the conversation.' },
  { name: 'Specialists', text: 'Bring the right skills to the job.' },
];
export default function HomeContent() {
  return <>
    <section className="chapter services-chapter"><div className="studio-wrap">
      <div className="chapter-heading"><div><p className="kicker">The right skills, right here</p><h2>What would you<br/>hand off first?</h2></div><p>Start with the work taking your time.<br/>We’ll help you find the person for it.</p></div>
      <div className="service-rows">{groups.map((g, i) => <Reveal className="service-row" key={g.name}><span className="row-index">0{i + 1}</span><div className="row-heading"><h3>{g.name}</h3><p>{g.text}</p></div><ul>{services.filter(s => s.group === g.name).map(s => <li key={s.slug}><Link href={'/services/' + s.slug}>{s.name}</Link></li>)}</ul></Reveal>)}</div>
    </div></section>
    <section className="founder-chapter"><div className="founder-composition"><div className="founder-photo"><Image src="/team/craig.jpeg" alt="Craig Mauer, GVE founder and Seattle builder" width={678} height={680}/></div><div className="founder-copy"><p className="kicker light">Built by a builder</p><h2>We’ve been<br/>in your shoes.</h2><p>Craig used virtual support at Silver Peak Design Build, then created GVE to help other owners get their time back.</p><p>Craig Mauer · CEO, Global Virtual Experts<br/>Owner, Silver Peak Design Build</p><Link href="/about/#craig-story" className="underlined light">Watch Craig’s story <span aria-hidden="true">→</span></Link></div></div></section>
    <section className="chapter"><div className="studio-wrap"><div className="chapter-heading"><div><p className="kicker">A clear way forward</p><h2>Your team starts<br/>with a conversation.</h2></div><div><p>You choose your Expert.<br/>We support you along the way.</p><Link href="/how-it-works" className="underlined">How it works</Link></div></div><ol className="process-rail">{[{ title: 'Talk', body: 'Tell us what’s taking your time.' }, { title: 'Find', body: 'We source and screen for your role.' }, { title: 'Choose', body: 'Meet the candidates. Pick your Expert.' }, { title: 'Work', body: 'Get started with ongoing GVE support.' }].map((s, i) => <Reveal key={s.title} as="li" className="process-item" delay={i * .07}><span>0{i + 1}</span><h3>{s.title}</h3><p>{s.body}</p></Reveal>)}</ol></div></section>
    <section className="chapter"><div className="studio-wrap inline-faq"><div><p className="kicker">Good to know</p><h2>A few quick<br/>answers.</h2><Link href="/faq" className="underlined">All FAQs</Link></div><Accordion items={[faq[0].items[0], faq[1].items[0], faq[2].items[1], faq[3].items[0]]}/></div></section>
    <CTA title={'Make room for\nwhat’s next.'} body="A free conversation about your workload, your business, and where an Expert could help."/>
  </>;
}
