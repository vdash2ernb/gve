import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import PageHero from '@/components/PageHero';
import {Reveal} from '@/components/Reveal';
import CTA from '@/components/CTA';
import YouTube from '@/components/YouTube';
import {services,stories} from '@/content/site';
import {domainForService} from '@/content/domains';
import {clientStoryForService} from '@/content/client-stories';
import {ServiceClientProof} from '@/components/ClientProof';
export function generateStaticParams(){return services.map(s=>({slug:s.slug}))}
export async function generateMetadata({params}:PageProps<'/services/[slug]'>):Promise<Metadata>{const {slug}=await params;const s=services.find(s=>s.slug===slug);return s?{title:s.name,description:s.intro}:{}}
const support=[{title:'Screened for the role',body:'Assessments and interviews before you meet.'},{title:'Your tools and hours',body:'Work scheduled around your business.'},{title:'Clear task reports',body:'Time tracking and daily updates.'},{title:'Ongoing support',body:'A client success manager to help.'}];
export default async function Service({params}:PageProps<'/services/[slug]'>){const {slug}=await params;const i=services.findIndex(s=>s.slug===slug);if(i<0)notFound();const s=services[i];const next=services[(i+1)%services.length];const clientStory=clientStoryForService(slug);const expert=s.proof?.person?stories.find(p=>p.name.toLowerCase()===s.proof!.person):undefined;return <><PageHero eyebrow={s.name} title={s.tagline} body={s.intro} domain={domainForService(s.slug)}><div className="cta-actions"><Link href="/contact" className="button navy">Find my Expert</Link><Link href="/services" className="underlined">All services</Link></div></PageHero><section className="page-content"><div className="studio-wrap"><p className="kicker">Tasks and responsibilities</p><h2 className="section-title">What your Expert can do.</h2><ul className="task-grid">{s.groups.map((g,j)=><Reveal key={g.title} as="li" className="task-panel" delay={(j%3)*.05}><span>0{j+1}</span><h3>{g.title}</h3><ul>{g.items.slice(0,2).map(t=><li key={t}>{t}</li>)}</ul></Reveal>)}</ul>{clientStory&&<ServiceClientProof story={clientStory}/>}{!clientStory&&expert&&<div className="service-expert-video"><YouTube id={expert.video} title={'Meet '+expert.name+' · '+expert.role}/><div><p className="kicker">Meet an Expert</p><h2>{expert.name}</h2><p>{expert.text}</p><Link href="/stories" className="underlined">More Expert stories</Link></div></div>}<div className="section-rule"><h2>GVE’s ongoing support.</h2><ul className="support-promise">{support.map(p=><li key={p.title}><h3>{p.title}</h3><p>{p.body}</p></li>)}</ul><Link href={'/services/'+next.slug} className="related-link">Explore {next.name}</Link></div></div></section><CTA/></>}
