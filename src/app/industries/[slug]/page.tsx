import type {Metadata} from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import type {CSSProperties} from 'react';
import PageHero from '@/components/PageHero';
import {Reveal} from '@/components/Reveal';
import Accordion from '@/components/Accordion';
import CTA from '@/components/CTA';
import FounderStory from '@/components/FounderStory';
import {ServiceClientProof} from '@/components/ClientProof';
import styles from '@/components/Industry.module.css';
import {faq,partners,services,supportPromises} from '@/content/site';
import {clientStories} from '@/content/client-stories';
import {industries,segmentFor,type Industry} from '@/content/industries';
import marks from '@/content/client-logos.json';
import {logoSize} from '@/lib/logo-size';
import {jsonLd,organizationId,pageMeta,siteUrl} from '@/content/seo';

type Props={params:Promise<{slug:string}>};
const mono=marks as Record<string,{src:string;width:number;height:number}>;
const answers=faq.flatMap(topic=>topic.items);

export function generateStaticParams(){return industries.map(i=>({slug:i.slug}))}
export async function generateMetadata({params}:Props):Promise<Metadata>{const {slug}=await params;const i=industries.find(i=>i.slug===slug);return i?pageMeta({title:i.seoTitle,description:i.metaDescription,path:'/industries/'+i.slug+'/'}):{}}

// What search engines read: a virtual assistant service for this kind of business, and where the page sits in the site.
function pageData(i:Industry,label:string){const url=siteUrl+'/industries/'+i.slug+'/';return [{'@context':'https://schema.org','@type':'Service',name:i.seoTitle,serviceType:'Virtual assistant services',description:i.metaDescription,url,provider:{'@id':organizationId},audience:{'@type':'BusinessAudience',audienceType:label},areaServed:['United States','Europe','Australia']},{'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:siteUrl+'/'},{'@type':'ListItem',position:2,name:'Industries',item:siteUrl+'/industries/'},{'@type':'ListItem',position:3,name:label,item:url}]}]}

export default async function IndustryPage({params}:Props){
  const {slug}=await params;const industry=industries.find(i=>i.slug===slug);if(!industry)notFound();
  const segment=segmentFor(industry);
  const clientLogos=industry.clients.map(name=>partners.find(p=>p.name===name)).filter(p=>p!==undefined);
  const story=industry.story&&industry.story!=='founder'?clientStories.find(s=>s.id===industry.story):undefined;
  const questions=industry.faq.map(q=>answers.find(a=>a.q===q)).filter(a=>a!==undefined);
  const others=industries.filter(i=>i.id!==industry.id);
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(pageData(industry,segment.label))}/>
    <PageHero eyebrow={segment.label} title={industry.title} body={industry.intro} domain="plans" sheets={segment.sheets}><div className="cta-actions"><Link href="/contact-us/#book" className="button navy">Request a free call</Link><Link href="/how-it-works" className="underlined">How it works</Link></div></PageHero>
    <section className="page-content"><div className="studio-wrap">
      <p className="kicker">Tasks and responsibilities</p><h2 className="section-title">What your Expert can do.</h2>
      <ul className="task-grid">{industry.tasks.map((t,j)=>{const service=services.find(s=>s.slug===t.service);return <Reveal key={t.title} as="li" className="task-panel" delay={(j%3)*.05}><span>0{j+1}</span><h3>{t.title}</h3><ul>{t.items.map(item=><li key={item}>{item}</li>)}</ul>{service&&<Link className={styles.taskLink} href={'/services/'+service.slug}>{service.name}</Link>}</Reveal>})}</ul>
      <div className={styles.block}><p className="kicker">Tools</p><h2 className="section-title">Works in the tools you use.</h2><ul className={styles.toolList}>{industry.tools.map(tool=><li key={tool}>{tool}</li>)}</ul><p className={styles.note}>We train your Expert on any other software you use.</p></div>
      {clientLogos.length>0&&<div className={styles.block}><p className="kicker">Clients</p><h2 className="section-title">Businesses we work with.</h2><ul className={styles.logos} aria-label={segment.label+' clients'}>{clientLogos.map(p=>{const mark=mono[p.img.split('/').pop()!];const size=logoSize(mark.width,mark.height);return <li key={p.name}><Image src={mark.src} alt={p.name} width={mark.width} height={mark.height} style={{'--logo-w':`${size.width}px`,'--logo-h':`${size.height}px`} as CSSProperties}/></li>})}</ul></div>}
      {story&&<div className={styles.block}><ServiceClientProof story={story}/></div>}
      <div className={`section-rule ${styles.block}`}><h2>GVE’s ongoing support.</h2><ul className="support-promise">{supportPromises.map(p=><li key={p.title}><h3>{p.title}</h3><p>{p.body}</p></li>)}</ul></div>
    </div></section>
    {industry.story==='founder'&&<FounderStory/>}
    <section className="chapter"><div className="studio-wrap inline-faq"><div><p className="kicker">FAQs</p><h2>Before<br/>you hire.</h2><Link href="/faq" className="underlined">All FAQs</Link></div><Accordion items={questions}/></div></section>
    <section className="chapter"><div className="studio-wrap"><p className="kicker">Other businesses we help</p><ul className={styles.others}>{others.map(o=><li key={o.slug}><Link href={'/industries/'+o.slug}>{segmentFor(o).label}</Link></li>)}</ul></div></section>
    <CTA/>
  </>;
}
