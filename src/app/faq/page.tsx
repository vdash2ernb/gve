import type {Metadata} from 'next';
import {jsonLd,pageMeta} from '@/content/seo';
import PageHero from '@/components/PageHero';
import Accordion from '@/components/Accordion';
import CTA from '@/components/CTA';
import {faq} from '@/content/site';
export const metadata:Metadata=pageMeta({title:'Virtual Assistant Services FAQ',description:'Answers about GVE virtual assistants: who you will work with, hours, how long hiring takes, pricing, the search deposit, and data security.',path:'/faq/'});
// Mirrors the visible questions and answers so search engines and AI tools can quote them.
const faqData={'@context':'https://schema.org','@type':'FAQPage',mainEntity:faq.flatMap(g=>g.items.map(i=>({'@type':'Question',name:i.q,acceptedAnswer:{'@type':'Answer',text:i.a}})))};
export default function FAQ(){return <><script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(faqData)}/><PageHero eyebrow="FAQs" title="Virtual assistant FAQs."/><section className="page-content"><div className="studio-wrap faq-layout"><nav className="topic-nav" aria-label="FAQ topics">{faq.map((g,i)=><a href={'#topic-'+i} key={g.topic}>{g.topic}</a>)}</nav><div>{faq.map((g,i)=><section className="faq-topic" id={'topic-'+i} key={g.topic}><h2>{g.topic}</h2><Accordion items={g.items}/></section>)}</div></div></section><CTA title="Still have a question?" body="Ask us about hiring an Expert on a free 30-minute call."/></>}
