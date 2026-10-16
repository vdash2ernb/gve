import type {Metadata} from 'next';
import {pageMeta} from '@/content/seo';
import PageHero from '@/components/PageHero';
import ServiceBrowser from '@/components/ServiceBrowser';
import CTA from '@/components/CTA';
export const metadata:Metadata=pageMeta({title:'Virtual Assistant Services',description:'Explore GVE virtual assistant services: executive and admin support, project management, bookkeeping, customer support, CRM, marketing, design, and drafting.',path:'/services/'});
export default function Services(){return <><PageHero eyebrow="Services" title="Virtual assistant services." body="Find help with admin, bookkeeping, sales, marketing, design, and more."/><section className="page-content"><div className="studio-wrap"><ServiceBrowser/></div></section><CTA/></>}
