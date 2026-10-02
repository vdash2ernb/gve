import type {Metadata} from 'next';
import PageHero from '@/components/PageHero';
import ServiceBrowser from '@/components/ServiceBrowser';
import CTA from '@/components/CTA';
export const metadata:Metadata={title:'Services',description:'Virtual support for admin, projects, bookkeeping, sales, marketing, and specialist work.'};
export default function Services(){return <><PageHero eyebrow="Services" title="What needs doing?" body="From daily admin to specialist work. Choose the support your business needs."/><section className="page-content"><div className="studio-wrap"><ServiceBrowser/></div></section><CTA/></>}
