import type {Metadata} from 'next';
import PageHero from '@/components/PageHero';
import Accordion from '@/components/Accordion';
import CTA from '@/components/CTA';
import {faq} from '@/content/site';
export const metadata:Metadata={title:'Frequently asked questions',description:'Straightforward answers about GVE Experts, hours, pricing, hiring, and support.'};
export default function FAQ(){return <><PageHero eyebrow="FAQs" title="Good questions. Clear answers." body="The details that help you decide."/><section className="page-content"><div className="studio-wrap faq-layout"><nav className="topic-nav" aria-label="FAQ topics">{faq.map((g,i)=><a href={'#topic-'+i} key={g.topic}>{g.topic}</a>)}</nav><div>{faq.map((g,i)=><section className="faq-topic" id={'topic-'+i} key={g.topic}><h2>{g.topic}</h2><Accordion items={g.items}/></section>)}</div></div></section><CTA title="Something else on your mind?" body="Let’s talk through your questions on a free call."/></>}
