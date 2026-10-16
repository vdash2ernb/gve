import type {Metadata} from 'next';
import {pageMeta} from '@/content/seo';
import PageHero from '@/components/PageHero';
import ServiceBrowser from '@/components/ServiceBrowser';
import CTA from '@/components/CTA';
export const metadata:Metadata=pageMeta({title:'Virtual Assistant Services',description:'Explore GVE virtual assistant services for builders, trades, and service businesses: permits and job schedules, CAD drafting, dispatch, bookkeeping, customer support, and more.',path:'/services/'});
export default function Services(){return <><PageHero eyebrow="Services" title="Virtual assistant services." body="Find help with permits, job schedules, bookkeeping, estimates, customer calls, and more."/><section className="page-content"><div className="studio-wrap"><ServiceBrowser/></div></section><CTA/></>}
