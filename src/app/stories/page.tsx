import type {Metadata} from 'next';
import Link from 'next/link';
import PageHero from '@/components/PageHero';
import YouTube from '@/components/YouTube';
import CTA from '@/components/CTA';
import {Reveal} from '@/components/Reveal';
import {stories,contact} from '@/content/site';
export const metadata:Metadata={title:'Meet the Experts',description:'Hear from GVE Experts working in drafting, bookkeeping, technical operations, and admin support.'};
export default function Stories(){return <><PageHero eyebrow="Expert stories" title="Meet the people behind the work." body="Drafting, bookkeeping, daily admin. Hear from the Experts who bring these skills to GVE."/><section className="page-content"><div className="studio-wrap"><div className="story-videos">{stories.map((s,i)=><Reveal key={s.name} className="story-video" delay={(i%2)*.05}><YouTube id={s.video} title={s.name+' · '+s.role}/><div className="story-caption"><span className="story-index">0{i+1}</span><div><h2>{s.name}</h2><p className="story-role">{s.role}</p><p>{s.text}</p></div></div></Reveal>)}</div><div className="team-introduction"><div><p className="kicker">Say hello to GVE</p><h2>One team.<br/>Many strengths.</h2><p>Get to know the people behind our support.</p><Link href="/about" className="underlined">Meet the whole team</Link></div><YouTube id="rOlaO2CRFUA" title="Meet the GVE team"/></div><p className="careers-note">Interested in joining GVE? <a className="underlined" href={'mailto:'+contact.careersEmail}>Talk to our careers team</a></p></div></section><CTA title="Who would help your business?" body="Let’s find an Expert with the skills you need."/></>}
