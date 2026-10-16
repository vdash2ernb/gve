import Image from 'next/image';
import Link from 'next/link';
import { services, faq } from '@/content/site';
import { Reveal } from './Reveal';
import Accordion from './Accordion';
import CTA from './CTA';
const groups = [
  { name: 'Admin & operations', text: 'Email, schedules, accounts, and customer support.' },
  { name: 'Sales & marketing', text: 'Lead outreach, social media, and writing.' },
  { name: 'Specialist services', text: 'Design, websites, CAD, and dispatch.' },
];
export default function HomeContent() {
  return <>
    <section className="chapter services-chapter"><div className="studio-wrap">
      <div className="chapter-heading"><div><p className="kicker">Our services</p><h2>Find help for<br/>your workload.</h2></div></div>
      <div className="service-rows">{groups.map((g, i) => <Reveal className="service-row" key={g.name}><span className="row-index">0{i + 1}</span><div className="row-heading"><h3>{g.name}</h3><p>{g.text}</p></div><ul>{services.filter(s => s.group === g.name).map(s => <li key={s.slug}><Link href={'/services/' + s.slug}>{s.name}</Link></li>)}</ul></Reveal>)}</div>
    </div></section>
    <section className="founder-chapter"><div className="founder-composition"><div className="founder-photo"><Image src="/team/craig.jpeg" alt="Craig Mauer, GVE founder and Seattle builder" width={678} height={680}/></div><div className="founder-copy"><p className="kicker light">Our founder</p><h2>Why Craig<br/>started GVE.</h2><p>Craig hired virtual assistants for Silver Peak Design Build, then started GVE to help other business owners hire their own.</p><p>Craig Mauer · CEO, Global Virtual Experts<br/>Owner, Silver Peak Design Build</p><Link href="/about/#craig-story" className="underlined light">Watch Craig’s story <span aria-hidden="true">→</span></Link></div></div></section>
    <section className="chapter"><div className="studio-wrap"><div className="chapter-heading"><div><p className="kicker">How it works</p><h2>From first call<br/>to first day.</h2></div><div><Link href="/how-it-works" className="underlined">Hiring steps and deposit terms</Link></div></div><ol className="process-rail">{[{ title: 'Define the role', body: 'Tell us the tasks, skills, and hours you need.' }, { title: 'Find candidates', body: 'We source and screen for your role.' }, { title: 'Choose your Expert', body: 'Interview the candidates and choose one.' }, { title: 'Get started', body: 'We help with onboarding and daily task reports.' }].map((s, i) => <Reveal key={s.title} as="li" className="process-item" delay={i * .07}><span>0{i + 1}</span><h3>{s.title}</h3><p>{s.body}</p></Reveal>)}</ol></div></section>
    <section className="chapter"><div className="studio-wrap inline-faq"><div><p className="kicker">FAQs</p><h2>Before<br/>you hire.</h2><Link href="/faq" className="underlined">All FAQs</Link></div><Accordion items={[faq[0].items[0], faq[1].items[0], faq[2].items[1], faq[3].items[0]]}/></div></section>
    <CTA/>
  </>;
}
