import type {Metadata} from 'next';
import Link from 'next/link';
import PageHero from '@/components/PageHero';
import CTA from '@/components/CTA';
import styles from '@/components/Industry.module.css';
import {industries,segmentFor} from '@/content/industries';
import {pageMeta} from '@/content/seo';

export const metadata:Metadata=pageMeta({title:'Virtual Assistants for Construction & Service Businesses',description:'GVE virtual assistants for contractors and remodelers, roofing companies and trades, home service businesses, and property managers.',path:'/industries/'});

export default function Industries(){return <><PageHero eyebrow="Industries" title="Who we help." body="Virtual assistants for builders, trades, and service businesses."/><section className="page-content"><div className="studio-wrap"><ul className={styles.cards}>{industries.map((i,n)=><li key={i.slug}><Link href={'/industries/'+i.slug}><span>0{n+1}</span><h2>{segmentFor(i).label}</h2><p>{i.intro}</p><strong>See how we help</strong></Link></li>)}</ul></div></section><CTA/></>}
