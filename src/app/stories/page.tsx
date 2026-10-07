import type {Metadata} from 'next';
import Link from 'next/link';
import PageHero from '@/components/PageHero';
import YouTube from '@/components/YouTube';
import CTA from '@/components/CTA';
import {Reveal} from '@/components/Reveal';
import {stories,contact} from '@/content/site';
export const metadata:Metadata={title:'Meet the Experts',description:'Hear from GVE Experts working in drafting, bookkeeping, technical operations, and admin support.',alternates:{canonical:'/stories/'}};
export default function Stories(){return <><PageHero eyebrow="Expert stories" title="Meet our Experts." body="Watch our team share their work in drafting, bookkeeping, admin, and technical operations."/><section className="page-content"><div className="studio-wrap"><div className="story-videos">{stories.map((s,i)=><Reveal key={s.name} id={s.name.toLowerCase()} className="story-video" delay={(i%2)*.05}><YouTube id={s.video} title={s.name+' · '+s.role}/><div className="story-caption"><div><h2>{s.name}</h2><p className="story-role">{s.role}</p><p>{s.text}</p></div></div></Reveal>)}</div><div className="team-introduction"><div><p className="kicker">Team video</p><h2>Meet the<br/>GVE team.</h2><Link href="/about" className="underlined">Meet the whole team</Link></div><YouTube id="rOlaO2CRFUA" title="Meet the GVE team"/></div><p className="careers-note">Interested in joining GVE? <a className="underlined" href={'mailto:'+contact.careersEmail}>Talk to our careers team</a></p></div></section><CTA/></>}
